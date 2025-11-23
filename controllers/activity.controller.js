import { ActivityService } from "../services/activity.service.js";
import { PointsService } from "../services/point.service.js";
import { MemberService } from "../services/member.service.js";


export class ActivityController {

  static async add(req, res) {
    const newActivity = await ActivityService.addActivity(req.body);
    res.json(newActivity);
  }

  static async getAll(req, res) {
    const list = await ActivityService.getActivities();
    res.json(list);
  }

  static async getOne(req, res) {
    const act = await ActivityService.getActivityById(req.params.id);
    res.json(act);
  }

  static async update(req, res) {
    const updated = await ActivityService.updateActivity(req.params.id, req.body);
    res.json(updated);
  }

  static async delete(req, res) {
    await ActivityService.deleteActivity(req.params.id);
    res.json({ message: "Activity deleted" });
  }
  static async assignActivity(req, res) {
  try {
    const { userId, activityId } = req.body;

    const activity = await ActivityService.getActivityById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const user = await MemberService.getMemberById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 👉 Ajouter les points automatiquement
    await PointsService.addPoints({
      userId,
      amount: activity.points,
      reason: `Participation to ${activity.title}`,
      activityId
    });

    return res.status(200).json({
      message: "Activity assigned & points added",
      addedPoints: activity.points
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

}
