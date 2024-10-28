import express, { Request, Response, Router } from 'express';
import { URLSearchParams } from 'url';
import UserProfile from '../../types/discordUser';
import { createUpdateUser } from '../../database/database';

const router: Router = express.Router();
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_USER_URL = 'https://discord.com/api/users/@me';

interface AuthorizeRequestQuery {
    code: string;
}

declare module 'express-session' {
    interface SessionData {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        tokenType?: string;
        userProfile: UserProfile;
    }
}

router.get(
    '/authorize',
    async (req: Request<{}, {}, {}, AuthorizeRequestQuery>, res: Response): Promise<void> => {
        const { code } = req.query;

        // Check if authorization code is provided
        if (!code) {
            res.status(400).json({ error: 'Authorization code is missing or invalid' });
            return;
        }

        // Set up URLSearchParams for token request
        const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI_CALLBACK!,
            scope: 'identify email', // Ensure email scope is requested
        });

        try {
            // Request to exchange code for tokens
            const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
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

            // Save token data to session
            req.session.accessToken = tokenData.access_token;
            req.session.refreshToken = tokenData.refresh_token;
            req.session.expiresIn = Math.floor(Date.now() / 1000) + tokenData.expires_in;
            req.session.tokenType = tokenData.token_type;

            // Fetch user information to get the user ID, name, and email
            const userResponse = await fetch(DISCORD_USER_URL, {
                headers: {
                    Authorization: `Bearer ${req.session.accessToken}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error('Failed to retrieve user information');
            }

            const userData: UserProfile = await userResponse.json();
            req.session.userProfile = userData;

            createUpdateUser(userData.id, userData.username, userData.email);

            res.status(200).json({ message: 'Authorization successful, user data saved to session' });
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

export default router;
