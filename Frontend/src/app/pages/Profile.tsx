import { useState, useRef } from "react";
import { Camera, Save, User, Eye, EyeOff, Upload, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api, { API_BASE_URL } from "../../api/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { patientNav, patientUser } from "../lib/nav";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { formatGender } from "../components/ui/utils";

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 rounded-xl"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={onChange}
        className="flex h-11 w-full rounded-xl border border-input bg-input-background dark:bg-input/30 px-3 py-2 text-sm text-foreground transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {placeholder || "Select"}
        </option>
        {options.map((opt) => (
          <option
            key={opt}
            value={opt}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function Profile() {
  const storedPatient = JSON.parse(localStorage.getItem("patient") || "{}");

  const [fullName, setFullName] = useState(storedPatient.fullName || "");
  const [phone, setPhone] = useState(storedPatient.phone || "");
  const [gender, setGender] = useState(storedPatient.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(storedPatient.dateOfBirth || "");

  const [bloodGroup, setBloodGroup] = useState(storedPatient.bloodGroup || "");
  const [height, setHeight] = useState(storedPatient.height || "");
  const [weight, setWeight] = useState(storedPatient.weight || "");
  const [allergies, setAllergies] = useState(storedPatient.allergies || "");
  const [chronicConditions, setChronicConditions] = useState(storedPatient.chronicConditions || "");

  const [emergencyContactName, setEmergencyContactName] = useState(storedPatient.emergencyContactName || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(storedPatient.emergencyContactPhone || "");
  const [emergencyRelationship, setEmergencyRelationship] = useState(storedPatient.emergencyRelationship || "");

  const [insuranceProvider, setInsuranceProvider] = useState(storedPatient.insuranceProvider || "");
  const [policyNumber, setPolicyNumber] = useState(storedPatient.policyNumber || "");
  const [insuranceValidUntil, setInsuranceValidUntil] = useState(storedPatient.insuranceValidUntil || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [viewImageModalOpen, setViewImageModalOpen] = useState(false);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);

  const handleCameraClick = () => {
    if (profileImageSrc) {
      setActionModalOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      let responseData;
      try {
        const response = await api.delete(`/patient/profile/image/${storedPatient.id}`);
        responseData = response.data;
      } catch (e) {
        const response = await api.delete(`/patient/remove-image/${storedPatient.id}`);
        responseData = response.data;
      }

      const updatedPatient = responseData && typeof responseData === 'object' ? responseData : { ...storedPatient, profileImage: null };
      localStorage.setItem("patient", JSON.stringify(updatedPatient));
      window.dispatchEvent(new Event("storage"));

      setPreviewUrl(null);
      setActionModalOpen(false);
      setShowRemovePhotoModal(false);
      toast.success("Profile photo removed successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to remove profile photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Only jpg, jpeg, png, webp formats
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isAllowedType =
      allowedExtensions.includes(ext) ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";

    if (!isAllowedType) {
      toast.error("Unable to upload image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validation: Maximum 5MB size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Unable to upload image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setZoom(1);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropAndUpload = async () => {
    if (!selectedImageSrc) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const img = new Image();
      img.src = selectedImageSrc;
      await new Promise((res) => (img.onload = res));

      const canvas = document.createElement("canvas");
      const CROP_SIZE = 500; // 1:1 square crop
      canvas.width = CROP_SIZE;
      canvas.height = CROP_SIZE;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const minDim = Math.min(img.width, img.height);
        const sourceWidth = minDim / zoom;
        const sourceHeight = minDim / zoom;
        const sourceX = (img.width - sourceWidth) / 2;
        const sourceY = (img.height - sourceHeight) / 2;

        ctx.drawImage(
          img,
          Math.max(0, sourceX),
          Math.max(0, sourceY),
          Math.min(sourceWidth, img.width),
          Math.min(sourceHeight, img.height),
          0,
          0,
          CROP_SIZE,
          CROP_SIZE
        );
      }

      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || new Blob()), "image/jpeg", 0.9)
      );

      const formData = new FormData();
      formData.append("file", blob, "profile.jpg");

      const response = await api.post(
        `/patient/profile/upload-image?patientId=${storedPatient.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      const profileImageUrl = response.data.profileImageUrl;
      const publicId = response.data.publicId;

      const updatedPatient = {
        ...storedPatient,
        profileImageUrl: profileImageUrl,
        cloudinaryPublicId: publicId,
        profileImage: profileImageUrl,
      };

      localStorage.setItem("patient", JSON.stringify(updatedPatient));
      window.dispatchEvent(new Event("storage"));

      setPreviewUrl(profileImageUrl);
      toast.success("Profile picture updated successfully.");
      setCropModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to upload image.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put(
        `/patient/update/${storedPatient.id}`,
        {
          fullName,
          phone,
          gender,
          dateOfBirth,
          bloodGroup,
          height,
          weight,
          allergies,
          chronicConditions,
          emergencyContactName,
          emergencyContactPhone,
          emergencyRelationship,
          insuranceProvider,
          policyNumber,
          insuranceValidUntil,
        }
      );

      localStorage.setItem(
        "patient",
        JSON.stringify(response.data)
      );

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("notificationsUpdated"));

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to update profile.";
      toast.error(msg);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const response = await api.put(
        `/patient/change-password/${storedPatient.id}`,
        {
          currentPassword,
          newPassword,
        }
      );

      toast.success(response.data);
      window.dispatchEvent(new Event("notificationsUpdated"));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to update password";
      toast.error(msg);
    }
  };

  const profileImageSrc =
    previewUrl ||
    (storedPatient.profileImageUrl
      ? storedPatient.profileImageUrl
      : (storedPatient.profileImage
          ? storedPatient.profileImage.startsWith("http")
            ? storedPatient.profileImage
            : `${API_BASE_URL}/uploads/profile/${storedPatient.profileImage}`
          : null));

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Profile">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">My Profile</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your personal and medical information.</p>
        </div>
        <Button
          onClick={handleSave}
          className="rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm lg:col-span-1">
          <div className="relative mx-auto w-fit">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-md">
              {uploading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
              )}
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={uploading}
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              title="Profile Photo Options"
            >
              <Camera size={15} />
            </button>
          </div>
          {uploading && (
            <div className="mx-auto mt-3 max-w-[200px] space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{storedPatient.fullName || patientUser.name}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">{storedPatient.email || "patient@example.com"}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                <AnimatedNumber value={16} />
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Visits</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                <AnimatedNumber value={6} />
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Doctors</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Section title="Personal Information">
            <Field label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Field label="Email" value={storedPatient.email || "patient@example.com"} type="email" disabled />
            <Field label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <SelectField
              label="Gender"
              value={formatGender(gender)}
              onChange={(e) => setGender(e.target.value)}
              options={["Male", "Female", "Other", "Prefer not to say"]}
              placeholder="Select Gender"
            />
            <Field label="Date of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" />
          </Section>

          <Section title="Medical Information">
            <SelectField
              label="Blood Group"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              placeholder="Select Blood Group"
            />
            <Field label="Height" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175 cm" />
            <Field label="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 72 kg" />
            <Field label="Allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Dust" />
            <div className="space-y-2 sm:col-span-2">
              <Label>Chronic Conditions</Label>
              <Textarea
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Asthma, Diabetes, Hypertension"
                className="rounded-xl"
                rows={2}
              />
            </div>
          </Section>

          <Section title="Emergency Contact">
            <Field label="Contact Name" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} placeholder="Enter Contact Name" />
            <Field label="Relationship" value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} placeholder="e.g. Spouse, Parent" />
            <Field label="Contact Phone" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} placeholder="Enter Contact Phone" />
          </Section>

          <Section title="Insurance Details">
            <Field label="Provider" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} placeholder="Enter Insurance Provider" />
            <Field label="Policy Number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="Enter Policy Number" />
            <Field label="Valid Until" value={insuranceValidUntil} onChange={(e) => setInsuranceValidUntil(e.target.value)} type="date" />
          </Section>

          <Section title="Change Password">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Button
                onClick={handleChangePassword}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Password
              </Button>
            </div>
          </Section>
        </div>
      </div>

      {/* Phase 6: Square Crop Modal */}
      {cropModalOpen && selectedImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Crop Profile Photo
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Adjust your photo inside the 1:1 square crop area.
            </p>

            <div className="relative mx-auto my-6 flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-500 bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedImageSrc}
                alt="Crop preview"
                className="h-full w-full object-cover transition-transform duration-100"
                style={{
                  transform: `scale(${zoom})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-blue-500/40" />
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {uploading && (
              <div className="mb-6 space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCropModalOpen(false)}
                disabled={uploading}
                className="flex-1 rounded-xl border-slate-200 dark:border-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropAndUpload}
                disabled={uploading}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? `Uploading... ${uploadProgress}%` : "Crop & Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4-Option Action Modal */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Profile Photo Options
              </h3>
              <button
                onClick={() => setActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setActionModalOpen(false);
                  setViewImageModalOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                View Current Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400"
              >
                <Upload size={18} className="text-teal-600 dark:text-teal-400" />
                Upload New Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionModalOpen(false);
                  setShowRemovePhotoModal(true);
                }}
                disabled={uploading}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 size={18} />
                Remove Current Photo
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setActionModalOpen(false)}
              className="w-full rounded-xl border-slate-200 dark:border-slate-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Photo Removal Dialog */}
      <ConfirmDialog
        open={showRemovePhotoModal}
        title="Remove Profile Photo?"
        message="Are you sure you want to remove your profile photo? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Keep Photo"
        danger
        loading={uploading}
        onConfirm={handleRemovePhoto}
        onCancel={() => !uploading && setShowRemovePhotoModal(false)}
      />

      {/* Lightbox / View Photo Modal */}
      {viewImageModalOpen && profileImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center">
            <button
              onClick={() => setViewImageModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="mx-auto my-4 max-h-[65vh] max-w-full overflow-hidden rounded-2xl">
              <img
                src={profileImageSrc}
                alt="Current Profile Photo"
                className="mx-auto max-h-[60vh] w-auto rounded-2xl object-contain shadow-lg"
              />
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <Button
                onClick={() => {
                  setViewImageModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Upload size={16} className="mr-2" /> Change Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewImageModalOpen(false)}
                className="rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
