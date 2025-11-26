import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import des routes
import authRoutes from "./routes/auth.routes.js";
import memberRoutes from "./routes/member.routes.js";
import pointRoutes from "./routes/point.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import sepoliaRoutes from "./routes/sepolia.routes.js";

dotenv.config();

// ----------------------
//   CONNEXION MONGO
// ----------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
//        ROUTES
// ----------------------
app.use("/api/sepolia", sepoliaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/points", pointRoutes);   
app.use("/api/rewards", rewardRoutes); 
app.use("/api/activities", activityRoutes); 

// ----------------------
//        SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));