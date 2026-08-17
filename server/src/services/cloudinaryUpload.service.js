import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadBufferToCloudinary(buffer, folder = 'techaid/service-requests') {
  return new Promise((resolve, reject) => {
    // If Cloudinary keys aren't set up yet, fallback gracefully for dev testing
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      const mockUrl = `https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80`;
      return resolve({ secure_url: mockUrl, public_id: `mock_${Date.now()}` });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export function classifyFileType(mimetype, fieldname) {
  if (fieldname === 'screenshot') return 'SCREENSHOT';
  if (fieldname === 'audio' || mimetype.startsWith('audio/')) return 'VOICE';
  if (fieldname === 'video' || mimetype.startsWith('video/')) return 'VIDEO';
  return 'IMAGE';
}
