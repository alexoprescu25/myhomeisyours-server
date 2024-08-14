import express from 'express';
const router = express.Router();

import { isAuth } from '../middlewares/is-auth.js';
import { isAdmin } from '../middlewares/is-admin.js';

import {
    fetchActivities,
    fetchActivitiesByDate
} from '../controllers/ActivityController.js';

router.post('/fetch', isAuth, isAdmin, fetchActivities);

router.post('/fetch-by-date', isAuth, isAdmin, fetchActivitiesByDate);

export default router;