import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { ticketApi } from "../api/ticketApi";
import type { TicketCategory } from "../types/ticket";

const categories: TicketCategory[] = [
  "Technical",
  "Billing",
  "Account",
  "Access",
  "Other",
];

export default function CreateTicket() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<TicketCategory>("Technical");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required.");
      return;
    }

    setLoading(true);

    try {
      const ticket = await ticketApi.create({
        subject: subject.trim(),
        description: description.trim(),
        category,
      });

      navigate(`/tickets/${ticket.id}`, { replace: true });
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ??
              "Unable to create ticket. Please try again."
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Button
        component={RouterLink}
        to="/tickets"
        sx={{ mb: 2 }}
      >
        ← Back to tickets
      </Button>

      <Typography variant="h4" gutterBottom>
        Create Ticket
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Describe the problem you need help resolving.
      </Typography>

      <Card sx={{ p: { xs: 2, sm: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            fullWidth
            slotProps={{
              htmlInput: { maxLength: 200 },
            }}
            margin="normal"
            helperText="Summarize the issue in one sentence."
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>

            <Select
              label="Category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as TicketCategory)
              }
            >
              {categories.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            multiline
            minRows={6}
            slotProps={{
              htmlInput: { maxLength: 10000 },
            }}
            margin="normal"
            helperText="Include relevant details and any error messages."
          />

          <Alert severity="info" sx={{ my: 2 }}>
            Ticket severity and agent assignment will be determined
            automatically by the server.
          </Alert>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </Button>

            <Button
              component={RouterLink}
              to="/tickets"
              color="inherit"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}