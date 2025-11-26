import type { AxiosResponse } from "axios";
import api from "./api";

type ActivityData = Record<string, unknown>;

const ActivityService = {
  getAllActivities: (): Promise<AxiosResponse<any>> => {
    return api.get("/activities");
  },

  getActivityById: (id: string | number): Promise<AxiosResponse<any>> => {
    return api.get(`/activities/${id}`);
  },

  addActivity: (data: ActivityData): Promise<AxiosResponse<any>> => {
    // Example data: { title, description, date, ... }
    return api.post("/activities/add", data);
  },

  updateActivity: (id: string | number, data: ActivityData): Promise<AxiosResponse<any>> => {
    return api.put(`/activities/${id}`, data);
  },

  deleteActivity: (id: string | number): Promise<AxiosResponse<any>> => {
    return api.delete(`/activities/${id}`);
  },

};

export default ActivityService;
