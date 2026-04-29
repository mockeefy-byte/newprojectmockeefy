import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Storage for Expert/User Profile Images
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mockeefy/profiles", // Folder in Cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 500, height: 500, crop: "limit" }], // Resize on upload
    },
});

// Storage for Verification Documents (PDFs, Images)
const verificationStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine format based on file
        let format = "jpg";
        if (file.mimetype === "application/pdf") format = "pdf";

        return {
            folder: "mockeefy/verification",
            resource_type: "auto", // Automatically detect (image/raw/video)
            allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        };
    },
});

// Middleware exports
export const uploadProfile = multer({ storage: profileStorage });
export const uploadVerification = multer({ storage: verificationStorage });
