import http from 'http';
import express from 'express';
import session from 'express-session';
import ws from 'ws';
import dotenv from 'dotenv';

import sessionValidator from './middleware/sessionValidator';

// Routes
import login from './endpoints/user/login';
import authorize from './endpoints/user/authorize';

import prot from './endpoints/test/prot';
import UserProfile from './types/discordUser';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });

// Declare global session types
declare module 'express-session' {
    interface SessionData {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        tokenType?: string;
        userProfile: UserProfile;
    }
}

// Configure session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: process.env.NODE_ENV === 'production' },
    })
);

// WebSocket server setup
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        ws.send(`Hello, you sent => ${message}`);
    });
});

// Base route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Routes for user
app.use('/user', login);
app.use('/user', authorize);

app.use('/test', sessionValidator, prot);

// Start server
server.listen(process.env.WEB_PORT, () => {
    console.log(`Server started on http://localhost:${process.env.WEB_PORT}`);
});
