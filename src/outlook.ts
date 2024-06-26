import express from 'express';
import dotenv from 'dotenv';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthorizationCodeRequest, ConfidentialClientApplication } from '@azure/msal-node';

dotenv.config();

const app = express();
const port = 3000;

import { LogLevel } from '@azure/msal-node';

const msalConfig = {
    auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel: any, message: any, containsPii: any) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: LogLevel.Info,
        },
    },
};

const pca = new ConfidentialClientApplication(msalConfig);

app.get('/connect/outlook', (req, res) => {
    const authCodeUrlParameters = {
        scopes: ['https://graph.microsoft.com/.default'],
        redirectUri: process.env.REDIRECT_URI!,
    };

    pca.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.redirect(response);
        })
        .catch((error) => console.log(JSON.stringify(error)));
});

app.get('/callback/outlook', async (req, res) => {
    const tokenRequest = {
        code: req.query.code as string,
        scopes: ['https://graph.microsoft.com/.default'],
        redirectUri: process.env.REDIRECT_URI!,
    };

    try {
        const response = await pca.acquireTokenByCode(tokenRequest);
        const accessToken = response?.accessToken ?? '';
        if (response) {
            res.send('Authentication successful! You can close this tab.');
        } else {
            res.send('Error retrieving tokens: Response is null.');
        }
        res.send('Authentication successful! You can close this tab.');
    } catch (error: any) {
        res.send(`Error retrieving tokens: ${error.message}`);
    }
});

const authProvider = {
    getAccessToken: async () => {
        const tokenRequest = {
            scopes: ['https://graph.microsoft.com/.default'],
        };

        const response = await pca.acquireTokenByClientCredential(tokenRequest);
        return response?.accessToken ?? '';
    },
};

const client = Client.initWithMiddleware({
    authProvider,
});

export const fetchEmails = async () => {
    const response = await client.api('/me/messages').get();
    return response.value;
};

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
