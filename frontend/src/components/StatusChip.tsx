import { Chip } from "@mui/material";
import type { TicketStatus } from "../types/ticket";

const statusStyles: Record<
  TicketStatus,
  "default" | "info" | "success" | "error"
> = {
  OPEN: "info",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "default",
};

const labels: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function StatusChip({
  status,
}: {
  status: TicketStatus;
}) {
  return (
    <Chip
      label={labels[status] ?? status}
      color={statusStyles[status] ?? "default"}
      size="small"
      variant="outlined"
    />
  );
}