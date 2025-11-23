import { Point } from "../models/point.model.js";
import { PointHistory } from "../models/pointHistory.model.js";


export class DashboardService {

  static async adminStats() {
    const totalPoints = await Point.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const topMembers = await Point.find()
      .populate("userId", "username email")
      .sort({ amount: -1 })
      .limit(5);

    const topActivities = await PointHistory.aggregate([
      { $match: { type: "add", activityId: { $ne: null } } },
      { $group: { _id: "$activityId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalPoints: totalPoints[0]?.total || 0,
      topMembers,
      topActivities
    };
  }

  static async memberStats(userId) {
    const balance = await Point.findOne({ userId });

    const history = await PointHistory.find({ userId }).sort({ date: -1 });

    return {
      balance: balance?.amount || 0,
      history
    };
  }
}
