import express from 'express';
const router = express.Router();

import { isAuth } from '../middlewares/is-auth.js';
import { isAdmin } from '../middlewares/is-admin.js';

import {
    fetchAccount,
    deleteAccount,
    fetchAllAccounts,
    changePassword,
    updateBasicInformation
} from '../controllers/UserController.js';

router.get('/fetch-all', isAuth, isAdmin, fetchAllAccounts);

router.post('/delete', isAuth, isAdmin, deleteAccount);

router.post('/fetch-by-id', isAuth, isAdmin, fetchAccount);

router.post('/update', isAuth, isAdmin, updateBasicInformation);

router.post('/change-password', isAuth, isAdmin, changePassword);

export default router; 