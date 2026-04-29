import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true }, // Usually same as sessionId or UUID
  sessionId: { type: String, required: true, unique: true },
  expertId: { type: String, required: true },
  candidateId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['not-started', 'live', 'finished'], 
    default: 'not-started' 
  },
  activeUsers: [{ type: String }], // Array of userIds currently in the meeting
  lastEndedAt: { type: Date }
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
