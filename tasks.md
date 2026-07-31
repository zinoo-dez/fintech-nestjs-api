# Step-by-Step Implementation Roadmap (`tasks.md`)

> **Learning Strategy**: တစ်ဆင့်ပြီးတစ်ဆင့် (Step-by-step) စနစ်တကျ သင်ယူဆောက်ရွက်နိုင်ရန် ဖွဲ့စည်းထားသော လမ်းညွှန်ချက်ဖြစ်သည်။ Step တစ်ခုစီအတွက် Code များ၊ ရှင်းလင်းချက်များနှင့် Test လုပ်နည်းများ ပါဝင်မည်။

---

## 🚦 Phase 1: Environment Setup & Infrastructure Setup

- [ ] **Task 1.1: Project Initialization & NestJS Setup**
  - NestJS project အသစ် ဆောက်ခြင်း (`@nestjs/cli`).
  - Required packages များ ထည့်သွင်းခြင်း: `@nestjs/config`, `@nestjs/typeorm` (or Prisma), `pg`, `ioredis`, `@nestjs/bulletmq`, `bullmq`, `class-validator`, `class-transformer`, `bcrypt`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`.
- [ ] **Task 1.2: Docker Infrastructure Configuration**
  - `docker-compose.yml` ရေးသားခြင်း (PostgreSQL + Redis Database Container ရန်းရန်)။
  - `.env` file ဖြင့် environment variables များ ပြင်ဆင်ခြင်း။

---

## 🗄️ Phase 2: Database Entities & Database Module

- [ ] **Task 2.1: Entities Design & Setup**
  - `User`, `Event`, `Seat`, `Booking` Entities ရေးသားခြင်း။
  - Database Migration Running & Seeding script ရေးသားခြင်း (Test လုပ်ရန် Event ၁ ခုနှင့် Seats ခုံ ၅၀ ဖန်တီးပေးခြင်း)။
- [ ] **Task 2.2: Event & Seat Browsing Modules**
  - `EventsService` နှင့် `SeatsService` ပြုလုပ်ခြင်း။
  - Event အလိုက် Seats Matrix ပြသပေးနိုင်သည့် API Endpoint (`GET /events/:id/seats`) ပြုလုပ်ခြင်း။

---

## 🔒 Phase 3: Redis Integration & Atomic Concurrency Locking

- [ ] **Task 3.1: Redis Module & Lock Manager Setup**
  - `RedisModule` သီးသန့်ဆောက်ပြီး `IORedis` Client ကို Injectable Provider အဖြစ် သတ်မှတ်ခြင်း။
  - Atomic Lock Strategy (`SET key token NX PX 300000` သို့မဟုတ် Redlock Pattern) ဖြင့် Custom `LockService` ရေးသားခြင်း။
- [ ] **Task 3.2: Seat Reservation Locking Logic (`POST /seats/:id/hold`)**
  - Seat Hold Logic ရေးသားခြင်း (Redis Lock acquisition -> Check DB seat status -> Update status to `HELD` -> Release Redis Lock)။
  - Race condition ဖြစ်မဖြစ် စစ်ဆေးမည့် Error handling & response (409 Conflict) ရေးသားခြင်း။

---

## ⏱️ Phase 4: BullMQ Delayed Queue for 5-Minute Auto-Release

- [ ] **Task 4.1: BullMQ Module Setup**
  - `@nestjs/bullmq` သုံး၍ Queue Module ချိတ်ဆက်ခြင်း။
  - `SEAT_EXPIRATION_QUEUE` နာမည်ဖြင့် Queue Register လုပ်ခြင်း။
- [ ] **Task 4.2: Delayed Job Producer & Expiration Processor Worker**
  - Seat Hold လုပ်သည့်အချိန်တွင် 5 မိနစ် (300,000 ms) delay ဖြင့် BullMQ Job ထည့်သွင်းခြင်း (`add('expire-seat', { seatId, bookingId }, { delay: 300000 })`)။
  - `SeatExpirationProcessor` Worker ရေးသားခြင်း (5 မိနစ်ပြည့်ပါက Seat status သည် `BOOKED` မဖြစ်သေးပါက `AVAILABLE` ဟု ပြန်ပြောင်းပေးပြီး Booking ကို `EXPIRED` သို့ ပြောင်းပေးခြင်း)။

---

## 💳 Phase 5: Checkout, Async Payment & Ticket Confirmation

- [ ] **Task 5.1: Booking Checkout Logic (`POST /bookings/checkout`)**
  - User မှ ၅ မိနစ်အတွင်း ငွေချေသည့်အခါ `HELD` status မှ `BOOKED` သို့ ပြောင်းလဲပေးခြင်း။
  - BullMQ အထဲမှ Pending Delayed Expiration Job ကို ရုတ်သိမ်း/ကျော်လွှားခြင်း။
- [ ] **Task 5.2: Payment Queue Processing**
  - Payment simulation ကို BullMQ Worker ဖြင့် မစောင့်ဆိုင်းရဘဲ နောက်ကွယ်တွင် Async လုပ်ဆောင်ခြင်း။

---

## ⚡ Phase 6: Redis Caching, Session Handling & Concurrency Testing

- [ ] **Task 6.1: Redis Cache-Aside & Session Management**
  - `GET /events/:id/seats` API ကို Redis Cache တွင် 10 စက္ကန့် TTL ဖြင့် သိမ်းဆည်းပေးခြင်း။
  - JWT Token Logout သည့်အခါ Redis Token Blacklist သို့ ထည့်သွင်းစစ်ဆေးခြင်း။
- [ ] **Task 6.2: Load Testing & Double-Booking Verification Script**
  - Autocannon / Artillery သို့မဟုတ် custom Node.js script ဖြင့် တပြိုင်နက် Request 100 ဖြင့် ခုံတစ်ခုံထဲကို လုဝယ်ခိုင်းပြီး **Double-Booking မဖြစ်ကြောင်း** သက်သေပြခြင်း။
