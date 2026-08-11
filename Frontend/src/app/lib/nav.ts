import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  FileText,
  Bell,
  User,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import type { NavItem } from "../components/DashboardLayout";

export const patientNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Find Doctors", to: "/doctors", icon: Stethoscope },
  { label: "Appointments", to: "/appointments", icon: CalendarDays },
  { label: "Medical History", to: "/history", icon: FileText },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const patientUser = {
  get name() {
    const patient = JSON.parse(localStorage.getItem("patient") || "{}");
    return patient.fullName || "Patient";
  },
  role: "Patient",
  get photo() {
    const patient = JSON.parse(localStorage.getItem("patient") || "{}");
    if (patient.profileImageUrl) {
      return patient.profileImageUrl;
    }
    if (patient.profileImage) {
      if (patient.profileImage.startsWith("http")) {
        return patient.profileImage;
      }
      return `http://localhost:8080/api/patient/image/${patient.id}`;
    }
    return undefined;
  },
  get initials() {
    const patient = JSON.parse(localStorage.getItem("patient") || "{}");
    return (
      patient.fullName
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "P"
    );
  },
};

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Doctors", to: "/admin/doctors", icon: Stethoscope },
  { label: "Patients", to: "/admin/patients", icon: Users },
  { label: "Appointments", to: "/admin/appointments", icon: CalendarDays },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export const adminUser = {
  name: "Dr. Admin",
  role: "Administrator",
};
