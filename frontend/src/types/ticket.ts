export type TicketCategory =
  | "Technical"
  | "Billing"
  | "Account"
  | "Access"
  | "Other";

export type TicketSeverity = "NORMAL" | "HIGH";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  category: TicketCategory;
  severity: TicketSeverity;
  status: TicketStatus;
  createdById: number;
  createdByName: string;
  assignedAgentId: number | null;
  assignedAgentName: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  highSeverityTickets: number;
  unassignedTickets: number;
}

export interface Agent {
  id: number;
  fullName: string;
  email: string;
  activeTicketCount: number;
}