import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    skills: [
      {
        type: String,
      },
    ],
    position: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
