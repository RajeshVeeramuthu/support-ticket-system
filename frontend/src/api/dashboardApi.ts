import axiosClient from "./axiosClient";
import type { DashboardStats } from "../types/ticket";

export const dashboardApi = {
  getStats: async () => {
    const response = await axiosClient.get<DashboardStats>(
      "/dashboard",
    );
    return response.data;
  },
};