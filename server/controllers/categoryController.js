import Category from '../models/Category.js';

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new category
export const createCategory = async (req, res) => {
    const { name, description, icon, type, amount, status } = req.body;

    try {
        const newCategory = new Category({
            name,
            description,
            icon,
            type,
            amount,
            status
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, type, amount, status } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description, icon, type, amount, status },
            { new: true }
        );
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Seed initial categories
export const seedCategories = async (req, res) => {
    const initialCategories = [
        // Programming Languages
        { name: 'JavaScript', type: 'technical', description: 'Web development language', amount: 500 },
        { name: 'Python', type: 'technical', description: 'General purpose language', amount: 500 },
        { name: 'Java', type: 'technical', description: 'Enterprise software development', amount: 600 },
        { name: 'C++', type: 'technical', description: 'System/Application software', amount: 600 },
        { name: 'Go', type: 'technical', description: 'Cloud infrastructure', amount: 700 },

        // Frameworks & Libraries
        { name: 'React', type: 'technical', description: 'UI Library', amount: 600 },
        { name: 'Node.js', type: 'technical', description: 'JS Runtime', amount: 600 },
        { name: 'Next.js', type: 'technical', description: 'React Framework', amount: 700 },
        { name: 'Spring Boot', type: 'technical', description: 'Java Framework', amount: 700 },

        // Recent Technologies / Trending
        { name: 'Generative AI', type: 'technical', description: 'LLMs, Prompt Engineering', amount: 1500 },
        { name: 'Blockchain', type: 'technical', description: 'Crypto, Smart Contracts', amount: 1200 },
        { name: 'Cybersecurity', type: 'technical', description: 'Network Security, Ethical Hacking', amount: 1000 },
        { name: 'Cloud Computing', type: 'technical', description: 'AWS, Azure, Google Cloud', amount: 900 },
        { name: 'DevOps', type: 'technical', description: 'CI/CD, Docker, Kubernetes', amount: 1000 },
        { name: 'Data Science', type: 'technical', description: 'Analytics, Machine Learning', amount: 1100 },
        { name: 'Machine Learning', type: 'technical', description: 'Algorithms, Neural Networks', amount: 1200 },
        { name: 'AR/VR', type: 'technical', description: 'Augmented & Virtual Reality', amount: 1300 },

        // Concepts
        { name: 'System Design', type: 'technical', description: 'Architecture and design', amount: 1000 },

        // Soft Skills
        { name: 'Behavioral', type: 'behavioral', description: 'Soft skills and leadership', amount: 300 }
    ];

    try {
        // Use bulkWrite to upsert (update if exists, insert if new) based on name
        const operations = initialCategories.map(cat => ({
            updateOne: {
                filter: { name: cat.name },
                update: { $set: cat },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Category.bulkWrite(operations);
            res.status(201).json({ message: 'Categories seeded/updated successfully' });
        } else {
            res.status(200).json({ message: 'No categories to seed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
