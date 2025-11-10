#!/usr/bin/env node
// Simple CLI: node index.js "City Name"
// Uses Open-Meteo (no API key) + Open-Meteo geocoding to get current weather.

const processArgs = process.argv.slice(2);
const city = processArgs.join(' ').trim();

 if (!city) {
  console.error('Usage: node index.js "City Name"');
  process.exit(1);
}

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function main() {
  try {
    // 1) Geocode city name to lat/lon (Open-Meteo geocoding)
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geo = await fetchJson(geocodeUrl);
    if (!geo.results || geo.results.length === 0) {
      console.error(`City not found: ${city}`);
      process.exitCode = 2;
      return;
    }

    const place = geo.results[0];
    const { latitude, longitude, name } = place;

    // 2) Fetch current weather for lat/lon
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
    const weatherData = await fetchJson(weatherUrl);
    const cw = weatherData.current_weather;
    if (!cw) {
      console.error('Weather data not available for', name);
      process.exitCode = 3;
      return;
    }

    const temp = cw.temperature;
    const code = cw.weathercode;
    const desc = weatherCodeMap[code] || 'Unknown';

    console.log(`Weather in ${name}: ${temp}°C, ${desc}`);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  }
}

main();
