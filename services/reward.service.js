import { Reward } from "../models/reward.model.js";

export class RewardService {

  static async addReward(data) {
    return await Reward.create(data);
  }

  static async getRewards() {
    return await Reward.find().sort({ createdAt: -1 });
  }

  static async redeemReward({ userId, rewardId, cost }, burnCallback) {
    return await burnCallback({ userId, amount: cost, rewardId });
  }
}
