import cloudinary from "cloudinary";

// multer-storage-cloudinary expects cloudinary.v2.uploader, so we must use the root module and configure v2
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
