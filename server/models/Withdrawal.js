import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [300, "Minimum withdrawal amount is 300"],
    },
    status: {
      type: String,
      enum: ["initiated", "processed", "rejected"],
      default: "initiated",
    },
    referenceId: {
      type: String,
      trim: true,
      // Useful for storing external bank transaction IDs later
    },
  },
  { timestamps: true }
);

export default mongoose.model("Withdrawal", withdrawalSchema);
