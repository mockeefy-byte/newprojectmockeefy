import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  topics: [{ type: String }],
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  duration: { type: Number, default: 30 }, // in minutes
  notes: { type: String, trim: true, maxlength: 500 },
  meetingLink: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'Upcoming', 'no-show', 'live'],
    default: 'confirmed'
  },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
