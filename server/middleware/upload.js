import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";
import fs from "fs";

// Determine storage type: 'cloudinary' or 'local'
// Defaults to 'local' if CLOUDINARY_CLOUD_NAME is missing or STORAGE_TYPE is explicitly 'local'
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.STORAGE_TYPE !== "local";

console.log(`Using ${useCloudinary ? "Cloudinary" : "Local Disk"} Storage`);

// --- Cloudinary Storage Configuration ---
const cloudProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mockeefy/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const cloudVerificationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // If PDF, use raw to prevent image conversion issues
    if (file.mimetype === "application/pdf") {
      return {
        folder: "mockeefy/verification",
        resource_type: "raw", // Important for PDFs to be downloadable/viewable as files
        format: undefined, // Keep original extension
      };
    }
    return {
      folder: "mockeefy/verification",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

const cloudUserStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mockeefy/user_profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// --- Local Disk Storage Configuration ---
const createLocalDir = (dirPath) => {
  const fullPath = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const localProfileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, createLocalDir("uploads/profileImages"));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const localVerificationStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, createLocalDir("uploads/verification"));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-verification${ext}`);
  },
});

const localUserStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, createLocalDir("uploads/userProfileImages"));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`);
  },
});

// --- Middleware Exports ---
export const uploadProfile = multer({ storage: useCloudinary ? cloudProfileStorage : localProfileStorage });
export const uploadVerification = multer({ storage: useCloudinary ? cloudVerificationStorage : localVerificationStorage });
export const uploadUserProfile = multer({ storage: useCloudinary ? cloudUserStorage : localUserStorage });

// Helper to get consistent file URL
export const getFileUrl = (req, file) => {
  if (!file) return "";

  // If Cloudinary, path is the full secure URL
  if (file.path && file.path.startsWith("http")) {
    return file.path;
  }

  // If Local, path is absolute filesystem path. We need relative URL.
  // We determine folder based on destination or filename context
  // Fallback: check where it was likely stored based on middleware usage

  // Simple heuristic for local files
  const filename = file.filename;
  if (!filename) return ""; // Should not happen

  // Check valid local directories based on storage configurations
  // (This assumes unique filenames or context handled by controller)

  // For safety, let's use the file.destination property if available, but it gives absolute path.
  // We know our structure:
  // - uploads/profileImages
  // - uploads/verification
  // - uploads/userProfileImages

  // Just map based on file type/context if possible, but the controller knows best what it uploaded.
  // We can return just "/uploads/folder/filename"

  // NOTE: This helper might be better placed in controllers or we make it smart.
  // Let's require the controller to specify the 'type' or just deduce?

  // Actually, standardizing here is hard without context. 
  // Let's just return the filename and let controller prepend folder? 
  // OR, we can return a relative path.

  if (file.path.includes("verification")) return `/uploads/verification/${filename}`;
  if (file.path.includes("userProfileImages")) return `/uploads/userProfileImages/${filename}`;
  return `/uploads/profileImages/${filename}`;
};
