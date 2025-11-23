import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  cost:       { type: Number, required: true },
  description:{ type: String },
  createdAt:  { type: Date, default: Date.now }
});

export const Reward = mongoose.model("Reward", rewardSchema);
