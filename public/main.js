const getBackgroundImage = (iconCode) => {
    const imageMap = {
        '01d': 'url(https://images.unsplash.com/photo-1469122312224-c5846569feb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        '01n': 'url(https://images.unsplash.com/photo-1494022299300-899b96e49893?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        '02d': 'url(https://images.unsplash.com/photo-1489515217757-5fd1be406fef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        '02n': 'url(https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80)',
        '03d': 'url(https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1953&q=80)',
        '04d': 'url(https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80)',
        '09d': 'url(https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?ixlib=rb-1.2.1&auto=format&fit=crop&w=1953&q=80)',
        '10d': 'url(https://images.unsplash.com/photo-1536514498060-2fed1d8ef57f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        '11d': 'url(https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?ixlib=rb-1.2.1&auto=format&fit=crop&w=1953&q=80)',
        '13d': 'url(https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        '50d': 'url(https://images.unsplash.com/photo-1504253163759-c23fccaebb55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)'
    };
    return imageMap[iconCode] || imageMap['01d'];
};

document.addEventListener("DOMContentLoaded", () => {
    const weatherForm = document.getElementById("weatherForm");
    const cityInput = document.getElementById("cityInput");
    const weatherResult = document.getElementById("weatherResult");
    const geoBtn = document.getElementById("geoBtn");
    const unitToggle = document.getElementById("unitToggle");
    const cityButtons = document.querySelectorAll(".city-btn");
  
    // We'll store the current units in a variable for easy reference
    // 'metric' = Celsius; 'imperial' = Fahrenheit
    let currentUnits = "metric";
  
    // Update `currentUnits` whenever toggle changes
    unitToggle.addEventListener("change", () => {
      currentUnits = unitToggle.checked ? "imperial" : "metric";
      // If you'd like, you can automatically re-fetch weather for the last city/coords
      // But let's keep it simple and only apply it to future searches.
    });
  
    // Handle Form Submit
    weatherForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const city = cityInput.value.trim();
      if (!city) {
        showError("Please enter a city name.");
        return;
      }
      await fetchWeatherByCity(city);
    });
  
    // Handle City Recommendation Buttons
    cityButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const city = button.getAttribute("data-city");
        cityInput.value = city; // optional: populate input
        await fetchWeatherByCity(city);
      });
    });
  
    // Handle Geolocation Button
    geoBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          showError("Unable to retrieve your location.");
          console.error(error);
        }
      );
    });
  
    // Fetch weather by city name
    async function fetchWeatherByCity(city) {
      try {
        setLoading();
        const response = await fetch(
          `/api/weather?city=${encodeURIComponent(city)}&units=${currentUnits}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          showError(errorData.error.message || "City not found.");
          return;
        }
        const data = await response.json();
        renderWeather(data);
      } catch (err) {
        showError("An error occurred while fetching city data.");
        console.error(err);
      }
    }
  
    // Fetch weather by geolocation (lat, lon)
    async function fetchWeatherByCoords(lat, lon) {
      try {
        setLoading();
        const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}&units=${currentUnits}`);
        if (!response.ok) {
          const errorData = await response.json();
          showError(errorData.error.message || "Location not found.");
          return;
        }
        const data = await response.json();
        renderWeather(data);
      } catch (err) {
        showError("An error occurred while fetching location data.");
        console.error(err);
      }
    }
  
    // Render weather data to the page
    function renderWeather(data) {
      // Extract relevant info
      const { name, main, weather, sys } = data;
      // weather array has at least one object with .description and .icon
      const weatherObj = weather && weather[0];
      const iconCode = weatherObj ? weatherObj.icon : null;
      const description = weatherObj ? weatherObj.description : "N/A";
  
      // Convert units if needed (just for display labels)
      const unitsLabel = currentUnits === "metric" ? "°C" : "°F";
  
      weatherResult.innerHTML = `
        <div class="mx-auto text-center p-4 bg-blue-100 rounded">
          <h2 class="text-2xl font-bold mb-2">${name}${sys?.country ? `, ${sys.country}` : ""}</h2>
          <!-- Weather Icon -->
          ${
            iconCode
              ? `<img class="mx-auto mb-2" src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="Weather Icon" />`
              : ""
          }
          <p class="text-lg">Temperature: <span class="font-semibold">${main.temp}${unitsLabel}</span></p>
          <p class="text-lg">Feels Like: <span class="font-semibold">${main.feels_like}${unitsLabel}</span></p>
          <p class="text-lg">Humidity: <span class="font-semibold">${main.humidity}%</span></p>
          <p class="text-lg capitalize">Conditions: <span class="font-semibold">${description}</span></p>
        </div>
      `;
    }
  
    // Show an error message
    function showError(msg) {
      weatherResult.innerHTML = `<p class="text-red-500">${msg}</p>`;
    }
  
    // Show a loading state
    function setLoading() {
      weatherResult.innerHTML = `<p class="text-gray-500">Loading...</p>`;
    }
  });

  
  // Update renderWeather function to include background change
  function renderWeather(data) {
    const { name, main, weather, sys } = data;
    const weatherObj = weather && weather[0];
    const iconCode = weatherObj ? weatherObj.icon : '01d';
    const description = weatherObj ? weatherObj.description : "N/A";
    const unitsLabel = currentUnits === "metric" ? "°C" : "°F";
  
    // Change background based on weather condition
    document.body.style.backgroundImage = getBackgroundImage(iconCode);
  
    weatherResult.innerHTML = `
      <div class="weather-container p-6 space-y-4">
        <h2 class="text-2xl font-bold text-white drop-shadow-md">${name}${sys?.country ? `, ${sys.country}` : ""}</h2>
        ${
          iconCode
            ? `<img class="mx-auto mb-2 w-24 h-24 drop-shadow-md" src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="Weather Icon" />`
            : ""
        }
        <div class="space-y-2">
          <p class="text-xl text-white drop-shadow-md">${main.temp}${unitsLabel}</p>
          <p class="text-lg text-white/80 drop-shadow-md">Feels like ${main.feels_like}${unitsLabel}</p>
          <p class="text-lg text-white/80 drop-shadow-md">Humidity: ${main.humidity}%</p>
          <p class="text-lg capitalize text-white/80 drop-shadow-md">${description}</p>
        </div>
      </div>
    `;
  }

  // Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check localStorage for theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
