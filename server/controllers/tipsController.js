import { TIPS_BY_CATEGORY, DEFAULT_CATEGORIES } from '../data/interviewTipsByCategory.js';

/**
 * GET /api/tips/categories
 * Returns list of category keys and static tips per category.
 */
export const getCategories = async (req, res) => {
  try {
    const categories = Object.keys(TIPS_BY_CATEGORY);
    const list = categories.map((key) => ({
      id: key,
      name: key,
      ...TIPS_BY_CATEGORY[key],
    }));
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('getCategories tips error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/tips?category=IT
 * Returns tips for one category.
 */
export const getTipsByCategory = async (req, res) => {
  try {
    const category = (req.query.category || '').trim().toUpperCase();
    if (!category) {
      return res.json({ success: true, data: TIPS_BY_CATEGORY });
    }
    const tips = TIPS_BY_CATEGORY[category] || null;
    if (!tips) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.json({ success: true, data: tips });
  } catch (err) {
    console.error('getTipsByCategory error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/tips/generate
 * Body: { company, location, position, category }
 * Returns tips for the category, optionally with a custom intro.
 * Optional AI: set OPENAI_API_KEY, npm install openai, and call OpenAI API here to
 * generate custom tips based on company/position/category; else static tips are returned.
 */
export const generateTips = async (req, res) => {
  try {
    const { company = '', location = '', position = '', category = 'IT' } = req.body || {};
    const categoryKey = (String(category).trim() || 'IT').toUpperCase();
    const tips = TIPS_BY_CATEGORY[categoryKey] || TIPS_BY_CATEGORY.IT;

    const customIntro =
      company || location || position
        ? `Tips tailored for ${position || 'your role'}${company ? ` at ${company}` : ''}${location ? ` (${location})` : ''}. Use the category-based guide below and adapt examples to this context.`
        : null;

    const payload = {
      ...tips,
      customIntro,
      context: { company: company || null, location: location || null, position: position || null },
    };

    return res.json({ success: true, data: payload });
  } catch (err) {
    console.error('generateTips error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
