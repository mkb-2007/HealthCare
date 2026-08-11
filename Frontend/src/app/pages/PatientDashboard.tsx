import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Heart,
  CalendarPlus,
  Stethoscope,
  FileText,
  PhoneCall,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmergencyContactModal } from "../components/EmergencyContactModal";
import { formatDateToDDMMYYYY, formatGender } from "../components/ui/utils";
import { patientNav, patientUser } from "../lib/nav";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import { useDoctors } from "../context/DoctorContext";
import api from "../../api/api";

const quickActions = [
  { label: "Book Appointment", icon: CalendarPlus, to: "/doctors", color: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" },
  { label: "Find Specialist", icon: Stethoscope, to: "/doctors", color: "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400" },
  { label: "Medical Reports", icon: FileText, to: "/history", color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" },
  { label: "Emergency Contact", icon: PhoneCall, to: "/profile", color: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400" },
];

export function PatientDashboard() {
  const patient = JSON.parse(
    localStorage.getItem("patient") || "{}"
  );

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [favoriteDoctors, setFavoriteDoctors] = useState<any[]>([]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchFavoriteDoctors();
  }, []);

  const fetchFavoriteDoctors = async () => {
    try {
      const patientId = patient?.id || 1;
      const res = await api.get(`/favorites?patientId=${patientId}`);
      setFavoriteDoctors(res.data);
    } catch (error) {
      console.error("Failed to fetch favorite doctors:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const patientId = patient?.id || 1;
      const res = await api.get(`/appointment/patient/${patientId}`);
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to load dashboard appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const completedCount = appointments.filter((a) => a.status === "Completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "Cancelled").length;

  const stats = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarCheck, color: "from-blue-500 to-blue-600" },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "from-green-500 to-emerald-600" },
    { label: "Cancelled", value: cancelledCount, icon: XCircle, color: "from-red-400 to-rose-500" },
    { label: "Favorite Doctors", value: favoriteDoctors.length, icon: Heart, color: "from-teal-500 to-cyan-600" },
  ];

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Welcome back, {patient.fullName || "Patient"} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Here&apos;s an overview of your health activity.</p>
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
            Patient Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-200">
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Full Name</p>
              <p className="font-medium">{patient.fullName || "—"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Email</p>
              <p className="font-medium">{patient.email || "—"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Phone</p>
              <p className="font-medium">{patient.phone || "—"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Gender</p>
              <p className="font-medium">{formatGender(patient.gender) || "—"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Date of Birth</p>
              <p className="font-medium">{formatDateToDDMMYYYY(patient.dateOfBirth)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}
            >
              <s.icon size={22} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-50">
              {s.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {loadingAppointments ? (
              <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading appointments...</p>
            ) : upcoming.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No upcoming appointments.
              </div>
            ) : (
              upcoming.map((a) => {
                const doctorName = a.doctorName || "Doctor";
                const doctorPhoto = getDoctorProfileImage(a);
                const dateStr = a.appointmentDate || a.date || "N/A";
                const timeStr = a.timeSlot || a.time || "N/A";
                const specStr = a.specialization || "Specialist";
                const hospitalStr = a.hospital || "General Hospital";

                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <ImageWithFallback
                      src={doctorPhoto}
                      alt={doctorName}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{doctorName}</h3>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{specStr}</p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} /> {hospitalStr}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck size={14} /> {dateStr}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {timeStr}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/appointments"
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Details <ArrowRight size={15} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick actions */}
          <h2 className="mt-8 text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {quickActions.map((q) => {
              const isEmergency = q.label === "Emergency Contact";
              if (isEmergency) {
                return (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setEmergencyModalOpen(true)}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer w-full"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${q.color}`}>
                      <q.icon size={22} />
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{q.label}</span>
                    <ArrowRight size={16} className="ml-auto text-slate-300" />
                  </button>
                );
              }

              return (
                <Link
                  key={q.label}
                  to={q.to}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${q.color}`}>
                    <q.icon size={22} />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{q.label}</span>
                  <ArrowRight size={16} className="ml-auto text-slate-300" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Favorite doctors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Favorite Doctors</h2>
            <Link to="/doctors" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            {favoriteDoctors.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                <Heart size={24} className="mx-auto mb-2 opacity-50 text-slate-400" />
                <p>No saved doctors yet.</p>
                <Link to="/doctors" className="mt-2 inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Browse Doctors
                </Link>
              </div>
            ) : (
              favoriteDoctors.map((d) => {
                const doctorName = d.fullName || d.name || "Doctor";
                const doctorPhoto = getDoctorProfileImage(d);

                return (
                  <Link
                    key={d.id}
                    to={`/doctors/${d.id}`}
                    className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageWithFallback
                        src={doctorPhoto}
                        alt={doctorName}
                        className="h-11 w-11 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{doctorName}</p>
                        <p className="truncate text-xs text-blue-600 dark:text-blue-400">{d.specialization}</p>
                      </div>
                    </div>
                    <Heart size={16} className="fill-rose-500 text-rose-500 shrink-0 ml-2" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <EmergencyContactModal
        open={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
        contactName={patient.emergencyContactName}
        relationship={patient.emergencyRelationship}
        phone={patient.emergencyContactPhone}
      />
    </DashboardLayout>
  );
}
