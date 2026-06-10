import {worker} from 'bullmq';
import {connection} from './queue';

const worker = new worker(
    'emails', 

    async (Job) => {
        console.log("processing email job...",Job.id, Job.data);
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work
        console.log(`Email sent to ${Job.data.to} with subject "${Job.data.subject}"`);
    },

 { connection }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
}); 
worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error:`, err);
});

