import express from 'express';
const router = express.Router();

import { isAuth } from '../middlewares/is-auth.js';
import { isAdmin } from '../middlewares/is-admin.js';

import {
    createGuest,
    deleteGuest,
    fetchListings,
    fetchFutureGuestsByProperty,
    fetchPastGuestsByProperty
} from '../controllers/GuestController.js';

router.post('/create', isAuth, createGuest);

router.post('/delete', isAuth, deleteGuest);

router.post('/fetch', isAuth, fetchListings);

router.post('/fetch-future-guests', isAuth, fetchFutureGuestsByProperty);

router.post('/fetch-past-guests', isAuth, fetchPastGuestsByProperty);

export default router;