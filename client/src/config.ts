// Backend URL for API and WebSocket (meetings, auth, etc.)
// Set VITE_API_URL in .env / Vercel / Render to your backend (e.g. https://newprojectmockeefy.onrender.com)
const hostname = window.location.hostname;

export const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // no trailing slash
    : import.meta.env.PROD
        ? "https://newprojectmockeefy.onrender.com"
        : `http://${hostname}:3000`;

export const API_URL = API_BASE_URL;

export const SOCKET_URL = API_BASE_URL;
