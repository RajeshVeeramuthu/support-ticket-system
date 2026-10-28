import { Alert } from "@mui/material";

export default function ErrorAlert({
  message,
}: {
  message: string;
}) {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}