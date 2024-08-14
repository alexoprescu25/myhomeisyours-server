import Property from '../../models/Property.js';
import createError from 'http-errors';
import { handleError } from '../../utils/index.js';

// *************************************** FETCH PROPERTY BY ID ******************************************

export const fetchPropertyById = async (req, res, next) => {
    const { propertyId } = req.body;

    try {
        const property = await Property.findOne({
                _id: propertyId
            })
            .select('-createdAt -updatedAt -createdBy -updatedBy -__v');

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }
        
        res.status(200).json({
            success: true,
            property: property
        })
    } catch (error) {
        handleError(res, error);
    }
}