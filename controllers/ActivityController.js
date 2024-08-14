import Activity from '../models/Activity.js';
import createError from 'http-errors';
import { handleError } from '../utils/index.js';

// *************************************** SIGN UP ******************************************

export const fetchActivities = async (req, res, next) => {
    const { userId } = req.body;

    try {
        const activities = await Activity.find({ userId })
            .sort({ timestamp: 'descending' })
            .limit(10);

        if (!activities) {
            throw new createError(
                404,
                'No activity found',
                { expose: true }
            );
        }

        res.status(200).json({
            success: true,
            activities: activities
        })
    } catch (err) {
        handleError(res, err);
    }
}

//

export const fetchActivitiesByDate = async (req, res, next) => {
    const { userId, from, to } = req.body;

    try {
        const activities = await Activity.find({ 
            userId,
            timestamp: {
                $gte: from,
                $lt: to
            }
        })
        .sort({ timestamp: 'descending' })
        .limit(10);

        res.status(200).json({
            success: true,
            activities: activities
        })
    } catch (err) {
        handleError(res, err);
    }
}