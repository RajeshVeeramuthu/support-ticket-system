import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ??
              "Registration failed. The email may already be registered."
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, sm: 5 }, width: "100%" }}
        >
          <Typography variant="h4" gutterBottom>
            Create an account
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Register to submit and track support requests.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              slotProps={{
                htmlInput: { maxLength: 100 },
              }}
              margin="normal"
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              margin="normal"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  minLength: 8,
                  maxLength: 100,
                },
              }}
              autoComplete="new-password"
              margin="normal"
              helperText="Use at least 8 characters."
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.3 }}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </Box>

          <Typography sx={{ textAlign: "center", mt: 3 }}>
            Already registered?{" "}
            <RouterLink to="/login">Sign in</RouterLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}