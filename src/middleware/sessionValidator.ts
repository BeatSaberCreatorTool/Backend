import { Request, Response, NextFunction } from 'express';
import { URLSearchParams } from 'url';

const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';

async function sessionValidator(req: Request, res: Response, next: NextFunction) {
    // Check if the session and accessToken exist
    if (!req.session || !req.session.accessToken) {
        req.session.lastUrl = req.originalUrl;
        return res.redirect('/user/login');
    }

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = req.session.expiresIn ? req.session.expiresIn : 0;

    if (currentTime >= expirationTime) {
        // Token expired, attempt to refresh
        try {
            const params = new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: req.session.refreshToken!,
            });

            const response = await fetch(DISCORD_TOKEN_URL, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            // Update session with new token data
            req.session.accessToken = data.access_token;
            req.session.refreshToken = data.refresh_token || req.session.refreshToken;
            req.session.expiresIn = currentTime + data.expires_in;
            req.session.tokenType = data.token_type;

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Token refresh error:', error);
            req.session.lastUrl = req.originalUrl;
            return res.redirect('/user/login'); // Redirect if refresh fails
        }
    } else {
        // Token is still valid, continue
        next();
    }
}

export default sessionValidator;
