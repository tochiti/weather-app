require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Use your environment variable
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Default route for '/'
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Weather API routes
app.get("/api/weather", async (req, res) => {
  const { city, units = "metric" } = req.query;

  if (!city) return res.status(400).json({ error: "City parameter is required." });

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { q: city, appid: OPENWEATHER_API_KEY, units },
    });
    res.json(response.data);
  } catch (err) {
    if (err.response && err.response.data) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
});


app.get("/api/weather/coords", async (req, res) => {
  const { lat, lon, units = "metric" } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required." });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: { lat, lon, appid: OPENWEATHER_API_KEY, units },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching weather data:", err.message);
    res.status(500).json({ error: "Error fetching weather data." });
  }
});

// Start the server for local development
const PORT = 3000;
app.listen(PORT, () => {});

// Export for Vercel deployment
module.exports = app;
