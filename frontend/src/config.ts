// config.ts
// This file handles environment variables for production and development.
// In Vite, environment variables must start with VITE_ to be exposed to the client.

// When deployed on Vercel/Netlify, we'll set VITE_API_URL to the Render backend URL.
// Locally, it defaults to localhost:3000.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
