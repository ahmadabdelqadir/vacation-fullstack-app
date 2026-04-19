# Vacations - Full-Stack App

A full-stack TypeScript vacations platform with role-based access, vacation likes,
admin CRUD, reports, AI recommendations, and a backend MCP (Model Context Protocol)
server for natural-language questions about the database.

## Stack

- Database: MongoDB with Mongoose
- Backend: Node.js, Express 5, TypeScript, Joi, JWT, Helmet, express-rate-limit,
  express-fileupload, `@modelcontextprotocol/sdk`, `express-mcp-handler`, OpenAI SDK
- Frontend: React 19, Vite 7, TypeScript, React Router 7, react-hook-form + Joi,
  Recharts, axios, Sonner, shadcn/ui
- Containers: Docker + Docker Compose (`mongo`, `backend`, `frontend`)
- Tests: Mocha, Chai, Supertest

## Project layout

```text
Database/   Schema notes and 12 seed images.
Backend/    Node + Express backend with layered 1-assets / 2-utils / 3-models / 4-services / 5-controllers / 6-middleware structure.
Frontend/   React + Vite SPA.
STAGE-01..08*.md  Progress log for each implementation phase.
```

## Features

- Register and log in with Joi validation
- Role-aware menu and route protection
- Browse vacations with pagination, filters, and like/unlike
- Admin vacation management (add, edit, delete)
- Admin chart report and CSV export
- AI destination recommendation page
- MCP-backed question page for database answers
- Docker-ready local deployment

## Local setup

```bash
# 1) Install dependencies
cd Backend && npm install
cd ../Frontend && npm install

# 2) Create env files (see the env-var tables below for required values)
#    - Backend/.env       -> ENVIRONMENT, PORT, MONGODB_CONNECTION_STRING, JWT_SECRET,
#                            BCRYPT_ROUNDS, AI_API_KEY, AI_MODEL, RUN_SEED
#    - Frontend/.env      -> VITE_API_BASE_URL

# 3) Start MongoDB locally
#    or run: docker compose up -d mongo

# 4) Run the backend
cd Backend
npm start

# 5) Run the frontend
cd ../Frontend
npm start
```

Backend runs on `http://localhost:4000`.
Frontend runs on `http://localhost:3000`.
The Vite dev server opens the browser automatically through `vite.config.ts`.

On first boot the backend seeds:

- 1 admin user
- 2 demo users
- 18 vacations (4 past, 4 active, 10 future)
- a realistic set of likes for the report page

The seed data is anchored to `2026-04-13` so the required filters work during demos.

## Docker setup

```bash
docker compose up -d --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- MongoDB: `mongodb://localhost:27017`

Container notes:

- The frontend container serves the SPA through nginx and proxies `/api`, `/sse`, and `/messages`.
- The backend connects to MongoDB through the `mongo` service name.
- The `backend-images` volume preserves uploaded vacation images across restarts.

## Backend environment variables

| Variable | Purpose |
|---|---|
| `ENVIRONMENT` | `development`, `production`, or `test` |
| `PORT` | Backend HTTP port. Default: `4000` |
| `MONGODB_CONNECTION_STRING` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `BCRYPT_ROUNDS` | bcrypt cost factor for new password hashes. Default: `10` |
| `HASH_SALT` | Optional legacy HMAC salt used only to verify and transparently upgrade pre-bcrypt accounts |
| `AI_API_KEY` | OpenAI API key. Leave empty to disable AI features |
| `AI_MODEL` | OpenAI model name. Default: `gpt-4o-mini` |
| `MCP_PUBLIC_URL` | Public URL of `/sse` for remote OpenAI MCP tool usage |
| `RUN_SEED` | Whether to run the idempotent seed process on boot |

## Frontend environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL. Use `http://localhost:4000` locally, or `/` behind nginx in Docker |

## Seeded credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vacations.com` | `admin1234` |
| User | `user1@demo.com` | `user1234` |
| User | `user2@demo.com` | `user1234` |

## Password hashing

New passwords use `bcrypt`, which is the standard and interview-friendly choice for password storage.

To avoid breaking older local or demo databases that were created before this cleanup, the backend also supports a narrow migration path:

- if a stored password is already bcrypt, it is verified with bcrypt
- if a stored password is an older HMAC hash, a successful login upgrades it to bcrypt automatically

This keeps the project orthodox for new data while staying practical for existing local environments.

## API and Postman

Postman files:

- `Backend/postman/Vacation App API.postman_collection.json`
- `Backend/postman/Vacation App Local.postman_environment.json`

Suggested flow:

1. Import both files into Postman.
2. Run the Login request first.
3. Reuse the stored token for the protected requests.
4. Paste a vacation `_id` into the `vacationId` variable when testing like, edit, and delete flows.

## MCP question page

The frontend `MCP Questions` page calls `POST /api/mcp/ask`.

On the backend:

1. If both `AI_API_KEY` and `MCP_PUBLIC_URL` are set, OpenAI can discover and call the backend MCP tools through `/sse`.
2. Otherwise, the backend uses a deterministic in-process router that invokes the same MCP tool handlers directly.

Either way, the answer still flows through real MCP tool handlers. It is not a fake client-side shortcut.

The required sample questions are supported, including:

- How many active holidays are there currently?
- What is the average price of the holidays?
- What future holidays are there for European countries?

## Interview-defensible decisions

- MongoDB fits the provided template and the project's document-shaped data well.
- Likes are stored in a separate collection to model the many-to-many relationship cleanly and support report aggregation.
- bcrypt is used for modern password storage, with a temporary legacy migration bridge for older local hashes.
- Joi centralizes validation rules in a clean, explainable way.
- MCP runs on the backend so secrets stay server-side and the same domain logic powers both MCP answers and REST reports.
- CSV generation happens on the backend and includes a UTF-8 BOM so Excel opens it correctly.
- Role checks exist on both frontend and backend so the UI hides actions and the server still enforces them.

## Notes

- Keep `AI_API_KEY` empty if you want to run the project without AI provider access.
- After publishing the project to GitHub, add the repository URL to this README as required by the project instructions.
