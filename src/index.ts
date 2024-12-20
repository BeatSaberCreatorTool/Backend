import http from 'http';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';

import sessionValidator from './middleware/sessionValidator';
import * as database from './database/database';
import UserProfile from './types/discordUser';

// Routes
import login from './endpoints/user/login';
import logout from './endpoints/user/logout';
import authorize from './endpoints/user/authorize';
import twitch from './endpoints/user/twitch';
import logintwitch from './endpoints/user/logintwitch';
import prot from './endpoints/test/prot';

// Api Routes
import userAPI from './endpoints/api/user';
import twitchAPI from './endpoints/api/twitch';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Declare global session types
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

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.NODE_ENV === 'production' },
    })
);

// Static file handling for 'public' folder (no need for .html extension)
app.use(express.static(path.join(__dirname, '../public'), { extensions: ['html'] }));
app.use('/dashboard', sessionValidator, express.static(path.join(__dirname, '../dashboard'), { extensions: ['html'] }));

// Routes
app.use('/user', login);
app.use('/user', logout);
app.use('/user', authorize);
app.use('/user', sessionValidator, twitch);
app.use('/user', sessionValidator, logintwitch);
app.use('/test', sessionValidator, prot);


// Api Routes
app.use('/api/user', sessionValidator, userAPI);
app.use('/api/twitch', sessionValidator, twitchAPI);

// Custom 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/error/404.html'));
});

// Start server
server.listen(process.env.WEB_PORT, async () => {
    await database.init();
    console.log(`Server started on http://localhost:${process.env.WEB_PORT}`);
});
