import Account from '../models/Account.js';
import Activity from '../models/Activity.js';
import createError from 'http-errors';
import { handleError } from '../utils/index.js';
import bcrypt from 'bcryptjs';

// *************************************** SIGN UP ******************************************

export const fetchAllAccounts = async (req, res, next) => {
    try {
        const users = await Account.find({ isDeleted: false })
            .select('-password')
            .sort({ createdAt: 'descending' });

        if (!users) {
            throw new createError(
                404,
                'No user found',
                { expose: true }
            );
        }

        res.status(200).json({
            success: true,
            users: users
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** DELETE ACCOUNT ******************************************

export const deleteAccount = async (req, res, next) => {
    const { accountId } = req.body;
    
    try {
        const account = await Account.findById(accountId);

        if (!account) {
            throw new createError(
                404,
                'Account user found',
                { expose: true }
            );
        }

        account.isDeleted = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Account deleted'
        })
    } catch (err) {
        handleError(res, err);
    }
}


// *************************************** FETCH ACCOUNT BY ID ******************************************

export const fetchAccount = async (req, res, next) => {
    const { accountId } = req.body;

    try {
        const account = await Account.findById(accountId);

        if (!account) {
            throw new createError(
                404,
                'No user found',
                { expose: true }
            );
        }

        res.status(200).json({
            success: true,
            account: account
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** UPDATE BASIC INFORMATION ******************************************

export const updateBasicInformation = async (req, res, next) => {
    const userId = req.userId;
    const { accountId, data } = req.body;

    try {
        const account = await Account.findById(accountId);

        if (!account) {
            throw new createError(
                404,
                'No user found',
                { expose: true }
            );
        }

        account.firstName = data.firstName;
        account.lastName = data.lastName;
        account.fullName = data.firstName + ' ' + data.lastName;
        account.email = data.email;
        account.role = data.role;

        const activity = new Activity({ userId, action: 'update', target: `${account.firstName} ${account.lastName}`});

        activity.generateDescription();

        await account.save();

        await activity.save();

        res.status(200).json({
            success: true,
            message: 'Basic information updated'
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** CHANGE PASSWORD ******************************************

export const changePassword = async (req, res, next) => {
    const userId = req.userId;
    const { accountId, password } = req.body;

    try {
        const account = await Account.findById(accountId);

        if (!account) {
            throw new createError(
                404,
                'No user found',
                { expose: true }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        account.password = hashedPassword;

        const activity = new Activity({ userId, action: 'action: "Change Password"', target: `${account.firstName} ${account.lastName}`});

        activity.generateDescription();

        await account.save();

        await activity.save();

        res.status(200).json({
            success: true,
            message: 'Password changed'
        })
    } catch (err) {
        handleError(res, err);
    }
}