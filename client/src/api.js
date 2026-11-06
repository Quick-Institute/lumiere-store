const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  try {
    return localStorage.getItem("lumiere_token") || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem("lumiere_token", token);
    else localStorage.removeItem("lumiere_token");
  } catch {}
}

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}