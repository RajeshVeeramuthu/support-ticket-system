import { Chip } from "@mui/material";
import type { TicketSeverity } from "../types/ticket";

export default function SeverityChip({
  severity,
}: {
  severity: TicketSeverity;
}) {
  return (
    <Chip
      label={severity === "HIGH" ? "High" : "Normal"}
      color={severity === "HIGH" ? "error" : "default"}
      size="small"
      variant={severity === "HIGH" ? "filled" : "outlined"}
    />
  );
}