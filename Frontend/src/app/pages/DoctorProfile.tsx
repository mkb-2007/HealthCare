import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Star,
  MapPin,
  Briefcase,
  Languages,
  Clock,
  BadgeCheck,
  GraduationCap,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../components/DashboardLayout";
import { PublicLayout } from "../components/PublicLayout";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { patientNav, patientUser } from "../lib/nav";
import { timeSlots } from "../lib/data";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import { isSlotPassed, areAllSlotsPassedForDate } from "./BookAppointment";
import { useDoctors } from "../context/DoctorContext";
import api from "../../api/api";

const defaultReviews = [
  { id: 1, name: "Anita R.", rating: 5, text: "Very knowledgeable and patient. Explained everything clearly." },
  { id: 2, name: "Karan M.", rating: 5, text: "Short wait time and excellent care. Highly recommend." },
  { id: 3, name: "Leena T.", rating: 4, text: "Great experience overall, very professional staff." },
];

function ProfileContent({ isGuest }: { isGuest: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (areAllSlotsPassedForDate(today)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return today;
  });
  const [slot, setSlot] = useState<string>("");
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    fetchDoctor();
    if (!isGuest && id) {
      checkFavoriteStatus();
    }
  }, [id, isGuest]);

  const checkFavoriteStatus = async () => {
    try {
      const storedPatientStr = localStorage.getItem("patient");
      const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
      const patientId = storedPatient?.id || 1;

      const res = await api.get(`/favorites?patientId=${patientId}`);
      const isFavorited = res.data.some((item: any) => String(item.id) === String(id));
      setIsFav(isFavorited);
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (isGuest) {
      toast.error("Please login to save favorite doctors.");
      navigate("/login");
      return;
    }

    const storedPatientStr = localStorage.getItem("patient");
    const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
    const patientId = storedPatient?.id || 1;

    const nextFavState = !isFav;
    setIsFav(nextFavState);

    try {
      if (nextFavState) {
        await api.post(`/favorites/${id}?patientId=${patientId}`);
        toast.success("Saved to favorites!");
      } else {
        await api.delete(`/favorites/${id}?patientId=${patientId}`);
        toast.success("Removed from favorites");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorites");
      setIsFav(!nextFavState);
    }
  };

  const { getDoctorById } = useDoctors();

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/doctor/${id}`);
      if (res.data) {
        setDoctor(res.data);
      } else {
        const found = getDoctorById(id!);
        setDoctor(found || null);
      }
    } catch (error) {
      const found = getDoctorById(id!);
      setDoctor(found || null);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!doctor) return;
    if (sessionStorage.getItem("hcp-auth")) {
      navigate(`/book/${doctor.id}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/book/${doctor.id}`)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Doctor not found</p>
        <Link to="/doctors" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to doctors list
        </Link>
      </div>
    );
  }

  const doctorName = doctor.fullName || doctor.name || "Doctor";
  const doctorPhoto = getDoctorProfileImage(doctor);

  const languagesText = Array.isArray(doctor.languages)
    ? doctor.languages.join(", ")
    : doctor.languages || "English, Hindi";

  const rawStatus = doctor.status && doctor.status !== "status" ? doctor.status : "Available";
  const upperStatus = String(rawStatus).toUpperCase();
  const doctorStatusLabel =
    upperStatus === "AVAILABLE" ? "Available" :
    upperStatus === "BUSY" ? "Busy" :
    upperStatus === "ON_LEAVE" || upperStatus === "ON LEAVE" ? "On Leave" :
    rawStatus;

  const doctorStatusBg =
    upperStatus === "AVAILABLE" || upperStatus === "ACTIVE"
      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
      : upperStatus === "BUSY" || upperStatus === "ON_LEAVE" || upperStatus === "ON LEAVE"
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

  return (
    <>
      <Link
        to="/doctors"
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <ArrowLeft size={16} /> Back to doctors
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: profile */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-teal-500" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
                <ImageWithFallback
                  src={doctorPhoto}
                  alt={doctorName}
                  className="h-28 w-28 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-md"
                />
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{doctorName}</h1>
                    <BadgeCheck size={20} className="text-blue-500" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doctorStatusBg}`}>
                      {doctorStatusLabel}
                    </span>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400">{doctor.specialization}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 text-amber-600 dark:text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    <span className="font-semibold">{doctor.rating || 4.8}</span>
                    <span className="text-sm text-amber-500 dark:text-amber-400">({doctor.reviews || 120})</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={toggleFavorite}
                    className={`rounded-xl border transition-all ${
                      isFav
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Heart size={16} className={isFav ? "text-red-500 fill-red-500" : "text-slate-400"} />
                    <span>{isFav ? "Remove Favorite" : "Add to Favorites"}</span>
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Briefcase, label: "Experience", value: `${doctor.experience || 0} years` },
                  { icon: GraduationCap, label: "Qualifications", value: doctor.qualifications || doctor.qualification || "MBBS, MD" },
                  { icon: MapPin, label: "Hospital", value: doctor.hospital || "General Hospital" },
                  { icon: Languages, label: "Languages", value: languagesText },
                  { icon: Clock, label: "Working Hours", value: "Mon–Sat, 9AM – 7PM" },
                  { icon: Star, label: "Consultation Fee", value: `₹${doctor.consultationFee ?? doctor.fee ?? 500}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-blue-600 shadow-sm">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">About Doctor</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {doctor.about || "Experienced specialist dedicated to providing high quality medical care and compassionate patient treatment."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Ratings &amp; Reviews
            </h2>
            <div className="mt-4 space-y-4">
              {defaultReviews.map((r) => (
                <div
                  key={r.id}
                  className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{r.name}</p>
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Book Appointment
            </h2>

            {isGuest && (
              <p className="mt-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 px-4 py-2.5 text-sm text-blue-700 dark:text-blue-300">
                Please login to book an appointment.
              </p>
            )}

            <div className="mt-4 flex justify-center rounded-xl border border-slate-100 dark:border-slate-800 p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (d && d >= today) {
                    setDate(d);
                    if (slot && isSlotPassed(slot, d)) {
                      setSlot("");
                    }
                  }
                }}
                disabled={(d) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return d < today;
                }}
                className="rounded-md"
              />
            </div>

            <div className="mt-5 space-y-4">
              {Object.entries(timeSlots).map(([period, slots]) => (
                <div key={period}>
                  <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {period}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => {
                      const disabled = isGuest || isSlotPassed(s, date);
                      const isSelected = slot === s;

                      return (
                        <button
                          key={s}
                          disabled={disabled}
                          onClick={() => !disabled && setSlot(s)}
                          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                            disabled
                              ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed pointer-events-none"
                              : isSelected
                              ? "border-blue-600 bg-blue-600 text-white font-medium"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleBook}
              className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-base hover:bg-blue-700"
            >
              {isGuest ? "Login to Book" : "Book Now"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function DoctorProfile() {
  const isGuest = !sessionStorage.getItem("hcp-auth");

  if (isGuest) {
    return (
      <PublicLayout>
        <ProfileContent isGuest />
      </PublicLayout>
    );
  }

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Doctor Profile">
      <ProfileContent isGuest={false} />
    </DashboardLayout>
  );
}
