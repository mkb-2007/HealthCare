import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Check,
  CalendarCheck,
  Clock,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CircleCheckBig,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { patientNav, patientUser } from "../lib/nav";
import { timeSlots } from "../lib/data";
import { getDoctorProfileImage } from "../lib/doctorUtils";
import { useDoctors } from "../context/DoctorContext";
import api from "../../api/api";

const steps = ["Doctor", "Date", "Time", "Confirm"];

export function isSlotPassed(slotStr: string, selectedDate?: Date): boolean {
  if (!selectedDate) return false;

  const now = new Date();
  const selected = new Date(selectedDate);

  const selectedStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (selectedStart.getTime() > todayStart.getTime()) {
    return false;
  }
  if (selectedStart.getTime() < todayStart.getTime()) {
    return true;
  }

  const match = slotStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3].toUpperCase();

  if (modifier === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return slotTime.getTime() <= now.getTime();
}

export function areAllSlotsPassedForDate(targetDate: Date): boolean {
  const allSlots = Object.values(timeSlots).flat();
  return allSlots.every((s) => isSlotPassed(s, targetDate));
}

export function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDoctorById } = useDoctors();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1);
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
  const [slot, setSlot] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (id) {
      loadDoctor();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadDoctor = async () => {
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

  useEffect(() => {
    if (confirmed) {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
    }
  }, [confirmed]);

  const canNext = (step === 1 && date) || (step === 2 && slot) || step === 3;

  const doctorName = doctor?.fullName || doctor?.name || "Doctor";
  const doctorPhoto = getDoctorProfileImage(doctor);
  const doctorSpec = doctor?.specialization || doctor?.speciality || "General Medicine";
  const doctorHospital = doctor?.hospital || doctor?.hospitalName || "Apollo Hospital";
  const doctorFee = doctor?.consultationFee ?? doctor?.fee ?? 500;
  const doctorExp = doctor?.experience ?? doctor?.yearsOfExperience ?? 5;

  const handleBookAppointment = async () => {
    if (!date || !slot) {
      toast.error("Please select a valid date and time slot.");
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const selectedStart = new Date(date);
    selectedStart.setHours(0, 0, 0, 0);

    if (selectedStart < todayStart || isSlotPassed(slot, date)) {
      toast.error("Cannot book an appointment in the past. Please select a future date and time.");
      return;
    }

    try {
      setBookingLoading(true);
      const storedPatientStr = localStorage.getItem("patient");
      const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;

      const dateFormatted = date
        ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : "Aug 02, 2026";

      const payload = {
        patientId: storedPatient?.id || 1,
        patientName: storedPatient?.fullName || storedPatient?.name || "Patient",
        doctorId: doctor?.id ? Number(doctor.id) : (id ? Number(id) : 1),
        doctorName: doctorName,
        specialization: doctorSpec,
        hospital: doctorHospital,
        doctorImage: doctorPhoto || doctor?.profileImage || doctor?.photo,
        appointmentDate: dateFormatted,
        timeSlot: slot || "10:00 AM",
        type: "In-person",
        status: "Upcoming",
      };

      await api.post("/appointment", payload);
      toast.success("Appointment booked successfully!");
      window.dispatchEvent(new Event("notificationsUpdated"));
      window.dispatchEvent(new Event("appointmentsUpdated"));
      setConfirmed(true);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={patientNav} user={patientUser} title="Book Appointment">
        <div className="mx-auto max-w-3xl py-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">Loading doctor details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor && id) {
    return (
      <DashboardLayout navItems={patientNav} user={patientUser} title="Book Appointment">
        <div className="mx-auto max-w-3xl py-12 text-center">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Doctor not found</p>
          <Link to="/doctors" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Back to doctors list
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (confirmed) {
    return (
      <DashboardLayout navItems={patientNav} user={patientUser} title="Booking">
        <div className="mx-auto max-w-lg py-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
            <CircleCheckBig size={44} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-50">Appointment Confirmed!</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Your appointment has been successfully booked. You can pay during your visit at the clinic.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 text-left shadow-sm">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={doctorPhoto}
                alt={doctorName}
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">👨‍⚕️ {doctorName}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{doctorSpec}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-slate-400 dark:text-slate-500">Date</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {date?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-slate-400 dark:text-slate-500">Time</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{slot}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
              <Link to="/appointments">My Appointments</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Book Appointment">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Book an Appointment</h1>

        {/* Stepper */}
        <div className="mt-6 flex items-center">
          {steps.map((label, i) => {
            const isDoctor = i === 0;
            const isPassed = isDoctor || i < step;
            const isActive = !isDoctor && i === step;

            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isPassed
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isPassed ? <Check size={16} /> : i + 1}
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {label} {isDoctor && "✔"}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded ${
                      i < step || isDoctor ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          {/* Selected Doctor Card (One Card Only) */}
          <div className="mb-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 sm:p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Selected Doctor
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src={doctorPhoto}
                  alt={doctorName}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    👨‍⚕️ {doctorName}
                  </h2>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {doctorSpec}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {doctorHospital}
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  ₹{doctorFee}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {doctorExp} Years Experience
                </span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Choose Date</h2>
              <div className="flex justify-center rounded-xl border border-slate-100 dark:border-slate-800 p-2">
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
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Choose Time</h2>
              <div className="space-y-4">
                {Object.entries(timeSlots).map(([period, slots]) => (
                  <div key={period}>
                    <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{period}</p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((s) => {
                        const disabled = isSlotPassed(s, date);
                        const isSelected = slot === s;

                        return (
                          <button
                            key={s}
                            disabled={disabled}
                            onClick={() => {
                              if (!disabled) setSlot(s);
                            }}
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
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Confirm Appointment</h2>
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
                <ImageWithFallback
                  src={doctorPhoto}
                  alt={doctorName}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{doctorName}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{doctorSpec}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{doctorHospital}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-sm">
                  <CalendarCheck size={16} className="text-blue-600" />
                  {date?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-sm">
                  <Clock size={16} className="text-blue-600" /> {slot || "Not selected"}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    <CreditCard size={16} /> Payment Summary
                  </h3>
                  <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
                    Pay Later at Hospital
                  </span>
                </div>
                <div className="space-y-2 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-sm">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Consultation Fee</span>
                    <span>₹{doctorFee}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Platform Fee</span>
                    <span>₹2.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Taxes</span>
                    <span>₹3.00</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-semibold text-slate-800 dark:text-slate-100">
                    <span>Total Due at Clinic</span>
                    <span>₹{Number(doctorFee) + 5}.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => (step === 1 ? navigate(-1) : setStep((s) => s - 1))}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          {step < 3 ? (
            <Button
              disabled={!canNext}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              disabled={bookingLoading}
              className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold px-6"
              onClick={handleBookAppointment}
            >
              {bookingLoading ? "Booking..." : "Confirm & Pay Later"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