body.classList.toggle('dark', savedTheme === 'dark');

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Updated background handling
function setBackground(iconCode) {
  const bgImage = getBackgroundImage(iconCode);
  const img = new Image();
  img.src = bgImage.replace('url(', '').replace(')', '');
  
  img.onload = () => {
    document.body.style.backgroundImage = bgImage;
  };
  img.onerror = () => {
    document.body.style.backgroundImage = '';
  };
}

// Update renderWeather function
function renderWeather(data) {
  const { name, main, weather, sys } = data;
  const weatherObj = weather && weather[0];
  const iconCode = weatherObj ? weatherObj.icon : '01d';
  const description = weatherObj ? weatherObj.description : "N/A";
  const unitsLabel = currentUnits === "metric" ? "°C" : "°F";

  setBackground(iconCode);

  weatherResult.innerHTML = `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold dark:text-white text-gray-800 drop-shadow-md">${name}${sys?.country ? `, ${sys.country}` : ""}</h2>
      ${iconCode ? `<img class="mx-auto mb-2 w-24 h-24 drop-shadow-md" src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="Weather Icon" />` : ""}
      <div class="space-y-2">
        <p class="text-xl dark:text-white text-gray-800 drop-shadow-md">${main.temp}${unitsLabel}</p>
        <p class="text-lg dark:text-white/80 text-gray-600 drop-shadow-md">Feels like ${main.feels_like}${unitsLabel}</p>
        <p class="text-lg dark:text-white/80 text-gray-600 drop-shadow-md">Humidity: ${main.humidity}%</p>
        <p class="text-lg capitalize dark:text-white/80 text-gray-600 drop-shadow-md">${description}</p>
      </div>
    </div>
  `;
}

// Update error and loading states
function showError(msg) {
  weatherResult.innerHTML = `<p class="text-red-500 dark:text-red-300">${msg}</p>`;
}

function setLoading() {
  weatherResult.innerHTML = `<p class="text-gray-600 dark:text-gray-300">Loading...</p>`;
}