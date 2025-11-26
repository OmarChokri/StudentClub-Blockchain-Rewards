// services/point.service.js
import { User } from "../models/user.model.js";
import { blockchain } from "../blockchain-interaction/interact.js";

export class PointsService {

  static async addPoints({ userId, amount, reason, activityId = null }) {
    if (!userId || amount <= 0) throw new Error("Paramètres invalides");

    const user = await User.findById(userId).lean();
    if (!user) throw new Error("Utilisateur introuvable");
    if (!user.walletAddress) throw new Error("Adresse wallet manquante");

    const receipt = await blockchain.givePoints(user.walletAddress, amount, reason);

    return {
      success: true,
      userId,
      amount,
      reason,
      txHash: receipt.hash,
      newBalance: await blockchain.getBalance(user.walletAddress),
    };
  }

  static async adminBurnPoints({ userId, amount, reason }) {
    const user = await User.findById(userId).lean();
    if (!user || !user.walletAddress) throw new Error("Utilisateur ou wallet introuvable");

    const currentBalance = await blockchain.getBalance(user.walletAddress);
    if (currentBalance < amount) throw new Error("Solde insuffisant");

    const receipt = await blockchain.burnUserPoints(user.walletAddress, amount, reason);

    return {
      success: true,
      userId,
      amount,
      reason,
      txHash: receipt.hash,
      newBalance: await blockchain.getBalance(user.walletAddress),
    };
  }

  static async getBalance(userId) {
    const user = await User.findById(userId).lean();
    if (!user || !user.walletAddress) throw new Error("Utilisateur ou wallet introuvable");

    const balance = await blockchain.getBalance(user.walletAddress);
    return Number(balance);
    
  }
}