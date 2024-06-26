import { google } from 'googleapis';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

const oauth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const app = express();

app.get('/connect/gmail', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    res.redirect(authUrl);
});

app.get('/callback/gmail', async (req, res) => {
    const { code } = req.query;
    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code as string);
            oauth2Client.setCredentials(tokens);
            res.send('Authentication successful! You can close this tab.');
        } catch (error: any) {
            res.send(`Error retrieving tokens: ${error.message}`);
        }
    } else {
        res.send('Error: No code provided.');
    }
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });


export const fetchEmails = async (): Promise<any[]> => {
    try {
   
        const response = await gmail.users.messages.list({ userId: 'me' });
        const messages = response.data.messages;

        if (messages && messages.length > 0) {
      
            const emailPromises = messages.map(async (message) => {
                const msgResponse = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                });
                return msgResponse.data;
            });

            
            const emails = await Promise.all(emailPromises);
            return emails;
        } else {
            return []; 
        }
    } catch (error) {
        console.error('Error fetching emails:', error);
        throw error; 
    }
};


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
