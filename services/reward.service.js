import { Reward } from "../models/reward.model.js";


export class RewardService {

  // CREATE
  static async addReward(data) {
    return await Reward.create(data);
  }

  // READ ALL
  static async getRewards() {
    return await Reward.find().sort({ createdAt: -1 });
  }

  // READ ONE
  static async getRewardById(id) {
    return await Reward.findById(id);
  }

  // UPDATE
  static async updateReward(id, data) {
    return await Reward.findByIdAndUpdate(id, data, { new: true });
  }

  // DELETE
  static async deleteReward(id) {
    return await Reward.findByIdAndDelete(id);
  }
  
}
