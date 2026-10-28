import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import StaffUsers from "./pages/StaffUsers";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/tickets"
                element={<TicketList />}
              />

              <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                <Route path="/admin/users" element={<StaffUsers />} />
              </Route>

              <Route
                element={<ProtectedRoute roles={["USER"]} />}
              >
                <Route
                  path="/tickets/new"
                  element={<CreateTicket />}
                />
              </Route>

              <Route
                path="/tickets/:id"
                element={<TicketDetails />}
              />
            </Route>
          </Route>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;