# Database

MongoDB schema reference for the Vacations app. Schemas live in
`Backend/src/3-models/*`; this document is the high-level design summary.

## Collections

### `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `firstName` | string | 2..30 |
| `lastName` | string | 2..30 |
| `email` | string | lowercased; unique index |
| `passwordHash` | string | HMAC-SHA512(plainText, HASH_SALT) |
| `role` | `"User" \| "Admin"` | default `User`; never accepted from client |
| `createdAt`, `updatedAt` | Date | mongoose timestamps |

Indexes: `{ email: 1 } unique`.

### `vacations`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `vacationCode` | string | unique, e.g. `VAC-0001` |
| `destination` | string | |
| `description` | string | |
| `startDate` | Date | |
| `endDate` | Date | >= startDate |
| `price` | number | 0..10000 |
| `imageFileName` | string | filename only; file lives on disk |
| `continent` | enum | used by MCP `getFutureEuropeanVacations` |

Indexes: `{ vacationCode: 1 } unique`, `{ startDate: 1 }`.

### `likes`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | ref users |
| `vacationId` | ObjectId | ref vacations |
| `createdAt` | Date | |

Indexes: `{ userId: 1, vacationId: 1 } unique` (prevents duplicate likes).

## Seed strategy

See `Backend/src/2-utils/seeder.ts`. Runs on boot when `RUN_SEED=true` and the
target collection is empty. Anchored to **2026-04-13**, producing 3 past, 3
active, and 6 future vacations so every filter in the UI is immediately
meaningful.

## Why likes is a separate collection

- Cleanly represents a many-to-many relationship.
- Enforces idempotent likes at the database level via the compound unique index.
- Simplifies the aggregation for the vacations list and the admin likes report.
- Avoids embedding a growing array on each vacation document.
