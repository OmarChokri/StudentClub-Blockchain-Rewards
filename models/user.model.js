import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  walletAddress: { 
    type: String, 
    required: true,       // 🔥 Obligatoire car on l’utilise avec le smart contract
    unique: true 
  },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
