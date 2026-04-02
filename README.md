# Booking System

A full-stack session booking platform built as a monorepo.

## Project Overview

- `apps/web`: Next.js 14 (App Router), TailwindCSS, TypeScript
- `apps/api`: NestJS, Drizzle ORM, PostgreSQL, JWT authentication
- `packages/shared`: Shared Zod schemas, inferred types, and constants

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Setup

```bash
npm install
```

Build shared package once after install (required by both apps):

```bash
npm run build --workspace @booking/shared
```

Create environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

## Database (API)

```bash
# Generate SQL migration files
DATABASE_URL=postgresql://postgres:password@localhost:5432/booking_db npm run db:generate --workspace @booking/api

# Apply migrations
DATABASE_URL=postgresql://postgres:password@localhost:5432/booking_db npm run db:migrate --workspace @booking/api

# Seed sessions (Mon-Fri, 09:00-17:00, 60 minutes)
DATABASE_URL=postgresql://postgres:password@localhost:5432/booking_db npm run db:seed --workspace @booking/api
```

## Run the Project

Run both apps from the repository root:

```bash
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001`

## API Response Shape

All endpoints return this envelope:

```json
{
  "data": {},
  "message": "string",
  "statusCode": 200
}
```

## API Documentation

### `POST /auth/register`

Request:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepass"
}
```

Response `201`:

```json
{
  "data": {
    "accessToken": "jwt-token",
    "userId": "uuid"
  },
  "message": "User registered successfully",
  "statusCode": 201
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "securepass"
}
```

Response `200`:

```json
{
  "data": {
    "accessToken": "jwt-token",
    "userId": "uuid"
  },
  "message": "Login successful",
  "statusCode": 200
}
```

Also sets refresh token as an `HttpOnly` cookie.

### `POST /auth/refresh`

Uses refresh token cookie and returns a new access token.

Response `200`:

```json
{
  "data": {
    "accessToken": "jwt-token"
  },
  "message": "Access token refreshed",
  "statusCode": 200
}
```

### `GET /bookings/available?date=YYYY-MM-DD&timezone=Europe/Istanbul`

Response `200`:

```json
{
  "data": [
    {
      "timeSlot": "09:00",
      "startTime": "09:00",
      "durationMinutes": 60,
      "available": true
    }
  ],
  "message": "Available sessions retrieved",
  "statusCode": 200
}
```

### `POST /bookings` (JWT required)

Request:

```json
{
  "userId": "uuid",
  "date": "2026-04-06",
  "timeSlot": "09:00"
}
```

Response `201`:

```json
{
  "data": {
    "bookingId": "uuid",
    "date": "2026-04-06",
    "timeSlot": "09:00",
    "durationMinutes": 60,
    "status": "confirmed"
  },
  "message": "Booking confirmed",
  "statusCode": 201
}
```

Common errors:

- `400`: validation error
- `401`: unauthorized
- `409`: slot conflict
- `500`: internal server error

## Testing

```bash
# API unit tests
npm run test --workspace @booking/api

# API integration tests (Supertest)
npm run test:e2e --workspace @booking/api

# Web lint/type/build
npm run lint --workspace @booking/web
npm run typecheck --workspace @booking/web
npm run build --workspace @booking/web
```

### Playwright E2E

Install browser binaries once:

```bash
cd apps/web
npx playwright install chromium
```

Run E2E tests:

```bash
npm run test:e2e --workspace @booking/web
```
