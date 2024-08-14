import Account from '../models/Account.js';
import Activity from '../models/Activity.js';
import Property from '../models/Property.js';
import createError from 'http-errors';
import { handleError } from '../utils/index.js';
import sharp from 'sharp';
import { v4 } from 'uuid';

import fs from 'fs/promises'; // Correctly import fs/promises for promise-based operations
import path from 'path';

import { S3Client, DeleteObjectCommand, PutObjectCommand  } from '@aws-sdk/client-s3';

// Helper function to get the directory name of the current module
const getRootDir = () => {
    // Use import.meta.url to get the directory of the current module
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, '..'); // Navigate up two levels
};

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AmazonAccessKeyId,
        secretAccessKey: process.env.AmazonAccessKey,
    }, 
    region: 'eu-north-1'
});

// *************************************** CREATE PROPERTY ******************************************

export const createProperty = async (req, res, next) => {
    const userId = req.userId;
    const { formData } = req.body;

    const numberOfBathrooms = (formData.bathrooms && formData.bathrooms.length > 0) ? (
        formData.bathrooms
            .map(item => Number(item.value))
            .reduce((a, b) => a + b, 0)
            .toString()
    ) : 0;

    const numberOfBeds = (formData.bedrooms && formData.bedrooms.length > 0) ? (
        formData.bedrooms
            .map(item => Number(item.beds.length))
            .reduce((a, b) => a + b, 0)
            .toString()
    ) : 0;
    
    try {
        const property = new Property({
            ...formData,
            numberOfBedrooms: formData.bedrooms ? formData.bedrooms.length : 0,
            numberOfBathrooms: numberOfBathrooms,
            numberOfBeds: numberOfBeds,
            createdBy: userId
        })

        const activity = new Activity({ userId, action: 'create', target: `${formData.name}`});

        activity.generateDescription();

        const createdProperty = await property.save();
        
        await activity.save();

        res.status(201).json({
            success: true,
            property: createdProperty
        })
    } catch (err) {
        handleError(res, err);
    }
}

// *************************************** CREATE PROPERTY ******************************************

export const editProperty = async (req, res, next) => {
    const userId = req.userId;
    const { formData, propertyId } = req.body;

    const numberOfBathrooms = (formData.bathrooms && formData.bathrooms.length > 0) ? (
        formData.bathrooms
            .map(item => Number(item.value))
            .reduce((a, b) => a + b, 0)
            .toString()
    ) : 0;

    const numberOfBeds = (formData.bedrooms && formData.bedrooms.length > 0) ? (
        formData.bedrooms
            .map(item => Number(item.beds.length))
            .reduce((a, b) => a + b, 0)
            .toString()
    ) : 0;
    
    try {
        const property = await Property.findById(propertyId);
        
        if (!property) {
            throw new createError( 
                404,
                'Property not found',
                { expose: true }
            )
        }

        const existingAccount = await Account.findById(userId).select('fullName');
       
        if (!existingAccount) {
            throw new createError( 
                404,
                'Invalid credentials. Account not found',
                { expose: true }
            )
        }

        property.set({
            ...formData,
            numberOfBedrooms: formData.bedrooms ? formData.bedrooms.length : 0,
            numberOfBathrooms: numberOfBathrooms,
            numberOfBeds: numberOfBeds,
            updatedBy: [
                {
                    userId: userId,
                    name: existingAccount.fullName
                },
                ...property.updatedBy
            ]
        });

        const activity = new Activity({ userId, action: 'update', target: `${property.name}`});

        activity.generateDescription();

        const updatedProperty = await property.save();

        await activity.save();

        res.status(200).json({
            success: true,
            property: updatedProperty
        })
    } catch (err) {
        handleError(res, err);
    }
} 

// *************************************** UPLOAD IMAGE ******************************************

