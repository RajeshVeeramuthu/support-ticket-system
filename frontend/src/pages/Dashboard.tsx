import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { dashboardApi } from "../api/dashboardApi";
import Loading from "../components/Loading";
import type { DashboardStats } from "../types/ticket";

const statLabels: { key: keyof DashboardStats; label: string }[] = [
  { key: "totalTickets", label: "Total tickets" },
  { key: "openTickets", label: "Open" },
  { key: "inProgressTickets", label: "In progress" },
  { key: "resolvedTickets", label: "Resolved" },
  { key: "closedTickets", label: "Closed" },
  { key: "highSeverityTickets", label: "High severity" },
  { key: "unassignedTickets", label: "Unassigned" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    dashboardApi
      .getStats()
      .then((result) => {
        if (active) setStats(result);
      })
      .catch(() => {
        if (active) setError("Unable to load dashboard statistics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        An overview of your support tickets.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Loading />
      ) : stats ? (
        <Grid container spacing={2}>
          {statLabels.map(({ key, label }) => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                    {stats[key]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Box>
  );
}
