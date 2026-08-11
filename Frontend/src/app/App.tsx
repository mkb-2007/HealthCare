import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DoctorProvider } from "./context/DoctorContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import { Landing } from "./pages/Landing";
import { PatientLogin } from "./pages/PatientLogin";
import { PatientRegister } from "./pages/PatientRegister";
import { AdminLogin } from "./pages/AdminLogin";

import { PatientDashboard } from "./pages/PatientDashboard";
import { Profile } from "./pages/Profile";
import { FindDoctors } from "./pages/FindDoctors";
import { DoctorProfile } from "./pages/DoctorProfile";
import { BookAppointment } from "./pages/BookAppointment";
import { MyAppointments } from "./pages/MyAppointments";
import { MedicalHistory } from "./pages/MedicalHistory";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";

import { AdminDashboard } from "./pages/AdminDashboard";
import { ManageDoctors } from "./pages/ManageDoctors";
import { ManagePatients } from "./pages/ManagePatients";
import { ManageAppointments } from "./pages/ManageAppointments";
import { Reports } from "./pages/Reports";

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <DoctorProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PatientLogin />} />
              <Route path="/register" element={<PatientRegister />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Public browsing — no auth required */}
              <Route path="/doctors" element={<FindDoctors />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />

              {/* Protected patient routes */}
              <Route path="/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
              <Route path="/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Protected admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/doctors" element={<AdminRoute><ManageDoctors /></AdminRoute>} />
              <Route path="/admin/patients" element={<AdminRoute><ManagePatients /></AdminRoute>} />
              <Route path="/admin/appointments" element={<AdminRoute><ManageAppointments /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><Settings admin /></AdminRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </BrowserRouter>
        </DoctorProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
