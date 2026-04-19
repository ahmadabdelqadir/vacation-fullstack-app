# Study Notes — Vacation FullStack App

Personal reference document. Kept outside the submission repo (add to
`.gitignore` if you want to keep this file local only).

All the explanations in one place, written simply, in the order they came
up during development. Read top to bottom before the interview.

---

## Table of contents

1. [MongoDB vs MySQL — why we picked Mongo](#1-mongodb-vs-mysql)
2. [Likes — why it's a separate collection](#2-likes-as-a-separate-collection)
3. [JWT + bcrypt — auth explained](#3-jwt--bcrypt)
4. [Joi validation — why + where](#4-joi-validation)
5. [Services vs controllers — the layered backend](#5-services-vs-controllers)
6. [Images on disk, filenames in DB](#6-images-on-disk-filenames-in-db)
7. [The seeder — what it does and why it's required](#7-the-seeder)
8. [Docker vs docker-compose](#8-docker-vs-docker-compose)
9. [`trust proxy` — the nginx-in-Docker gotcha](#9-trust-proxy)
10. [XSS sanitization skipping password fields](#10-xss-skipping-passwords)
11. [CSV with UTF-8 BOM for Excel](#11-csv-utf-8-bom)
12. [MCP — what it is and what it adds](#12-mcp)
13. [Recharts for the Reports page](#13-recharts)
14. [Framer Motion + shadcn/ui — why](#14-framer-motion--shadcnui)
15. [ObjectId vs numeric ID](#15-objectid-vs-numeric-id)
16. [Spec checklist — MCP page](#16-spec-checklist-mcp-page)
17. [Common interview questions & short answers](#17-common-interview-questions)

---

## 1. MongoDB vs MySQL

**Why Mongo:**

- The full-stack template we were given was already Mongo-based (uses Mongoose).
- Our entities (users, vacations, likes) are simple documents. No complex joins needed.
- Docker setup with Mongo is a one-liner (`mongo:7` image).
- The compound unique index on the likes collection gives us idempotent likes
  "for free" at the database layer.

**When MySQL would be better:** if the project required showing off relational
constraints, JOINs, foreign keys, or if the instructor asked for SQL specifically.
Neither applies here, so Mongo is the right call.

**Interview-ready one-liner:**
> "Mongo fits the template we were given and the data shape is document-like.
> Likes use a compound unique index, which guarantees no duplicate likes without
> any application-level locking."

---

## 2. Likes as a separate collection

**What we did:** instead of storing likes as an array inside each vacation or
each user document, we made a third collection called `likes` with documents
shaped like `{ userId, vacationId, createdAt }`.

**Why:**

- It's a **many-to-many** relationship (many users can like many vacations) —
  the textbook case for a separate collection.
- A compound unique index on `{ userId: 1, vacationId: 1 }` makes it
  **physically impossible** for a user to like the same vacation twice.
  The database rejects the second insert with duplicate-key error 11000.
- Aggregation queries for the Reports page are much cleaner when likes are
  first-class documents (one `$group` stage gets counts per vacation).
- If likes were embedded in vacation documents, the array would grow unbounded
  as the app scales, and Mongo has a 16 MB per-document limit.

**Interview-ready one-liner:**
> "Likes are a many-to-many relationship. A separate collection with a compound
> unique index gives us idempotent likes at the database level and makes the
> reports aggregation trivial."

---

## 3. JWT + bcrypt

### JWT (JSON Web Token)

When a user logs in, we generate a signed token that contains their user info
(id, name, email, role). The frontend stores it in `localStorage` and sends
it on every request in the `Authorization: Bearer <token>` header.

The backend verifies the signature on every protected route using `JWT_SECRET`.
If the signature is valid, the request continues; otherwise the middleware
returns 401.

**Token lifetime:** 3 hours. When it expires, the frontend HTTP interceptor
catches the 401 and auto-logs the user out.

### bcrypt (password hashing)

When a user registers, their password is **hashed** with bcrypt before being
saved. `bcrypt` stores the salt inside the hash itself, so we don't need to
manage salts separately. We never store the plain password anywhere.

On login, bcrypt.compare takes the typed password and the stored hash and
tells us if they match. It doesn't decrypt — it re-hashes the typed password
with the stored salt and compares.

**Why not plain SHA256?** Fast hashes are too fast. An attacker with the DB
could try billions of candidate passwords per second. bcrypt is **intentionally
slow** (10 rounds by default ≈ 100 ms per hash). That slowness is the security.

**About HMAC fallback in [`cyber.ts`](Backend/src/utils/cyber.ts):**
old accounts from an earlier build used HMAC-SHA512. The code still verifies
those old hashes so existing users can log in, and on their first successful
login it re-hashes their password with bcrypt. All new accounts go straight
to bcrypt.

**Interview-ready one-liner:**
> "JWT for auth, bcrypt for password hashing. Tokens carry user identity and
> role, they're signed with a secret in the env, and passwords are stored as
> bcrypt hashes — never plain text. If an old HMAC hash is found on login,
> the backend verifies it once and silently upgrades it to bcrypt."

---

## 4. Joi validation

Joi is a schema validation library. Every request body that matters
(register, login, vacation create/edit, AI question, MCP question) has a
Joi schema attached to its DTO class with a `validate()` method.

**Pattern** — every model class has this shape:

```ts
export class RegisterModel {
    public email!: string;
    public password!: string;
    // ...

    private static schema = joi.object({
        email: joi.string().required().email(),
        password: joi.string().required().min(4),
        // ...
    });

    public validate(): void {
        const result = RegisterModel.schema.validate(this);
        if (result.error) throw new ValidationError(result.error.message);
    }
}
```

Controllers just do:

```ts
const payload = new RegisterModel(request.body);
payload.validate();   // throws ValidationError (400) if invalid
```

The frontend **also** uses Joi (via `@hookform/resolvers/joi`) so users get
instant feedback as they type, but the backend is the final authority. Never
trust the frontend.

**Interview-ready one-liner:**
> "Every request body has a Joi schema. Controllers instantiate the DTO,
> call validate(), and let the centralized error middleware turn
> ValidationError into a 400 response. Frontend uses Joi too for the UX,
> but backend always revalidates."

---

## 5. Services vs controllers

The backend has this folder structure:

```
Backend/src/
├── assets/      images on disk
├── utils/       helpers (config, cyber/jwt/bcrypt, csv, seeder, mcp-helper)
├── models/      mongoose schemas + Joi DTOs + error classes + enums
├── services/    business logic
├── controllers/ Express routers (thin)
└── middleware/  security + error handling
```

**Rule:** controllers only do HTTP work — parse request, call service, return
response. Services have the actual logic.

Example — in [`auth-controller.ts`](Backend/src/controllers/auth-controller.ts):

```ts
private register = async (req, res, next) => {
    try {
        const payload = new RegisterModel(req.body);        // build DTO
        const result = await authService.register(payload); // delegate
        res.status(StatusCode.Created).json(result);        // respond
    } catch (err) {
        next(err);
    }
};
```

The actual work (email lowercasing, uniqueness check, bcrypt hashing,
database insert, token generation) lives in
[`auth-service.ts`](Backend/src/services/auth-service.ts).

**Why this matters:** you can test services without HTTP, swap HTTP for gRPC
later without touching logic, and the controllers stay readable.

---

## 6. Images on disk, filenames in DB

**How it works:**

1. Admin uploads a vacation with an image (multipart form data).
2. `express-fileupload` parses the file.
3. `uploaded-file-saver.add(file)` writes the bytes to
   `Backend/src/assets/images/` under a new UUID filename (`abc-123.jpg`)
   and returns that filename.
4. Mongo stores the filename (`"abc-123.jpg"`), NOT the bytes.
5. The browser requests `GET /api/vacations/images/abc-123.jpg` when it needs
   to display the image. The backend reads the file from disk and streams it.

**Why not store images in Mongo:**

- Binary data bloats documents. Our vacations collection stays ~6 KB total
  for 18 records. If images were in the documents, it'd be ~8 MB.
- Mongo isn't a file server. Filesystems are.
- Streaming a file from disk is a single `sendFile` call; streaming from
  Mongo needs GridFS and extra code.

**Verified:** our vacations collection averages **341 bytes per document**.
No binary data. The filesystem check confirms every `imageFileName` has a
matching real JPEG on disk.

**Interview-ready one-liner:**
> "Images live on the filesystem under `Backend/src/assets/images/`. Mongo
> stores only the filename. The `GET /api/vacations/images/:name` endpoint
> streams them with `response.sendFile`. Standard pattern — filesystems are
> optimized for binary, document stores aren't."

---

## 7. The seeder

### What it is

A TypeScript module ([`Backend/src/utils/seeder.ts`](Backend/src/utils/seeder.ts))
that runs once on backend boot (when `RUN_SEED=true`, which is the default).

### What it does

1. Copies the 18 vacation photos from `Database/seed/images/` into
   `Backend/src/assets/images/` (the runtime folder).
2. Inserts 3 default users (admin + 2 demo) if the `users` collection is empty.
3. Inserts 18 vacations (dates spread around 2026-04-13 for filter variety)
   if the `vacations` collection is empty.
4. Inserts ~24 realistic likes if the `likes` collection is empty.

### Why it's critical

Without the seeder, the instructor runs `docker compose up`, sees a fresh
empty app, tries to log in with the admin credentials documented in the
README, and hits 401. The seeder is what makes the "clone + one command + it
works" experience possible.

### Idempotent = safe to re-run

Each seed function starts with:

```ts
if (count > 0) return;
```

So:

- **First boot**: empty DB → seed inserts everything
- **Every subsequent boot**: data exists → seed skips
- **Admin adds a vacation, restarts**: that new vacation stays, seeder skips

It can never overwrite or delete anything.

**Interview-ready one-liner:**
> "The seeder populates the DB with 3 users, 18 vacations, and realistic
> likes on first boot. It's idempotent — checks each collection is empty
> before inserting — so restarts never overwrite changes."

---

## 8. Docker vs docker-compose

**Dockerfile** = a recipe for **building one image**. We have two:
- `Backend/Dockerfile` — packages the Node backend
- `Frontend/Dockerfile` — builds the Vite app and bakes it into an nginx image

**docker-compose.yml** = a recipe for **running multiple images together**.
Ours defines three services:
- `mongo` (using Docker Hub's official image)
- `backend` (built from `Backend/Dockerfile`)
- `frontend` (built from `Frontend/Dockerfile`)

plus the network they share, the volumes (persistent Mongo data, uploaded
images), and the environment variables passed into the backend.

**Analogy:**
- Dockerfile = recipe for one dish
- Image = the cooked dish
- Container = the dish on a plate being eaten
- docker-compose.yml = the dinner-party plan: "serve pasta + salad + dessert
  together, with these drinks, on this table"

Without docker-compose, running three services manually takes ~10 `docker run`
commands with networking flags. With compose, it's `docker compose up -d --build`.

**Interview-ready one-liner:**
> "Dockerfiles package each service into an image. docker-compose wires them
> together into one stack — mongo, backend, frontend — sharing a network,
> volumes, and env vars, so the whole app comes up with a single command."

---

## 9. `trust proxy`

One line in [`Backend/src/app.ts`](Backend/src/app.ts):
```ts
this.server.set("trust proxy", 1);
```

**Why:** in Docker, the browser hits nginx (frontend container) first, and
nginx forwards `/api/*` to the backend. nginx sets the `X-Forwarded-For`
header to pass along the real client IP.

Express by default ignores that header. `express-rate-limit` detects that
`X-Forwarded-For` is set but `trust proxy` is false and throws a
`ValidationError` — which we caught as a 401 in the browser.

`trust proxy` set to `1` tells Express to trust the **first** proxy hop
(our nginx container). After that, `req.ip` returns the actual client IP
and rate-limiting keys its buckets per real user.

**This caused the mysterious "login works via curl but not browser" bug.**
Fixed for good.

---

## 10. XSS skipping passwords

In [`security-middleware.ts`](Backend/src/middleware/security-middleware.ts),
the `preventXss` middleware runs `striptags` on every string field in the
request body to strip HTML tags — a defense against stored-XSS attacks.

**But:** if it stripped tags from the password field too, and someone's
password contained `<` or `>` characters, their typed password would get
modified **before hashing** at register time, and **again** before comparing
at login time. The stored hash would never match.

That's why passwords are explicitly excluded:

```ts
private readonly xssSkipFields = new Set(["password", "passwordHash", ...]);
```

Passwords don't need XSS protection — they're hashed before being stored,
so their contents never appear in HTML anyway.

**This was a real bug we caught during testing** and the fix is orthodox.

---

## 11. CSV UTF-8 BOM

The admin Reports page has a "Download CSV" button. The file content starts
with three magic bytes: `0xEF 0xBB 0xBF` — the UTF-8 Byte Order Mark.

**Why:** without the BOM, Excel on Windows defaults to interpreting the file
as a legacy encoding (Windows-1252), and any non-ASCII character in a
destination name ("Rio de Janeiro", accents, special characters) comes out
as garbled text (mojibake).

With the BOM, Excel recognizes it as UTF-8 and renders everything correctly.

`csv-helper.ts` handles this plus proper cell escaping (quoting any cell
that contains commas, quotes, or newlines).

**Interview-ready one-liner:**
> "The CSV starts with a UTF-8 BOM so Excel recognizes the encoding and
> displays special characters correctly. Without it, Excel guesses Windows-1252
> and you get mojibake."

---

## 12. MCP

**MCP (Model Context Protocol)** is a standard from Anthropic (adopted by
OpenAI and others) for letting AI models call real code on your server.

### What the AI page vs the MCP page do

| AI Recommendation | MCP Questions |
|---|---|
| Input: a destination | Input: any natural-language question |
| OpenAI answers from **training data** | Answer comes from **your live database** |
| "Tokyo has sushi and temples..." (generic) | "There are 4 active vacations" (real count right now) |

They solve different problems. AI = knowledge about the world.
MCP = live-data answers through a standard protocol.

### Our MCP implementation

Backend has a real MCP server on:
- `GET /sse` — lists available tools
- `POST /messages` — runs a selected tool

Six tools:
- `countActiveVacations`
- `getAverageVacationPrice`
- `getFutureVacations`
- `getFutureEuropeanVacations`
- `getMostLikedVacations`
- `getVacationLikesReport`

Each tool is registered with a Zod input schema and a handler that calls the
matching function in `mcp-domain-service.ts`. The reports page uses the
**same** functions, so REST report numbers and MCP tool numbers can never
disagree.

### Two modes on `POST /api/mcp/ask`

**Mode A — remote (needs `MCP_PUBLIC_URL` set):** our backend asks OpenAI
"here's the question, and here's the URL of my MCP server." OpenAI picks a
tool, calls it over the internet, writes a natural-language answer.

**Mode B — in-process (current setup):** our backend matches keywords in the
question ("active" → `countActiveVacations`, "average" → `getAverageVacationPrice`,
etc.), calls the tool handler directly in the same Node process, and if an
AI key is set, asks OpenAI to phrase the result. Without an AI key it uses
a deterministic template.

**Both modes run the same real MCP tool handler on real data.** The only
difference is who picks the tool.

### Why Mode B isn't "cheating"

The code path is:

```
request → backend → real MCP tool → real Mongo query → real data → response
```

Same path in both modes. Explaining it honestly:
> "With `MCP_PUBLIC_URL` set, OpenAI picks the tool; without it, my backend's
> keyword router picks the tool. Either way, the same handler runs and the
> answer comes from my live database — not from the model's training."

### What it adds that the AI page can't

1. **Live data** — ask "how many active vacations" and get today's count.
   The AI page can't do this no matter how smart the model is.
2. **Standard extensibility** — add a new tool (e.g., "how many users signed
   up this week") and any MCP-aware client can call it automatically.
3. **Separation of knowledge vs execution** — the LLM generates text; the
   MCP tools execute real queries. No hallucinated statistics.

**Interview-ready one-liner:**
> "The AI page generates text from the model's training. The MCP page answers
> questions against the live database through a standard protocol. Same tools
> power both the admin reports and the MCP answers, so the numbers always agree."

---

## 13. Recharts

The Reports page uses `Recharts` — a React charting library built on D3 —
to render the bar chart of destination vs. likes count.

**Why Recharts:**

- React-native components (write `<BarChart><Bar /></BarChart>` JSX)
- Responsive container handles window resizing automatically
- Built-in tooltips, axes, and legends
- Easy to explain in an interview — "it's D3, but componentized for React"

The chart data comes from `GET /api/admin/reports/vacations-likes`, which
returns `[{ destination, likes }]`. Recharts maps that directly onto the chart.

---

## 14. Framer Motion + shadcn/ui

### shadcn/ui

Not a component library — a **set of components you copy into your project**.
Built on Radix UI primitives + Tailwind CSS. Gives us:

- Accessible components (focus management, keyboard nav, ARIA)
- Full code ownership — the files live in `src/Components/ui/`
- Zero runtime bundle overhead (no library, just copied code)

Used for: Button, Card, Dialog, Input, Label, Textarea, Sonner (toasts), Badge,
Separator.

### Framer Motion

Animation library for React. We use it for:

1. **Page transitions** ([`PageTransition.tsx`](Frontend/src/Components/Shared/PageTransition/PageTransition.tsx))
   — fade + slight upward slide when routes change.
2. **Vacation card stagger** — when the filter changes on the vacations page,
   cards fade in one after another with a 0.05s stagger.
3. **Hero blobs on the home page** — animated conic gradients that float
   slowly (plain CSS, but the hero uses motion for the main title fade-in).

**Why it's appropriate:** travel/vacation products are visual and
"feel-heavy." Polished animation reads as professional without being gimmicky.

---

## 15. ObjectId vs numeric ID

Mongo assigns every document a 12-byte primary key called an **ObjectId**,
rendered as a 24-char hex string like `69e4cb0df31276e2fbb3b6a0`.

**Why ObjectId and not numeric 1, 2, 3:**

- ObjectId embeds a timestamp + machine id + counter, so it's globally unique
  across distributed writes.
- No central counter to manage.
- Mongo assigns it on insert automatically.
- Standard for every MongoDB-backed app.

We also add our own human-friendly business code `vacationCode` like
`VAC-0001`, `VAC-0002` — used for display, support tickets, and Postman
testing. Routes use `_id` because that's universal REST convention.

**When iterating in Postman:** grab the `_id` from the list response and
paste it into the collection's `{{vacationId}}` variable. Every `/:id`
route uses that variable.

**Interview-ready one-liner:**
> "Mongo uses 12-byte ObjectIds. Every document gets one automatically. They
> encode a timestamp so they're safe across distributed writes without a
> central counter. Routes use `_id`; we also have a human-readable
> `vacationCode` (`VAC-0001`) for display."

---

## 16. Spec checklist — MCP page

Re-reading the brief, here's exactly what was asked and what we delivered:

| Requirement | Implementation |
|---|---|
| Only accessible to authenticated users | `/mcp` route wrapped in `<ProtectedRoute>` in [Routing.tsx](Frontend/src/Components/LayoutArea/Routing/Routing.tsx). `POST /api/mcp/ask` guarded by `securityMiddleware.verifyToken`. |
| Unlogged-in visitors redirected to `/login` | `ProtectedRoute` checks `authStore.isAuthenticated` and navigates to `/login` if false. |
| Text box for a natural-language question | shadcn `<Textarea>` in [McpQuestions.tsx](Frontend/src/Components/PagesArea/McpQuestions/McpQuestions.tsx), 400-char limit, Joi-validated on backend. |
| Communication via backend MCP server | Real `McpServer` on `/sse` + `/messages`, six registered tools with Zod schemas, handlers call real Mongo aggregations. |
| Example question 1: "How many active holidays are there currently?" | Routed to `countActiveVacations` tool → runs `countDocuments({ startDate: { $lte: today }, endDate: { $gte: today } })` → returns count. |
| Example question 2: "What is the average price of the holidays?" | Routed to `getAverageVacationPrice` tool → runs `$avg` aggregation → returns dollar figure. |
| Example question 3: "What future holidays are there for European countries?" | Routed to `getFutureEuropeanVacations` tool → queries `{ startDate: { $gt: today }, continent: "Europe" }` → returns destinations list. |

**All checks pass.** The spec's MCP requirements are fully satisfied.

---

## 17. Common interview questions

Quick, honest, short answers.

### "Why MongoDB?"

> The template was already Mongo-based. Our entities are document-shaped and
> small. Mongo's compound unique index gives us idempotent likes for free.

### "Why Likes as a separate collection?"

> Many-to-many relationship. Compound unique index on `(userId, vacationId)`
> prevents duplicate likes at the DB level, stronger than any app check.

### "Why JWT for auth?"

> Stateless, easy to explain, industry-standard. The token carries user
> identity and role; middleware verifies it on every protected route.

### "Why bcrypt over SHA256?"

> bcrypt is intentionally slow — about 100 ms per hash at 10 rounds. That
> slowness is the security, because it slows down brute-force attacks on a
> leaked database.

### "Why are images on disk and not in Mongo?"

> Filesystems are optimized for binary; document stores aren't. We store just
> the filename (`"abc-123.jpg"`) in Mongo — about 15 bytes — and serve the
> actual bytes from disk through `GET /api/vacations/images/:name`.

### "Why Joi on both frontend and backend?"

> Frontend Joi gives instant feedback as the user types — better UX. Backend
> Joi is the final authority because the frontend can't be trusted. The
> backend always re-validates.

### "Why a seeder?"

> So the instructor can clone the repo and run `docker compose up` and
> immediately have a working app with admin credentials, 18 vacations, and
> likes for the report chart. Idempotent so restarts never overwrite changes.

### "What is MCP and what does it add?"

> MCP is a standard protocol for letting AI models call real code on your
> server. Our MCP page lets users ask questions in natural language and
> get answers from the live database — the AI page just uses the model's
> training data. MCP also provides a standard extension point: any MCP-aware
> client can connect to `/sse` and use the tools.

### "Why `trust proxy`?"

> In Docker we run behind nginx. nginx sets `X-Forwarded-For` with the real
> client IP. Without `trust proxy`, express-rate-limit rejects requests that
> have that header. Setting it to `1` tells Express to trust the first proxy
> hop, which is our nginx container.

### "Why UTF-8 BOM in the CSV?"

> Excel on Windows guesses character encoding. Without the BOM it defaults to
> Windows-1252 and non-ASCII characters render as garbage. The BOM makes
> Excel detect UTF-8 and render correctly.

### "Why ObjectId instead of a numeric id?"

> Mongo assigns 12-byte ObjectIds automatically. They encode a timestamp and
> are globally unique across distributed writes. Numeric ids would need a
> central counter and a single writer.

### "What's the difference between Dockerfile and docker-compose.yml?"

> Dockerfile packages one service into an image. docker-compose.yml wires
> multiple services into a running stack — mongo, backend, frontend —
> with networking, volumes, and env vars. Single command brings everything up.

### "How do you protect admin routes?"

> Two layers. Frontend: `<AdminRoute>` checks the user's role before rendering.
> Backend: `securityMiddleware.verifyAdmin` decodes the JWT and rejects
> non-admins with 403. UI hides what isn't available, server enforces what's
> allowed.

### "Why do you split controllers and services?"

> Controllers only handle HTTP — parse request, call service, return response.
> Services hold the logic. This keeps controllers trivially readable and
> services testable without HTTP.

### "Why does the XSS sanitizer skip passwords?"

> Because stripping characters from a password would mean the hash stored at
> register time wouldn't match the typed password at login time. Passwords
> never appear in HTML anyway — they're hashed before storage and never
> returned to the client.

---

## Final mental checklist before the interview

- [ ] I can explain the layered backend (controllers → services → models)
- [ ] I can defend MongoDB + separate likes collection
- [ ] I can explain why bcrypt is different from fast hashes
- [ ] I can defend putting images on disk
- [ ] I can explain the seeder and why it's idempotent
- [ ] I can articulate what MCP adds over a plain AI call
- [ ] I can walk through Docker flow (Dockerfile → image → compose → stack)
- [ ] I understand ObjectId and can show it in Postman
- [ ] I can open any file and explain what its class does in 10 seconds

Good luck.
