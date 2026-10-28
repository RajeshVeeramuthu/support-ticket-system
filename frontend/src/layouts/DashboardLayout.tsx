import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";

const drawerWidth = 250;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Tickets",
      path: "/tickets",
      icon: <ConfirmationNumberIcon />,
    },
    ...(user?.role === "USER"
      ? [
          {
            label: "Create Ticket",
            path: "/tickets/new",
            icon: <AddIcon />,
          },
        ]
      : []),
    ...(user?.role === "ADMIN"
      ? [
          {
            label: "Staff accounts",
            path: "/admin/users",
            icon: <ManageAccountsIcon />,
          },
        ]
      : []),
  ];

  const sidebar = (
    <Box sx={{ height: "100%", bgcolor: "background.paper" }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }} color="primary">
          SupportDesk
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Ticket Management
        </Typography>
      </Box>

      <List sx={{ px: 1.5 }}>
        {links.map((link) => (
          <ListItemButton
            key={link.path}
            component={RouterLink}
            to={link.path}
            selected={location.pathname === link.path}
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ position: "absolute", bottom: 0, p: 2, width: "100%" }}>
        <ListItemButton
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
              aria-label="Open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography sx={{ fontWeight: 700, flexGrow: 1 }}>
            Support Ticket Management
          </Typography>

          <Avatar sx={{ width: 34, height: 34, mr: 1 }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </Avatar>

          {!isMobile && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {sidebar}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              width: drawerWidth,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                borderRight: "1px solid #e8edf4",
              },
            }}
          >
            {sidebar}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          px: { xs: 2, md: 4 },
          py: 4,
          mt: "64px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
