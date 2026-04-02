# Full-Stack Booking System — Project Specification

## Overview

A full-stack session booking platform built with a decoupled monorepo architecture. Users can browse available time slots on a calendar, select a slot, and confirm a booking. The system prevents double bookings via database-level concurrency control.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript, TailwindCSS |
| Backend    | NestJS, TypeScript                      |
| Validation | Zod (shared between frontend & backend) |
| Database   | PostgreSQL via Drizzle ORM              |
| Auth       | JWT (access + refresh tokens)           |
| Testing    | Jest, Supertest, Playwright             |

---

## Project Structure

```
/
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── page.tsx          # Home / Booking page
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── components/
│   │   │   │   ├── BookingWidget.tsx
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── TimeSlotPicker.tsx
│   │   │   │   ├── ConfirmationModal.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorMessage.tsx
│   │   │   └── lib/
│   │   │       └── api/
│   │   │           ├── bookings.ts   # Typed API fetch functions
│   │   │           └── auth.ts
│   │   ├── tailwind.config.ts
│   │   └── next.config.ts
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── database/
│       │   │   ├── database.module.ts
│       │   │   ├── drizzle.provider.ts
│       │   │   └── schema/
│       │   │       ├── bookings.schema.ts
│       │   │       ├── users.schema.ts
│       │   │       └── sessions.schema.ts
│       │   ├── bookings/
│       │   │   ├── bookings.module.ts
│       │   │   ├── bookings.controller.ts
│       │   │   └── bookings.service.ts
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── jwt.strategy.ts
│       │   │   └── jwt-auth.guard.ts
│       │   └── users/
│       │       ├── users.module.ts
│       │       └── users.service.ts
│       └── drizzle.config.ts
│
└── packages/
    └── shared/
        ├── schemas/
        │   ├── booking.schema.ts
        │   └── auth.schema.ts
        └── index.ts
```

---

## Database Schema

### `users` table
| Column       | Type        | Notes              |
|--------------|-------------|--------------------|
| id           | uuid (PK)   | auto-generated     |
| email        | varchar     | unique, not null   |
| name         | varchar     | not null           |
| passwordHash | varchar     | not null           |
| createdAt    | timestamp   | default now()      |

### `sessions` table (available slot configuration)
| Column          | Type      | Notes                        |
|-----------------|-----------|------------------------------|
| id              | uuid (PK) |                              |
| dayOfWeek       | integer   | 0=Sun, 1=Mon … 6=Sat         |
| startTime       | time      | e.g., "09:00"                |
| durationMinutes | integer   | e.g., 60                     |
| isActive        | boolean   | default true                 |

### `bookings` table
| Column          | Type        | Notes                              |
|-----------------|-------------|------------------------------------|
| id              | uuid (PK)   | auto-generated                     |
| userId          | uuid (FK)   | references users.id                |
| date            | date        | YYYY-MM-DD, not null               |
| timeSlot        | varchar     | e.g., "09:00", not null            |
| durationMinutes | integer     | not null                           |
| status          | varchar     | 'confirmed' \| 'cancelled'         |
| createdAt       | timestamp   | default now()                      |
| updatedAt       | timestamp   | auto-updated                       |

**Unique constraint**: `(date, timeSlot)` — prevents double bookings at DB level.

---

## API Specification

### Public Endpoints

#### `GET /bookings/available`
Returns available time slots for a specific date.

**Query Params:**
- `date` (required): `YYYY-MM-DD`
- `timezone` (optional): IANA timezone string, e.g., `Europe/Istanbul`

**Response 200:**
```json
{
  "data": [
    {
      "timeSlot": "09:00",
      "startTime": "09:00",
      "durationMinutes": 60,
      "available": true
    },
    {
      "timeSlot": "10:00",
      "startTime": "10:00",
      "durationMinutes": 60,
      "available": false
    }
  ],
  "message": "Available sessions retrieved",
  "statusCode": 200
}
```

---

### Protected Endpoints (JWT required)

#### `POST /bookings`
Creates a new booking. Validates availability atomically to prevent double bookings.

**Request Body:**
```json
{
  "userId": "uuid",
  "date": "2025-06-15",
  "timeSlot": "09:00"
}
```

**Response 201:**
```json
{
  "data": {
    "bookingId": "uuid",
    "date": "2025-06-15",
    "timeSlot": "09:00",
    "durationMinutes": 60,
    "status": "confirmed"
  },
  "message": "Booking confirmed",
  "statusCode": 201
}
```

**Error Responses:**
- `400` — Validation error (invalid date, missing fields)
- `401` — Unauthorized (no/invalid JWT)
- `409` — Conflict (slot already booked)
- `500` — Internal server error

---

#### `POST /auth/register`
```json
// Request
{ "email": "user@example.com", "name": "John", "password": "securepass" }
// Response 201
{ "data": { "accessToken": "...", "userId": "uuid" }, "statusCode": 201 }
```

