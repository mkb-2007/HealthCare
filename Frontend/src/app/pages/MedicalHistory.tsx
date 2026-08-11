import { useState, useEffect } from "react";
import { FileText, Download, Pill, Activity, TestTube } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { patientNav, patientUser } from "../lib/nav";
import {
  MedicalReport,
  initialReports,
  downloadReportAsTxt,
} from "../lib/reportGenerator";
import api from "../../api/api";

export function MedicalHistory() {
  const [reports, setReports] = useState<MedicalReport[]>(initialReports);
  const [loading, setLoading] = useState(false);

  const storedPatientStr = localStorage.getItem("patient");
  const patient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
  const patientName = patient?.fullName || patient?.name || "Patient";
  const patientId = patient?.id || 1;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patient/reports?patientId=${patientId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setReports(res.data);
      }
    } catch (err) {
      // Fallback to initial realistic reports if backend endpoint not yet active
      console.log("Using client-side medical records.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report: MedicalReport) => {
    try {
      downloadReportAsTxt(report, patientName, patientId);
      toast.success(`Downloading ${report.reportTitle}...`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download medical report.");
    }
  };

  const getReportMeta = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("lab") || t.includes("blood") || t.includes("test")) {
      return {
        icon: TestTube,
        color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50",
      };
    }
    if (t.includes("prescription") || t.includes("medicine")) {
      return {
        icon: Pill,
        color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
      };
    }
    if (t.includes("ecg") || t.includes("diagnostic") || t.includes("cardio")) {
      return {
        icon: Activity,
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50",
      };
    }
    return {
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
    };
  };

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Medical History">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Medical History</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">All your reports and prescriptions in one place.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">Loading medical records...</p>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
            No medical records found.
          </div>
        ) : (
          reports.map((r) => {
            const { icon: Icon, color } = getReportMeta(r.reportType);

            return (
              <div
                key={r.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">{r.reportTitle}</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 truncate">
                    {r.doctorName} · {r.visitDate}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                  {r.reportType}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl shrink-0"
                  onClick={() => handleDownload(r)}
                >
                  <Download size={15} /> Download
                </Button>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
