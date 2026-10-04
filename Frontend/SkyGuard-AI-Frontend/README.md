# SkyGuard AI Frontend

This frontend follows the user's hand-drawn UI structure:

Temperature + Humidity + Pressure
        ↓
Anomaly Detection
        ↓
Malfunction Detection
        ↓
Communication Monitoring

It is a React + Vite dashboard and is designed to connect later to the SkyGuard FastAPI backend.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Folder

```text
SkyGuard-AI-Frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

The current UI uses demo data so it works immediately. Later, replace the demo values/functions in `App.jsx` with Axios API calls to the FastAPI backend.
