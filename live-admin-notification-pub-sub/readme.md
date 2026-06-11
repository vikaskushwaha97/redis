# Live Admin Notification Pub/Sub

A learning demonstration project showcasing **Redis Pub/Sub (Publish-Subscribe)** for real-time notifications. This project demonstrates how to implement a live notification system where publishers broadcast messages to multiple subscribers simultaneously.

## What is Pub/Sub?

**Pub/Sub** is a real-time messaging pattern where:
- **Publishers** send messages to channels without knowing who is listening
- **Subscribers** listen to channels and receive messages in real-time
- Messages are delivered instantly to all active subscribers
- No message persistence - only active subscribers receive messages

Perfect for:
- Live notifications
- Real-time updates
- Chat systems
- Event broadcasting
- Live dashboard updates

## Project Structure

```
src/
├── api.js           # Express server for publishing notifications
└── subscriber.js    # Subscriber that listens for notifications
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
- `express` - Web framework
- `ioredis` - Redis client

## Configuration

### Redis Connection

Both API and Subscriber connect to Redis using:
1. `REDIS_URL` environment variable (if set)
2. Default: `redis://localhost:6379`

Set custom Redis connection:
```bash
export REDIS_URL=redis://your-redis-host:6379
```

Or modify connection in code files (lines with `process.env.REDIS_URL`).

## Running the Project

### Terminal 1: Start the Subscriber
```bash
npm run subscriber
```

Output:
```
Subscribed to notifications channel
```

The subscriber now listens on the `notifications` channel.

### Terminal 2: Start the API Server
```bash
npm run api
```

Output:
```
API server is running on port https://localhost:3000
```

### Terminal 3: Publish Notifications
Send POST requests to publish notifications (see API section below).

## API Endpoints

### Publish a Notification
**POST** `/notifications`

Request body:
```json
{
  "title": "Admin Alert",
  "message": "User quota exceeded"
}
```

Response:
```json
{
  "message": "Notification published",
  "recivers": 1
}
```

**Key Detail**: The `recivers` value shows how many subscribers received the message in real-time.

## How It Works

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Redis Server                          │
│                                                          │
│             Channel: "notifications"                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Message Queue (Real-time)                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
       ▲                                     ▼
    PUBLISH                              SUBSCRIBE
       │                                     │
    API Server                        Subscriber Clients
    (Publisher)                      (Admin Dashboard,
                                      Monitoring Tools, etc)
```

### Message Flow

#### Step 1: Subscriber Connects
```javascript
subscriber.subscribe('notifications', (err) => {
    console.log('Subscribed to notifications channel');
});
```

Subscriber listens on `notifications` channel.

#### Step 2: Listener Registered
```javascript
subscriber.on('message', (channel, message) => {
    console.log("Recived on", channel, ":", JSON.parse(message));
});
```

Waits for incoming messages from the channel.

#### Step 3: API Publishes Message
```javascript
const recivers = await publisher.publish('notifications', JSON.stringify(payload));
```

API publishes a message to the `notifications` channel.

#### Step 4: Instant Delivery
```
Notification delivered instantly to all connected subscribers
```

All subscribers receive the message in real-time.

## Learning Points

### 1. **Pub/Sub Pattern**
- **Decoupled communication** - Publisher doesn't need to know about subscribers
- **Real-time delivery** - Messages sent instantly
- **One-to-many** - One publisher, multiple subscribers

### 2. **Redis PUBLISH Command**
```javascript
await publisher.publish('notifications', JSON.stringify(payload));
```
- Sends message to all subscribers on that channel
- Returns count of subscribers who received it

### 3. **Redis SUBSCRIBE Command**
```javascript
subscriber.subscribe('notifications', callback);
```
- Listens for messages on specified channel
- Enters "subscribe mode" - can only subscribe/unsubscribe

### 4. **Message Format**
Messages are JSON strings:
```javascript
{
  "title": "Admin Alert",
  "message": "User quota exceeded",
  "createdAt": "2026-06-11T10:30:00.000Z"
}
```

### 5. **Multiple Subscribers**
You can run multiple subscriber instances:
```bash
# Terminal 2
npm run subscriber

# Terminal 3
npm run subscriber

