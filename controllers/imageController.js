const multer = require('multer');
const path = require('path');
const response = require('../components/utils/response'); // Assuming response utility is in place
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Single image upload handler
exports.uploadSingleImage = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return response.serverError(res, res.__('messages.internalServerError'), err.message);
        }
        if (!req.file) {
            return response.error(res, res.__('messages.fileNotProvided'));
        }

        return response.success(res, res.__('messages.singleUploadSuccess'), {
            file: req.file,
        });
    });
};

// Multiple images upload handler
exports.uploadMultipleImages = (req, res) => {
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


exports.uploadMultipleImagesFromJson = (req, res) => {
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