import { API_BASE_URL } from '../config';

/**
 * Generates the full profile image URL.
 * 
 * @param path - The image path from the database (e.g., "/uploads/..." or "http://...")
 * @returns The full URL to the image, or a default fallback if invalid.
 */
export const getProfileImageUrl = (path?: string | null): string => {
    if (!path) {
        return '/mockeefy.png';
    }

    // If it's already a full URL (including UI avatars or external links), return it
    if (path.startsWith('http')) {
        // Cloudinary or external URLs should be returned as-is
        if (path.includes('cloudinary.com') || path.includes('ui-avatars.com')) {
            return path;
        }

        // Legacy local uploads (if any exist) might need rebasing, but usually not needed for Cloudinary
        if (path.includes('/uploads/')) {
            const relativePath = path.substring(path.indexOf('/uploads/'));
            return `${API_BASE_URL}${relativePath}`;
        }
        return path;
    }

    // If it's a relative path (starts with /), append to API_BASE_URL
    if (path.startsWith('/')) {
        return `${API_BASE_URL}${path}`;
    }

    // Fallback for unexpected formats, try to treat as relative path
    return `${API_BASE_URL}/${path}`;
};
