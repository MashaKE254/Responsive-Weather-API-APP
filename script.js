// Constants
const API_KEY = '28395c9ded824beb9ec123721241009';
const API_BASE_URL = 'https://api.weatherapi.com/v1';

const searchInput = document.getElementById('search-input');
const temperatureElement = document.getElementById('temperature');
const weatherTypeElement = document.getElementById('weather-type');
const weatherDescriptionElement = document.querySelector('.weather-description');
const realFeelElement = document.getElementById('real-feel');
const currentWeatherContainer = document.querySelector('.area-current-container');
const forecastContainer = document.querySelector('.area-forecast-container');

searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

async function handleSearch() {
  const city = searchInput.value;
  if (city) {
    await fetchWeatherData(city);
  }
}

async function fetchWeatherData(city) {
  const apiUrl = `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=10&aqi=no&alerts=no`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error.message);
      return;
    }
    
    console.log('Full API response:', data);
    
    displayCurrentWeather(data);
    updateHourlyForecast(data.forecast.forecastday[0].hour, data.current.temp_c);
    updateDailyForecast(data.forecast.forecastday);
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function updateHourlyForecast(hourlyData, currentTemp) {
  console.log('Hourly forecast data:', hourlyData);
  const forecastContainer = document.querySelector('.hourly-forecast .forecast-hourly-card');
  forecastContainer.innerHTML = '';

 
  const nowCard = `
    <div class="forecast-card">
      <p class="header-small">Now</p>
      <p class="temp">${Math.round(currentTemp)}°C</p>
      <i class="weather-icon ${getWeatherIconClass(hourlyData[0]?.condition?.text || 'Unknown')}"></i>
    </div>
  `;
  forecastContainer.innerHTML += nowCard;

  for (let i = 1; i <= 9; i++) {
    const data = hourlyData[i * 3];
    if (!data) {
      console.warn(`No data for hour ${i * 3}`);
      continue;
    }

    let time = 'N/A';
    try {
      time = new Date(data.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      console.error('Error parsing time:', error);
    }

    const temp = Math.round(data.temp_c);
    const weatherIcon = getWeatherIconClass(data.condition?.text || 'Unknown');

    const card = `
      <div class="forecast-card">
        <p class="header-small">${time}</p>
        <p class="temp">${temp}°C</p>
        <i class="weather-icon ${weatherIcon}"></i>
      </div>
    `;
    forecastContainer.innerHTML += card;
  }
}

function getWeatherIconClass(weatherCondition) {
  const iconMap = {
    'Sunny': 'fas fa-sun',
    'Clear': 'fas fa-moon',
    'Partly cloudy': 'fas fa-cloud-sun',
    'Cloudy': 'fas fa-cloud',
    'Overcast': 'fas fa-cloud',
    'Mist': 'fas fa-smog',
    'Patchy rain possible': 'fas fa-cloud-rain',
    'Patchy snow possible': 'fas fa-snowflake',
    'Patchy sleet possible': 'fas fa-cloud-meatball',
    'Patchy freezing drizzle possible': 'fas fa-icicles',
    'Thundery outbreaks possible': 'fas fa-bolt',
    'Blowing snow': 'fas fa-wind',
    'Blizzard': 'fas fa-snowflake',
    'Fog': 'fas fa-smog',
    'Freezing fog': 'fas fa-smog',
    'Patchy light drizzle': 'fas fa-cloud-rain',
    'Light drizzle': 'fas fa-cloud-rain',
    'Freezing drizzle': 'fas fa-icicles',
    'Heavy freezing drizzle': 'fas fa-icicles',
    'Patchy light rain': 'fas fa-cloud-rain',
    'Light rain': 'fas fa-cloud-rain',
    'Moderate rain at times': 'fas fa-cloud-showers-heavy',
    'Moderate rain': 'fas fa-cloud-showers-heavy',
    'Heavy rain at times': 'fas fa-cloud-showers-heavy',
    'Heavy rain': 'fas fa-cloud-showers-heavy',
    'Light freezing rain': 'fas fa-icicles',
    'Moderate or heavy freezing rain': 'fas fa-icicles',
    'Light sleet': 'fas fa-cloud-meatball',
    'Moderate or heavy sleet': 'fas fa-cloud-meatball',
    'Patchy light snow': 'fas fa-snowflake',
    'Light snow': 'fas fa-snowflake',
    'Patchy moderate snow': 'fas fa-snowflake',
    'Moderate snow': 'fas fa-snowflake',
    'Patchy heavy snow': 'fas fa-snowflake',
    'Heavy snow': 'fas fa-snowflake',
    'Ice pellets': 'fas fa-icicles',
    'Light rain shower': 'fas fa-cloud-rain',
    'Moderate or heavy rain shower': 'fas fa-cloud-showers-heavy',
    'Torrential rain shower': 'fas fa-cloud-showers-heavy',
    'Light sleet showers': 'fas fa-cloud-meatball',
    'Moderate or heavy sleet showers': 'fas fa-cloud-meatball',
    'Light snow showers': 'fas fa-snowflake',
    'Moderate or heavy snow showers': 'fas fa-snowflake',
    'Light showers of ice pellets': 'fas fa-icicles',
    'Moderate or heavy showers of ice pellets': 'fas fa-icicles',
    'Patchy light rain with thunder': 'fas fa-bolt',
    'Moderate or heavy rain with thunder': 'fas fa-bolt',
    'Patchy light snow with thunder': 'fas fa-bolt',
    'Moderate or heavy snow with thunder': 'fas fa-bolt'
  };
  return iconMap[weatherCondition] || 'fas fa-cloud';
}

function displayCurrentWeather(data) {
  if (!data || !data.location || !data.current) {
    console.error('Invalid data structure:', data);
    return;
  }

  const locationElement = document.getElementById('location');
  locationElement.textContent = `${data.location.name}, ${data.location.country}`;
  
  updateLocalTime(data.location.tz_id);
  
  temperatureElement.textContent = `${Math.round(data.current.temp_c)}°C`;
  weatherTypeElement.textContent = data.current.condition.text;
  
  const description = `Today we expect ${data.current.condition.text} with a high of ${Math.round(data.forecast.forecastday[0].day.maxtemp_c)}°C and a low of ${Math.round(data.forecast.forecastday[0].day.mintemp_c)}°C`;
  weatherDescriptionElement.textContent = description;
  
  document.getElementById('real-feel').textContent = `${Math.round(data.current.feelslike_c)}°C`;
  document.getElementById('humidity').textContent = `${data.current.humidity}%`;
  document.getElementById('visibility').textContent = `${data.current.vis_km} km`;
  document.getElementById('precipitation').textContent = `${data.current.precip_mm} mm`;
  
  // Update UV Index
  const uvIndex = data.current.uv;
  document.getElementById('uv-index-value').textContent = uvIndex;
  document.getElementById('uv-description').textContent = getUVDescription(uvIndex);
  document.getElementById('uv-advice').textContent = getUVAdvice(uvIndex);
  updateUVBar(uvIndex);

  // Update Wind Speed
  document.getElementById('wind-speed').textContent = `${Math.round(data.current.wind_mph)} mph`;
  document.getElementById('wind-gust').textContent = `${Math.round(data.current.gust_mph)} mph`;
  updateWindDirection(data.current.wind_degree, data.current.wind_dir);
}

function updateLocalTime(timezone) {
  const localTimeElement = document.getElementById('local-time');
  
  function updateTime() {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      timeZone: timezone
    };
    
    localTimeElement.textContent = new Date().toLocaleString('en-US', options);
  }
  
  updateTime();
  setInterval(updateTime, 60000);
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
  } else {
    loadDefaultWeather();
  }
}

