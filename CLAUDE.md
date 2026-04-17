# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript weather and time dashboard that runs entirely in the browser with no build step, no package manager, and no external dependencies. Deployed to GitHub Pages.

## Running Locally

Open `index.html` directly in a browser, or serve with any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

There are no build, lint, or test commands — the site is deployed as-is.

## Deployment

Push to `main` or `claude/weather-time-website-tq2hg` to trigger automatic GitHub Pages deployment via `.github/workflows/pages.yml`.

## Architecture

All logic lives in two files: `index.html` (structure + styles) and `app.js` (all functionality).

### `app.js` structure

**Time and background system** — `TIME_BACKGROUNDS` maps hour ranges to CSS gradients; `backgroundForHour(hour)` selects the current gradient. `updateClock()` runs every second and only triggers a background repaint when the time period changes (not every tick).

**Weather** — `fetchWeather(lat, lon)` calls the Open-Meteo API (no API key needed). WMO weather codes are decoded via the `WEATHER_CODES` lookup table (40+ codes mapped to text + emoji). Reverse geocoding uses the Open-Meteo geocoding endpoint to display the location name.

**News** — `fetchNews(countryCode, cityName)` tries three strategies in order: (1) Reddit JSON API (`r/<subreddit>/top.json`) using `COUNTRY_SUBREDDIT` for country-specific subreddits — no proxy needed, native CORS; (2) Google News RSS via `api.rss2json.com`; (3) Google News RSS via `corsproxy.io` then `allorigins.win`. `COUNTRY_LANGUAGE` maps ISO country codes to locale strings used in Google News fallback URLs.

**Geolocation** — `loadLocation()` requests browser geolocation, then fans out to both `fetchWeather()` and `fetchNews()` in parallel.

### Key conventions

- XSS prevention: all user-facing dynamic content goes through `escapeHtml()` before being injected into the DOM.
- External links use `rel="noopener noreferrer"`.
- No `innerHTML` with raw API data — build DOM strings through `escapeHtml()` wrappers.
