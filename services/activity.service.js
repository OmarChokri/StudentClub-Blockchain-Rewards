import { Activity } from "../models/activity.model.js";

export class ActivityService {

  static async addActivity(data) {
    return await Activity.create(data);
  }

  static async getActivities() {
    return await Activity.find().sort({ createdAt: -1 });
  }

  static async getActivityById(id) {
    return await Activity.findById(id);
  }

  static async updateActivity(id, data) {
    return await Activity.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteActivity(id) {
    return await Activity.findByIdAndDelete(id);
  }
}
