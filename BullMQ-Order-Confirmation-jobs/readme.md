# BullMQ Order Confirmation Jobs

A learning demonstration project showcasing **BullMQ** - a powerful job queue library built on Redis. This project demonstrates how to implement asynchronous job processing with retry logic and exponential backoff strategies.

## What is BullMQ?

BullMQ is a fast, robust, and extensible queue for processing distributed jobs and messages in Node.js. It leverages Redis to manage job queues, making it ideal for:
- Sending emails asynchronously
- Processing heavy computations
- Handling scheduled tasks
- Managing background jobs with retry logic

## Project Structure

```
src/
├── api.js       # Express server for queueing jobs
├── queue.js     # Queue initialization and configuration
└── worker.js    # Job processing worker
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
- `bullmq` - Job queue library
- `ioredis` - Redis client
- `express` - API framework

## Configuration

### Redis Connection
The project connects to Redis at `localhost:6379`. Update the connection settings in [src/queue.js](src/queue.js) if your Redis server is on a different host/port:

```javascript
const connection = {
    host: 'localhost',
    port: 6379
};
```

## Running the Project

### Start the API Server
```bash
npm run api
```
The API server runs on `http://localhost:3000`

### Start the Worker
In a separate terminal:
```bash
npm run worker
```
The worker processes jobs from the queue.

### Development Mode
```bash
npm run dev
```

## API Endpoints

### Queue Welcome Email Job
**POST** `/welcome-email`

Request body:
```json
{
  "to": "user@example.com",
  "name": "John Doe"
}
```

Response:
```json
{
  "message": "Welcome email job added to the queue",
  "jobId": "1"
}
```

## Learning Points

### 1. **Job Queueing**
Jobs are added to the Redis-backed queue without blocking the API response:
```javascript
emailQueue.add('send-welcome-email', {
  to: req.body.to,
  name: req.body.name,
})
```

### 2. **Retry Strategy**
Jobs automatically retry on failure with exponential backoff:
- **Attempts**: 3 retries
- **Backoff Type**: Exponential
- **Initial Delay**: 5000ms (5 seconds)

Each retry waits longer than the previous attempt.

### 3. **Job Processing**
Workers listen to the queue and process jobs independently, allowing the API to remain responsive.

### 4. **Redis Connection Pool**
ioredis manages efficient Redis connections for high-throughput scenarios.

## Key Features Demonstrated

✅ Asynchronous job processing  
✅ Automatic retry with exponential backoff  
✅ Decoupled producer (API) and consumer (Worker)  
✅ Redis-backed persistence  
✅ Simple job configuration  

## Example Flow

1. **API Request** → Client sends POST request to `/welcome-email`
2. **Job Created** → API adds job to queue, returns immediately with job ID
3. **Queue Storage** → Job persisted in Redis
4. **Worker Processing** → Worker picks up job and processes it
5. **Retry Logic** → If worker fails, job retries with exponential backoff
6. **Completion** → Job marked complete in Redis

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
→ Ensure Redis is running: `redis-server`

### Jobs Not Processing
→ Verify worker is running in a separate terminal: `npm run worker`

### Queue Not Found
→ Check Redis connection settings in [src/queue.js](src/queue.js)

## Further Learning

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Basics](https://redis.io/docs/getting-started/)
- [Job Queue Patterns](https://bullmq.io/guide/introduction/)

## License

MIT
