import { Download, TrendingUp, Users, CalendarCheck, Star } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { adminNav, adminUser } from "../lib/nav";
import { useTheme } from "../context/ThemeContext";
import {
  appointmentsPerMonth,
  departmentDistribution,
  doctorPerformance,
} from "../lib/data";

const kpis = [
  { label: "Total Revenue", value: "₹1.24Cr", icon: TrendingUp, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50" },
  { label: "New Patients", value: "3,120", icon: Users, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50" },
  { label: "Appointments", value: "12,480", icon: CalendarCheck, color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50" },
  { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50" },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="mt-4 h-72">{children}</div>
    </div>
  );
}

export function Reports() {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#1e3a5f" : "#eef2f7";
  const cursorColor = theme === "dark" ? "#0f2644" : "#f1f5f9";
  const tooltipStyle = theme === "dark"
    ? { backgroundColor: "#0c1a2e", border: "1px solid #1e3a5f", color: "#e8f0fe", borderRadius: "8px" }
    : { borderRadius: "8px" };

  return (
    <DashboardLayout navItems={adminNav} user={adminUser} title="Reports">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Reports &amp; Analytics</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Insights across your hospital operations.</p>
        </div>
        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700">
          <Download size={16} /> Download Report
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.color}`}>
              <k.icon size={22} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-50">{k.value}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Appointment Trends">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart id="reports-trend-line" data={appointmentsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="appointments" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient Statistics by Department">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart id="reports-dept-pie">
              <Pie
                data={departmentDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={95}
                label
              >
                {departmentDistribution.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor Performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart id="reports-perf-bar" data={doctorPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="#94a3b8"
                width={80}
              />
              <Tooltip cursor={{ fill: cursorColor }} contentStyle={tooltipStyle} />
              <Bar dataKey="patients" fill="#14b8a6" radius={[0, 6, 6, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Appointments">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart id="reports-monthly-bar" data={appointmentsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip cursor={{ fill: cursorColor }} contentStyle={tooltipStyle} />
              <Bar dataKey="appointments" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
