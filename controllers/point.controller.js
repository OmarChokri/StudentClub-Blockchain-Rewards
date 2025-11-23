import { PointsService } from "../services/point.service.js";

export class PointsController {

  static async add(req, res) {
    try {
      const result = await PointsService.addPoints(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async transfer(req, res) {
    try {
      const result = await PointsService.transferPoints(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async burn(req, res) {
    try {
      const result = await PointsService.burnPoints(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async balance(req, res) {
    const balance = await PointsService.getBalance(req.params.userId);
    res.json(balance);
  }

  static async history(req, res) {
    const list = await PointsService.getHistory(req.params.userId);
    res.json(list);
  }
}
