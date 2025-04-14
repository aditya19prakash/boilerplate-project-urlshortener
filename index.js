require('dotenv').config();
const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const validUrl = require('valid-url');
const app = express();

// In-memory store for URL mappings
const urlDatabase = {};

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the homepage
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// URL Shortening endpoint
app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;

  // Check if the URL is valid
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'Invalid URL' });
  }

  // Check if URL already exists in the database
  const existingUrl = Object.values(urlDatabase).find((entry) => entry.original_url === url);
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url,
    });
  }

  // Generate a short URL using shortid
  const shortUrl = shortid.generate();

  // Store the original and short URLs in the in-memory database
  urlDatabase[shortUrl] = { original_url: url, short_url: shortUrl };

  res.json({
    original_url: url,
    short_url: shortUrl,
  });
});

// URL Redirect endpoint
app.get('/api/shorturl/:shortUrl', function (req, res) {
  const { shortUrl } = req.params;

  // Retrieve the original URL from the in-memory store
  const url = urlDatabase[shortUrl];
  if (url) {
    return res.redirect(url.original_url);
  }

  // Return an error if the short URL does not exist
  res.json({ error: 'Short URL not found' });
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
