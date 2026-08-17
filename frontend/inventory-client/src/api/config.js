// Toggle between mock data and real API calls.
// Set VITE_USE_MOCK in .env to 'false' to use real backend.
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';