#### `POST /auth/login`
```json
// Request
{ "email": "user@example.com", "password": "securepass" }
// Response 200
{ "data": { "accessToken": "...", "userId": "uuid" }, "statusCode": 200 }
```

#### `POST /auth/refresh`
Uses HttpOnly refresh token cookie to issue a new access token.

---

## Frontend Features

### Booking Widget
The main UI component, composed of:

1. **CalendarView** — Monthly calendar grid
   - Highlights dates that have available slots
   - Grays out fully booked or past dates
   - Clicking a date fetches and shows time slots

2. **TimeSlotPicker** — Time slot list for selected date
   - Shows each slot with start time and duration
   - Marks unavailable slots as disabled
   - Selecting a slot enables the "Book Session" button

3. **Confirmation Modal** — Pre-submit confirmation
   - Shows selected date and time
   - "Confirm" button triggers `POST /bookings`
   - Shows loading state during API call
   - On success: shows confirmation message with booking ID
   - On error: shows specific error (e.g., "Slot just taken")

### UI/UX Requirements
- Fully responsive (mobile-first)
- Skeleton loading states while fetching slots
- Optimistic UI on booking confirmation
- Toast notifications for success/error
- Accessible (ARIA labels, keyboard navigation)

---

## Authentication Flow

1. User registers or logs in → receives JWT access token
2. Access token stored in memory (React state / context)
3. Refresh token stored in HttpOnly cookie (set by backend)
4. All booking mutations include `Authorization: Bearer <token>` header
5. On 401 response → auto-refresh using refresh token endpoint
6. On refresh failure → redirect to login

---

## Concurrency Control

Double booking prevention uses a PostgreSQL transaction with row-level locking:

```ts
// bookings.service.ts
async bookSession(data: BookingRequest): Promise<Booking> {
  return await this.db.transaction(async (tx) => {
    // Lock existing bookings for this slot
    const existing = await tx
      .select()
      .from(bookings)
      .where(and(eq(bookings.date, data.date), eq(bookings.timeSlot, data.timeSlot)))
      .for('update')

    if (existing.length > 0) {
      throw new ConflictException('This time slot is no longer available')
    }

    const [booking] = await tx.insert(bookings).values({
      userId: data.userId,
      date: data.date,
      timeSlot: data.timeSlot,
      durationMinutes: 60,
      status: 'confirmed',
    }).returning()

    return booking
  })
}
```

---

## Validation (Zod Shared Schemas)

All schemas live in `packages/shared` and are imported by both apps:

```ts
// packages/shared/schemas/booking.schema.ts

export const BookingRequestSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'TimeSlot must be HH:MM'),
})

export const AvailableSessionSchema = z.object({
  timeSlot: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().positive(),
  available: z.boolean(),
})

export const AvailableSessionsResponseSchema = z.array(AvailableSessionSchema)

export type BookingRequest = z.infer<typeof BookingRequestSchema>
export type AvailableSession = z.infer<typeof AvailableSessionSchema>
```

---

## Testing Requirements

### Unit Tests (Jest)
- `BookingsService.getAvailableSessions()` — mock DB, test filtering logic
- `BookingsService.bookSession()` — mock DB, test conflict detection
- `AuthService.login()` / `register()` — mock users, test JWT generation

### Integration Tests (Supertest)
- `GET /bookings/available?date=` — valid date, invalid date, no available slots
- `POST /bookings` — success, conflict, unauthorized, invalid body
- `POST /auth/login` — success, wrong password, unknown email

### E2E Tests (Playwright)
- Full booking flow: load page → select date → select slot → confirm → see success
- Conflict scenario: two concurrent booking attempts for the same slot
- Auth flow: register → login → book → logout

---

## Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/booking_db
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Setup Instructions

```bash
# 1. Install dependencies (root)
npm install

# 2. Set up PostgreSQL and create database
createdb booking_db

# 3. Configure environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Run database migrations
cd apps/api && npm run db:migrate

# 5. (Optional) Seed available session slots
npm run db:seed

# 6. Start both apps
npm run dev  # from root (runs both web and api concurrently)
# OR individually:
cd apps/api && npm run start:dev   # http://localhost:3001
cd apps/web && npm run dev         # http://localhost:3000
```

---

## Evaluation Checklist

- [ ] Monorepo structure with `apps/web`, `apps/api`, `packages/shared`
- [ ] Shared Zod schemas used in both frontend and backend
- [ ] `GET /bookings/available` returns filtered available slots
- [ ] `POST /bookings` prevents double bookings via DB transaction
- [ ] JWT authentication implemented and protecting routes
- [ ] Calendar UI showing available/unavailable dates
- [ ] Time slot selection and confirmation modal
- [ ] Loading, error, and success UI states
- [ ] Responsive design
- [ ] Unit tests for booking service
- [ ] Integration tests for API endpoints
- [ ] E2E test for full booking flow
- [ ] README with setup instructions
- [ ] `.env.example` files provided