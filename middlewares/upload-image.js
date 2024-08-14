import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 } from 'uuid';

import { fileFilter } from '../utils/index.js';

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
        secretAccessKey: process.env.AMAZON_ACCESS_KEY,
    }, 
    region: 'eu-north-1'
})

const uploadS3Image = (bucketName) => {
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AMAZON_S3_BUCKET,
            acl: 'public-read',
            metadata: (req, file, cb) => {
                cb(null, {fieldname: file.fieldname})
            },
            key: (req, file, cb) => {
                const extension = file.mimetype.split('/')[1];
                const fileName = `${bucketName}/${v4()}-medstore.${extension}`;
                cb(null, fileName);
            }
        }),
        fileFilter: fileFilter
    })
}

const uploadImage = (bucketName) => {
    return multer({
        storage: multer.diskStorage({ 
            destination: 'uploads/',
            filename: (req, file, cb) => {
                const extension = file.mimetype.split('/')[1];
                const fileName = `${v4()}-medstore.${extension}`;
                cb(null, fileName);
            }
        })
    })
}

export { uploadImage, uploadS3Image }