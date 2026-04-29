import multer from "multer";
import createCloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";
import fs from "fs";

// Determine storage type: 'cloudinary' or 'local'
// Defaults to 'local' if CLOUDINARY_CLOUD_NAME is missing or STORAGE_TYPE is explicitly 'local'
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.STORAGE_TYPE !== "local";

console.log(`Using ${useCloudinary ? "Cloudinary" : "Local Disk"} Storage`);

// --- Cloudinary Storage Configuration ---
// Package exports a factory function, not the class
const cloudProfileStorage = createCloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mockeefy/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const cloudVerificationStorage = createCloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mockeefy/verification",
    resource_type: "image", // Images only (no PDFs)
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    quality: "auto:good", // Fast compression
    eager: [
      { quality: "auto:good", fetch_format: "auto" } // CDN optimization
    ]
  },
});

const cloudUserStorage = createCloudinaryStorage({
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
// Profile: 5MB limit
export const uploadProfile = multer({ 
  storage: useCloudinary ? cloudProfileStorage : localProfileStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Verification: 100KB limit (images only, fast uploads)
export const uploadVerification = multer({ 
  storage: useCloudinary ? cloudVerificationStorage : localVerificationStorage,
  limits: { fileSize: 100 * 1024 }, // 100KB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error('Only image files (JPG, PNG, WebP) are allowed'));
    } else {
      cb(null, true);
    }
  }
});

// User Profile: 5MB limit
export const uploadUserProfile = multer({ 
  storage: useCloudinary ? cloudUserStorage : localUserStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Helper to get consistent file URL (works for both Cloudinary and local storage)
export const getFileUrl = (req, file) => {
  if (!file) return "";

  // Cloudinary: upload_stream callback merges result into req.file (secure_url, url, path, etc.)
  const cloudinaryUrl = file.secure_url || file.url || (file.path && file.path.startsWith("http") ? file.path : null);
  if (cloudinaryUrl) return cloudinaryUrl;

  // Local disk: path is absolute; we need a relative URL for the client
  const filename = file.filename;
  if (!filename) return "";

  if (file.path && typeof file.path === "string") {
    if (file.path.includes("verification")) return `/uploads/verification/${filename}`;
    if (file.path.includes("userProfileImages")) return `/uploads/userProfileImages/${filename}`;
  }
  return `/uploads/profileImages/${filename}`;
};
