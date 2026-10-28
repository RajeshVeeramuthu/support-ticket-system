import axiosClient from "./axiosClient";
import type {
  Agent,
  CreateTicketRequest,
  Ticket,
  TicketStatus,
} from "../types/ticket";

export interface TicketListParams {
  search?: string;
  status?: TicketStatus | "";
  page?: number;
  pageSize?: number;
}

export interface TicketListResult {
  items: Ticket[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const ticketApi = {
  getAll: async (params?: TicketListParams) => {
    const response = await axiosClient.get<TicketListResult>("/tickets", {
      params,
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosClient.get<Ticket>(
      `/tickets/${id}`,
    );
    return response.data;
  },

  create: async (data: CreateTicketRequest) => {
    const response = await axiosClient.post<Ticket>(
      "/tickets",
      data,
    );
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: TicketStatus,
  ) => {
    const response = await axiosClient.patch<Ticket>(
      `/tickets/${id}/status`,
      { status },
    );
    return response.data;
  },

  assign: async (id: number, agentId: number) => {
    const response = await axiosClient.post<Ticket>(
      `/tickets/${id}/assign`,
      { agentId },
    );
    return response.data;
  },

  getAgents: async () => {
    const response = await axiosClient.get<Agent[]>("/tickets/agents");
    return response.data;
  },
};