import express from 'express';
import dotenv from 'dotenv';
import { addEmailJob } from './queue';
import './gmail';
import './outlook';

dotenv.config();

const app = express();

app.get('/connect/:service', (req, res) => {
    const { service } = req.params;
    if (service === 'gmail') {
        res.redirect('/connect/gmail');
    } else if (service === 'outlook') {
        res.redirect('/connect/outlook');
    } else {
        res.status(400).send('Unknown service');
    }
});

app.get('/callback/:service', async (req, res) => {
    const { service } = req.params;
    const { code } = req.query;

    if (!code) {
        res.send('Error: No code provided.');
        return;
    }

    if (service === 'gmail') {
        await addEmailJob('gmail', code as string);
        res.send('Gmail authentication successful! You can close this tab.');
    } else if (service === 'outlook') {
        await addEmailJob('outlook', code as string);
        res.send('Outlook authentication successful! You can close this tab.');
    } else {
        res.status(400).send('Unknown service');
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 3000');
});
