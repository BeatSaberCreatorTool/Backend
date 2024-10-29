import express, { Request, Response, Router } from 'express';
import { URLSearchParams } from 'url';
import { createUpdateTwitch } from '../../database/database';

const router: Router = express.Router();
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_USER_URL = 'https://api.twitch.tv/helix/users';

interface AuthorizeRequestQuery {
    code: string;
}

router.get(
    '/twitch',
    async (req: Request<{}, {}, {}, AuthorizeRequestQuery>, res: Response): Promise<void> => {
        const { code } = req.query;

        // Check if authorization code is provided
        if (!code) {
            res.status(400).json({ error: 'Authorization code is missing or invalid' });
            return;
        }

        const params = new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID!,
            client_secret: process.env.TWITCH_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.TWITCH_REDIRECT_URI_CALLBACK!,
        });

        try {
            // Exchange code for access token
            const tokenResponse = await fetch(TWITCH_TOKEN_URL, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to retrieve token');
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Fetch user information from Twitch
            const userResponse = await fetch(TWITCH_USER_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Client-ID': process.env.TWITCH_CLIENT_ID!,
                },
            });

            if (!userResponse.ok) {
                throw new Error('Failed to retrieve user information');
            }

            const userData = await userResponse.json();
            const channelName = userData.data[0]?.display_name; // Extract the channel name

            if (!channelName) {
                res.redirect('/error/twitch');
            }

            createUpdateTwitch(req.session.userProfile.id, channelName);

            if (req.session.lastUrl) {
                const lastUrl = req.session.lastUrl;
                delete req.session.lastUrl;
                res.redirect(lastUrl);
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

export default router;
