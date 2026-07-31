# Event Ticket Booking API - System Requirements & User Stories

> **Goal**: Building a high-concurrency, production-grade Event Ticket Booking API in NestJS for mid-level job readiness.
> Focus: Concurrency Control, 5-Minute Temporary Seat Holding, BullMQ Queue Processing, and Redis Session/Caching.

---

## 1. Project Overview

 high-demand flash sale သို့မဟုတ် ပွဲလက်မှတ် ရောင်းချပွဲများတွင် လူထောင်ပေါင်းများစွာ တစ်ပြိုင်နက် လက်မှတ်ဝယ်ယူသည့်အခါ ဖြစ်ပေါ်လာတတ်သော **Double-Booking (Race Condition)** ပြဿနာကို NestJS, Redis နှင့် BullMQ တို့ဖြင့် ထိန်းချုပ်ဖြေရှင်းမည့် API စနစ်ဖြစ်သည်။

### Core Tech Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (Prisma or TypeORM)
- **In-Memory Store / Lock**: Redis
- **Background Queue System**: BullMQ
- **Infrastructure**: Docker & Docker Compose

---

## 2. Epics & User Stories

### Epic 1: User Authentication & Session Management
- **US-1.1**: As a User, I want to register and log in to get a JWT token.
- **US-1.2**: As a User, I want my token to be verifiable and revokable via Redis (Session / Token Blacklisting on logout).

### Epic 2: Event & Seat Browsing (High Performance Caching)
- **US-2.1**: As a User, I want to view available events and seat layouts instantly.
- **US-2.2**: As a System, I want seat availability data to be cached in Redis (Cache-Aside pattern) to reduce database load during traffic spikes.

### Epic 3: Concurrency Seat Reservation (5-Minute Temporary Lock)
- **US-3.1**: As a User, I want to select and hold a seat for **5 minutes** while I enter payment details.
- **US-3.2**: As a System, I must guarantee that **no two users can reserve the exact same seat at the exact same millisecond** (Atomic Locking via Redis / DB Transaction).

### Epic 4: Automatic Seat Expiration (Queue Processing)
- **US-4.1**: As a System, if a user fails to pay within 5 minutes (300 seconds), a **BullMQ Delayed Job** must automatically release the seat back to `AVAILABLE` status.
- **US-4.2**: As a System, if the user pays successfully before 5 minutes, the delayed expiration job must be cancelled or gracefully skipped.

### Epic 5: Async Payment & Ticket Confirmation (Queue Worker)
- **US-5.1**: As a User, I want to submit my payment and receive instant booking confirmation.
- **US-5.2**: As a System, payment processing and final ticket generation should be offloaded to a background queue (BullMQ Worker) to keep API responses fast.

---

## 3. Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| **FR-01** | Atomic Seat Lock | Seat status change from `AVAILABLE` to `HELD` must be atomic using Redis Distributed Lock or Lua Script. |
| **FR-02** | TTL Expiration | Held seats must have an exact 5-minute TTL. Failure to complete booking within TTL must reset seat state. |
| **FR-03** | Double Booking Prevention | Under 1,000 requests/sec concurrency test, 0 double-bookings must occur. |
| **FR-04** | Queue Retries | Failed payment/ticket processing jobs in BullMQ must support exponential backoff retries. |
| **FR-05** | Cache Invalidation | When a seat status changes (`HELD` -> `BOOKED` or `AVAILABLE`), the Redis cache for that event's seat layout must update or invalidate immediately. |

---

## 4. Non-Functional Requirements

- **Performance**: Seat Availability API response time < 50ms (via Redis Cache).
- **Consistency**: Strong consistency for Seat Locking & Final Checkout.
- **Scalability**: Decoupled API servers and BullMQ Workers for horizontal scaling.
- **Observability**: Structured logs for lock acquisitions, queue jobs, and lock releases.
