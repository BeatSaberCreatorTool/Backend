import express, { Request, Response, Router } from 'express';
import UserProfile from '../../types/discordUser';

declare module 'express-session' {
    interface SessionData {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        tokenType?: string;
        userProfile: UserProfile;
    }
}

const router: Router = express.Router();

router.get('/prot', (req: Request, res: Response) => {

    res.json(req.session.userProfile);
});

export default router;