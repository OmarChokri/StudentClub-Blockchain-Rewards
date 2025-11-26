import type { AxiosResponse } from "axios";
import api from "./api";

type SigninData = { email: string; password: string };
type SignupData = Record<string, unknown>;

const AuthService = {
  signup: (data: SignupData): Promise<AxiosResponse> => {
    return api.post("/auth/signup", data);
  },

  signin: async (data: SigninData): Promise<AxiosResponse> => {
    const res = await api.post("/auth/signin", data);

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    console.log(res);
    return res;
  },

  logout: (): void => {
    localStorage.removeItem("token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};

export default AuthService;
