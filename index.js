require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Use your own OpenWeather API key
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "69473b48bdb775147571f950a739ecb4";

app.use(cors());
app.use(express.static("public")); // Serve files from 'public' folder

/**
 * GET /api/weather?city=...&units=metric|imperial
 * Example: /api/weather?city=London&units=metric
 */
app.get("/api/weather", async (req, res) => {
  const { city, units = "metric" } = req.query;
  if (!city) {
    return res.status(400).json({ error: "City parameter is required." });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units
      }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }
    res.status(500).json({ error: "An error occurred while fetching weather data." });
  }
});

/**
 * GET /api/weather/coords?lat=...&lon=...&units=metric|imperial
 * Example: /api/weather/coords?lat=51.5085&lon=-0.1257&units=metric
 */
app.get("/api/weather/coords", async (req, res) => {
  const { lat, lon, units = "metric" } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units
      }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }
    res.status(500).json({ error: "An error occurred while fetching weather data." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});