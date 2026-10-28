import axiosClient from "./axiosClient";
import type {
  CreateStaffUserRequest,
  StaffUser,
} from "../types/staffUser";

export const adminUserApi = {
  getAll: async () => {
    const response = await axiosClient.get<StaffUser[]>("/admin/users");
    return response.data;
  },

  create: async (data: CreateStaffUserRequest) => {
    const response = await axiosClient.post<StaffUser>("/admin/users", data);
    return response.data;
  },
};
