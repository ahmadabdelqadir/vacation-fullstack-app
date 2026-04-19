# Vacations - Full-Stack App

A full-stack TypeScript vacations platform with role-based access, vacation likes,
admin CRUD, reports, AI recommendations, and a backend MCP (Model Context Protocol)
server for natural-language questions about the database.

## Repository

https://github.com/ahmadabdelqadir/vacation-fullstack-app

## Stack

- Database: MongoDB with Mongoose
- Backend: Node.js, Express 5, TypeScript, Joi, JWT, Helmet, express-rate-limit,
  express-fileupload, `@modelcontextprotocol/sdk`, `express-mcp-handler`, OpenAI SDK
- Frontend: React 19, Vite 7, TypeScript, React Router 7, react-hook-form + Joi,
  Recharts, axios, Sonner, shadcn/ui
- Containers: Docker + Docker Compose (`mongo`, `backend`, `frontend`)

## Features

- Role-aware menu and route protection
- Browse vacations with pagination, filters, and like/unlike
- Admin vacation management (add, edit, delete)
- Admin chart report and CSV export
- AI destination recommendation page
- MCP-backed question page for database answers

## Docker setup

```bash
docker compose up -d --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- MongoDB: `mongodb://localhost:27017`

## Admin credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vacations.com` | `admin1234` |

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

The backend uses a deterministic in-process router that invokes the same MCP tool handlers directly.

## Notes

- Keep `AI_API_KEY` empty if you want to run the project without AI provider access.
