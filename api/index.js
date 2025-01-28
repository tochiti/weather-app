require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Use your environment variable on Vercel
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Example routes:
// GET /api/weather?city=...&units=metric|imperial
// app.get('/weather', async (req, res) => {
//   const { city, units = 'metric' } = req.query;
//   if (!city) {
//     return res.status(400).json({ error: 'City parameter is required.' });
//   }

//   try {
//     const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
//       params: { q: city, appid: OPENWEATHER_API_KEY, units }
//     });
//     res.json(response.data);
//   } catch (err) {
//     if (err.response) {
//       return res.status(err.response.status).json({ error: err.response.data });
//     }
//     res.status(500).json({ error: 'Error fetching weather data.' });
//   }
// });

app.get('/weather', async (req, res) => {
  const { city, units = 'metric' } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required.' });
  }

  try {
    console.log("Fetching weather for city:", city);
    console.log("Using API Key:", OPENWEATHER_API_KEY);

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: OPENWEATHER_API_KEY, units }
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching weather data:", err.message);

    if (err.response) {
      return res.status(err.response.status).json({ error: err.response.data });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/weather/coords?lat=...&lon=...&units=...
app.get('/weather/coords', async (req, res) => {
  const { lat, lon, units = 'metric' } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: OPENWEATHER_API_KEY, units }
    });
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ error: err.response.data });
    }
    res.status(500).json({ error: 'Error fetching weather data.' });
  }
});

// IMPORTANT: Export the Express app.
// No app.listen(...) needed for Vercel.
module.exports = app;