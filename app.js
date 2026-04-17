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
        document.body.style.backgroundImage = bg.gradient;
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

const COUNTRY_SUBREDDIT = {
    US: 'news', GB: 'unitedkingdom', CA: 'canada', AU: 'australia',
    NZ: 'newzealand', IE: 'ireland', IN: 'india', ZA: 'southafrica',
    DE: 'de', AT: 'austria', CH: 'switzerland',
    FR: 'france', BE: 'belgium',
    ES: 'spain', MX: 'mexico', AR: 'argentina', BR: 'brasil', PT: 'portugal',
    IT: 'italy', NL: 'thenetherlands',
    SE: 'sweden', NO: 'norway', DK: 'denmark', FI: 'finland',
    PL: 'poland', CZ: 'czech', HU: 'hungary', RO: 'romania', GR: 'greece',
    RU: 'russia', UA: 'ukraine', TR: 'turkey',
    JP: 'japan', KR: 'korea', TW: 'taiwan', SG: 'singapore',
    MY: 'malaysia', ID: 'indonesia', TH: 'thailand', PH: 'philippines',
    IL: 'israel', EG: 'egypt',
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

function parseGoogleNewsTitle(rawTitle) {
    const parts = rawTitle.split(' - ');
    return {
        title: parts.length > 1 ? parts.slice(0, -1).join(' - ') : rawTitle,
        source: parts.length > 1 ? parts[parts.length - 1] : '',
    };
}

async function loadNewsViaRss2Json(rssSource) {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssSource)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`rss2json ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'rss2json bad response');
    return (data.items || []).slice(0, 5).map((item) => {
        const { title, source } = parseGoogleNewsTitle(item.title || 'Untitled');
        return { title, link: item.link || '#', pubDate: item.pubDate || '', source: item.author || source };
    });
}

async function loadNewsViaProxy(rssSource) {
    const proxies = [
        (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    ];
    for (const makeUrl of proxies) {
        try {
            const res = await fetch(makeUrl(rssSource));
            if (!res.ok) continue;
            const doc = new DOMParser().parseFromString(await res.text(), 'text/xml');
            if (doc.querySelector('parsererror')) continue;
            const items = Array.from(doc.querySelectorAll('item')).slice(0, 5);
            if (items.length === 0) continue;
            return items.map((item) => {
                const rawTitle = item.querySelector('title')?.textContent || 'Untitled';
                const { title, source } = parseGoogleNewsTitle(rawTitle);
                return {
                    title,
                    link: item.querySelector('link')?.textContent || '#',
                    pubDate: item.querySelector('pubDate')?.textContent || '',
                    source: item.querySelector('source')?.textContent || source,
                };
            });
        } catch { /* try next */ }
    }
    throw new Error('All news sources failed.');
}

async function loadNewsViaReddit(countryCode) {
    const subreddit = COUNTRY_SUBREDDIT[countryCode] || 'worldnews';
    const res = await fetch(
        `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=5`,
        { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error(`Reddit ${res.status}`);
    const data = await res.json();
    const posts = (data?.data?.children || []).slice(0, 5);
    if (posts.length === 0) throw new Error('No posts');
    return posts.map(({ data: p }) => ({
        title: p.title,
        link: p.url,
        pubDate: new Date(p.created_utc * 1000).toISOString(),
        source: `r/${subreddit}`,
    }));
}

async function loadNewsArticles(rssSource) {
    try { return await loadNewsViaRss2Json(rssSource); } catch { /* fall through */ }
    return await loadNewsViaProxy(rssSource);
}

async function fetchNews(countryCode, cityName) {
    const country = (countryCode || 'US').toUpperCase();

    try {
        let items = [];

        try {
            items = await loadNewsViaReddit(country);
        } catch {
            const lang = COUNTRY_LANGUAGE[country] || 'en';
            const hl = lang === 'en' ? `en-${country}` : lang;
            const query = cityName ? `?q=${encodeURIComponent(cityName)}&` : '?';
            const cityRssUrl = `https://news.google.com/rss/search${query}hl=${hl}&gl=${country}&ceid=${country}:${lang}`;
            const topRssUrl = `https://news.google.com/rss?hl=${hl}&gl=${country}&ceid=${country}:${lang}`;
            if (cityName) {
                try { items = await loadNewsArticles(cityRssUrl); } catch { items = []; }
            }
            if (items.length === 0) items = await loadNewsArticles(topRssUrl);
        }

        if (items.length === 0) {
            showNewsError('No news articles found.');
            return;
        }

        const list = items.map(({ title, link, pubDate, source }) => {
            const meta = [source, formatRelativeTime(pubDate)].filter(Boolean).join(' • ');
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
