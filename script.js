// coordinates -> weather logic extracted from HTML version

async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Unable to geocode city');
    const json = await res.json();
    if (!json.results || json.results.length === 0) {
        throw new Error('City not found');
    }
    return json.results[0]; // has latitude, longitude, name, country
}

async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Unable to fetch weather');
    return res.json();
}

function simplifyWeatherCode(code) {
    const mapping = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Drizzle: Light',
        53: 'Drizzle: Moderate',
        55: 'Drizzle: Dense',
        61: 'Rain: Slight',
        63: 'Rain: Moderate',
        65: 'Rain: Heavy',
        71: 'Snow fall: Slight',
        73: 'Snow fall: Moderate',
        75: 'Snow fall: Heavy',
        80: 'Rain showers: Slight',
        81: 'Rain showers: Moderate',
        82: 'Rain showers: Violent'
    };
    return mapping[code] || `Code ${code}`;
}

function weatherIcon(code) {
    // return Font Awesome class based on code
    const icons = {
        0: 'fa-sun',
        1: 'fa-sun',
        2: 'fa-cloud-sun',
        3: 'fa-cloud',
        45: 'fa-smog',
        48: 'fa-smog',
        51: 'fa-cloud-drizzle',
        53: 'fa-cloud-drizzle',
        55: 'fa-cloud-showers-heavy',
        61: 'fa-cloud-rain',
        63: 'fa-cloud-showers-heavy',
        65: 'fa-cloud-showers-heavy',
        71: 'fa-snowflake',
        73: 'fa-snowflake',
        75: 'fa-snowflake',
        80: 'fa-cloud-showers-heavy',
        81: 'fa-cloud-showers-heavy',
        82: 'fa-cloud-showers-heavy'
    };
    return icons[code] ? `fa-solid ${icons[code]}` : 'fa-solid fa-question';
}

document.getElementById('weather-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city-input').value.trim();
    if (!city) return;

    const resultDiv = document.getElementById('weather-result');
    resultDiv.textContent = 'Loading…';

    try {
        const coord = await getCoordinates(city);
        const data = await getWeather(coord.latitude, coord.longitude);

        const cw = data.current_weather;
        const iconClass = weatherIcon(cw.weathercode);
        resultDiv.innerHTML = `
            <h2><i class="${iconClass} weather-icon"></i> ${coord.name}, ${coord.country}</h2>
            <p><strong>Temperature:</strong> ${cw.temperature}°C</p>
            <p><strong>Wind:</strong> ${cw.windspeed} m/s (${cw.winddirection}°)</p>
            <p><strong>Condition:</strong> ${simplifyWeatherCode(cw.weathercode)}</p>
        `;
    } catch (err) {
        resultDiv.textContent = err.message;
    }
});