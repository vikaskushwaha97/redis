import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());
const redis = new Redis( process.env.REDIS_URL || 'redis://localhost:6379');// Connect to Redis server
const queueKey = 'queue:email';

app.post('/email', async (req, res) => {
   const job ={
    to: req.body.to,
    subject: req.body.subject,
    body: req.body.body,
    createdAt: Date.now()
   };
   await redis.lpush(queueKey, JSON.stringify(job));
    res.json({queued: true, job});
});

app.get('/email/process-one', async (req, res) => {
    const job = await redis.rpop(queueKey);
    if (!job) {
        return res.json({ message: 'No jobs in queue' });
    }  
    const emailJob = JSON.parse(job);
    // Simulate email sending
    console.log(`Sending email to ${emailJob.to} with subject "${emailJob.subject}"`);
    res.json({ sent: true, job: emailJob });
});

app.listen(3000, () => {
    console.log('Email queue service running on port https://localhost:3000');
});
