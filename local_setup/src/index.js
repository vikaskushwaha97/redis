import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();

// Connect to Redis
const redis = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379'
);

app.get('/redis', async (req, res) => {
    try {
        const reply = await redis.ping();

        res.send(`Redis response: ${reply}`);
    } catch (error) {
        res.status(500).json({
            redis: 'Connection failed',
            error: error.message
        });
    }
});

// Connect to MongoDB
app.get('/mongodb', async (req, res) => {
    const url =
        process.env.MONGODB_URL ||
        'mongodb://localhost:27017/chai_aur_redis';

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url);
        }

        res.json({
            mongo: 'Connected to MongoDB',
            database: mongoose.connection.name
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);

        res.status(500).json({
            mongo: 'Failed to connect',
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});