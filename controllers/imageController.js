import multer from 'multer';
import path from 'path';
import response from '../components/utils/response.js'; // Ensure the file path and extension are correct
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
// Initialize Prisma Client
const prisma = new PrismaClient();


// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensure upload directory exists
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        const uploadPath = 'uploads/';
        const fullPath = path.join(uploadPath, originalName);

        // Check if the file already exists
        if (fs.existsSync(fullPath)) {
            return cb(new Error(`File with name "${originalName}" already exists.`));
        } else {
            cb(null, originalName); // Use the original filename
        }
    },
});

const upload = multer({ storage });

// Single image upload handler
export const uploadSingleImage = (req, res) => {
    upload.array('image', 5)(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);

            // Properly handle multer errors and send as response
            if (err.message.includes('File with name')) {
                return response.error(res, err.message);
            }

            return response.serverError(res, res.__('messages.internalServerError'), err.message);
        }

        if (!req.files || req.files.length === 0) {
            return response.error(res, res.__('messages.fileNotProvided'));
        }

        const fileDetailsWithUrls = req.files.map((file) => ({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            url: `${process.env.BASE_URL}/uploads/${file.filename}`,
        }));

        return response.success(res, res.__('messages.singleUploadSuccess'), {
            files: fileDetailsWithUrls,
        });

    });
};

// Multiple images upload handler
export const uploadMultipleImages = (req, res) => {
    upload.array('images', 5)(req, res, (err) => {  // Limit to 5 images
        if (err) {
            return response.serverError(res, res.__('messages.internalServerError'), err.message);
        }
        if (!req.files || req.files.length === 0) {
            return response.error(res, res.__('messages.fileNotProvided'));
        }

        return response.success(res, res.__('messages.multipleUploadSuccess'), {
            files: req.files,
        });
    });
};


export const uploadMultipleImagesFromJson = (req, res) => {
    try {
        const { images, uploadPath } = req.body;

        // Ensure uploadPath is provided and valid
        if (!uploadPath) {
            return response.error(res, 'Upload path is not provided.');
        }

        // Check if images array is valid
        if (!images || !Array.isArray(images) || images.length === 0) {
            return response.error(res, 'No images provided.');
        }

        // Ensure the upload directory exists
        const fullPath = path.join(__dirname, '..', uploadPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true }); // Create the directory if it doesn't exist
        }

        const uploadedFiles = [];

        images.forEach((image, index) => {
            const { filename, base64 } = image;

            // Validate image data
            if (!filename || !base64) {
                throw new Error(`Image ${index + 1} is missing required fields.`);
            }

            // Decode the base64 string to binary data
            const buffer = Buffer.from(base64, 'base64');

            // Generate a unique filename and save the file
            const filePath = path.join(fullPath, `${Date.now()}-${filename}`);
            fs.writeFileSync(filePath, buffer);

            // Dynamically use BASE_URL for the file URL
            const fileUrl = `${process.env.BASE_URL}/uploads/${path.basename(filePath)}`;

            uploadedFiles.push({
                filename,
                fileUrl, // Use fileUrl instead of filePath
            });
        });

        return response.success(res, 'Images uploaded successfully.', {
            files: uploadedFiles,
            uploadPath: `${process.env.BASE_URL}/uploads`, // Provide the URL to the upload directory
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        return response.serverError(res, 'Error uploading images.', error.message);
    }
};
