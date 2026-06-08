import Redis from 'ioredis';
import express from 'express';  

const app = express();
app.use(express.json());
const redis = new Redis( process.env.REDIS_URL || 'redis://localhost:6379');// Connect to Redis server

function otpKey(phone) { 
    return `otp:${phone}`;
}   
app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    await redis.set(otpKey(phone), otp, 'EX', 45); // Store OTP with 45 second expiration
    res.json({ message: 'OTP sent', otp }); // In production, send OTP via SMS instead of returning it
});
app.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    const SavedOtp = await redis.get(otpKey(phone));
    if(!SavedOtp) {
        return res.status(400).json({ message: 'OTP expired or not found' });
    }
    if(SavedOtp === otp) {
        await redis.del(otpKey(phone)); // Remove OTP after successful verification
        res.json({ message: 'OTP verified' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }   
});
app.get('/otp/:phone', async (req, res) => {
   const { phone } = req.params;
   const ttl = await redis.ttl(otpKey(req.params.phone));
   res.json({ ttl });
});
app.listen(3000, () => {
    console.log('OTP verification service running on port https://localhost:3000');
});