// src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(filePath, folderName) {
  return await cloudinary.uploader.upload(filePath, {
    folder: folderName,
  });
}


export const uploadVideo = async (filePath, folder) => {
  return await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'video',
    eager: [
      {
        width: 300,
        height: 300,
        crop: "fill",
        gravity: "auto",
        fetch_format: "jpg",
        format: "jpg",
      }
    ],
    eager_async: false, // Asegura que las transformaciones se procesen síncronamente
  });
};



export async function deleteImage(publicId) {
  return await cloudinary.uploader.destroy(publicId)
}
