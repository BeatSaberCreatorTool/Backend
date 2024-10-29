import express, { Request, Response, Router } from 'express';
import UserProfile from '../../types/discordUser';

declare module 'express-session' {
    interface SessionData {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        tokenType?: string;
        userProfile: UserProfile;
        lastUrl?: string;
    }
}

const router: Router = express.Router();

router.get('/prot', (req: Request, res: Response) => {

    res.send(`
        <a href="${process.env.TWITCH_REDIRECT_URI}">Link twitch</a>
        `)
});

export default router;