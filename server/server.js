import express from 'express';
import redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { checkCache, directLink, addToPremiumize, getAccountInfo } from './modules/premiumize.js';
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
        res.json(JSON.parse(reply)); // Parse JSON before sending
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
    client.set('accountInfo', accountInfo, 'EX', 3600); // Cache account info
    res.status(200).send(accountInfo);
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
      client.set('latestMovies', latestMovies, 'EX', 3600); // Cache latest movies
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
            const results = await searchMovies(query);
            if (results) {
                // Send a pretty-printed JSON response with 2-space indentation
                res.status(200).send(JSON.stringify(JSON.parse(results), null, 2));
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


app.get('/getStreamLink/:hash', async (req, res) => {
    try {
      const { hash } = req.params;
      const premiumizeAPIKey = process.env.PREMIUMIZE_API_KEY; // Replace with your API key
  
      if (!hash) {
        return res.status(400).json({ error: 'Hash is missing' });
      }
  
      const magnetLink = `magnet:?xt=urn:btih:${hash}`;
      const cacheResult = await checkCache(magnetLink, premiumizeAPIKey);
  
      if (cacheResult) {
        const streamLink = await directLink(magnetLink, premiumizeAPIKey);
        if (streamLink) {
          res.status(200).json({ streamLink });
        } else {
          res.status(404).json({ error: 'Stream link not found' });
        }
      } else {
        const addToPremiumizeResult = await addToPremiumize(magnetLink, premiumizeAPIKey);
        if (addToPremiumizeResult) {
          res.status(200).send(addToPremiumizeResult);
        } else {
          res.status(500).json({ error: 'Failed to add to Premiumize' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });  
 

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
