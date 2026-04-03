import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mockeefy');
        const db = mongoose.connection.db;

        const expert = await db.collection("expertdetails").findOne({ 
            $or: [
                { userId: "69b27763daed6b9189927d9f" },
                { userId: new mongoose.Types.ObjectId("69b27763daed6b9189927d9f") }
            ]
        });
        console.log("EXPERT 9F DETAILS:", expert);
        
        const user = await db.collection("users").findOne({
             _id: new mongoose.Types.ObjectId("69b27763daed6b9189927d9f")
        });
        console.log("USER 9F DETAILS:", user ? user.name : "Not found", user ? user.role : "");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}
run();
