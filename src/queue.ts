import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv';
import { fetchEmails as fetchGmailEmails } from './gmail';
import { fetchEmails as fetchOutlookEmails } from './outlook';
import { analyzeEmailContent, generateReply } from './ai';

dotenv.config();

const connection = {
    host: 'localhost',
    port: 6379,
};

const emailQueue = new Queue('email-processing', { connection });

const worker = new Worker('email-processing', async (job) => {
    const { service, token } = job.data;
    let emails;

    if (service === 'gmail') {
        emails = await fetchGmailEmails();
    } else if (service === 'outlook') {
        emails = await fetchOutlookEmails();
    }

    if (emails) {
        for (const email of emails) {
            const label = await analyzeEmailContent(email.snippet);
            const reply = generateReply(label);
            // Here you would implement sending the reply via the respective email service API
            console.log(`Reply: ${reply}`);
        }
    }
}, { connection });

export const addEmailJob = async (service: string, token: string) => {
    await emailQueue.add('process-emails', { service, token });
};
