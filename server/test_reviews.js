import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        console.log("Connected to DB.");

        const db = mongoose.connection.db;
        const reviews = await db.collection('reviews').find().toArray();
        console.log("Total reviews found:", reviews.length);
        console.log(JSON.stringify(reviews.slice(0, 5), null, 2));
        
        const count = await db.collection('expertdetails').countDocuments();
        console.log("total experts", count);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
    }
}
run();
