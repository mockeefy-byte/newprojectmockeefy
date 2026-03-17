// Backend URL for API and WebSocket (meetings, auth, etc.)
// Set VITE_API_URL in Vercel (or .env) to your Render backend – required for live meetings (sockets) and API.
const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

const raw = import.meta.env.VITE_API_URL;
// Must match your Render backend URL. Set VITE_API_URL in Vercel env so the client connects to Render for API + WebSocket.
const prodDefault = "https://newprojectmockeefy.onrender.com";

function normalizeBaseUrl(url: string): string {
    return url.replace(/\/api\/?$/, "").replace(/\/+$/, "").trim() || url;
}

export const API_BASE_URL =
    raw && String(raw).trim()
        ? normalizeBaseUrl(String(raw))
        : import.meta.env.PROD
            ? prodDefault
            : `http://${hostname}:5000`;

export const API_URL = API_BASE_URL;

// Sockets use same backend – required for live meeting signaling (offer/answer/ICE). Video/audio is WebRTC.
export const SOCKET_URL = API_BASE_URL;
