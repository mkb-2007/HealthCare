import api from "./api";

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  availableDoctors: number;
  busyDoctors: number;
  onLeaveDoctors: number;
  monthlyRevenue: string;
}

export interface MonthlyCount {
  month: string;
  appointments: number;
  patients: number;
}

export interface DepartmentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RecentPatient {
  id: number;
  fullName: string;
  email: string;
  status: string;
  profileImage?: string;
  createdAt?: string;
}

export interface LatestAppointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientProfileImage: string | null;
  doctorId: number;
  doctorName: string;
  doctorDepartment: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
}

export interface RecentDoctor {
  id: number;
  fullName: string;
  specialization: string;
  hospital: string;
  profileImage?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  appointmentsPerMonth: MonthlyCount[];
  patientGrowth: MonthlyCount[];
  departmentDistribution: DepartmentDistribution[];
  recentPatients: RecentPatient[];
  latestAppointments: LatestAppointment[];
  recentDoctors: RecentDoctor[];
}

export const getAdminDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>("/admin/dashboard/data");
  return response.data;
};
