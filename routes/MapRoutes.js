import express from 'express';
const router = express.Router();

import { isAuth } from '../middlewares/is-auth.js';

import {
    handleMap
} from '../controllers/MapController.js';

router.post('/geo-location', isAuth, handleMap);

export default router;