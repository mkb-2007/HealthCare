import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Eye, CalendarClock, X, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Calendar as CalendarPicker } from "../components/ui/calendar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { patientNav, patientUser } from "../lib/nav";
import { timeSlots } from "../lib/data";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import { useDoctors } from "../context/DoctorContext";
import api from "../../api/api";

const tabs = ["All", "Upcoming", "Completed", "Cancelled"];

export function MyAppointments() {
  const { doctors } = useDoctors();
  const [tab, setTab] = useState("All");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View Details state
  const [viewDetailsItem, setViewDetailsItem] = useState<any>(null);

  // Cancel dialog state
  const [selectedCancelId, setSelectedCancelId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule dialog state
  const [rescheduleItem, setRescheduleItem] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(new Date());
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const storedPatientStr = localStorage.getItem("patient");
      const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
      const patientId = storedPatient?.id || 1;

      const res = await api.get(`/appointment/patient/${patientId}`);
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptCancel = (id: number) => {
    setSelectedCancelId(id);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!selectedCancelId) return;
    try {
      setCancelling(true);
      await api.delete(`/appointment/${selectedCancelId}`);
      toast.success("Appointment cancelled successfully.");
      window.dispatchEvent(new Event("notificationsUpdated"));
      window.dispatchEvent(new Event("appointmentsUpdated"));
      setShowCancelModal(false);
      setSelectedCancelId(null);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Unable to cancel appointment. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const openRescheduleModal = (item: any) => {
    setRescheduleItem(item);
    setRescheduleSlot(item.timeSlot || item.time || "");
    setRescheduleDate(new Date());
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleItem) return;
    if (!rescheduleSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    try {
      setRescheduleLoading(true);
      const formattedDate = rescheduleDate
        ? rescheduleDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : rescheduleItem.appointmentDate;

      const payload = {
        appointmentDate: formattedDate,
        timeSlot: rescheduleSlot,
        status: "Upcoming",
      };

      await api.put(`/appointment/${rescheduleItem.id}`, payload);
      toast.success("Appointment rescheduled successfully!");
      window.dispatchEvent(new Event("notificationsUpdated"));
      window.dispatchEvent(new Event("appointmentsUpdated"));
      setRescheduleItem(null);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
      toast.error("Failed to reschedule appointment.");
    } finally {
      setRescheduleLoading(false);
    }
  };

const resolveDoctorImage = (a: any) => getDoctorProfileImage(a, doctors);

  const filtered = appointments.filter((a) => tab === "All" || a.status === tab);

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="My Appointments">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">My Appointments</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage and track all your appointments.</p>
        </div>
        <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
          <Link to="/doctors">
            <CalendarPlus size={16} /> Book New
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl bg-slate-100 dark:bg-slate-800">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            Loading appointments...
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const doctorName = a.doctorName || "Doctor";
                  const doctorPhoto = resolveDoctorImage(a);
                  const dateStr = a.appointmentDate || a.date || "N/A";
                  const timeStr = a.timeSlot || a.time || "N/A";

                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src={doctorPhoto}
                            alt={doctorName}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{doctorName}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{a.specialization}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{dateStr}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{timeStr}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Details"
                            onClick={() => setViewDetailsItem(a)}
                          >
                            <Eye size={16} />
                          </Button>
                          {a.status === "Upcoming" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                title="Reschedule"
                                onClick={() => openRescheduleModal(a)}
                              >
                                <CalendarClock size={16} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                                title="Cancel"
                                onClick={() => handlePromptCancel(a.id)}
                              >
                                <X size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">No appointments found.</p>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      <Dialog open={!!viewDetailsItem} onOpenChange={(open) => !open && setViewDetailsItem(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Appointment Details</DialogTitle>
          </DialogHeader>

          {viewDetailsItem && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
                <ImageWithFallback
                  src={resolveDoctorImage(viewDetailsItem)}
                  alt={viewDetailsItem.doctorName || "Doctor"}
                  className="h-14 w-14 rounded-xl object-cover border"
                />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">👨‍⚕️ {viewDetailsItem.doctorName || "Doctor"}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{viewDetailsItem.specialization || "Specialist"}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{viewDetailsItem.hospital || "Apollo Hospital"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{viewDetailsItem.appointmentDate || viewDetailsItem.date || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Time</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{viewDetailsItem.timeSlot || viewDetailsItem.time || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={viewDetailsItem.status} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Type</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{viewDetailsItem.type || "In-person"}</p>
                </div>
              </div>

              {viewDetailsItem.doctorId && (
                <Button asChild variant="outline" className="w-full rounded-xl mt-2">
                  <Link to={`/doctors/${viewDetailsItem.doctorId}`}>View Doctor Profile</Link>
                </Button>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setViewDetailsItem(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelModal}
        title="Cancel Appointment?"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => !cancelling && setShowCancelModal(false)}
      />

      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleItem} onOpenChange={(open) => !open && setRescheduleItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reschedule Appointment</DialogTitle>
          </DialogHeader>

          {rescheduleItem && (
            <div className="mt-2 space-y-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3 text-sm flex items-center justify-between border border-slate-100 dark:border-slate-700/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{rescheduleItem.doctorName}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{rescheduleItem.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Select New Date</p>
                  <div className="flex justify-center rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50/50 dark:bg-slate-900/50">
                    <CalendarPicker mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} />
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Select New Time Slot</p>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 flex-1">
                    {Object.entries(timeSlots).map(([period, slots]) => (
                      <div key={period}>
                        <p className="mb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{period}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {slots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRescheduleSlot(s)}
                              className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                                rescheduleSlot === s
                                  ? "border-blue-600 bg-blue-600 text-white font-medium shadow-sm"
                                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setRescheduleItem(null)}>
              Cancel
            </Button>
            <Button
              disabled={rescheduleLoading}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveReschedule}
            >
              {rescheduleLoading ? "Saving..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
