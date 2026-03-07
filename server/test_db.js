import 'dotenv/config';
import mongoose from 'mongoose';

console.log('Testing connection to:', process.env.MONGO_URI);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
};

connect();
