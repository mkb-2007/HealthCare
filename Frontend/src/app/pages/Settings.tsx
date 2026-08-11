import { useState } from "react";
import { Save, Hospital, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/api";
import { DashboardLayout, type NavItem } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { patientNav, patientUser, adminNav, adminUser } from "../lib/nav";
import { Logo } from "../components/Logo";
import { useTheme } from "../context/ThemeContext";

// Helper function to return selected session timeout in minutes
export function getSessionTimeout(): number | null {
  const saved = localStorage.getItem("hcp-session-timeout") || "30 Minutes";
  switch (saved) {
    case "15 Minutes":
      return 15;
    case "30 Minutes":
      return 30;
    case "1 Hour":
      return 60;
    case "Never":
      return null;
    default:
      return 30;
  }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onCheckedChange,
  defaultChecked,
}: {
  label: string;
  desc: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} defaultChecked={defaultChecked} />
    </div>
  );
}

export function Settings({ admin = false }: { admin?: boolean }) {
  const nav: NavItem[] = admin ? adminNav : patientNav;
  const user = admin ? adminUser : patientUser;
  const { theme, toggleTheme } = useTheme();

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // New Preferences State
  const [sessionTimeout, setSessionTimeout] = useState<string>(
    () => localStorage.getItem("hcp-session-timeout") || "30 Minutes"
  );
  const [fontSize, setFontSize] = useState<string>(
    () => localStorage.getItem("hcp-font-size") || "medium"
  );

  const handleSessionTimeoutChange = (val: string) => {
    setSessionTimeout(val);
    localStorage.setItem("hcp-session-timeout", val);
  };

  const handleFontSizeChange = (val: string) => {
    setFontSize(val);
    localStorage.setItem("hcp-font-size", val);
    let scale = "100%";
    if (val === "small") scale = "90%";
    else if (val === "large") scale = "110%";
    document.documentElement.style.fontSize = scale;
  };

  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!currentPw) {
      const msg = "Please enter your current password.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    if (!newPw) {
      const msg = "Please enter a new password.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    if (newPw.length < 6) {
      const msg = "New password must be at least 6 characters long.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    if (newPw !== confirmPw) {
      const msg = "New password and confirm password do not match.";
      setPwError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);

      if (admin) {
        const storedAdminPw = sessionStorage.getItem("hcp-admin-password");
        const storedUserPw = sessionStorage.getItem("hcp-user-password");
        const validPassword = storedAdminPw || storedUserPw || "admin123";

        if (currentPw !== validPassword) {
          const msg = "Current password is incorrect.";
          setPwError(msg);
          toast.error(msg);
          return;
        }

        sessionStorage.setItem("hcp-admin-password", newPw);
        const successMsg = "Admin password updated successfully!";
        setPwSuccess(successMsg);
        toast.success(successMsg);

        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        return;
      }

      const patient = JSON.parse(
        localStorage.getItem("patient") || "{}"
      );

      if (!patient || !patient.id) {
        const msg = "Patient session not found. Please log in again.";
        setPwError(msg);
        toast.error(msg);
        return;
      }

      const response = await api.put(
        `/patient/change-password/${patient.id}`,
        {
          currentPassword: currentPw,
          newPassword: newPw,
        }
      );

      setPwSuccess(response.data);
      toast.success(response.data);

      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.message ||
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to update password";
      setPwError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (currentPw || newPw || confirmPw) {
      handleUpdatePassword();
    } else {
      toast.success("Settings saved successfully!");
      if (!admin) {
        try {
          const storedPatientStr = localStorage.getItem("patient");
          const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
          const patientId = storedPatient?.id || 1;

          await api.post("/notifications", {
            userId: patientId,
            title: "Settings Updated",
            message: "Your account preferences and settings have been updated.",
            type: "settings",
          });
          window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
          console.error("Failed to generate settings notification:", err);
        }
      }
    }
  };

  return (
    <DashboardLayout navItems={nav} user={user} title="Settings">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage preferences and account configuration.</p>
        </div>
        <Button onClick={handleSaveAll} className="rounded-xl bg-blue-600 hover:bg-blue-700">
          <Save size={16} /> Save Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {admin && (
          <Card title="Hospital Information">
            <div className="flex items-center gap-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm">
                <Hospital size={22} />
              </div>
              <Logo />
            </div>
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input defaultValue="HealthCare+ Multispecialty" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input defaultValue="care@healthcareplus.com" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input defaultValue="24 GST Road, Chennai" className="h-11 rounded-xl" />
            </div>
          </Card>
        )}

        <Card title="Change Password">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {pwError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{pwError}</span>
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => {
                    setCurrentPw(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => {
                    setNewPw(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => {
                    setConfirmPw(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </Card>

        <Card title="Notification Settings">
          <ToggleRow label="Email Notifications" desc="Appointment updates via email" defaultChecked />
          <Separator />
          <ToggleRow label="SMS Reminders" desc="Get text reminders before visits" defaultChecked />
          <Separator />
          <ToggleRow label="Promotional Emails" desc="Offers and health tips" />
        </Card>

        <Card title="Preferences">
          <ToggleRow
            label="Dark Mode"
            desc="Switch to a darker theme"
            checked={theme === "dark"}
            onCheckedChange={() => toggleTheme()}
          />

          <Separator />

          {/* Session Timeout Preference */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Session Timeout</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Automatically log out after inactivity.</p>
            </div>
            <Select value={sessionTimeout} onValueChange={handleSessionTimeoutChange}>
              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 Minutes">15 Minutes</SelectItem>
                <SelectItem value="30 Minutes">30 Minutes</SelectItem>
                <SelectItem value="1 Hour">1 Hour</SelectItem>
                <SelectItem value="Never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Font Size Preference */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Font Size</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Adjust the application text size.</p>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-1">
              {[
                { label: "Small", value: "small" },
                { label: "Medium (default)", value: "medium" },
                { label: "Large", value: "large" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={opt.value}
                    checked={fontSize === opt.value}
                    onChange={() => handleFontSizeChange(opt.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
