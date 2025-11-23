import { RewardService } from "../services/reward.service.js";
import { PointsService } from "../services/point.service.js";

export class RewardController {

  static async add(req, res) {
    const reward = await RewardService.addReward(req.body);
    res.json(reward);
  }

  static async getAll(req, res) {
    const list = await RewardService.getRewards();
    res.json(list);
  }

  static async redeem(req, res) {
    const { userId, rewardId, cost } = req.body;

    try {
      const result = await RewardService.redeemReward(
        { userId, rewardId, cost },
        PointsService.burnPoints
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}
