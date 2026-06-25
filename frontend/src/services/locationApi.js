const API_BASE = "https://api.countrystatecity.in/v1";
const API_KEY = import.meta.env.VITE_CSC_API_KEY || "eXVOOU1JV0V6azU3VWJCMXlQeUZoT25Rd2RuQnRKZDBQTjNQSllldw==";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7;

async function request(path) {
  const cacheKey = `csc:${path}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "X-CSCAPI-KEY": API_KEY
    }
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar la ubicacion");
  }

  const data = await response.json();
  writeCache(cacheKey, data);
  return data;
}

export async function getCountries() {
  const data = await request("/countries");
  return data.map(normalizeCountry).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStates(countryIso2) {
  if (!countryIso2) return [];
  const data = await request(`/countries/${countryIso2}/states`);
  return data.map(normalizeState).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCities(countryIso2, stateIso2) {
  if (!countryIso2 || !stateIso2) return [];
  const data = await request(`/countries/${countryIso2}/states/${stateIso2}/cities`);
  return data.map(normalizeCity).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeCountry(item) {
  return {
    id: item.id,
    name: item.name,
    iso2: item.iso2,
    emoji: item.emoji
  };
}

function normalizeState(item) {
  return {
    id: item.id,
    name: item.name,
    iso2: item.iso2
  };
}

function normalizeCity(item) {
  return {
    id: item.id,
    name: item.name
  };
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.createdAt > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ createdAt: Date.now(), data }));
  } catch {
    // localStorage can be full or unavailable; React Query still caches in memory.
  }
}
