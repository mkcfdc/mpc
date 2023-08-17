import express from 'express';
import redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { checkCache, directLink, addToPremiumize, getAccountInfo, checkTransferStatus, deleteTransfer } from './modules/premiumize.js';
import { searchMovies, getLatestMovies } from './modules/movieSearch.js';

const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Create a single Redis client instance
const client = redis.createClient({
  host: process.env.REDIS_HOST, // Redis server host
  port: 6379,       // Redis server port
});

client.on('connect', function() {
  console.log('Redis Connected!');
});

client.on('error', function(error) {
  console.error('Error:', error);
});

client.on('ready', function() {
  console.log('Redis server is ready.');
});

// Middleware to check Redis cache
function checkRedisCache(key) {
  return (req, res, next) => {
    client.get(key, (err, reply) => {
      if (err) {
        console.error('Redis error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (reply !== null) {
        // Key exists, return its value
        res.status(200).send(reply); // Parse JSON before sending
      } else {
        // Key doesn't exist
        next(); // Proceed to the route handler
      }
    });
  };
}

// Route to fetch account information
app.get('/account/info', checkRedisCache('accountInfo'), async (req, res) => {
  const premiumizeAPIKey = process.env.PREMIUMIZE_API_KEY;

  try {
    const accountInfo = await getAccountInfo(premiumizeAPIKey);
    if (accountInfo) {
      client.set('accountInfo', JSON.stringify(accountInfo), 'EX', 3600); // Cache account info
      res.status(200).json(accountInfo);
    } else {
      res.status(404).json({ error: 'Account info not found' });
    }
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch latest movies with Redis caching
app.get('/latest', checkRedisCache('latestMovies'), async (req, res) => {
  try {
    const latestMovies = await getLatestMovies();
    if (latestMovies) {
      client.set('latestMovies', latestMovies, 'EX', 3600); // Cache latest movies 1hr
      res.status(200).send(latestMovies);
    } else {
      res.status(404).json({ error: 'No latest movies found' });
    }
  } catch (error) {
    console.error('Error in /latest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/search/:query', async (req, res) => {
  const query = req.params.query;

  if (query) {
      try {
          const imdbIds = query.split(','); // Split the query by comma to get IMDb IDs
          const results = await searchMovies(imdbIds);
          
          if (results.length > 0) {
              // Send a pretty-printed JSON response with 2-space indentation
              res.status(200).send(JSON.stringify(results, null, 2));
          } else {
              res.status(404).json({ error: 'No movies found' });
          }
      } catch (error) {
          console.error('Error in /search:', error);
          res.status(500).json({ error: 'Internal server error.. probably database' });
      }
  } else {
      res.status(400).json({ error: 'Missing query parameter' });
  }
});

app.get('/getWatchedMovies', async (req, res) => {
  try {
    // Retrieve the top 5 most watched movies from the sorted set
    const topMovies = await client.zrevrange('topWatchedMovies', 0, 4, 'WITHSCORES');

    // If there are no topMovies, return an empty JSON response
    if (topMovies.length === 0) {
      return res.status(200).json([]);
    }

    // Extract the IMDb IDs from the sorted set result
    const imdbList = topMovies.filter((_, index) => index % 2 === 0);

    // Call the searchMovieInfo function with the array of IMDb IDs
    const movieInfoList = await searchMovies(imdbList);

    // Construct the response with movie information, view counts, and details
    const formattedMovieList = imdbList.map((imdb, index) => ({
      imdb,
      count: parseInt(topMovies[index * 2 + 1]),
      ...movieInfoList.find(movie => movie.imdb === imdb),
    }));

    res.status(200).json(formattedMovieList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/getStreamLink/:hash/:imdb?', async (req, res) => {
  try {
    const { hash, imdb } = req.params;
    const premiumizeAPIKey = process.env.PREMIUMIZE_API_KEY; // Replace with your API key

    if (!hash) {
      return res.status(400).json({ error: 'Hash is missing' });
    }
    
    const magnetLink = `magnet:?xt=urn:btih:${hash}`;
    const cacheKey = `streamLink:${hash}`;

    // Check if the stream link is already cached
    const cachedStreamLink = await client.get(cacheKey);

    if (cachedStreamLink) {
      res.status(200).json({ streamLink: JSON.parse(cachedStreamLink) });
      console.log('cache hit; streamLink');

      if (imdb) {
        console.log(imdb);
        // Increment the count for the movie's IMDb ID
        await client.zincrby('topWatchedMovies', 1, imdb);
      
        // Trim the sorted set to keep only the top 5 movies
        await client.zremrangebyrank('topWatchedMovies', 0, -6);
      }

    } else {
      const cacheResult = await checkCache(magnetLink, premiumizeAPIKey);

      if (cacheResult) {
        const streamLink = await directLink(magnetLink, premiumizeAPIKey);
        if (streamLink) {
          // Cache the stream link
          await client.set(cacheKey, JSON.stringify(streamLink));
          await client.expire(cacheKey, 43200); // Set expiration time (in seconds), e.g., 12 hours

          if (imdb) {
            console.log(imdb);
            // Increment the count for the movie's IMDb ID
            await client.zincrby('topWatchedMovies', 1, imdb);
          
            // Trim the sorted set to keep only the top 5 movies
            await client.zremrangebyrank('topWatchedMovies', 0, -6);
          }

          res.status(200).json({ streamLink });
          console.log('api hit; streamLink');
        } else {
          res.status(404).json({ error: 'Stream link not found' });
        }
      } else {
        const addToPremiumizeResult = await addToPremiumize(magnetLink, premiumizeAPIKey);
        if (addToPremiumizeResult) {
          // Cache the transferId here? No it's updated a lot from this point
          res.status(200).send(addToPremiumizeResult);
        } else {
          res.status(500).json({ error: 'Failed to add to Premiumize' });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  app.get('/transfer/status/:transferId', async (req, res) => {
    const { transferId } = req.params;
    const apiKey = process.env.PREMIUMIZE_API_KEY;
  
    if (transferId === 'all') {
      try {
        const result = await checkTransferStatus(apiKey);

        if (result && result.transfers) {
          for (const transfer of result.transfers) {
            if (transfer.status === 'finished') {
              const jsonData = JSON.stringify(transfer);
              await client.set(`cachedTransfer:${transfer.id}`, jsonData);
              await client.expire(`cachedTransfer:${transfer.id}`, 45000); // Set expiration time (in seconds), e.g., 1 hour
            }
          }
        }
  

        res.status(200).send(result);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred.' });
      }
      return;
    }
  
    if (transferId === 'undefined') {
      res.status(400).json({ error: 'No transfer ID given.' });
      return;
    }
  

    try {
      // Check if the data is already cached for the specific transferId
      const cachedData = await client.get(`cachedTransfer:${transferId}`);
    
      if (cachedData) {
        // If data is cached, send the cached data
        console.log('Cache hit; transfer ');
        res.status(200).send(JSON.parse(cachedData));
      } else {
        // If data is not cached, fetch it and cache it
        const result = await checkTransferStatus(apiKey);
    
        if (result) {
          const transfer = result.transfers.find(t => t.id === transferId);
          if (transfer && transfer.status === 'finished') {
            const jsonData = JSON.stringify(transfer);
            await client.set(`cachedTransfer:${transferId}`, jsonData);
            await client.expire(`cachedTransfer:${transferId}`, 3600); // Set expiration time (in seconds), e.g., 1 hour
    
            res.status(200).send(transfer);
            console.log('api hit; transfer');
          } else {
            res.status(200).send(transfer || {});
          }
        } else {
          res.status(500).json({ error: 'Failed to get response.' });
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ error: 'An error occurred.' });
    } finally {
      // Do not close the connection here to keep it open for future requests
    }
  });
  
  // Delete the transfer (transfer/delete)
 app.get('/transfer/delete/:transferId', async (req, res) => {
    const { transferId } = req.params;
    const apiKey = process.env.PREMIUMIZE_API_KEY;
  
    if (transferId === 'undefined') {
      return res.status(400).json({ error: 'No transfer ID given.' });
    }
    
    const result = await deleteTransfer(transferId, apiKey);
  
    if (result) {
      await client.del(`cachedTransfer:${transferId}`);
      return res.status(200).send(result);
    } else {
      return res.status(500).json({ error: 'No response given' });
    }
  });
  
 

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
