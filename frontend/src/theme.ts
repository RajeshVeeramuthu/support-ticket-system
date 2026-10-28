import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#64748b",
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
    success: {
      main: "#15803d",
    },
    warning: {
      main: "#d97706",
    },
    error: {
      main: "#dc2626",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e8edf4",
          boxShadow: "0 3px 14px rgba(15, 23, 42, 0.04)",
        },
      },
    },
  },
});

export default theme;