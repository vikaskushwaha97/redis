import express from 'express';
import Redis from 'ioredis';
const app = express();
app.use(express.json());

// Connect to Redis
const redis = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379'
);
const BANNER_KEY = 'app:banner';

app.post('/banner', async (req, res) => {
    await redis.set(BANNER_KEY,req.body.message || 'Welcome to our site!');
    res.json({ message: 'Banner updated successfully' });
});

app.get('/banner', async (req, res) => {
    const bannerMessage = await redis.get(BANNER_KEY) ;
    res.json({ message: bannerMessage || 'Welcome to our site!' });
});

app.delete('/banner', async (req, res) => {
    await redis.del(BANNER_KEY);
    res.json({ message: 'Banner reset to default' });
});

app.get("/banner/exists", async (req, res) => {
    const exists = await redis.exists(BANNER_KEY);
    res.json({ exists: exists === 1 });
});
app.listen(3000, () => {
    console.log('Site Banner service is running on port 3000');
});