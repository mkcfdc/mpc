import express from 'express';
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

// Route to fetch account information
app.get('/account/info', async (req, res) => {
  const premiumizeAPIKey = process.env.PREMIUMIZE_API_KEY;

  try {
    const accountInfo = await getAccountInfo(premiumizeAPIKey);
    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the route for getting the latest movies
app.get('/latest', async (req, res) => {
  try {
      const latestMovies = await getLatestMovies();
      if (latestMovies) {
        res.status(200).send(JSON.stringify(JSON.parse(latestMovies), null, 2));
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
          res.status(200).json({ addToPremiumizeResult });
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
