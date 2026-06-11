import Redis from 'ioredis';
import express from 'express';

const app = express();
app.use(express.json());

const redis = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379'
);



app.post("/post/:id/view", async (req, res) => {
    const postId = req.params.id;
    const views = await redis.incr(`post:${postId}:views`);
    res.json({ message: 'View recorded', postId, views });
});




app.post("/leaderboard/score", async (req, res) => {
    const { userId, score } = req.body;
    if (!userId || typeof score !== 'number') {
        return res.status(400).json({ message: 'Invalid userId or score' });
    }
    const newScore = await redis.zincrby('leaderboard', score, userId);
    res.json({ message: 'Score updated', userId, totalScore: parseInt(newScore) });
});



app.get("/leaderboard", async (req, res) => {
    const topUsers = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    const leaderboard = [];
    for (let i = 0; i < topUsers.length; i += 2) {
        leaderboard.push({
            rank: (i / 2) + 1,
            userId: topUsers[i],
            score: parseInt(topUsers[i + 1])
        });
    }
    res.json({ leaderboard });
});




app.get("/leaderboard/:userid/rank", async (req, res) => {
    const userId = req.params.userid;
    const rank = await redis.zrevrank('leaderboard', userId);
    if (rank === null) {
        return res.status(404).json({ message: 'User not found in leaderboard' });
    }
    res.json({ userId, rank: rank + 1 });
});



app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});