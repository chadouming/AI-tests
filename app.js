const dateEl = document.getElementById('date');
const timeEl = document.getElementById('time');
const weatherEl = document.getElementById('weather');
const newsEl = document.getElementById('news');

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

const COUNTRY_LANGUAGE = {
    US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', IN: 'en', ZA: 'en',
    FR: 'fr', BE: 'fr', LU: 'fr', CH: 'de', MC: 'fr',
    DE: 'de', AT: 'de',
    ES: 'es', MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es', VE: 'es', UY: 'es',
    PT: 'pt', BR: 'pt',
    IT: 'it',
    NL: 'nl',
    SE: 'sv', NO: 'no', DK: 'da', FI: 'fi', IS: 'is',
    PL: 'pl', CZ: 'cs', SK: 'sk', HU: 'hu', RO: 'ro', GR: 'el',
    RU: 'ru', UA: 'uk',
    TR: 'tr',
    JP: 'ja', KR: 'ko', CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-HK',
    ID: 'id', MY: 'ms', TH: 'th', VN: 'vi', PH: 'en', SG: 'en',
    IL: 'he', SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar',
};

function showWeatherError(message) {
    weatherEl.innerHTML = `<div class="error">${message}</div>`;
}

function showNewsError(message) {
    newsEl.innerHTML = `<div class="error">${message}</div>`;
}

function renderWeather(current, locationText) {
    const code = WEATHER_CODES[current.weather_code] || { desc: 'Unknown', icon: '❓' };
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
}

async function fetchWeather(latitude, longitude, locationText) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh`;
    try {
        const res = await fetch(weatherUrl);
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        const data = await res.json();
        renderWeather(data.current, locationText);
    } catch (err) {
        showWeatherError(`Unable to load weather: ${err.message}`);
    }
}

async function reverseGeocode(latitude, longitude) {
    try {
        const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data?.results?.[0] || null;
    } catch {
        return null;
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

async function fetchNews(countryCode, cityName) {
    const country = (countryCode || 'US').toUpperCase();
    const lang = COUNTRY_LANGUAGE[country] || 'en';
    const hl = lang === 'en' ? `en-${country}` : lang;
    const query = cityName ? `?q=${encodeURIComponent(cityName)}&` : '?';
    const rssUrl = `https://news.google.com/rss/search${query}hl=${hl}&gl=${country}&ceid=${country}:${lang}`;
    const fallbackUrl = `https://news.google.com/rss?hl=${hl}&gl=${country}&ceid=${country}:${lang}`;

    const proxy = (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    async function loadRss(url) {
        const res = await fetch(proxy(url));
        if (!res.ok) throw new Error(`News API error: ${res.status}`);
        const xmlText = await res.text();
        const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
        if (doc.querySelector('parsererror')) throw new Error('Failed to parse news feed.');
        return Array.from(doc.querySelectorAll('item')).slice(0, 5);
    }

    try {
        let items = [];
        if (cityName) {
            try { items = await loadRss(rssUrl); } catch { items = []; }
        }
        if (items.length === 0) items = await loadRss(fallbackUrl);

        if (items.length === 0) {
            showNewsError('No news articles found.');
            return;
        }

        const list = items.map((item) => {
            const rawTitle = item.querySelector('title')?.textContent || 'Untitled';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const sourceEl = item.querySelector('source');
            const source = sourceEl?.textContent || '';
            const titleParts = rawTitle.split(' - ');
            const title = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : rawTitle;
            const derivedSource = source || (titleParts.length > 1 ? titleParts[titleParts.length - 1] : '');
            const meta = [derivedSource, formatRelativeTime(pubDate)].filter(Boolean).join(' • ');
            return `
                <li>
                    <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
                        <div class="news-title">${escapeHtml(title)}</div>
                        <div class="news-meta">${escapeHtml(meta)}</div>
                    </a>
                </li>
            `;
        }).join('');

        newsEl.innerHTML = `<ul class="news-list">${list}</ul>`;
    } catch (err) {
        showNewsError(`Unable to load news: ${err.message}`);
    }
}

async function loadLocationContent(latitude, longitude) {
    const place = await reverseGeocode(latitude, longitude);
    const locationText = place
        ? [place.name, place.admin1, place.country].filter(Boolean).join(', ')
        : `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    const countryCode = place?.country_code || 'US';
    const cityName = place?.name || '';

    await Promise.all([
        fetchWeather(latitude, longitude, locationText),
        fetchNews(countryCode, cityName),
    ]);
}

function loadLocation() {
    if (!('geolocation' in navigator)) {
        showWeatherError('Geolocation is not supported by your browser.');
        showNewsError('Geolocation is not supported by your browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            loadLocationContent(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            const messages = {
                1: 'Location permission denied.',
                2: 'Location unavailable.',
                3: 'Location request timed out.',
            };
            const msg = messages[error.code] || 'Unable to retrieve your location.';
            showWeatherError(msg);
            showNewsError(msg);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
}

loadLocation();
