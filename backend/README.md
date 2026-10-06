# ParkPal Backend

The ParkPal backend is built with Python 3.12 Flask and connects to a PostgreSQL database.

---

## 1. Database Setup (Docker)

Use the provided `docker-compose.yml` in the project root to run PostgreSQL:

```bash
# From repository root:
docker compose up -d
```

This launches a PostgreSQL container on port `5433` (avoiding local host port conflicts) and automatically runs `scripts/init.sql` to initialize tables:
- `users`
- `feature`
- `park`
- `notes`

---

## 2. Python Environment Setup

1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 3. Data Ingestion

Populate the database with Seattle Parks data:

```bash
python scripts/consolidate.py data/Seattle_Parks.json
```

---

## 4. Run the Backend Server

```bash
python app.py
```

The server will automatically generate an RSA key pair (`.cert/privatekey.pem` and `.cert/publickey.cer`) if one does not exist, and will start on `http://127.0.0.1:5000`.

---

## 5. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Health check | No |
| GET | `/parks` | Get all parks with feature IDs and coordinates | No |
| GET | `/features` | Get all park features | No |
| POST | `/auth_register` | Register new user account | No |
| POST | `/auth_login` | Login and obtain RS256 JWT | No |
| POST | `/auth_getnote` | Fetch user's note for a specific park | Bearer JWT |
| POST | `/auth_editnote` | Save/update user's note for a specific park | Bearer JWT |