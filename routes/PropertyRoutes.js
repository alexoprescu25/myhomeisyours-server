import express from 'express';
const router = express.Router();

import { isAuth } from '../middlewares/is-auth.js';
import { isAdmin } from '../middlewares/is-admin.js';

import {
    createProperty,
    uploadPropertyImage,
    updatePropertyImages,
    fetchListings,
    uploadFloorplan,
    updateFloorplan,
    fetchPropertyById,
    findNearbyLocations,
    updateVideos,
    editProperty,
    deleteImage,
    changeFloorplan,
    deleteFloorplan,
    updateImagesOrder,
    updateVideosFromDashboard,
    deleteProperty
} from '../controllers/PropertyController.js';

import { uploadImage, uploadS3Image } from '../middlewares/upload-image.js';

router.post('/create', isAuth, createProperty);

router.post('/update', isAuth, editProperty);

router.post('/update-images', isAuth, updatePropertyImages);

router.post('/upload-image', isAuth, uploadImage('my-home-is-yours').array('images'), uploadPropertyImage);

router.post('/update-videos', isAuth, updateVideos);

router.post('/fetch', isAuth, fetchListings);

router.post('/fetch-by-id', isAuth, fetchPropertyById);

router.post('/nearby-search', isAuth, findNearbyLocations);

router.post('/delete-image', isAuth, deleteImage);

router.post('/update-images-order', isAuth, updateImagesOrder);

router.post('/delete', isAuth, isAdmin, deleteProperty);

// FLOORPLAN

router.post('/upload-floorplan',isAuth, uploadS3Image('my-home-is-yours').single('image'), uploadFloorplan);

router.post('/update-floorplan', isAuth, updateFloorplan);

router.post('/change-floorplan', isAuth, changeFloorplan);

router.post('/delete-floorplan', isAuth, deleteFloorplan);

// UPDATE VIDEOS FROM DASHBOARD

router.post('/save-videos', isAuth, updateVideosFromDashboard);

export default router;