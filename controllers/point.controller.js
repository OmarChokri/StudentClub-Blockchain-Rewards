import { PointsService } from "../services/point.service.js";

/**
 * PointsController - Contrôleurs Express pour la gestion des points
 * Tous les endpoints sont protégés par un middleware d'authentification
 * (ex: verifyToken + role check) que tu devras ajouter selon ton système
 */
export class PointsController {
  
  static async add(req, res) {
    try {
      const { userId, amount, reason, activityId } = req.body;

      if (!userId || !amount || !reason) {
        return res.status(400).json({ message: "userId, amount et reason sont requis" });
      }

      const result = await PointsService.addPoints({
        userId,
        amount: Number(amount),
        reason,
        activityId,
      });

      return res.status(200).json({
        success: true,
        message: `${amount} points ajoutés avec succès`,
        data: result,
      });
    } catch (err) {
      console.error("Erreur addPoints:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async adminBurn(req, res) {
    try {
      const { userId, amount, reason } = req.body;

      if (!userId || !amount || amount <= 0 || !reason) {
        return res.status(400).json({ message: "userId, amount et reason sont requis" });
      }

      const result = await PointsService.adminBurnPoints({
        userId,
        amount: Number(amount),
        reason,
      });

      return res.status(200).json({
        success: true,
        message: `${amount} points retirés (admin)`,
        balance: result.amount,
      });
    } catch (err) {
      console.error("Erreur adminBurnPoints:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async balance(req, res) {
    try {
      let userId = req.params.userId;

      const balance = await PointsService.getBalance(userId);

      return res.json({
        success: true,
        userId,
        balance,
      });
    } catch (err) {
      console.error("Erreur getBalance:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

}