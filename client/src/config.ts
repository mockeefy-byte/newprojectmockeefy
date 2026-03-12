// Backend URL for API and WebSocket (meetings, auth, etc.)
// Set VITE_API_URL in .env / Vercel / Render to your backend (e.g. https://newprojectmockeefy.onrender.com)
const hostname = window.location.hostname;

// Base URL must be origin only (e.g. http://localhost:3000). App paths already include /api/...
const raw = import.meta.env.VITE_API_URL;
export const API_BASE_URL = raw
    ? raw.replace(/\/api\/?$/, "").replace(/\/$/, "") // strip trailing /api and slash
    : import.meta.env.PROD
        ? "https://newprojectmockeefy.onrender.com"
        : `http://${hostname}:3000`;

export const API_URL = API_BASE_URL;

export const SOCKET_URL = API_BASE_URL;
