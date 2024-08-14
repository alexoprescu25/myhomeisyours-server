import Account from '../models/Account.js';
import Activity from '../models/Activity.js';
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import { handleError } from '../utils/index.js';
import jwt from 'jsonwebtoken';

// *************************************** SIGN UP ******************************************

export const createAccount = async (req, res, next) => {
    const userId = req.userId;
    const { firstName, lastName, email, password, role } = req.body;

    try {
        const existingUser = await Account.findOne({ email: email });

        if (existingUser) {
            throw new createError(
                409,
                'The email address you entered is already associated with an existing account.',
                { expose: true }
            )
        }

        const currentUser = await Account.findById(userId);

        if (!currentUser) {
            throw new createError(
                401,
                'Permission denied. Try to login again',
                { expose: true }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const account = new Account({ 
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email, 
            role,
            password: hashedPassword, 
            provider: 'email',
            imageUrl: 'https://i.ibb.co/mGGbcFN/sbcf-default-avatar.webp',
            createdBy: {
                fullName: currentUser.fullName,
                alias: currentUser.alias,
                _id: currentUser._id
            }
        });

        const activity = new Activity({ userId, action: 'addAccount', target: `${firstName} ${lastName}`});

        activity.generateDescription();

        const createdAccount = await account.save();

        await activity.save();

        res.status(201).json({ 
            success: true,
            account: createdAccount
        })
    } catch (err) {
        handleError(res, err);
    }
}

// **************************************** SIGN IN ************************************************

export const signIn = async (req, res, next) => {
    const { email, password, rememberMe } = req.body;
    let loadedUser;

    try {
        const userDoc = await Account.findOne({ email: email, isDeleted: false });

        if (!userDoc) {
            throw new createError(
                404,
                'User account not found. Please check your credentials and try again.',
                { expose: true }
            );
        }

        loadedUser = userDoc;
        const doMatch = await bcrypt.compare(password, userDoc.password);

        if (!doMatch) {
            throw new createError(
                403,
                'Invalid credentials',
                { expose: true }
            );
        }

        await userDoc.save();

        const token = jwt.sign( 
            {
                userId: userDoc._id.toString(),
                email: userDoc.email,
                role: userDoc.role
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        ); 

        let refreshToken;
        
        if (rememberMe) {
            refreshToken = jwt.sign({ userId: userDoc._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: '23h' });
        }

        res.status(200).json({
            success: true,
            message: 'Successfully login user',
            token: token,
            refreshToken: refreshToken,
            userId: loadedUser._id.toString()
        })
    } catch (err) {
        handleError(res, err);
    } 
}
// **************************************** FETCH CURRENT USER ************************************************

export const fetchCurrentUser = async (req, res, next) => {
    const userId = req.userId;

    try {
        const userDoc = await Account.findById(userId).select('-password');

        if (!userDoc) {
            throw new createError(
                404,
                'User account not found. Please check your credentials and try again.',
                { expose: true }
            );
        }

        res.status(200).json({
            success: true,
            userData: userDoc,
            message: 'Account info'
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** LOG OUT ******************************************

export const logOut = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.sign(token, "", { expiresIn: 1 }, (logout, err) => {
        if (logout) {
            res.status(200).json({
                success: true,
                message: 'Successfully logout user',
            })
        } else {
            res.status(400).json({
                success: false,
                message: 'Error'
            })
        }
    })
}

// *************************************** REFRESH TOKEN ******************************************

export const refreshAuthentication = async (req, res, next) => {
    const { refreshToken } = req.body;
    
    try {
        if (!refreshToken) {
            throw new createError(
                401,
                'No refresh token, authorization denied.',
                { expose: true }
            )
        }

        const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

        if (!decodedToken) {
            throw new createError(
                401,
                'Token verification failed, authorization denied.',
                { expose: true }
            )
        }

        const userDoc = await Account.findById(decodedToken.userId);
  
        if (!userDoc) {
            throw new createError(404, 'Account not found', { expose: true })
        }

        const token = jwt.sign(
            {
                userId: userDoc._id.toString(),
                email: userDoc.email,
                role: userDoc.role,
                type: userDoc.type
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '2h' }
        ); 

        res.status(200).json({ token })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        res.status(err.statusCode).json({ message: err.message });
    }
}

// *************************************** DELETE ACCOUNT ******************************************

export const deleteAccount = async (req, res, next) => {
    const userId = req.userId;

    try {
        const existingUser = await Account.findById(userId);

        if (!existingUser) {
            throw new createError(
                404,
                'Account not found.',
                { expose: true }
            )
        }

        const deletedUser = await Account.findByIdAndRemove(userId);

        res.status(200).json({
            success: true,
            message: 'Your account was deleted'
        })
    } catch (err) {
        handleError(res, err);
    }
}