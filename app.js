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
import dashboarsRoutes from "./routes/dashboard.routes.js"; 


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
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/points", pointRoutes);   
app.use("/api/rewards", rewardRoutes); 
app.use("/api/activities", activityRoutes); 
app.use("/api/dashboard", dashboarsRoutes); 


// // Contract ABI (simplified)
// const abi = [
//   "function getBalance(address user) public view returns (uint256)",
//   "function givePoints(address to, uint256 amount, string memory reason)",
//   "function transferPoints(address to, uint256 amount)",
//   "function usePoints(uint256 amount, string memory reason)"
// ];


// app.get("/", (req, res) => {
//   res.send("Student Club Points API running!");
// });

// // ✅ Get balance
// app.get("/balance/:address", async (req, res) => {
//   try {
//     const address = req.params.address;
//     const balance = await contract.getBalance(address);
//     console.log("Balance:", balance.toString());

//     res.json({ address, balance: balance.toString() });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Admin: give points
// app.post("/givePoints", async (req, res) => {
//   try {
//     const { to, amount, reason } = req.body;
//     const tx = await contract.givePoints(to, amount, reason);
//     await tx.wait();
//     res.json({ success: true, txHash: tx.hash });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Member: transfer points
// app.post("/transferPoints", async (req, res) => {
//   try {
//     const { fromPrivateKey, to, amount } = req.body;
//     const memberWallet = new ethers.Wallet(fromPrivateKey, provider);
//     const memberContract = new ethers.Contract(CONTRACT_ADDRESS, abi, memberWallet);

//     const tx = await memberContract.transferPoints(to, amount);
//     await tx.wait();
//     res.json({ success: true, txHash: tx.hash });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// ----------------------
//        SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