async function positionSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const weatherData = await fetchWeatherData(`${lat},${lon}`);
  if (weatherData) {
    displayCurrentWeather(weatherData);
  }
}

function positionError(error) {
  console.error("Error getting user location:", error);
  loadDefaultWeather();
}

async function loadDefaultWeather() {
  const weatherData = await fetchWeatherData('Nairobi');
  if (weatherData) {
    displayCurrentWeather(weatherData);
  }
}

getUserLocation();

function updateDailyForecast(dailyData) {
  console.log('Daily forecast data:', dailyData);
  const forecastContainer = document.querySelector('.ten-day-forecast .forecast-daily-card');
  forecastContainer.innerHTML = '';

  const daysToShow = Math.min(dailyData.length, 10);

  for (let i = 0; i < daysToShow; i++) {
    const day = dailyData[i];
    const date = new Date(day.date);
    const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
    const maxTemp = Math.round(day.day.maxtemp_c);
    const minTemp = Math.round(day.day.mintemp_c);
    const weatherIcon = getWeatherIconClass(day.day.condition.text);

    const card = `
      <div class="forecast-card">
        <p class="header-small">${dayName}</p>
        <p class="temp">${maxTemp}°C / ${minTemp}°C</p>
        <i class="weather-icon ${weatherIcon}"></i>
      </div>
    `;
    forecastContainer.innerHTML += card;
  }
}

function updateUVBar(uvIndex) {
  const uvFill = document.querySelector('.uv-fill');
  const uvMarker = document.querySelector('.uv-marker');
  const percentage = (uvIndex / 11) * 100;
  uvFill.style.width = `${percentage}%`;
  uvMarker.style.left = `${percentage}%`;
}

function getUVDescription(uvIndex) {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

function getUVAdvice(uvIndex) {
  if (uvIndex <= 2) return 'No protection required.';
  if (uvIndex <= 5) return 'Wear sunglasses and use SPF 30+ sunscreen.';
  if (uvIndex <= 7) return 'Reduce sun exposure, wear protective clothing.';
  if (uvIndex <= 10) return 'Minimize sun exposure, seek shade.';
  return 'Avoid sun exposure, take all precautions.';
}

function updateWindDirection(degree, direction) {
  const arrow = document.getElementById('wind-arrow');
  const directionText = document.getElementById('wind-direction');
  
  arrow.style.transform = `rotate(${degree}deg)`;
  directionText.textContent = direction;
}

function getWeatherIconClass(condition) {
  return 'default-weather-icon';
}