export const uploadPropertyImage = async (req, res, next) => {
    const files = req.files;

    if (!files) {
        throw new createError( 
            404,
            'No image provided!',
            { expose: true }
        )
    }

    try {
        const compressedImagesPromises = files.map(async (item) => {
            const compressedItemBuffer = await sharp(item.path)
                .resize(1280, 720) // width=300 & height=150
                .toFormat('jpeg') // convert to JPEG
                .jpeg({ quality: 80 }) // compress it with a quality level of 80 out of 100
                .toBuffer();

            // Upload to S3

            const extension = item.mimetype.split('/')[1];
            const fileName = `my-home-is-yours/${v4()}-medstore.${extension}`;

            const uploadParams = {
                Bucket: process.env.AmazonS3Bucket,
                Key: fileName, // Unique filename for S3
                Body: compressedItemBuffer,
                ContentType: 'image/jpeg'
            };

            const command = new PutObjectCommand(uploadParams);
            const data = await s3.send(command);

            return {
                key: uploadParams.Key,
                url: `https://${process.env.AmazonS3Bucket}.s3.${process.env.AmazonRegion}.amazonaws.com/${uploadParams.Key}`,
                name: item.originalname
            };
        });

        const uploadedImages = await Promise.all(compressedImagesPromises);

        const filesInDir = await fs.readdir('uploads');

        // Ensure files exist and are not in use
        const unlinkPromises = filesInDir.map(async (file) => {
            const filePath = path.join('uploads', file);
            try {
                await fs.access(filePath); // Check if the file is accessible
                await fs.unlink(filePath); // Attempt to delete the file
            } catch (unlinkError) {
                console.error(`Error deleting file ${filePath}:`, unlinkError);
            }
        });

        await Promise.all(unlinkPromises);

        res.status(200).json({ images: uploadedImages });
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** UPDATE IMAGES ARRAY ******************************************

export const updatePropertyImages = async (req, res, next) => {
    const { images, propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        property.images = [
            ...property.images,
            ...images
        ]

        await property.save();

        res.status(200).json({
            images: images,
            message: 'Images uploaded'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** UPLOAD IMAGE ******************************************

export const uploadFloorplan = async (req, res, next) => {
    const file = req.file;
 
    if (!file) {
        throw new createError( 
            404,
            'No image provided!',
            { expose: true }
        )
    }

    try {
        res.status(200).json({ 
            key: file.key,
            url: file.location,
            name: file.originalname
        });
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** UPDATE FLOORPLAN ******************************************

export const updateFloorplan = async (req, res, next) => {
    const { floorplan, propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }
        
        property.floorplan.key = floorplan.key;
        property.floorplan.name = floorplan.name;
        property.floorplan.url = floorplan.url;

        await property.save();
 
        res.status(200).json({
            success: true,
            message: 'Floorplan updated'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** DELETE FLOORPLAN ******************************************

export const deleteFloorplan = async (req, res, next) => {
    const { propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        if (!property.floorplan.key) {
            throw new createError(
                404,
                'Floorplan not found',
                { expose: true }
            );
        }
        
        const command = new DeleteObjectCommand({
            Bucket: process.env.AmazonS3Bucket,
            Key: property.floorplan.key
        });

        const awsResponse = await s3.send(command);
        
        if (awsResponse.$metadata.httpStatusCode === 204) {
            property.floorplan.name = '';
            property.floorplan.key = '';
            property.floorplan.url = '';
    
            await property.save();
        }

        await property.save();
 
        res.status(200).json({
            success: true,
            message: 'Floorplan deleted'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** CHANGE FLOORPLAN ******************************************

export const changeFloorplan = async (req, res, next) => {
    const { floorplan, propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }
        
        const command = new DeleteObjectCommand({
            Bucket: process.env.AmazonS3Bucket,
            Key: property.floorplan.key
        });

        const awsResponse = await s3.send(command);
        
        if (awsResponse.$metadata.httpStatusCode === 204) {
            property.floorplan = floorplan;
    
            await property.save();
        }

        await property.save();
 
        res.status(200).json({
            success: true,
            message: 'Floorplan updated'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** UPDATE VIDEOS ******************************************


export const updateVideos = async (req, res, next) => {
    const { videos, propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        videos.forEach(item => {
            property.videos.push(item);
        })

        await property.save();
 
        res.status(200).json({
            videos: videos,
            message: 'Videos updated'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** FETCH LISTINGS ******************************************

export const fetchListings = async (req, res, next) => {
    const { skip, limit } = req.body;

    try {
        const listings = await Property.find()
            .sort({ createdAt: 'descending' })
            .skip(skip)
            .limit(limit);

        if (!listings) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        const numberOfListings = await Property.countDocuments();
        
        res.status(200).json({
            success:true,
            listings: listings,
            number: numberOfListings
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** FETCH PROPERTY BY ID ******************************************

export const fetchPropertyById = async (req, res, next) => {
    const { propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }
        
        res.status(200).json({
            success:true,
            property: property
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** FETCH NEARBY LOCATIONS ******************************************

export const findNearbyLocations = async (req, res, next) => {
    const { coordinates, filters } = req.body;

    const searchConfig = {
        'address.position': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [coordinates[0],coordinates[1]]
                },
                $maxDistance: filters.maxDistance
            }
        }
    }
    
    if (filters.propertyType) searchConfig.type = filters.propertyType;
    if (filters.numberOfBedrooms) searchConfig.numberOfBedrooms = filters.numberOfBedrooms;
    if (filters.numberOfBathrooms) searchConfig.numberOfBathrooms = filters.numberOfBathrooms;
    if (filters.petFriendly) searchConfig['summary.general.petFriendly.isAvailable'] = filters.petFriendly;
    if (filters.walkInShower) searchConfig['bathrooms.type'] = 'walk-in-shower';
    if (filters.groundFloor) searchConfig.floor = 0;

    try {
        const properties = await Property.find(searchConfig);

        if (!properties) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }
        
        res.status(200).json({
            success:true,
            properties: properties
        })
    } catch (error) {
        handleError(res, error);
    }
}


// *************************************** DELETE A SINGLE IMAGE ******************************************

export const deleteImage = async (req, res, next) => {
    const { propertyId, imageId } = req.body;

    try {
        const existingProperty = await Property.findById(propertyId);

        if (!existingProperty) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            )
        }

        const property = await Property.findOne({
            _id: propertyId,
            'images._id': imageId
        }, {
            'images.$': 1
        })

        if (!property.images || !property.images[0]) {
            throw new createError(
                404,
                'Image not found',
                { expose: true }
            );
        }

        const command = new DeleteObjectCommand({
            Bucket: process.env.AmazonS3Bucket,
            Key: property.images[0].key
        });

        const awsResponse = await s3.send(command);
        
        if (awsResponse.$metadata.httpStatusCode === 204) {
            existingProperty.images.pull({ _id: imageId });
    
            await existingProperty.save();
        } 

        res.status(200).json({
            success: true,
            message: 'Image deleted'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** DELETE A SINGLE IMAGE ******************************************

export const updateImagesOrder = async (req, res, next) => {
    const { images, propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        property.images = [...images]

        await property.save();

        res.status(200).json({
            images: images,
            message: 'Images uploaded'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** DELETE A SINGLE IMAGE ******************************************

export const updateVideosFromDashboard = async (req, res, next) => {
    const { videos, propertyId } = req.body;

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        property.videos = [...videos]

        await property.save();

        res.status(200).json({
            videos: videos,
            message: 'Videos updated'
        })
    } catch (error) {
        handleError(res, error);
    }
}

// *************************************** DELETE A SINGLE IMAGE ******************************************

export const deleteProperty = async (req, res, next) => {
    const userId = req.userId;
    const { propertyId } = req.body;

    const mediaPromises = [];

    try {
        const property = await Property.findById(propertyId);

        if (!property) {
            throw new createError(
                404,
                'Property not found',
                { expose: true }
            );
        }

        if (property.images && property.images.length > 0) {
            property.images.forEach((item) => {
                const command = new DeleteObjectCommand({
                    Bucket: process.env.AmazonS3Bucket,
                    Key: item.key
                });
        
                mediaPromises.push(s3.send(command));
            })
        }

        const activity = new Activity({ userId, action: 'delete', target: `property ${property.name}`});

        activity.generateDescription();

        await Promise.all(mediaPromises);

        await Property.findByIdAndDelete(propertyId);

        await activity.save();

        res.status(200).json({
            message: `Property ${property.name} was deleted`
        })
    } catch (error) {
        handleError(res, error);
    }
}