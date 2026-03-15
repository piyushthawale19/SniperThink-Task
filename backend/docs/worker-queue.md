# Worker and Queue Configuration

## Queue Stack

- Queue library: BullMQ
- Broker: Redis
- Worker runtime: Node.js
- Default queue name: `fileProcessing`

## Environment Variables

- `REDIS_URL`: complete Redis connection string
- `REDIS_HOST`: host value when `REDIS_URL` is not used
- `REDIS_PORT`: port value when `REDIS_URL` is not used
- `WORKER_CONCURRENCY`: number of jobs processed concurrently by one worker process
- `MAX_JOB_ATTEMPTS`: maximum retry attempts per job
- `JOB_RETRY_BACKOFF_MS`: exponential retry backoff base delay in milliseconds

## Run the Worker

```bash
cd backend
npm run worker
```

## Retry Behavior

- Each uploaded file creates one BullMQ job.
- Jobs retry automatically up to `MAX_JOB_ATTEMPTS`.
- Failed attempts move the database job record back to `pending`.
- The final failed attempt marks the job as `failed` and stores the error message.

## Concurrency Model

- BullMQ prevents the same queued job from being processed by more than one worker at the same time.
- One worker process can process multiple jobs concurrently through `WORKER_CONCURRENCY`.
- Multiple worker processes can be started in parallel for horizontal scaling.

Example:

```bash
cd backend
npm run worker
```

Open a second terminal and run the same command again to add another worker process.

## Progress Updates

The worker persists progress to PostgreSQL at these checkpoints:

- `10`: worker picked up the job
- `55`: file text extraction complete
- `90`: analytics complete and result ready to persist
- `100`: result stored and job marked as completed

## Local Development Infrastructure

Use Docker Compose to boot PostgreSQL and Redis locally:

```bash
cd backend
docker compose up -d
```
