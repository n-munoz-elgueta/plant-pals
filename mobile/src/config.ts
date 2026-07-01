import Constants from "expo-constants";

// In development, reach the backend on the same machine that runs the Expo
// dev server (works from phones on the same LAN). Override with
// EXPO_PUBLIC_API_URL once the backend is deployed somewhere real.
const devHost = Constants.expoConfig?.hostUri?.split(":")[0];

const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (devHost ? `http://${devHost}:8000` : "http://localhost:8000");

// Strip any trailing slash so `${API_URL}/auth/login` never becomes a
// double-slashed path (which the backend 404s on).
export const API_URL = rawApiUrl.replace(/\/+$/, "");
