import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WeeklySpecials from "./pages/WeeklySpecials";
import Inventory from "./pages/Inventory";
import SpecialOffers from "./pages/SpecialOffers";
import Dealerships from "./pages/Dealerships";
import AutoBusinesses from "./pages/AutoBusinesses";
import ServiceParts from "./pages/ServiceParts";
import CommunityBlog from "./pages/CommunityBlog";
import ContactSubmissions from "./pages/ContactSubmissions";
import Parts from "./pages/Parts";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Redirect root to admin login */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Auth Routes */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/specials"
              element={
                <ProtectedRoute>
                  <WeeklySpecials />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/offers"
              element={
                <ProtectedRoute>
                  <SpecialOffers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dealerships"
              element={
                <ProtectedRoute>
                  <Dealerships />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/businesses"
              element={
                <ProtectedRoute>
                  <AutoBusinesses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/service"
              element={
                <ProtectedRoute>
                  <ServiceParts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parts"
              element={
                <ProtectedRoute>
                  <Parts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/blog"
              element={
                <ProtectedRoute>
                  <CommunityBlog />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/contacts"
              element={
                <ProtectedRoute>
                  <ContactSubmissions />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                theme: {
                  primary: "#4aed88",
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
