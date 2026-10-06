# ParkPal
Find Seattle Parks!

ParkPal connects you with your community by helping you explore all the beautiful parks Seattle has to offer. Search for parks by name or features, view them on an interactive map, and keep your own personal notes.

---

## Architecture Overview

- **Frontend**: React 18 SPA with React Router v6, Axios, RxJS, and `@react-google-maps/api`.
- **Backend**: Python 3.12 Flask API, PyJWT (RS256 asymmetric signatures), bcrypt, and psycopg2.
- **Database**: PostgreSQL (containerized with Docker / Docker Compose).

---

## Quickstart Guide

### 1. Start the Database (Docker)

Make sure Docker is running on your system, then start the PostgreSQL container:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5433` (avoiding local 5432 conflicts) and automatically creates the required tables (`users`, `feature`, `park`, `notes`).

---

### 2. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Seed the database with Seattle Parks data:
   ```bash
   python scripts/consolidate.py data/Seattle_Parks.json
   ```

5. Run the Flask backend:
   ```bash
   python app.py
   ```
   The backend will start at `http://127.0.0.1:5000`. RSA key pairs for JWT signing are generated automatically in `.cert/` on first launch.

---

### 3. Frontend Setup & Run

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure Google Maps API Key:
   Copy `.env.example` to `.env` and set `REACT_APP_GOOGLE_MAPS_API_KEY`:
   ```bash
   cp .env.example .env
   ```

4. Start the frontend:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features & Implementation Status

- [x] Search by park name (with autocomplete suggestions)
- [x] Search by features (multi-select filter)
- [x] Interactive map view with pan-to-park
- [x] View park features and hours
- [x] User registration & login with secure bcrypt password hashing
- [x] RS256 JWT authentication
- [x] Personal park notes (fetch, edit, and save with JWT auth)
- [x] User logout functionality
- [x] Containerized PostgreSQL setup
