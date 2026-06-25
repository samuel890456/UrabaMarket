function apiOrigin() {
  const base = import.meta.env.VITE_API_URL;
  if (!base) return "";
  // ej: http://localhost:4000/api/v1  -> http://localhost:4000
  return String(base).replace(/\/api\/v1\/?$/, "");
}

export function resolveAssetUrl(url) {
  if (!url) return url;
  if (typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    const origin = apiOrigin();
    return origin ? `${origin}${url}` : url;
  }
  return url;
}

