
import Skill from '../models/Skill.js';

export const getSkillsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const skills = await Skill.find({ categoryId, isActive: true });
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSkill = async (req, res) => {
    try {
        const { name, categoryId, description } = req.body;
        const newSkill = new Skill({ name, categoryId, description });
        await newSkill.save();
        res.status(201).json(newSkill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
