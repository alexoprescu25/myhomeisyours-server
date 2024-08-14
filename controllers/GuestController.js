import Guest from '../models/Guest.js';
import Activity from '../models/Activity.js';
import createError from 'http-errors';
import { handleError } from '../utils/index.js';

// *************************************** CREATE ******************************************

export const createGuest = async (req, res, next) => {
    const userId = req.userId;
    const { formData, propertyId, propertyName } = req.body;
    
    try {
        const guest = new Guest({
            ...formData,
            createdBy: userId,
            propertyId: propertyId
        })

        const activity = new Activity({ userId, action: 'create', target: `guest ${formData.name} for ${propertyName}`});

        activity.generateDescription();

        const createdGuest = await guest.save();

        await activity.save();

        res.status(201).json({
            success: true,
            guest: createdGuest
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** DELETE ******************************************

export const deleteGuest = async (req, res, next) => {
    const userId = req.userId;
    const { guestId, propertyName } = req.body;
    
    try {
        const guest = await Guest.findById(guestId);

        if (!guest) {
            throw new createError(
                404,
                'Guest not found',
                { expose: true }
            );
        }

        const activity = new Activity({ userId, action: 'delete', target: `guest ${guest.name} from ${propertyName}`});

        activity.generateDescription();

        await Guest.findByIdAndDelete(guestId);

        await activity.save();

        res.status(200).json({
            success: true,
            message: `${guest.name}'s booking was removed`
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** FETCH FUTURE GUESTS ******************************************

export const fetchFutureGuestsByProperty = async (req, res, next) => {
    const { propertyId } = req.body;

    const currentDate = new Date();

    try {
        const guests = await Guest.find({
            propertyId: propertyId,
            checkIn: { $gt: currentDate }
        })
        .populate('propertyId', 'name address')
        .populate('createdBy', 'fullName')
        .exec();

        if (!guests) {
            throw new createError(
                404,
                'No guest found',
                { expose: true }
            );
        }

        const nextBookingDate = await Guest.find({ 
            propertyId: propertyId,
            checkIn: { $gt: currentDate }
         })
        .sort({ checkIn: 1 })
        .limit(1);

        res.status(200).json({
            success: true,
            guests: guests,
            nextBookingDate: nextBookingDate ? nextBookingDate : ''
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** FETCH PAST GUESTS ******************************************

export const fetchPastGuestsByProperty = async (req, res, next) => {
    const { propertyId } = req.body;

    const currentDate = new Date();

    try {
        const guests = await Guest.find({
            propertyId: propertyId,
            checkIn: { $lte: currentDate }
        })
        .populate('propertyId', 'name address')
        .populate('createdBy', 'fullName')
        .exec();

        if (!guests) {
            throw new createError(
                404,
                'No guest found',
                { expose: true }
            );
        }

        res.status(200).json({
            success: true,
            guests: guests
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** FETCH GUESTS ******************************************

export const fetchListings = async (req, res, next) => {
    const { skip, limit, from, to } = req.body;

    const currentDate = new Date();

    const filter = {
        checkIn: { $gt: currentDate }
    };
    
    if (from && to) {
        filter.checkIn = {
            $gte: from,
            $lt: to
        };
    }

    try {
        const guests = await Guest.find(filter)
            .populate('propertyId', 'name address _id')
            .populate('createdBy', 'fullName')
            .sort({ checkIn: 'ascending' })
            .skip(skip)
            .limit(limit);

        if (!guests) {
            throw new createError(
                404,
                'Guest not found',
                { expose: true }
            );
        }

        const numberOfGuests = await Guest.countDocuments();
        
        res.status(200).json({
            success:true,
            guests: guests,
            number: numberOfGuests
        })
    } catch (error) {
        handleError(res, error);
    }
}