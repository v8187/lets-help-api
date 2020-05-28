import helmet from 'helmet';
import { urlencoded, json } from 'body-parser';
import passport from 'passport';
import express from 'express';
import cors from 'cors';

import { getAuthRouter } from './routers/auth.router';
import { getApiRouter } from './routers/api.router';
import { setupAuthorization } from './auth';
import { initDatabase } from './db';
// Initialize Firebase Admin for Notifications
// import { sendNotificationToAdmins } from './firebase-sdk';

const app = express();

export const initApp = () => {
    /**
     * Disable the X-Powered-By header (in lower-case). Attackers can use this header (which is enabled by default)
     * to detect apps running Express and then launch specifically-targeted attacks.
     */
    app.use(helmet());

    // Set App Configurations
    app.use(urlencoded({ extended: false }));
    app.use(json());

    // Configure Passpoort and setup Authorization
    app.use(passport.initialize());
    setupAuthorization(passport);

    // Initialize Database
    initDatabase();



    // Configure CORS
    app.use(cors());
    // app.use(cors({
    //     origin: 'http://localhost:3000',
    //     optionsSuccessStatus: 200
    // }));

    // app.use(express.static(path.join(__dirname, 'public')));

    // Set App Routes
    // app.use(express.static(`${APP_ROOT}/public`));

    // Configure Routers
    app.get('/', (req, res) => res.send('Hello'));
    app.use('/auth', getAuthRouter(passport));
    app.use('/api', getApiRouter(passport));

    // Handle undefined routes
    app.use('*', function (req, res) {
        res.status(404).json({
            type: 'NOT_FOUND',
            error: 'Route not found',
            messsage: `"${req.method}" request for path "${req.originalUrl}" does not exist.`
        }).end();
    });

    return app;
};