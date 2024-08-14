import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';

import { MONGO_URI } from './constants/index.js';
import { rqListener } from './utils/index.js';

import AccountRoutes from './routes/AccountRoutes.js';
import UserRoutes from './routes/UserRoutes.js';
import MapRoutes from './routes/MapRoutes.js';
import PropertyRoutes from './routes/PropertyRoutes.js';
import PublicRoutes from './routes/public/PublicRoutes.js';
import ActivityRoutes from './routes/ActivityRoutes.js';
import GuestRoutes from './routes/GuestRoutes.js';

const app = express();

app.use(helmet());

const corsOptions = {
    origin: ['http://localhost:3000', 'https://myhomeisyours.netlify.app', 'https://mhiy-7110400cda28.herokuapp.com'], // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
//     if (req.method === 'OPTIONS') {
//         return res.sendStatus(200);
//     }
    
//     next();
// });

app.use(bodyParser.json());

app.use('/account', AccountRoutes);
app.use('/user', UserRoutes);
app.use('/map', MapRoutes);
app.use('/property', PropertyRoutes);
app.use('/public', PublicRoutes);
app.use('/activity', ActivityRoutes);
app.use('/guest', GuestRoutes);

const PORT = process.env.PORT || 8080;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        const server = app.listen(PORT, () => { rqListener(PORT) });
    })
    .catch(err => {
        console.log(err)
    });   