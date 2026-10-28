import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { ticketApi } from "../api/ticketApi";
import { commentApi } from "../api/commentApi";
import { useAuth } from "../context/useAuth";

import type { Agent, Ticket, TicketComment, TicketStatus } from "../types/ticket";

import StatusChip from "../components/StatusChip";
import SeverityChip from "../components/SeverityChip";
import Loading from "../components/Loading";

const statuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const ticketId = Number(id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [comment, setComment] = useState("");
  const [nextStatus, setNextStatus] = useState<TicketStatus>("OPEN");
  const [agentId, setAgentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      ticketApi.getById(ticketId),
      commentApi.getAll(ticketId),
      isAdmin ? ticketApi.getAgents() : Promise.resolve([] as Agent[]),
    ])
      .then(([ticketData, commentData, agentData]) => {
        if (!active) return;
        setTicket(ticketData);
        setComments(commentData);
        setAgents(agentData);
        setNextStatus(ticketData.status);
        setAgentId(ticketData.assignedAgentId?.toString() ?? "");
        setError("");
      })
      .catch(() => {
        if (active) {
          setError(
            "Unable to load this ticket. It may not exist or you may not have access.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ticketId, isAdmin]);

  async function handleStatusUpdate() {
    if (!ticket) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedTicket = await ticketApi.updateStatus(ticket.id, nextStatus);
      setTicket(updatedTicket);
      setSuccess("Ticket status updated successfully.");
    } catch {
      setError("Unable to update ticket status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign() {
    if (!ticket || !agentId.trim()) {
      setError("Enter a valid support agent ID.");
      return;
    }

    const parsedAgentId = Number(agentId);

    if (!Number.isInteger(parsedAgentId) || parsedAgentId <= 0) {
      setError("Agent ID must be a positive integer.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedTicket = await ticketApi.assign(ticket.id, parsedAgentId);
      setTicket(updatedTicket);
      setAgents(await ticketApi.getAgents());
      setSuccess("Ticket assignment updated successfully.");
    } catch {
      setError(
        "Unable to assign the ticket. Verify the agent ID and your permissions.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await commentApi.create(ticketId, comment.trim());
      setComment("");

      const updatedComments = await commentApi.getAll(ticketId);
      setComments(updatedComments);
      setSuccess("Comment added successfully.");
    } catch {
      setError("Unable to add comment.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  if (!ticket) {
    return (
      <Box>
        <Alert severity="error">{error || "Ticket not found."}</Alert>

        <Button onClick={() => navigate("/tickets")} sx={{ mt: 2 }}>
          Back to tickets
        </Button>
      </Box>
    );
  }

  const canUpdateStatus = user?.role === "AGENT" || user?.role === "ADMIN";

  const canAssign = isAdmin;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Button component={RouterLink} to="/tickets" sx={{ mb: 2 }}>
        ← Back to tickets
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            #{ticket.id}
          </Typography>

          <Typography variant="h4" gutterBottom>
            {ticket.subject}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <StatusChip status={ticket.status} />
            <SeverityChip severity={ticket.severity} />
          </Stack>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Ticket Information
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography color="text.secondary" variant="body2">
            Description
          </Typography>

          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              my: 1,
              overflowWrap: "anywhere",
            }}
          >
            {ticket.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>

              <Typography>{ticket.category}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Created By
              </Typography>

              <Typography>{ticket.createdByName}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Assigned Agent
              </Typography>

              <Typography>
                {ticket.assignedAgentName ?? "Unassigned"}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>

              <Typography>
                {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>

              <Typography>
                {new Date(ticket.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Card>

        {canUpdateStatus && (
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Update Status
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ticket Status</InputLabel>

                <Select
                  value={nextStatus}
                  label="Ticket Status"
                  onChange={(e) =>
                    setNextStatus(e.target.value as TicketStatus)
                  }
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                disabled={saving || nextStatus === ticket.status}
                onClick={handleStatusUpdate}
              >
                Save Status
              </Button>
            </Stack>
          </Card>
        )}

        {canAssign && (
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Assign Support Agent
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Support agent</InputLabel>
                <Select
                  label="Support agent"
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
                >
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={String(agent.id)}>
                      {agent.fullName} ({agent.activeTicketCount} active)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                disabled={saving || !agentId || agentId === String(ticket.assignedAgentId)}
                onClick={handleAssign}
              >
                Assign
              </Button>
            </Stack>
            {agents.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No active support agents are available.
              </Alert>
            )}
          </Card>
        )}

        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Comments ({comments.length})
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {comments.length === 0 ? (
            <Typography color="text.secondary">No comments yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {comments.map((item) => (
                <Box key={item.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.userName}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      mt: 1,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.message}
                  </Typography>

                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>
          )}

          {ticket.status !== "CLOSED" && (
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 3 }}>
            <TextField
              label="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              required
              slotProps={{
                htmlInput: { maxLength: 5000 },
              }}
            />

              <Button
                type="submit"
                variant="contained"
                disabled={saving || !comment.trim()}
                sx={{ mt: 2 }}
              >
                Add Comment
              </Button>
            </Box>
          )}
        </Card>
      </Stack>
    </Box>
  );
}
