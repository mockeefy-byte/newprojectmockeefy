import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import PricingRule from './models/PricingRule.js';

dotenv.config({ path: './.env' });

const testPricing = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockdata');
        console.log('✅ MongoDB Connected');

        let categoryId = "IT & Software";

        // Resolve Category ID if name is passed
        if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            const categoryDoc = await Category.findOne({ name: categoryId });
            console.log("Found CategoryDoc?:", !!categoryDoc);
            if (categoryDoc) {
                categoryId = categoryDoc._id.toString();
                console.log("Resolved category ID to:", categoryId);
            } else {
                console.log("Category not found");
                process.exit(1);
            }
        }

        const level = "Beginner";
        const duration = 30;

        console.log("Looking for PricingRule with:", { categoryId, level, duration });

        let priceRule = await PricingRule.findOne({ categoryId, skillId: null, level, duration: Number(duration) });
        console.log("Found PriceRule:", priceRule);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testPricing();
