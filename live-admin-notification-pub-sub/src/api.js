import express from 'express';
 import Redis from 'ioredis';

const app = express();
app.use(express.json());

const publisher = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379'
);

app.post("/notifications", async (req, res) => {
    const payload = {   
        title: req.body.title|| "No Title",
        message: req.body.message,
        createdAt: new Date().toISOString()
    }

    const recivers = await publisher.publish('notifications', JSON.stringify(payload));

    res.json({message: 'Notification published', recivers});
});

app.listen(3000, () => {
    console.log('API server is running on port https://localhost:3000');
}); 