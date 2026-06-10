# Email Queue

A learning demonstration project showcasing **Redis-based job queuing** for email processing. This project demonstrates how to implement a simple, lightweight email queue using Redis lists without external job queue libraries.

## What is This Project?

This is a minimalist email queue implementation that:
- Uses **Redis lists** as a FIFO queue (First-In-First-Out)
- Provides an Express API for queueing emails
- Processes emails on-demand using a separate endpoint
- Demonstrates core Redis queue concepts

Perfect for learning Redis fundamentals and asynchronous job processing patterns.

## Project Structure

```
src/
└── index.js    # Express server with queue endpoints
```

## Setup & Installation

### Prerequisites
- **Node.js** v14+
- **Redis** server running locally or accessible

### Install Dependencies

```bash
npm install
```

This installs:
- `ioredis` - Redis client for Node.js
- `express` - Web framework

## Configuration

### Redis Connection

The project connects to Redis with the following priority:
1. `REDIS_URL` environment variable (if set)
2. Default: `redis://localhost:6379`

Set custom Redis connection:
```bash
export REDIS_URL=redis://your-redis-host:6379
```

Or in the code, modify [src/index.js](src/index.js):
```javascript
const redis = new Redis('redis://localhost:6379');
```

## Running the Project

```bash
npm run dev
```

The API server runs on `http://localhost:3000`

## API Endpoints

### Queue an Email
**POST** `/email`

Request body:
```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "body": "Welcome to our service"
}
```

Response:
```json
{
  "queued": true,
  "job": {
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "Welcome to our service",
    "createdAt": 1718044800000
  }
}
```

### Process One Email
**GET** `/email/process-one`

Retrieves and processes the oldest email in the queue.

Response (if jobs exist):
```json
{
  "sent": true,
  "job": {
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "Welcome to our service",
    "createdAt": 1718044800000
  }
}
```

Response (if queue is empty):
```json
{
  "message": "No jobs in queue"
}
```

## How It Works

### Queue Operation (LPUSH)
When you POST to `/email`, the job is pushed to the **left** side of the Redis list:

```javascript
await redis.lpush(queueKey, JSON.stringify(job));
```

This adds new jobs to the head of the queue.

### Dequeue Operation (RPOP)
When you GET `/email/process-one`, the job is popped from the **right** side:

```javascript
const job = await redis.rpop(queueKey);
```

This removes the oldest job from the tail of the queue (FIFO behavior).

## Visual Queue Flow

```
Queue Key: "queue:email"

Step 1: Queue 3 emails
┌─────────────────┐
│ Email 1 (NEW)   │  ← LPUSH here
│ Email 2         │
│ Email 3 (OLD)   │
└─────────────────┘

Step 2: Process one email
┌─────────────────┐
│ Email 1         │
│ Email 2         │
│ Email 3 (OLD)   │  ← RPOP here
└─────────────────┘
                      (Email 3 is processed & removed)
```

## Learning Points

### 1. **Redis Lists**
Redis lists are ordered collections ideal for queues:
- `LPUSH` - Add to head (fast)
- `RPOP` - Remove from tail (fast)
- `LLEN` - Get queue length

### 2. **FIFO Queue Pattern**
Using LPUSH + RPOP creates a FIFO queue:
- New jobs added to the left
- Old jobs processed from the right
- Maintains order automatically

### 3. **Job Serialization**
Jobs are stored as JSON strings:
```javascript
JSON.stringify(job)  // Store
JSON.parse(job)      // Retrieve
```

### 4. **Stateless Processing**
Each request is independent - no persistent worker needed. Useful for on-demand processing or learning.

### 5. **Simple & Lightweight**
No external dependencies like BullMQ:
- Minimal overhead
- Direct Redis control
- Great for learning Redis operations

## Example Usage

### Terminal 1: Start the server
```bash
npm run dev
```

### Terminal 2: Queue emails
```bash
curl -X POST http://localhost:3000/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "alice@example.com",
    "subject": "Hello",
    "body": "This is a test email"
  }'

curl -X POST http://localhost:3000/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "bob@example.com",
    "subject": "Another email",
    "body": "Second email"
  }'
```

### Terminal 2: Process emails
```bash
# Process first email
curl http://localhost:3000/email/process-one

# Process second email
curl http://localhost:3000/email/process-one

# Queue is empty
curl http://localhost:3000/email/process-one
```

## Differences from BullMQ-Order-Confirmation-jobs

| Feature | Email-queue | BullMQ |
|---------|-------------|--------|
| **Library** | Raw Redis | BullMQ abstraction |
| **Complexity** | Simple (learning focused) | Feature-rich |
| **Retry Logic** | Manual | Automatic |
| **Persistence** | Basic | Advanced |
| **Worker Model** | On-demand | Background worker |
| **Best for** | Learning Redis | Production apps |

## Key Concepts

### Redis Queue Key
```javascript
const queueKey = 'queue:email';  // Namespace for queue
```

### Job Structure
```javascript
{
  to: 'user@example.com',
  subject: 'Email subject',
  body: 'Email body',
  createdAt: Date.now()  // Timestamp
}
```

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
→ Ensure Redis is running: `redis-server`

### Check Queue Length in Redis CLI
```bash
redis-cli
> LLEN queue:email
```

### View All Jobs in Queue
```bash
redis-cli
> LRANGE queue:email 0 -1
```

### Clear Queue
```bash
redis-cli
> DEL queue:email
```

## Further Learning

- [Redis Lists](https://redis.io/docs/data-types/lists/)
- [Redis Data Structures](https://redis.io/docs/data-types/)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Queue Patterns](https://redis.io/docs/management/patterns/)

## License

MIT
