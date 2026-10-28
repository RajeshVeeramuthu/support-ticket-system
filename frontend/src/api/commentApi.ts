import axiosClient from "./axiosClient";
import type { TicketComment } from "../types/ticket";

export const commentApi = {
  getAll: async (ticketId: number) => {
    const response = await axiosClient.get<TicketComment[]>(
      `/tickets/${ticketId}/comments`,
    );
    return response.data;
  },

  create: async (ticketId: number, comment: string) => {
    const response = await axiosClient.post<TicketComment>(
      `/tickets/${ticketId}/comments`,
      { message: comment },
    );
    return response.data;
  },
};