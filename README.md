# SniperThink Developer Assignment

Full-stack distributed file processing architecture with a modern, scroll-storytelling React frontend.

## Architecture & Choices

- **Frontend**: React, Vite, Framer Motion, Intersection Observer. The animation architecture uses Framer Motion's physics-based scroll observer to efficiently tie scroll intent to UI progression without redundant and janky re-renders. Component elements use `whileInView` with negative margin offsets for precise entry animations that trigger organically as the user reads.
- **Backend Stack**: Node.js, Express, PostgreSQL, Redis, BullMQ.
- **Queue System**: A message queue (BullMQ + Redis) handles file processing asynchronously. Instead of blocking the single-threaded Node.js event loop while extracting heavy PDF texts or processing data strings, we offload this to dedicated worker instances. This keeps the API responding with low latency and scales gracefully because we can simply boot up more workers as demand spikes.
- **Worker Concurrency**: The `BullMQ` worker processes tasks currently tuned with `concurrency: 5`. This allows one Node worker to safely run 5 asynchronous tasks (waiting on I/O or DB) in parallel. It handles deduplication natively via job ids, and will intelligently retry jobs up to 3 times with exponential backoff if failure occurs.

## Getting Started

### Prerequisites

- Redis (local or remote)
- PostgreSQL (local or remote)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env # Set your keys here
npm run dev
```

### 2. Workers

```bash
cd backend
npm run worker
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
