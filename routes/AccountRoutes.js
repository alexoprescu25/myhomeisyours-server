import express from 'express';
const router = express.Router();

import { isAuth } from '../middlewares/is-auth.js';

import { 
    signIn,
    logOut, 
    deleteAccount,
    createAccount, 
    fetchCurrentUser,
    refreshAuthentication
} from '../controllers/AccountController.js'; 

router.post('/signin', signIn);

router.post('/signup', isAuth, createAccount);

router.post('/refresh', refreshAuthentication);

router.get('/fetch', isAuth, fetchCurrentUser); 

router.post('/logout', isAuth, logOut);

router.delete('/delete', isAuth, deleteAccount);

export default router;