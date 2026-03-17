# CommuniCare Frontend Scaffold

This is a React + Vite frontend scaffold for the CommuniCare web app.

## Included pages
- User Registration Interface
- Login Page
- Invitation Code Group Joining Page
- Dashboard
- Group Management Page
- CRC Self-Assessment Questionnaire Summary Interface
- Social Network Mapping

## Run locally
```bash
npm install
npm run dev
```

## Run with Docker
```bash
docker build -t communicare-frontend .
docker run -p 5173:5173 communicare-frontend
```

## Notes
- API calls are routed through `/api/*`.
- Vite is configured to proxy `/api` to `http://backend:8000` inside Docker Compose.
- Current services include mock fallbacks, so the UI can run even before the backend is complete.
