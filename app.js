const dateEl = document.getElementById('date');
const timeEl = document.getElementById('time');
const weatherEl = document.getElementById('weather');

const TIME_BACKGROUNDS = [
    { start: 0, name: 'night', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
    { start: 5, name: 'dawn', gradient: 'linear-gradient(135deg, #2c3e50 0%, #fd746c 100%)' },
    { start: 7, name: 'morning', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { start: 10, name: 'day', gradient: 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)' },
    { start: 17, name: 'sunset', gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 60%, #6a1b9a 100%)' },
    { start: 20, name: 'dusk', gradient: 'linear-gradient(135deg, #355c7d 0%, #6c5b7b 50%, #c06c84 100%)' },
    { start: 22, name: 'night', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
];

function backgroundForHour(hour) {
    let match = TIME_BACKGROUNDS[0];
    for (const entry of TIME_BACKGROUNDS) {
        if (hour >= entry.start) match = entry;
    }
    return match;
}

let currentBackgroundName = null;

function updateBackground(now) {
    const bg = backgroundForHour(now.getHours());
    if (bg.name !== currentBackgroundName) {
        document.body.style.background = bg.gradient;
        currentBackgroundName = bg.name;
    }
}

function updateClock() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    timeEl.textContent = now.toLocaleTimeString();
    updateBackground(now);
}

updateClock();
setInterval(updateClock, 1000);

const WEATHER_CODES = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌦️' },
    53: { desc: 'Moderate drizzle', icon: '🌦️' },
    55: { desc: 'Dense drizzle', icon: '🌦️' },
    56: { desc: 'Light freezing drizzle', icon: '🌧️' },
    57: { desc: 'Dense freezing drizzle', icon: '🌧️' },
    61: { desc: 'Slight rain', icon: '🌦️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    66: { desc: 'Light freezing rain', icon: '🌧️' },
    67: { desc: 'Heavy freezing rain', icon: '🌧️' },
    71: { desc: 'Slight snow', icon: '🌨️' },
    73: { desc: 'Moderate snow', icon: '🌨️' },
    75: { desc: 'Heavy snow', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '🌨️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    85: { desc: 'Slight snow showers', icon: '🌨️' },
    86: { desc: 'Heavy snow showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

function showWeatherError(message) {
    weatherEl.innerHTML = `<div class="error">${message}</div>`;
}

async function fetchWeather(latitude, longitude) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh`;
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;

    try {
        const [weatherRes, geocodeRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geocodeUrl).catch(() => null),
        ]);

        if (!weatherRes.ok) {
            throw new Error(`Weather API error: ${weatherRes.status}`);
        }

        const weatherData = await weatherRes.json();
        const current = weatherData.current;
        const code = WEATHER_CODES[current.weather_code] || { desc: 'Unknown', icon: '❓' };

        let locationText = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        if (geocodeRes && geocodeRes.ok) {
            const geocodeData = await geocodeRes.json();
            const place = geocodeData?.results?.[0];
            if (place) {
                locationText = [place.name, place.admin1, place.country]
                    .filter(Boolean)
                    .join(', ');
            }
        }

        weatherEl.innerHTML = `
            <div class="weather-main">
                <div id="weather-icon">${code.icon}</div>
                <div id="temperature">${Math.round(current.temperature_2m)}°C</div>
            </div>
            <div id="weather-description">${code.desc}</div>
            <div id="weather-location">📍 ${locationText}</div>
            <div id="weather-details">
                Humidity: ${current.relative_humidity_2m}% •
                Wind: ${Math.round(current.wind_speed_10m)} km/h
            </div>
        `;
    } catch (err) {
        showWeatherError(`Unable to load weather: ${err.message}`);
    }
}

function loadWeather() {
    if (!('geolocation' in navigator)) {
        showWeatherError('Geolocation is not supported by your browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            const messages = {
                1: 'Location permission denied.',
                2: 'Location unavailable.',
                3: 'Location request timed out.',
            };
            showWeatherError(messages[error.code] || 'Unable to retrieve your location.');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
}

loadWeather();
