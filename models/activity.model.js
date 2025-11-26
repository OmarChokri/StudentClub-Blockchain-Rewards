import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  points: { type: Number, default: 0 }, // points attribués pour cette activité
  type: { type: String, enum: ["add", "remove"], default: "add" },
  createdAt: { type: Date, default: Date.now },
});

export const Activity = mongoose.model("Activity", activitySchema);
