import type { AxiosResponse } from "axios";
import api from "./api";

type MemberData = Record<string, unknown>;

const MemberService = {
  getAllMembers: (): Promise<AxiosResponse<any>> => {
    return api.get("/members");
  },

  getMemberById: (id: string | number): Promise<AxiosResponse<any>> => {
    return api.get(`/members/${id}`);
  },

  getMemberByEmail: (email: string): Promise<AxiosResponse<any>> => {
    return api.get(`/members/email/${email}`);
  },

  addMember: (data: MemberData): Promise<AxiosResponse<any>> => {
    // Example data structure:
    // { firstName, lastName, email, phone, address, ... }
    return api.post("/members/add", data);
  },

  updateMember: (id: string | number, data: MemberData): Promise<AxiosResponse<any>> => {
    return api.put(`/members/${id}`, data);
  },

  deleteMember: (id: string | number): Promise<AxiosResponse<any>> => {
    return api.delete(`/members/${id}`);
  },
};

export default MemberService;
