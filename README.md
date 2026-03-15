# SniperThink Developer Assignment

Full-stack application with a React frontend and a backend distributed file processing system built on Express, PostgreSQL, Redis, and BullMQ.

## Backend Status

The backend now covers the assignment requirements for Part 2:

- PDF and TXT upload support up to 10 MB
- Persistent file, job, and result records in PostgreSQL
- Redis-backed asynchronous job queue with BullMQ
- Concurrent worker processing with retry support
- Job status tracking with progress updates
- Processed result retrieval with word count, paragraph count, and top keywords

## Backend Architecture

- API server: Express handles authentication, upload requests, job status, and result retrieval.
- Storage: uploaded files are stored on disk under `backend/uploads`.
- Database: PostgreSQL stores users, files, jobs, leads, and results.
- Queue: BullMQ schedules background processing jobs on Redis.
- Workers: dedicated worker processes extract text from PDF/TXT files and persist analytics.

## Run Locally

### 1. Start infrastructure

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL on `5432` and Redis on `6379` using [backend/docker-compose.yml](backend/docker-compose.yml).

### 2. Configure the backend

```bash
cd backend
copy .env.example .env
```

Set `DATABASE_URL`, `REDIS_URL` or `REDIS_HOST` and `REDIS_PORT`, and `JWT_SECRET` in `backend/.env`.

### 3. Start the API server

```bash
cd backend
npm install
npm run dev
```

### 4. Start the worker

```bash
cd backend
npm run worker
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend Deliverables

- Database schema: [backend/schema.sql](backend/schema.sql)
- API documentation: [backend/docs/api.md](backend/docs/api.md)
- Worker and queue setup: [backend/docs/worker-queue.md](backend/docs/worker-queue.md)

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/files/upload`
- `GET /api/jobs/:jobId`
- `GET /api/jobs/:jobId/result`
- `POST /api/interest`
