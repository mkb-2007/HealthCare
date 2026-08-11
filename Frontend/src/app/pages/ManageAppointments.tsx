import { useEffect, useMemo, useState } from "react";
import { Search, Check, X, CalendarClock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatusBadge } from "../components/StatusBadge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { adminNav, adminUser } from "../lib/nav";
import { type AppointmentStatus } from "../lib/data";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import api from "../../api/api";

export function ManageAppointments() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointment/all");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const setStatusOf = async (id: number | string, s: AppointmentStatus) => {
    try {
      await api.put(`/appointment/${id}`, { status: s });
      toast.success(`Appointment status updated to ${s}`);
      window.dispatchEvent(new Event("appointmentsUpdated"));
      fetchAppointments();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const remove = async (id: number | string) => {
    try {
      await api.delete(`/appointment/${id}`);
      toast.success("Appointment deleted");
      window.dispatchEvent(new Event("appointmentsUpdated"));
      fetchAppointments();
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const list = useMemo(
    () =>
      items.filter((a) => {
        const q = query.toLowerCase();
        const doctorName = a.doctorName || a.doctor?.fullName || "";
        const patientName = a.patientName || a.patient || "";
        const matchesQ =
          doctorName.toLowerCase().includes(q) || patientName.toLowerCase().includes(q);
        const matchesS = status === "all" || (a.status || "Upcoming") === status;
        return matchesQ && matchesS;
      }),
    [items, query, status]
  );

  return (
    <DashboardLayout navItems={adminNav} user={adminUser} title="Manage Appointments">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manage Appointments</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Approve, reschedule or cancel appointments.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor or patient..."
            className="h-10 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-10 w-44 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-slate-800">
              <TableHead>Doctor</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((a) => {
              const docName = a.doctorName || a.doctor?.fullName || "Doctor";
              const patName = a.patientName || a.patient || "Patient";
              const dateVal = a.appointmentDate || a.date || "N/A";
              const timeVal = a.timeSlot || a.time || "N/A";
              const statusVal = a.status || "Upcoming";

              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={getDoctorProfileImage({ doctorName: docName, photo: a.photo || a.profileImage })}
                        alt={docName}
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                      <p className="font-medium text-slate-800 dark:text-slate-100">{docName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{patName}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{dateVal}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{timeVal}</TableCell>
                  <TableCell>
                    <StatusBadge status={statusVal} />
                  </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    {a.status === "Pending" && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 dark:text-green-400"
                          onClick={() => setStatusOf(a.id, "Approved")}
                        >
                          <Check size={15} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 dark:text-red-400"
                          onClick={() => setStatusOf(a.id, "Cancelled")}
                        >
                          <X size={15} />
                        </Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 dark:text-blue-400">
                      <CalendarClock size={15} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 dark:text-slate-500"
                      onClick={() => remove(a.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
        {list.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">No appointments found.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
