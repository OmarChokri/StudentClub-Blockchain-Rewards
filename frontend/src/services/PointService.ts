import type { AxiosResponse } from "axios";
import api from "./api";

type PointsData = Record<string, unknown>;

const PointService = {

  addPoints: (data: PointsData): Promise<AxiosResponse<any>> => {
    // data = { userId, amount, reason }
    return api.post("/points/add", data);
  },

  adminBurn: (data: PointsData): Promise<AxiosResponse<any>> => {
    // data = { userId, amount, reason }
    return api.post("/points/admin-burn", data);
  },

  getBalance: (userId: string): Promise<AxiosResponse<any>> => {
    return api.get(`/points/balance/${userId}`);
  },

};

export default PointService;
