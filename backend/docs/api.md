# Backend API Documentation

Base URL: `https://sniperthink-task-7bi9.onrender.com/api`

## Authentication

### Register

`POST /auth/register`

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strong-password"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### Login

`POST /auth/login`

Request:

```json
{
  "email": "jane@example.com",
  "password": "strong-password"
}
```

Response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

Use `Authorization: Bearer <jwt>` for protected endpoints.

## File Upload

### Upload a file

`POST /files/upload`

Content type: `multipart/form-data`

Field:

- `file`: PDF or TXT, max 10 MB

Response:

```json
{
  "fileId": 7,
  "jobId": "ce29bcfa-9555-485d-8d7e-26fd0d56d303",
  "status": "pending",
  "progress": 0
}
```

## Job Tracking

### Get job status

`GET /jobs/:jobId`

Response:

```json
{
  "jobId": "ce29bcfa-9555-485d-8d7e-26fd0d56d303",
  "status": "processing",
  "progress": 55,
  "retryCount": 0,
  "errorMessage": null,
  "createdAt": "2026-03-15T10:00:00.000Z",
  "updatedAt": "2026-03-15T10:00:05.000Z"
}
```

Possible job states:

- `pending`
- `processing`
- `completed`
- `failed`

### Get processed result

`GET /jobs/:jobId/result`

If the job is complete:

```json
{
  "jobId": "ce29bcfa-9555-485d-8d7e-26fd0d56d303",
  "wordCount": 1200,
  "paragraphCount": 35,
  "topKeywords": ["system", "data", "process"]
}
```

If the job is still running:

```json
{
  "message": "Job processing is not complete yet",
  "jobId": "ce29bcfa-9555-485d-8d7e-26fd0d56d303",
  "status": "processing",
  "progress": 55
}
```

## Lead Submission

### Submit interest form

`POST /interest`

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "selectedStep": "Strategy"
}
```
