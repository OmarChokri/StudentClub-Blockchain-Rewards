import { RewardService } from "../services/reward.service.js";

export class RewardController {

  // CREATE
  static async add(req, res) {
    try {
      const reward = await RewardService.addReward(req.body);
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // READ ALL
  static async getAll(req, res) {
    try {
      const list = await RewardService.getRewards();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // READ ONE
  static async getById(req, res) {
    try {
      const reward = await RewardService.getRewardById(req.params.id);
      if (!reward) return res.status(404).json({ message: "Reward not found" });
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // UPDATE
  static async update(req, res) {
    try {
      const reward = await RewardService.updateReward(req.params.id, req.body);
      if (!reward) return res.status(404).json({ message: "Reward not found" });
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE
  static async delete(req, res) {
    try {
      const reward = await RewardService.deleteReward(req.params.id);
      if (!reward) return res.status(404).json({ message: "Reward not found" });
      res.json({ message: "Reward deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  

}
