import mongoose from "mongoose";

/* ----------------- Education Schema ------------------ */
const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  field: { type: String, trim: true },
  start: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear(),
  },
  end: {
    type: Number,
    required: true,
    min: 1900,
    validate: {
      validator: function (value) {
        return value >= this.start;
      },
      message: "End year must be greater than or equal to start year",
    },
  },
}, { _id: false });

/* ----------------- Experience Schema ------------------ */
const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  start: { type: Number, required: true },
  end: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.start;
      },
      message: "End year must be greater than or equal to start year",
    },
  },
}, { _id: false });

/* ----------------- Availability Schema ------------------ */
const availabilitySchema = new mongoose.Schema({
  sessionDuration: { type: Number, default: 30 },
  maxPerDay: { type: Number, default: 1, min: 1 },

  weekly: {
    type: Map,
    of: [
      new mongoose.Schema(
        {
          from: { type: String, trim: true },
          to: { type: String, trim: true }
        },
        { _id: false }
      )
    ],
    default: {},
  },

  breakDates: {
    type: [
      {
        start: Date,
        end: Date
      }
    ],
    default: []
  }
});

/* ----------------- Expert Schema ------------------ */

const expertSchema = new mongoose.Schema(
  {
    profileImage: { type: String, trim: true }, // Legacy: maintained for migration, but source of truth is User

    personalInformation: {
      // Identity fields (name, mobile, gender, dob, address) are now in User model.
      // We only keep category here as it's specific to the expert role context logic sometimes,
      // though ideally it fits in Expert Details proper. Keeping it here for now as requested.
      category: {
        type: String,
        enum: ["IT", "HR", "Business", "Design", "Marketing", "Finance", "AI", "IT & Software", "Non-IT Corporate", "Medical", "Legal", "Creative"],
        trim: true
      }
    },

    education: {
      type: [educationSchema],
      default: []
    },

    professionalDetails: {
      title: { type: String, trim: true },
      company: { type: String, trim: true },
      totalExperience: { type: Number, min: 0 },
      industry: { type: String, trim: true },
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Intermediate"
      },
      previous: { type: [experienceSchema], default: [] }
    },

    skillsAndExpertise: {
      mode: {
        type: String,
        enum: ["Online", "Offline", "Hybrid"],
        default: "Online",
        trim: true
      },
      domains: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      languages: { type: [String], default: [] }
    },

    availability: {
      type: availabilitySchema,
      default: () => ({})
    },

    verification: {
      companyId: {
        url: { type: String, trim: true },
        name: { type: String, trim: true }
      },
      aadhar: {
        url: { type: String, trim: true },
        name: { type: String, trim: true }
      },
      linkedin: { type: String, trim: true }
    },

    /* ----------------- Pricing REMOVED (Centralized Engine) ------------------ */
    // Pricing is now fully dynamic via PricingRules table based on Category + Level + Duration

    /* ----------------- Admin Mappings (Old Layer - Deprecated or Simple Tagging) ------------------ */
    adminMappings: {
      skills: { type: [String], default: [] },
      roles: { type: [String], default: [] },
      level: { type: String, enum: ["Junior", "Mid", "Senior", "Principal", "Architect", ""], default: "" }
    },

    /* ----------------- Advanced Skill Mapping (Phase 2) ------------------ */
    expertSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
      // priceAdjustment removed
      isEnabled: { type: Boolean, default: true }
    }],

    /* ----------------- Metrics (Real Data) ------------------ */
    metrics: {
      totalSessions: { type: Number, default: 0 },
      completedSessions: { type: Number, default: 0 },
      cancelledSessions: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 } // in hours
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "Active"],
      default: "pending"
    },

    rejectionReason: {
      type: String,
      trim: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ExpertDetails", expertSchema);
