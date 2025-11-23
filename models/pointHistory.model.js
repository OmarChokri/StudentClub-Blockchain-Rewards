import mongoose from "mongoose";

const pointHistorySchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type:          { type: String, enum: ["add", "transfer", "burn"], required: true },
  amount:        { type: Number, required: true },
  activityId:    { type: mongoose.Schema.Types.ObjectId, ref: "Activity", default: null },
  rewardId:      { type: mongoose.Schema.Types.ObjectId, ref: "Reward", default: null },
  fromUser:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  toUser:        { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  date:          { type: Date, default: Date.now }
});

export const PointHistory = mongoose.model("PointHistory", pointHistorySchema);
