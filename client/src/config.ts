// Dynamically determine the socket URL based on the current window location
// This allows the app to work seamlessly on both localhost and the local network IP
const hostname = window.location.hostname;

export const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || "https://mockeefy.com")
    : `http://${hostname}:3000`;

export const API_URL = API_BASE_URL;

export const SOCKET_URL = API_BASE_URL;
