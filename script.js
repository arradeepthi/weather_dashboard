const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherInputDiv = document.querySelector(".weather-input");
const weatherDataDiv = document.querySelector(".weather-data");
const resetButton = document.querySelector(".reset-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const cityInput = document.querySelector(".city-input");
const API_KEY = "011306d44cd8a6286db222fa9c29c355";

const validCityName = (cityName) => {
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(cityName);
};

const getWeatherAlert = (weather) => {
  switch (weather) {
    case "Rain":
      return "Don't forget to take an umbrella!";
    case "Snow":
      return "It's snowy outside, wear warm clothes!";
    case "Thunderstorm":
      return "Stay indoors, thunderstorms expected!";
    case "Clear":
      return "Enjoy your day. Weather's clear out there :))";
    case "Clouds":
      return "It's cloudy today!";
    default:
      return "";
  } // show result
};

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    return `<div class="details text-center">
      <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
      <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
      <h6>Humidity: ${weatherItem.main.humidity}%</h6>
      <h6>Wind: ${weatherItem.wind.speed} m/s</h6>
    </div>`;
  } else {
    return `<li class="card">
      <div class="card-inner">
        <div class="card-front">
          <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
          <p>${(weatherItem.main.temp - 273.15).toFixed(1)}°C</p>
          <p>${weatherItem.main.humidity}%</p>
          <p>${weatherItem.wind.speed} m/s</p>
        </div>
        <div class="card-back">
          <p>Feels like: ${(weatherItem.main.feels_like - 273.15).toFixed(
            1
          )}°C</p>
          <p>Pressure: ${weatherItem.main.pressure} hPa</p>
          <p>${weatherItem.weather[0].description}</p>
        </div>
      </div>
    </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
      document.querySelector(".weather-data").classList.remove("d-none");
      const currentWeatherCondition = data.list[0].weather[0].main;
      const alertMessage = getWeatherAlert(currentWeatherCondition);

      const alertBox = document.querySelector(".weather-alert");
      if (alertMessage) {
        alertBox.innerHTML = `
    <div class="alert-content">
      <span class="emoji">⚠️</span>
      <span>${alertMessage}</span>
      <button class="close-alert">&times;</button>
    </div>
  `;
        alertBox.classList.remove("d-none");

        // Manual close
        document.querySelector(".close-alert").addEventListener("click", () => {
          alertBox.classList.add("d-none");
        });

        // Auto close after 3 seconds
        setTimeout(() => {
          alertBox.classList.add("d-none");
        }, 3000);
      }

      weatherInputDiv.classList.add("d-none");
      weatherDataDiv.classList.remove("d-none");
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") {
    alert("Please enter a city name.");
    return;
  }

  if (!validCityName(cityName)) {
    alert(
      "Please enter a valid city name. Only letters and spaces are allowed."
    );
    return;
  }

  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Current Location request denied. Please reset location permission to grant access again."
        );
      } else {
        alert(
          "Current Location request error. Please reset location permission."
        );
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    getCityCoordinates();
  }
});
resetButton.addEventListener("click", () => {
  cityInput.value = "";
  currentWeatherDiv.innerHTML = "";
  weatherCardsDiv.innerHTML = "";

  weatherDataDiv.classList.add("d-none");
  weatherInputDiv.classList.remove("d-none");

  // 👇 Hide weather alert if visible
  const alertBox = document.querySelector(".weather-alert");
  alertBox.classList.add("d-none");
});

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    card.querySelector(".card-inner").classList.toggle("flipped");
  });
});
