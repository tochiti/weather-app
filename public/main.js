document.addEventListener("DOMContentLoaded", () => {
    // Grabs form elements and result display
    const weatherForm = document.getElementById("weatherForm");
    const cityInput = document.getElementById("cityInput");
    const weatherResult = document.getElementById("weatherResult");
  
    // Example toggle for Celsius (metric) or Fahrenheit (imperial).
    // If you have a checkbox with ID 'unitToggle', e.g. <input type="checkbox" id="unitToggle">
    const unitToggle = document.getElementById("unitToggle");
    let currentUnits = "metric";
  
    if (unitToggle) {
      unitToggle.addEventListener("change", () => {
        currentUnits = unitToggle.checked ? "imperial" : "metric";
      });
    }
  
    // Handle form submit (search by city)
    weatherForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const city = cityInput.value.trim();
      if (!city) {
        showError("Please enter a city name.");
        return;
      }
      await fetchWeatherByCity(city);
    });
  
    // If you have a "Use My Location" button:
    // <button id="geoBtn">Use My Location</button>
    const geoBtn = document.getElementById("geoBtn");
    if (geoBtn) {
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
    }
  
    // Function to fetch weather by city
    async function fetchWeatherByCity(city) {
      try {
        setLoading();
        // Hit our Express route on Vercel: /api/weather?city=...&units=...
        const response = await fetch(/api/weather?city=${encodeURIComponent(city)}&units=${currentUnits});
        if (!response.ok) {
          const errorData = await response.json();
          showError(errorData.error?.message || "City not found.");
          return;
        }
        const data = await response.json();
        renderWeather(data);
      } catch (err) {
        showError("An error occurred while fetching city data.");
        console.error(err);
      }
    }
  
    // Function to fetch weather by coordinates (geolocation)
    async function fetchWeatherByCoords(lat, lon) {
      try {
        setLoading();
        // Hit our Express route on Vercel: /api/weather/coords?lat=...&lon=...&units=...
        const response = await fetch(/api/weather/coords?lat=${lat}&lon=${lon}&units=${currentUnits});
        if (!response.ok) {
          const errorData = await response.json();
          showError(errorData.error?.message || "Location not found.");
          return;
        }
        const data = await response.json();
        renderWeather(data);
      } catch (err) {
        showError("An error occurred while fetching location data.");
        console.error(err);
      }
    }
  
    // Display weather data on the page
    function renderWeather(data) {
      const { name, main, weather } = data;
      if (!name || !main || !weather) {
        showError("Incomplete weather data.");
        return;
      }
  
      // Weather details
      const [weatherInfo] = weather; // Typically first object in 'weather' array
      const description = weatherInfo?.description || "N/A";
      const icon = weatherInfo?.icon || "01d";
      const unitsSymbol = currentUnits === "imperial" ? "°F" : "°C";
  
      weatherResult.innerHTML = `
        <div class="p-4 bg-blue-100 rounded">
          <h2 class="text-lg font-bold">${name}</h2>
          <p>Temperature: ${main.temp}${unitsSymbol}</p>
          <p>Feels Like: ${main.feels_like}${unitsSymbol}</p>
          <p>Humidity: ${main.humidity}%</p>
          <p>Condition: ${description}</p>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon">
        </div>
      `;
    }
  
    // Show error messages
    function showError(msg) {
      weatherResult.innerHTML = <p class="text-red-500">${msg}</p>;
    }
  
    // Show a loading state
    function setLoading() {
      weatherResult.innerHTML = <p class="text-gray-500">Loading...</p>;
    }
  });