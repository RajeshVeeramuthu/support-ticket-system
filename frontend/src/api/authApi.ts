import axiosClient from "./axiosClient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await axiosClient.post<AuthResponse>(
      "/auth/login",
      data,
    );
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await axiosClient.post<AuthResponse>(
      "/auth/register",
      data,
    );
    return response.data;
  },
};