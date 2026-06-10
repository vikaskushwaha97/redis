import express from 'express';
import {emailQueue} from './queue.js';

const app = express();



app.use(express.json());

app.post("/welcome-email", (req, res) => {
  const job = emailQueue.add('send-welcome-email', {
    to: req.body.to,
    name: req.body.name,
  },
  
  {    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },

  });

  res.json({message: 'Welcome email job added to the queue', jobId: job.id});
});

app.listen(3000, () => {
  console.log('API server is running on port https://localhost:3000');
});
