import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ticketApi } from "../api/ticketApi";
import { useAuth } from "../context/useAuth";
import Loading from "../components/Loading";
import SeverityChip from "../components/SeverityChip";
import StatusChip from "../components/StatusChip";
import type { Ticket, TicketStatus } from "../types/ticket";

const statuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    ticketApi
      .getAll({
        search: search.trim() || undefined,
        status,
        page: page + 1,
        pageSize,
      })
      .then((result) => {
        if (!active) return;
        setTickets(result.items);
        setTotalCount(result.totalCount);
        setError("");
      })
      .catch(() => {
        if (active) setError("Unable to load tickets. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, pageSize, search, status]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Tickets
          </Typography>
          <Typography color="text.secondary">
            Search and manage support requests.
          </Typography>
        </Box>
        {user?.role === "USER" && (
          <Button
            component={RouterLink}
            to="/tickets/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Ticket
          </Button>
        )}
      </Box>

      <Card sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 2.5,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search subject or description"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            slotProps={{
              input: { startAdornment: <SearchIcon sx={{ mr: 1 }} /> },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TicketStatus | "");
                setPage(0);
              }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {statuses.map((item) => (
                <MenuItem value={item} key={item}>
                  {item.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Loading />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Agent</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      hover
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>{ticket.subject}</TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell><SeverityChip severity={ticket.severity} /></TableCell>
                      <TableCell><StatusChip status={ticket.status} /></TableCell>
                      <TableCell>{ticket.assignedAgentName ?? "Unassigned"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {tickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No matching tickets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Card>
    </Box>
  );
}
