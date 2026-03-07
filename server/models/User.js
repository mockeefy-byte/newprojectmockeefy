// models/User.js
import mongoose from "mongoose";

/* ----------------- Education Schema ------------------ */
const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  field: { type: String, trim: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number },
  current: { type: Boolean, default: false }
}, { _id: true });

/* ----------------- Experience Schema ------------------ */
const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 500 }
}, { _id: true });

/* ----------------- Certification Schema ------------------ */
const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  credentialId: { type: String, trim: true },
  credentialUrl: { type: String, trim: true }
}, { _id: true });

/* ----------------- User Schema ------------------ */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['expert', 'candidate', 'admin']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  },

  /* ----------------- Profile Fields ------------------ */
  profileImage: {
    type: String,
    trim: true
  },

  personalInfo: {
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 }
  },

  education: {
    type: [educationSchema],
    default: []
  },

  experience: {
    type: [experienceSchema],
    default: []
  },

  certifications: {
    type: [certificationSchema],
    default: []
  },

  skills: {
    technical: { type: [String], default: [] },
    soft: { type: [String], default: [] },
    languages: { type: [String], default: [] }
  },

  preferences: {
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      trim: true
    },
    expectedSalary: { type: Number },
    noticePeriod: { type: String, trim: true },
    willingToRelocate: { type: Boolean, default: false }
  },

  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
