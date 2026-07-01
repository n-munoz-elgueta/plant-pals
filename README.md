# Plant Pals 🪴

Co-parent your houseplants. A shared household where you and your partner
track every plant, log who watered what, and see a calendar of what's due.

- **`backend/`** — FastAPI + SQLite API: accounts, invite-code households,
  plants with photos, watering log, and a computed watering schedule.
- **`mobile/`** — Expo (React Native + TypeScript) app: plant list with
  due-status badges, add/edit plants with a species picker that suggests a
  watering interval, watering history, and a calendar view.

## Running the backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- Interactive API docs: http://localhost:8000/docs
- The SQLite database (`backend/plants.db`) and species seed data are
  created automatically on first start.
- `--host 0.0.0.0` matters: your phones reach the backend over your LAN.

Run the tests with:

```bash
cd backend && .venv/bin/python -m pytest
```

## Running the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the Expo Go app on each phone (both phones must be on
the same Wi-Fi as your computer). The app automatically points its API
calls at the machine running the Expo dev server on port 8000, so start the
backend on the same machine **first** — if the backend isn't running you'll
see "Network request failed" when you try to sign up.

To point at a deployed backend instead, set:

```bash
EXPO_PUBLIC_API_URL=https://your-server.example.com npx expo start
```

### Node and Expo SDK versions

This project targets **Expo SDK 54**, which is the version the Expo Go app
in the App Store / Play Store currently supports. If Expo Go reports
"Project is incompatible with this version of Expo Go," check that the
`expo` version in `mobile/package.json` matches whatever SDK your installed
Expo Go supports (the Expo Go app shows its supported SDK on its home
screen), and run `npx expo install --fix` after changing it.

Use **Node 22 LTS** for the mobile tooling. Node 26 currently crashes the
Expo CLI on this SDK (a silent failure during config resolution). If you
installed Node 22 alongside another version via Homebrew, prefix commands:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npx expo start -c
```

## How you use it

1. Both partners create an account.
2. One of you creates a household — the app shows a 6-letter invite code.
3. The other joins with that code.
4. Add plants: name them whatever you like, optionally pick a species
   (pre-fills a suggested watering interval — tweak it freely), add a photo.
5. When either of you waters a plant, tap **💧 I watered it**. The other
   person sees who watered it and when.
6. The **Calendar** tab shows which plants are due on which day; overdue
   plants surface on today.

## Good to know

- Watering intervals are per-plant and fully manual by design. The species
  suggestions are starting points; real watering needs depend on pot, light,
  and season, so adjust the interval to what your plant actually wants.
- Due dates are computed in UTC. If you water late at night, the recorded
  day may differ by one from your local date.
- Photos are stored on the backend's disk under `backend/media/`.

## Not built yet (v2 ideas)

- Hosting the backend somewhere both phones can reach away from home
  (Fly.io/Railway, or Tailscale to a home machine).
- Push notifications when plants come due.
- Postgres + cloud photo storage for a real deployment.
