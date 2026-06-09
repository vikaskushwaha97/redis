import express from 'express';
import Redis from 'ioredis';    

const app = express();
app.use(express.json());
const redis = new Redis( process.env.REDIS_URL || 'redis://localhost:6379'); // Connect to Redis server

app.post('/user/:id/json', async (req, res) => { 
await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body), 'EX', 3600); // Store user profile as JSON with 1 hour expiration
res.json({ message: 'User profile cached as JSON' });
});
 
app.get('/user/:id/json', async (req, res) => {
    const raw = await redis.get(`user:${req.params.id}:json`); 
    if (!raw) {
        return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(JSON.parse(raw)); // Return user profile as JSON
});

app.post('/user/:id/hash', async (req, res) => {
    await redis.hmset(`user:${req.params.id}:hash`, req.body); // Store user profile as Redis hash
    await redis.expire(`user:${req.params.id}:hash`, 3600); // Set expiration to 1 hour
    res.json({ message: 'User profile cached as hash' });
});

app.get('/user/:id/hash', async (req, res) => {
    const userHash = await redis.hgetall(`user:${req.params.id}:hash`);
    if (Object.keys(userHash).length === 0) {
        return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(userHash); // Return user profile as hash
});

app.listen(3000, () => {
    console.log('User profile cache service running on port https://localhost:3000');
}); 