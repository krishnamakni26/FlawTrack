const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME) &&
  (process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY) &&
  (process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary configured for remote secure attachment storage');
} else {
  logger.info('Cloudinary credentials not provided; using fallback storage');
}

class CloudinaryService {
  /**
   * Upload a multer file (buffer or disk) to Cloudinary or fallback storage
   * @param {Object} file Multer file object
   * @returns {Promise<{ path: string, filename: string, originalName: string, mimetype: string, size: number }>}
   */
  static async uploadFile(file) {
    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const publicId = `flawtrack/${Date.now()}_${crypto.randomUUID()}`;

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'flawtrack/attachments',
            public_id: publicId,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary upload failed: ${error.message}`);
              return reject(error);
            }
            resolve({
              filename: result.public_id,
              originalName: file.originalname,
              path: result.secure_url,
              mimetype: file.mimetype,
              size: file.size,
              uploadedAt: new Date(),
            });
          }
        );

        if (file.buffer) {
          const { Readable } = require('stream');
          const readable = Readable.from(file.buffer);
          readable.pipe(uploadStream);
        } else if (file.path && fs.existsSync(file.path)) {
          fs.createReadStream(file.path).pipe(uploadStream);
        } else {
          reject(new Error('Invalid file payload: neither buffer nor path available'));
        }
      });
    }

    // Fallback storage when Cloudinary is not configured (e.g. local offline test)
    if (file.buffer) {
      const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      return {
        filename,
        originalName: file.originalname,
        path: filePath,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      };
    }

    return {
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };
  }
}

module.exports = CloudinaryService;
