/**
 * Pricing Utility
 * Calculate hourly rates based on category and experience
 */

// Category-based price ranges (in Rupees)
export const PRICE_RANGES = {
    IT: { min: 200, max: 1000, base: 400 },
    HR: { min: 150, max: 800, base: 300 },
    Business: { min: 300, max: 1200, base: 500 },
    Design: { min: 200, max: 900, base: 400 },
    Marketing: { min: 150, max: 800, base: 350 },
    Finance: { min: 250, max: 1000, base: 450 },
    AI: { min: 400, max: 1500, base: 700 }
};

/**
 * Calculate hourly rate based on category and years of experience
 * @param {string} category - Expert category (IT, HR, Business, etc.)
 * @param {number} yearsOfExperience - Total years of professional experience
 * @returns {number} Calculated hourly rate in Rupees
 */
export function calculateHourlyRate(category, yearsOfExperience) {
    const range = PRICE_RANGES[category] || PRICE_RANGES.IT;
    const { min, max, base } = range;

    let rate = base;

    if (yearsOfExperience <= 1) {
        // Fresher: minimum rate
        rate = min;
    } else if (yearsOfExperience <= 3) {
        // 1-3 years: base rate
        rate = base;
    } else if (yearsOfExperience <= 5) {
        // 3-5 years: base + 30% of range
        rate = base + (max - base) * 0.3;
    } else if (yearsOfExperience <= 10) {
        // 5-10 years: base + 60% of range
        rate = base + (max - base) * 0.6;
    } else {
        // 10+ years: maximum rate
        rate = max;
    }

    return Math.round(rate);
}

/**
 * Get price range for a category
 * @param {string} category - Expert category
 * @returns {object} Price range object with min, max, base
 */
export function getPriceRange(category) {
    return PRICE_RANGES[category] || PRICE_RANGES.IT;
}

/**
 * Calculate experience from work history
 * @param {Array} previousJobs - Array of previous job objects with start/end dates
 * @returns {number} Total years of experience
 */
export function calculateExperienceYears(previousJobs) {
    if (!previousJobs || previousJobs.length === 0) {
        return 0;
    }

    let totalMonths = 0;
    const today = new Date();

    previousJobs.forEach(job => {
        if (job.start) {
            const startYear = typeof job.start === 'number' ? job.start : new Date(job.start).getFullYear();
            const endYear = job.end
                ? (typeof job.end === 'number' ? job.end : new Date(job.end).getFullYear())
                : today.getFullYear();

            const months = (endYear - startYear) * 12;
            totalMonths += months;
        }
    });

    return Math.floor(totalMonths / 12);
}

/**
 * Calculate suggested pricing for an expert
 * @param {object} expert - Expert document from database
 * @returns {number} Suggested hourly rate
 */
export function calculateSuggestedPricing(expert) {
    const category = expert.personalInformation?.category || 'IT';

    // Try to get experience from professionalDetails
    let experience = expert.professionalDetails?.totalExperience || 0;

    // If no totalExperience, calculate from previous jobs
    if (experience === 0 && expert.professionalDetails?.previous) {
        experience = calculateExperienceYears(expert.professionalDetails.previous);
    }

    // If still no experience, calculate from DOB (age - 22)
    if (experience === 0 && expert.personalInformation?.dob) {
        const age = new Date().getFullYear() - new Date(expert.personalInformation.dob).getFullYear();
        experience = Math.max(0, age - 22);
    }

    return calculateHourlyRate(category, experience);
}
