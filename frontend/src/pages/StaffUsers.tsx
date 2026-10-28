import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
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
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { adminUserApi } from "../api/adminUserApi";
import Loading from "../components/Loading";
import type { StaffRole, StaffUser } from "../types/staffUser";

export default function StaffUsers() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("AGENT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    adminUserApi
      .getAll()
      .then((result) => {
        if (active) setUsers(result);
      })
      .catch(() => {
        if (active) setError("Unable to load staff accounts.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const created = await adminUserApi.create({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      setUsers((current) =>
        [...current, created].sort((a, b) =>
          a.role.localeCompare(b.role) || a.fullName.localeCompare(b.fullName),
        ),
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("AGENT");
      setSuccess(`${created.role} account created successfully.`);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ??
            "Unable to create the account. Check the details and try again.")
          : "An unexpected error occurred.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Staff accounts
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Create and review agent and administrator accounts.
      </Typography>

      <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create staff account
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          <TextField
            label="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            slotProps={{ htmlInput: { maxLength: 256 } }}
          />
          <TextField
            label="Temporary password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            helperText="At least 8 characters."
            slotProps={{ htmlInput: { minLength: 8, maxLength: 100 } }}
          />
          <FormControl>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value as StaffRole)}
            >
              <MenuItem value="AGENT">Agent</MenuItem>
              <MenuItem value="ADMIN">Administrator</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ gridColumn: { md: "1 / -1" } }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Creating account..." : "Create account"}
            </Button>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Existing accounts
        </Typography>
        {loading ? (
          <Loading />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}
