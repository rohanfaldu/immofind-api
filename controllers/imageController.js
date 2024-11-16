const multer = require('multer');
const path = require('path');
const response = require('../components/utils/response'); // Assuming response utility is in place

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
