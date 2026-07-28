# POS system

This is a Django/PostgreSQL API with a Vite frontend. The baseline includes
token-protected APIs, production-safe environment configuration, and
transactional checkout stock locking.

## Run locally

1. Create a PostgreSQL database and copy `backend/.env.example` to
   `backend/.env`. Configure its values in your shell or process manager; Django
   intentionally refuses to start without `DJANGO_SECRET_KEY`.
2. Create a Python virtual environment, install dependencies, then migrate:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   $env:DJANGO_SECRET_KEY = "use-a-long-random-secret"
   $env:POSTGRES_PASSWORD = "your-postgres-password"
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. In another terminal, configure and run the frontend:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
   npm run start
   ```

## Production checklist

- Set a unique `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, production hostnames,
  HTTPS CORS origin(s), and real PostgreSQL credentials.
- Run `npm run build`; serve `frontend/dist` through a web server/CDN.
- Run Django behind a reverse proxy with TLS, database backups, and monitoring.
- Apply migrations and create an administrator before opening the system to staff.
- Test checkout, refund, cash-session close, and recovery/restore with your own
  operating procedures before processing live money.

## Security model

All API endpoints require an expiring token by default. Only the explicit login,
OTP, and password-recovery endpoints remain public. The frontend adds the token
to every request to the configured API and returns the user to login when a
session expires.
