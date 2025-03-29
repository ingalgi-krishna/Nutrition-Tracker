// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(base64Image: string) {
    // Remove data URL prefix if present
    const imageData = base64Image.includes('base64')
        ? base64Image
        : `data:image/jpeg;base64,${base64Image}`;

    try {
        const result = await cloudinary.uploader.upload(imageData, {
            folder: 'nutritrack',
            resource_type: 'image'
        });

        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}