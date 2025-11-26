import { ActivityService } from "../services/activity.service.js";


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

}
