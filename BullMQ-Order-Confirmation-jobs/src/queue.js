import {Queue} from 'bullmq';

const connection = {
    host: 'localhost',
    port: 6379
};  






const EmailQueue = new Queue('email', { connection });
module.exports = {
    EmailQueue,
    connection
};