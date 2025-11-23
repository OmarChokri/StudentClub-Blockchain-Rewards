import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, default: 0 },
  reason: { type: String },
  date: { type: Date, default: Date.now },
});

export const Point = mongoose.model("Point", pointSchema);
