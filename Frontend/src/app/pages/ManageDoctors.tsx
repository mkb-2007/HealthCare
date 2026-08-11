import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Star, Wand2 } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { adminNav, adminUser } from "../lib/nav";
import { specializations } from "../lib/data";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import { useDoctors } from "../context/DoctorContext";
import api from "../../api/api";

export function ManageDoctors() {
  const { doctors, loading, fetchDoctors, addDoctor, updateDoctor, deleteDoctor } = useDoctors();
  const [query, setQuery] = useState("");
  const [generatingImages, setGeneratingImages] = useState(false);

  const handleGenerateImages = async () => {
    try {
      setGeneratingImages(true);
      const res = await api.post("/doctor/generate-images");
      const count = res.data?.count || 0;
      toast.success(
        count > 0
          ? `Generated Cloudinary images for ${count} doctor(s) successfully!`
          : "All doctors already have valid Cloudinary images!"
      );
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate doctor images. Please try again.");
    } finally {
      setGeneratingImages(false);
    }
  };

  // Add doctor modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDept, setAddDept] = useState("Cardiology");
  const [addExp, setAddExp] = useState("");
  const [addHospital, setAddHospital] = useState("");
  const [addFee, setAddFee] = useState("");
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Edit doctor modal states
  const [editDoctor, setEditDoctor] = useState<any | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Delete doctor modal states
  const [deleteDoctorId, setDeleteDoctorId] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAddDoctor = async () => {
    if (!addName.trim()) {
      toast.error("Please enter doctor name.");
      return;
    }

    try {
      setAddLoading(true);
      await addDoctor({
        name: addName,
        specialization: addDept,
        experience: Number(addExp) || 5,
        hospital: addHospital || "Apollo Hospital",
        consultationFee: Number(addFee) || 500,
        availability: "Available",
      }, addImageFile || undefined);

      toast.success("Doctor added successfully!");
      setShowAddModal(false);
      resetAddForm();
    } catch (err) {
      toast.error("Failed to add doctor.");
    } finally {
      setAddLoading(false);
    }
  };

  const resetAddForm = () => {
    setAddName("");
    setAddDept("Cardiology");
    setAddExp("");
    setAddHospital("");
    setAddFee("");
    setAddImageFile(null);
  };

  const handleOpenEdit = (doc: any) => {
    setEditDoctor({
      ...doc,
      fullName: doc.fullName || doc.name || "",
      specialization: doc.specialization || doc.department || "Cardiology",
      experience: doc.experience || "",
      hospital: doc.hospital || "",
      consultationFee: doc.consultationFee || doc.fee || "",
      status: doc.status || doc.availability || "Available",
    });
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editDoctor) return;

    try {
      setEditLoading(true);
      await updateDoctor(editDoctor.id, editDoctor, editImageFile || undefined);
      toast.success("Doctor details updated!");
      setShowEditModal(false);
      setEditDoctor(null);
      setEditImageFile(null);
    } catch (err) {
      toast.error("Failed to update doctor.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!deleteDoctorId) return;

    try {
      setDeleting(true);
      await deleteDoctor(deleteDoctorId);
      toast.success("Doctor deleted successfully.");
      setShowDeleteModal(false);
      setDeleteDoctorId(null);
    } catch (error) {
      toast.error("Failed to delete doctor.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = doctors.filter((d) => {
    const name = d.fullName || d.name || "";
    const dept = d.specialization || d.speciality || d.department || "";
    const q = query.toLowerCase();
    return name.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout navItems={adminNav} user={adminUser} title="Manage Doctors">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manage Doctors</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{doctors.length} doctors registered.</p>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors..."
              className="h-10 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 pl-9"
            />
          </div>

          <Button
            variant="outline"
            disabled={generatingImages}
            onClick={handleGenerateImages}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
          >
            <Wand2 size={16} className={generatingImages ? "animate-spin text-purple-600" : "text-purple-600 dark:text-purple-400"} />
            {generatingImages ? "Generating Images..." : "Generate Doctor Images"}
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={16} /> Add Doctor
          </Button>
        </div>
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Full Name</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={addDept} onValueChange={setAddDept}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input
                type="number"
                value={addExp}
                onChange={(e) => setAddExp(e.target.value)}
                placeholder="10"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Hospital</Label>
              <Input
                value={addHospital}
                onChange={(e) => setAddHospital(e.target.value)}
                placeholder="Hospital name"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Consultation Fee (₹)</Label>
              <Input
                type="number"
                value={addFee}
                onChange={(e) => setAddFee(e.target.value)}
                placeholder="800"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Doctor Photo (Cloudinary Upload)</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={addLoading}
              onClick={handleAddDoctor}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {addLoading ? "Adding..." : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          {editDoctor && (
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Full Name</Label>
                <Input
                  value={editDoctor.fullName}
                  onChange={(e) => setEditDoctor({ ...editDoctor, fullName: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={editDoctor.specialization}
                  onValueChange={(val) => setEditDoctor({ ...editDoctor, specialization: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={editDoctor.experience}
                  onChange={(e) => setEditDoctor({ ...editDoctor, experience: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Hospital</Label>
                <Input
                  value={editDoctor.hospital}
                  onChange={(e) => setEditDoctor({ ...editDoctor, hospital: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Consultation Fee (₹)</Label>
                <Input
                  type="number"
                  value={editDoctor.consultationFee}
                  onChange={(e) => setEditDoctor({ ...editDoctor, consultationFee: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editDoctor.status || "Available"}
                  onValueChange={(val) => setEditDoctor({ ...editDoctor, status: val, availability: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Update Photo (Cloudinary Upload)</Label>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={editLoading}
              onClick={handleSaveEdit}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-slate-800">
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  Loading doctors...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  No doctors found matching your query.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => {
                const docName = d.fullName || d.name || "Doctor";
                const docDept = d.specialization || d.speciality || d.department || "Cardiology";
                const docExp = d.experience ?? 5;
                const docRating = d.rating ?? 4.8;
                const status = d.status && d.status !== "status" ? d.status : "Available";
                const upperStatus = String(status).toUpperCase();
                const doctorPhoto = getDoctorProfileImage(d);

                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={doctorPhoto}
                          alt={docName}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{docName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{d.hospital || "Apollo Hospital"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{docDept}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{docExp} yrs</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400">
                        <Star size={14} className="fill-amber-400" /> {docRating}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          upperStatus === "AVAILABLE" || upperStatus === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : upperStatus === "BUSY"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                        }`}
                      >
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 dark:text-blue-400"
                          onClick={() => handleOpenEdit(d)}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => {
                            setDeleteDoctorId(d.id);
                            setShowDeleteModal(true);
                          }}
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

      <ConfirmDialog
        open={showDeleteModal}
        title="Delete Doctor?"
        message="Are you sure you want to delete this doctor record? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={handleDeleteDoctor}
        onCancel={() => !deleting && setShowDeleteModal(false)}
      />
    </DashboardLayout>
  );
}
