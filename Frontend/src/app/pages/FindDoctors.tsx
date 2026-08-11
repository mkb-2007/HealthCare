import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Filter, Star, MapPin, Briefcase, BadgeCheck, Heart } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { PublicLayout } from "../components/PublicLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { patientNav, patientUser, guestNav, guestUser } from "../lib/nav";
import { specializations } from "../lib/data";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import { useDoctors } from "../context/DoctorContext";

function DoctorsContent({ isGuest }: { isGuest: boolean }) {
  const navigate = useNavigate();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const [query, setQuery] = useState("");
  const [spec, setSpec] = useState("all");
  const [exp, setExp] = useState("all");
  const [avail, setAvail] = useState("all");
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    if (!isGuest) {
      fetchFavorites();
    }
  }, [isGuest]);

  const fetchFavorites = async () => {
    try {
      const storedPatientStr = localStorage.getItem("patient");
      const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
      const patientId = storedPatient?.id || 1;

      const res = await api.get(`/favorites?patientId=${patientId}`);
      const favSet = new Set<string | number>(res.data.map((item: any) => item.id));
      setFavorites(favSet);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (doctorId: string | number) => {
    if (isGuest) {
      toast.error("Please login to save favorite doctors.");
      navigate("/login");
      return;
    }

    const storedPatientStr = localStorage.getItem("patient");
    const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
    const patientId = storedPatient?.id || 1;

    const isFav = favorites.has(doctorId);

    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(doctorId);
      } else {
        next.add(doctorId);
      }
      return next;
    });

    try {
      if (isFav) {
        await api.delete(`/favorites/${doctorId}?patientId=${patientId}`);
        toast.success("Removed from favorites");
      } else {
        await api.post(`/favorites/${doctorId}?patientId=${patientId}`);
        toast.success("Saved to favorites!");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorites");
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(doctorId);
        } else {
          next.delete(doctorId);
        }
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    let list = doctors.filter((d) => {
      const q = query.toLowerCase();
      const doctorName = (d.fullName || d.name || "").toLowerCase();
      const doctorSpec = (d.specialization || "").toLowerCase();
      const matchesQuery = doctorName.includes(q) || doctorSpec.includes(q);
      const matchesSpec = spec === "all" || (d.specialization || "") === spec;
      const expYears = Number(d.experience || 0);
      const matchesExp =
        exp === "all" ||
        (exp === "0-10" && expYears <= 10) ||
        (exp === "10+" && expYears > 10);
      const getStatus = (item: any) => {
        if (item.status && item.status !== "status") return item.status;
        return "Available";
      };
      const doctorStatus = getStatus(d);
      const matchesAvail = avail === "all" || (avail === "today" && doctorStatus.toUpperCase() === "AVAILABLE");
      return matchesQuery && matchesSpec && matchesExp && matchesAvail;
    });
    list = [...list].sort((a, b) => {
      const aRating = a.rating || 4.8;
      const bRating = b.rating || 4.8;
      const aFee = a.consultationFee ?? a.fee ?? 0;
      const bFee = b.consultationFee ?? b.fee ?? 0;
      const aExp = Number(a.experience || 0);
      const bExp = Number(b.experience || 0);
      return sort === "rating" ? bRating - aRating : sort === "fee" ? aFee - bFee : bExp - aExp;
    });
    return list;
  }, [doctors, query, spec, exp, avail, sort]);

  const handleBook = (id: string | number) => {
    if (sessionStorage.getItem("hcp-auth")) {
      navigate(`/book/${id}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/book/${id}`)}`);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Find Doctors</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Book with {doctors.length}+ verified specialists near you.
        </p>
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor name or specialization..."
            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10"
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={spec} onValueChange={setSpec}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={exp} onValueChange={setExp}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Experience</SelectItem>
              <SelectItem value="0-10">Up to 10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={avail} onValueChange={setAvail}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Availability</SelectItem>
              <SelectItem value="today">Available Today</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="fee">Lowest Fee</SelectItem>
              <SelectItem value="exp">Most Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        Showing{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span>{" "}
        doctors
      </p>

      <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => {
          const doctorName = d.fullName || d.name || "Doctor";
          const doctorPhoto = getDoctorProfileImage(d);
          const rawStatus = d.status && d.status !== "status" ? d.status : "Available";
          const upperStatus = String(rawStatus).toUpperCase();
          const doctorStatusLabel =
            upperStatus === "AVAILABLE" ? "Available" :
            upperStatus === "BUSY" ? "Busy" :
            upperStatus === "ON_LEAVE" || upperStatus === "ON LEAVE" ? "On Leave" :
            rawStatus;

          const badgeBg =
            upperStatus === "AVAILABLE" || upperStatus === "ACTIVE"
              ? "bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400"
              : upperStatus === "BUSY" || upperStatus === "ON_LEAVE" || upperStatus === "ON LEAVE"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/80 dark:text-yellow-400"
              : "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400";

          const isFav = favorites.has(d.id);

          return (
            <div
              key={d.id}
              className="flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <ImageWithFallback
                    src={doctorPhoto}
                    alt={doctorName}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(d.id)}
                    className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 transition-transform hover:scale-110"
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart
                      size={15}
                      className={isFav ? "text-red-500 fill-red-500" : "text-slate-400 dark:text-slate-500 hover:text-red-500"}
                    />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="truncate font-semibold text-slate-800 dark:text-slate-100">
                        {doctorName}
                      </h3>
                      <BadgeCheck size={16} className="shrink-0 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeBg}`}>
                      {doctorStatusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{d.specialization}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-500 dark:text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <span className="font-medium">{d.rating || 4.8}</span>
                    <span className="text-slate-400 dark:text-slate-500">({d.reviews || 120})</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <MapPin size={14} /> {d.hospital || "General Hospital"}
                </p>
                <p className="flex items-center gap-2">
                  <Briefcase size={14} /> {d.experience} years experience
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Consultation</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">₹{d.consultationFee ?? d.fee ?? 500}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-lg">
                    <Link to={`/doctors/${d.id}`}>View Profile</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleBook(d.id)}
                  >
                    Book
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function FindDoctors() {
  const isGuest = !sessionStorage.getItem("hcp-auth");

  if (isGuest) {
    return (
      <PublicLayout>
        <DoctorsContent isGuest />
      </PublicLayout>
    );
  }

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Find Doctors">
      <DoctorsContent isGuest={false} />
    </DashboardLayout>
  );
}