# Terminal 4
npm run api
# Publish notification - both subscribers receive it!
```

### 6. **Key Differences from Previous Projects**

| Feature | Email-queue | BullMQ | Pub/Sub |
|---------|-------------|--------|---------|
| **Pattern** | FIFO Queue | Job Queue | Real-time Messaging |
| **Persistence** | Redis Lists | Redis + Job Store | No (real-time only) |
| **Delivery** | On-demand | Background worker | Instant broadcast |
| **Subscribers** | Single processor | Multiple workers | Multiple listeners |
| **Use Case** | Task queue | Job processing | Live notifications |

## Example Workflow

### Setup (3 terminals)

**Terminal 1: Start Subscriber 1**
```bash
npm run subscriber
# Output: Subscribed to notifications channel
```

**Terminal 2: Start Subscriber 2**
```bash
npm run subscriber
# Output: Subscribed to notifications channel
```

**Terminal 3: Start API**
```bash
npm run api
# Output: API server is running on port https://localhost:3000
```

### Publish Notifications

**Terminal 4: Send notifications**
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User Registration",
    "message": "New user signed up: john@example.com"
  }'
```

### See Results

**Terminal 1 output:**
```
Subscribed to notifications channel
Recived on notifications : {
  title: 'User Registration',
  message: 'New user signed up: john@example.com',
  createdAt: '2026-06-11T10:30:00.000Z'
}
```

**Terminal 2 output:**
```
Subscribed to notifications channel
Recived on notifications : {
  title: 'User Registration',
  message: 'New user signed up: john@example.com',
  createdAt: '2026-06-11T10:30:00.000Z'
}
```

**Terminal 3 response:**
```json
{
  "message": "Notification published",
  "recivers": 2
}
```

Both subscribers received the same message simultaneously! That's Pub/Sub in action.

## Real-World Use Cases

### 1. **Admin Dashboard**
Real-time alerts for admins:
- User registration events
- Payment failures
- System errors
- Resource warnings

### 2. **Live Chat**
Users receive messages instantly in chat channels.

### 3. **Stock Price Updates**
Traders receive price updates across multiple terminals.

### 4. **System Monitoring**
Multiple monitoring tools subscribe to system events.

### 5. **WebSocket Integration**
WebSocket servers subscribe and broadcast to connected clients.

## Key Concepts

### Channel
```javascript
const channel = 'notifications';  // Named communication channel
```

### Payload Structure
```javascript
{
  title: 'Alert Title',
  message: 'Alert Details',
  createdAt: ISO timestamp
}
```

### Receiver Count
```javascript
const recivers = await publisher.publish('notifications', message);
// recivers = number of subscribers who received the message
```

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
→ Ensure Redis is running: `redis-server`

### Subscriber Not Receiving Messages
→ Ensure subscriber is running BEFORE publishing  
→ Pub/Sub only delivers to active subscribers

### Check Active Subscriptions (Redis CLI)
```bash
redis-cli
> PUBSUB CHANNELS
# Shows all active channels

> PUBSUB NUMSUB notifications
# Shows subscriber count on 'notifications' channel
```

### Clear All Pub/Sub Activity
```bash
redis-cli
> FLUSHALL  # Clears all Redis data
```

## Advanced Patterns

### Multiple Channels
```javascript
subscriber.subscribe(['notifications', 'alerts', 'updates']);
```

### Pattern-Based Subscriptions
```javascript
subscriber.psubscribe('admin:*');  // Subscribe to admin:notifications, admin:alerts, etc.
```

### Unsubscribe
```javascript
subscriber.unsubscribe('notifications');
```

## Further Learning

- [Redis Pub/Sub Documentation](https://redis.io/docs/interact/pubsub/)
- [ioredis Pub/Sub Guide](https://github.com/luin/ioredis#pubsub)
- [Pub/Sub Patterns](https://redis.io/docs/interact/pubsub/patterns/)
- [Real-time Systems](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)

## Learning Journey Summary

Your Redis learning progression:

1. **Email-queue** → Basic FIFO queue with Redis lists
2. **BullMQ** → Production job queue with retries and persistence
3. **Pub/Sub** → Real-time message broadcasting

You've now learned three fundamental Redis patterns! 🎓

## License

MIT
