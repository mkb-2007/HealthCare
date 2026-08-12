import { useState, useEffect, useCallback } from "react";
import {
  Stethoscope,
  Users,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  User,
  Loader2,
  CalendarX2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatusBadge } from "../components/StatusBadge";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { adminNav, adminUser } from "../lib/nav";
import { useTheme } from "../context/ThemeContext";
import {
  getAdminDashboardData,
  type DashboardResponse,
} from "../../api/AdminDashboardAPI";
import { Button } from "../components/ui/button";
import { API_BASE_URL } from "../../api/api";

export function AdminDashboard() {
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await getAdminDashboardData();
      setData(res);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard statistics from MySQL database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);

    // Instant update handlers
    const handleUpdate = () => fetchDashboard();
    window.addEventListener("appointmentsUpdated", handleUpdate);
    window.addEventListener("patientsUpdated", handleUpdate);
    window.addEventListener("doctorsUpdated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("appointmentsUpdated", handleUpdate);
      window.removeEventListener("patientsUpdated", handleUpdate);
      window.removeEventListener("doctorsUpdated", handleUpdate);
    };
  }, [fetchDashboard]);

  const stats = data
    ? [
        {
          label: "Total Doctors",
          value: data.stats.totalDoctors,
          icon: Stethoscope,
          color: "from-blue-500 to-blue-600",
          trend: `${data.stats.availableDoctors} Avail`,
        },
        {
          label: "Total Patients",
          value: data.stats.totalPatients,
          icon: Users,
          color: "from-teal-500 to-cyan-600",
          trend: `Total`,
        },
        {
          label: "Today's Appointments",
          value: data.stats.todayAppointments,
          icon: CalendarDays,
          color: "from-indigo-500 to-violet-600",
          trend: `Total ${data.stats.totalAppointments}`,
        },
        {
          label: "Pending",
          value: data.stats.pendingAppointments,
          icon: Clock,
          color: "from-amber-400 to-orange-500",
          trend: "Pending",
        },
        {
          label: "Completed",
          value: data.stats.completedAppointments,
          icon: CheckCircle2,
          color: "from-green-500 to-emerald-600",
          trend: "Done",
        },
        {
          label: "Cancelled",
          value: data.stats.cancelledAppointments,
          icon: XCircle,
          color: "from-rose-400 to-red-500",
          trend: "Cancelled",
        },
      ]
    : [];

  const gridColor = theme === "dark" ? "#1e3a5f" : "#eef2f7";
  const cursorColor = theme === "dark" ? "#0f2644" : "#f1f5f9";
  const tooltipStyle =
    theme === "dark"
      ? {
          backgroundColor: "#0c1a2e",
          border: "1px solid #1e3a5f",
          color: "#e8f0fe",
          borderRadius: "8px",
        }
      : { borderRadius: "8px" };

  // Search filtering
  const filteredPatients = (data?.recentPatients || []).filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.fullName && p.fullName.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  });

  const filteredAppointments = (data?.latestAppointments || []).filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.patientName && a.patientName.toLowerCase().includes(term)) ||
      (a.doctorName && a.doctorName.toLowerCase().includes(term)) ||
      (a.doctorDepartment && a.doctorDepartment.toLowerCase().includes(term)) ||
      (a.status && a.status.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout
      navItems={adminNav}
      user={adminUser}
      title="Admin Dashboard"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Monitor hospital performance at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Revenue (this month)
              </p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                <AnimatedNumber value={data?.stats.monthlyRevenue || "₹0"} />
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchDashboard}
            disabled={loading}
            className="h-11 w-11 rounded-2xl border-slate-200 dark:border-slate-800"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 p-4 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <Button size="sm" onClick={fetchDashboard} className="rounded-xl">
            Retry
          </Button>
        </div>
      )}

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={36} className="animate-spin text-blue-600 dark:text-blue-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Fetching latest database statistics...
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}
                  >
                    <s.icon size={20} />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                    <TrendingUp size={12} /> {s.trend}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Appointments per Month
              </h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    id="admin-appt-bar"
                    data={data?.appointmentsPerMonth || []}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={gridColor}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      cursor={{ fill: cursorColor }}
                      contentStyle={tooltipStyle}
                    />
                    <Bar
                      dataKey="appointments"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Doctor Availability
              </h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart id="admin-dept-pie">
                    <Pie
                      data={data?.departmentDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {(data?.departmentDistribution || []).map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(data?.departmentDistribution || []).map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: d.color }}
                    />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Patient Growth
              </h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    id="admin-growth-area"
                    data={data?.patientGrowth || []}
                  >
                    <defs>
                      <linearGradient id="grow" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#14b8a6"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#14b8a6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={gridColor}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      stroke="#14b8a6"
                      strokeWidth={2.5}
                      fill="url(#grow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Recent Registrations
              </h2>
              <div className="mt-4 space-y-3">
                {filteredPatients.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    No patients found
                  </p>
                ) : (
                  filteredPatients.slice(0, 5).map((p) => {
                    const imgUrl = p.profileImage
                      ? p.profileImage.startsWith("http")
                        ? p.profileImage
                        : `${API_BASE_URL}/uploads/profile/${p.profileImage}`
                      : null;

                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={p.fullName}
                            className="h-9 w-9 shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        ) : null}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-100 dark:border-slate-700 ${
                            imgUrl ? "hidden" : ""
                          }`}
                        >
                          <User size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {p.fullName}
                          </p>
                          <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                            {p.email}
                          </p>
                        </div>
                        <StatusBadge status={p.status || "ACTIVE"} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Latest appointments */}
          <div className="mt-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Latest Appointments
            </h2>
            <div className="mt-4 space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                  <CalendarX2 size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No appointments found</p>
                </div>
              ) : (
                filteredAppointments.slice(0, 5).map((a) => (
                  <div
                    key={a.appointmentId}
                    className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-3"
                  >
                    {a.patientProfileImage ? (
                      <img
                        src={a.patientProfileImage}
                        alt={a.patientName}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                    ) : null}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 ${
                        a.patientProfileImage ? "hidden" : ""
                      }`}
                    >
                      <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {a.patientName || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {a.doctorName
                          ? `Dr. ${a.doctorName.replace(/^Dr\.?\s*/i, "")}`
                          : "Doctor"}{" "}
                        · {a.doctorDepartment || "General"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {a.appointmentDate || "—"} · {a.appointmentTime || "—"}
                    </p>
                    <StatusBadge status={a.status || "Upcoming"} />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
