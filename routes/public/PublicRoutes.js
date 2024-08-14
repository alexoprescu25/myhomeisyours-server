import express from 'express';
const router = express.Router();

import { isAuth } from '../../middlewares/is-auth.js';

import { 
    fetchPropertyById
} from '../../controllers/public/PublicController.js'; 

router.post('/property', fetchPropertyById);

export default router;