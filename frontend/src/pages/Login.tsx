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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ??
              "Login failed. Check your credentials.")
          : "An unexpected error occurred.",
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
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, width: "100%" }}>
          <Typography variant="h4" gutterBottom>
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your support tickets.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              autoComplete="email"
              margin="normal"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, py: 1.3 }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Box>

          <Typography sx={{ mt: 3, textAlign: "center" }}>
            Don't have an account?{" "}
            <RouterLink to="/register">Register</RouterLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
