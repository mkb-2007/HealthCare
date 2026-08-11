import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Pencil, Trash2, User, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatusBadge } from "../components/StatusBadge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatGender } from "../components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { adminNav, adminUser } from "../lib/nav";

export interface PatientAdminData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  insuranceValidUntil?: string;
  profileImage?: string;
  status: string;
  appointmentCount: number;
  createdAt?: string;
}

export function ManagePatients() {
  const [patientsList, setPatientsList] = useState<PatientAdminData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState("");

  // Modal States
  const [viewPatient, setViewPatient] = useState<PatientAdminData | null>(null);
  const [editPatient, setEditPatient] = useState<PatientAdminData | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", status: "ACTIVE" });
  const [editLoading, setEditLoading] = useState(false);

  // Delete State
  const [deletePatientId, setDeletePatientId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/patients");
      setPatientsList(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to fetch admin patients:", err);
      toast.error("Failed to load patients from database");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const getProfileImageUrl = (patient: PatientAdminData): string | null => {
    if (!patient.profileImage) return null;
    if (patient.profileImage.startsWith("http://") || patient.profileImage.startsWith("https://")) {
      return patient.profileImage;
    }
    return `http://localhost:8080/uploads/profile/${patient.profileImage}`;
  };

  const filteredPatients = patientsList.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.fullName || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (p: PatientAdminData) => {
    setEditPatient(p);
    setEditForm({
      fullName: p.fullName || "",
      phone: p.phone || "",
      status: p.status || "ACTIVE",
    });
  };

  const handleSaveEdit = async () => {
    if (!editPatient) return;
    if (!editForm.fullName.trim() || !editForm.phone.trim()) {
      toast.error("Name and Phone number are required");
      return;
    }

    try {
      setEditLoading(true);
      await api.put(`/admin/patients/${editPatient.id}`, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        status: editForm.status,
      });

      toast.success("Patient details updated successfully");
      window.dispatchEvent(new Event("patientsUpdated"));
      setEditPatient(null);
      await fetchPatients();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update patient details");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePatientId) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/admin/patients/${deletePatientId}`);
      toast.success("Patient account deleted successfully");
      window.dispatchEvent(new Event("patientsUpdated"));
      setDeletePatientId(null);
      await fetchPatients();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete patient");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={adminNav} user={adminUser} title="Manage Patients">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manage Patients</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {patientsList.length} registered patient{patientsList.length === 1 ? "" : "s"} in database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={loading}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw size={15} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="h-10 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-slate-800">
              <TableHead>Profile Picture & Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Appointments Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                    Fetching patients from database...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  No patients found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((p) => {
                const imgUrl = getProfileImageUrl(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={p.fullName}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-slate-700">
                            <User size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{p.fullName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">ID: #{p.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{p.phone}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{p.email}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 font-medium">
                      {p.appointmentCount}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewPatient(p)}
                          className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(p)}
                          className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                          title="Edit Patient"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletePatientId(p.id)}
                          className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700"
                          title="Delete Patient"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* VIEW PATIENT MODAL */}
      <Dialog open={!!viewPatient} onOpenChange={(val) => !val && setViewPatient(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
              Patient Profile Details
            </DialogTitle>
          </DialogHeader>

          {viewPatient && (
            <div className="mt-4 space-y-6">
              {/* Header profile info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                {getProfileImageUrl(viewPatient) ? (
                  <img
                    src={getProfileImageUrl(viewPatient)!}
                    alt={viewPatient.fullName}
                    className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-xl border-2 border-blue-500">
                    <User size={30} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{viewPatient.fullName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{viewPatient.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={viewPatient.status} />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      ID: #{viewPatient.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of 15 requested profile details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Full Name</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.fullName || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.email || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.phone || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Gender</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatGender(viewPatient.gender) || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Date of Birth</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.dateOfBirth || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Blood Group</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.bloodGroup || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Height</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.height ? `${viewPatient.height} cm` : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Weight</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.weight ? `${viewPatient.weight} kg` : "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Allergies</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.allergies || "None reported"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Medical / Chronic Conditions</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.chronicConditions || "None reported"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Emergency Contact</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.emergencyContactName
                      ? `${viewPatient.emergencyContactName} (${viewPatient.emergencyRelationship || "Contact"}) - ${viewPatient.emergencyContactPhone || ""}`
                      : "Not provided"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Insurance Information</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewPatient.insuranceProvider
                      ? `${viewPatient.insuranceProvider} · Policy #${viewPatient.policyNumber || "N/A"} · Valid Until: ${viewPatient.insuranceValidUntil || "N/A"}`
                      : "No insurance listed"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Total Appointments Count</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {viewPatient.appointmentCount} appointment{viewPatient.appointmentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Account Status</p>
                  <div className="mt-1">
                    <StatusBadge status={viewPatient.status} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setViewPatient(null)}
              className="rounded-xl border-slate-200 dark:border-slate-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PATIENT MODAL */}
      <Dialog open={!!editPatient} onOpenChange={(val) => !val && !editLoading && setEditPatient(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Edit Patient Details
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Name</Label>
              <Input
                value={editForm.fullName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Account Status</Label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 flex h-11 w-full rounded-xl border border-input bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={editLoading}
              onClick={() => setEditPatient(null)}
              className="rounded-xl border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={editLoading}
              onClick={handleSaveEdit}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5"
            >
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={deletePatientId !== null}
        title="Delete Patient"
        message="Delete this patient?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        danger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletePatientId(null)}
      />
    </DashboardLayout>
  );
}
