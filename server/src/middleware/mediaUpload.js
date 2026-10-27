
import multer from 'multer';

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const allowedVideoTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (
      allowedImageTypes.has(file.mimetype) ||
      allowedVideoTypes.has(file.mimetype)
    ) {
      return callback(null, true);
    }

    const error = new Error(
      'Only JPG, PNG, WEBP, GIF, MP4, WEBM, and MOV files are allowed.'
    );

    error.statusCode = 400;
    callback(error);
  },
});

export const uploadPostMedia = (req, res, next) => {
  upload.array('media', 5)(req, res, (error) => {
    if (error) {
      error.statusCode = error.statusCode || 400;
      return next(error);
    }

    for (const file of req.files || []) {
      const isImage = allowedImageTypes.has(file.mimetype);
      const maxSize = isImage
        ? 10 * 1024 * 1024
        : 50 * 1024 * 1024;

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: isImage
            ? 'Each image must be 10 MB or smaller.'
            : 'Each video must be 50 MB or smaller.',
        });
      }
    }

    next();
  });
};
