import type { AxiosResponse } from "axios";
import api from "./api";

type RewardData = Record<string, unknown>;

const RewardService = {
  addReward: (data: RewardData): Promise<AxiosResponse<any>> => {
    return api.post("/rewards/add", data);
  },

  getAllRewards: (): Promise<AxiosResponse<any>> => {
    return api.get("/rewards");
  },

  getRewardById: (id: string): Promise<AxiosResponse<any>> => {
    return api.get(`/rewards/${id}`);
  },

  updateReward: (id: string, data: RewardData): Promise<AxiosResponse<any>> => {
    return api.put(`/rewards/${id}`, data);
  },

  deleteReward: (id: string): Promise<AxiosResponse<any>> => {
    return api.delete(`/rewards/${id}`);
  },

};

export default RewardService;
