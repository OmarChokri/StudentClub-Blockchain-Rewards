import { DashboardService } from "../services/dashboard.service.js";

export class DashboardController {

  static async admin(req, res) {
    const stats = await DashboardService.adminStats();
    res.json(stats);
  }

  static async member(req, res) {
    const stats = await DashboardService.memberStats(req.params.userId);
    res.json(stats);
  }
}
