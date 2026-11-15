# NIA Home Services

Responsive home-services website with a booking API and PostgreSQL, runnable with Docker Compose.

## Run locally

1. Install Docker Desktop and make sure it is running.
2. Copy `.env.example` to `.env` and set a strong, unique `POSTGRES_PASSWORD`.
3. Run `docker compose up --build -d`.
4. Open [http://localhost:8080](http://localhost:8080).

If port 8080 is already in use, change the host-side port in `docker-compose.yml`.

## Services

- `nia-web`: Nginx-served website and reverse proxy.
- `nia-api`: booking API at `/api/bookings` and health endpoint at `/api/health`.
- `nia-db`: PostgreSQL database with a persistent Docker volume.

## Useful commands

- Logs: `docker compose logs -f`
- Stop containers: `docker compose down`
- Rebuild and start: `docker compose up --build -d`
- Backup bookings: `docker compose exec nia-db pg_dump -U nia nia > nia-backup.sql`

Do not run `docker compose down -v` unless you intend to permanently delete the database volume and its saved booking requests.

## Before production

- Keep `.env` private and use a strong database password.
- Configure HTTPS at your production host.
- Booking requests are stored in PostgreSQL; the app does not yet send email/SMS notifications or provide a staff dashboard.
- The site uses externally hosted photography.

## Deploy to Vercel

Import the repository with the project root set to `.` (not `api`). The root contains the static site and Vercel API functions. Add `DATABASE_URL` as a Vercel environment variable using a hosted PostgreSQL connection string; the local Docker database is not reachable by Vercel. The first request initializes the `bookings` table.

The Docker-only Express server at `api/server.js` is excluded from Vercel deployments. The serverless routes are `api/bookings.js` and `api/health.js`.
