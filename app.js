// Clock & Weather UI — live clock, Open-Meteo weather, dark/light mode.

const CITIES = [
  { name: "Tunis", lat: 36.8, lon: 10.18 },
  { name: "Sfax", lat: 34.74, lon: 10.76 },
  { name: "Algiers", lat: 36.75, lon: 3.06 },
  { name: "Paris", lat: 48.85, lon: 2.35 },
  { name: "London", lat: 51.5, lon: -0.12 },
  { name: "New York", lat: 40.71, lon: -74.0 },
];

// WMO weather codes -> emoji + label
function describeWeather(code) {
  if (code === 0) return ["☀️", "Clear sky"];
  if (code <= 3) return ["⛅", "Partly cloudy"];
  if (code <= 48) return ["🌫️", "Fog"];
  if (code <= 57) return ["🌦️", "Drizzle"];
  if (code <= 67) return ["🌧️", "Rain"];
  if (code <= 77) return ["🌨️", "Snow"];
  if (code <= 82) return ["🌧️", "Showers"];
  if (code <= 99) return ["⛈️", "Thunderstorm"];
  return ["⛅", "Unknown"];
}

// ---------- clock ----------
function tickClock() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  document.getElementById("clock").textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById("date").textContent = now.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
tickClock();
setInterval(tickClock, 1000);

// ---------- weather ----------
const citySelect = document.getElementById("citySelect");
CITIES.forEach((c, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = c.name;
  citySelect.appendChild(opt);
});

async function loadWeather(index) {
  const city = CITIES[index];
  const err = document.getElementById("weatherError");
  err.hidden = true;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const cur = data.current;
    const [icon, desc] = describeWeather(cur.weather_code);
    document.getElementById("weatherIcon").textContent = icon;
    document.getElementById("weatherTemp").textContent = `${Math.round(cur.temperature_2m)}°C`;
    document.getElementById("weatherDesc").textContent = `${desc} · ${city.name}`;
    document.getElementById("humidity").textContent = `${cur.relative_humidity_2m}%`;
    document.getElementById("wind").textContent = `${Math.round(cur.wind_speed_10m)} km/h`;
  } catch (e) {
    err.textContent = "Could not load weather data. Check your connection.";
    err.hidden = false;
  }
}

citySelect.addEventListener("change", () => loadWeather(Number(citySelect.value)));
loadWeather(0);
// refresh weather every 10 minutes
setInterval(() => loadWeather(Number(citySelect.value)), 10 * 60 * 1000);

// ---------- theme ----------
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  toggle.textContent = theme === "light" ? "🌙" : "☀️";
  localStorage.setItem("cw-theme", theme);
}

applyTheme(localStorage.getItem("cw-theme") || "dark");
toggle.addEventListener("click", () => {
  applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
});
