import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { AnimatedNumber } from "../components/AnimatedNumber";
import {
  CalendarCheck,
  Video,
  Star,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Bell,
  Lock,
  ClipboardList,
  Search,
  FileText,
  User,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { heroImage, testimonials } from "../lib/data";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { label: "Home",     href: "#home" },
  { label: "Doctors",  href: "/doctors" },
  { label: "Services", href: "#services" },
  { label: "About",    href: "#about" },
  { label: "Contact",  href: "#contact" },
];



const CARDS_PER_PAGE = 3;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}
        />
      ))}
    </div>
  );
}

function TestimonialsCarousel() {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [animating, setAnimating] = useState(false);
  const totalPages = Math.ceil(testimonials.length / CARDS_PER_PAGE);
  const visible = testimonials.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const go = (d: 1 | -1) => {
    if (animating) return;
    setDir(d);
    setAnimating(true);
    setTimeout(() => {
      setPage((p) => (p + d + totalPages) % totalPages);
      setAnimating(false);
    }, 220);
  };

  return (
    <section className="mx-auto w-full max-w-[1600px] px-10 pt-12 pb-20">
      <div className="text-center">
        <h2
          className="text-3xl font-bold text-slate-900 dark:text-slate-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What our patients say
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Real stories from the HealthCare+ community.</p>
      </div>

      <div className="relative mt-12">
        {/* Arrow buttons */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous reviews"
          className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md transition-all hover:scale-110 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 sm:-left-5"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next reviews"
          className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md transition-all hover:scale-110 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 sm:-right-5"
        >
          <ChevronRight size={20} />
        </button>

        {/* Cards */}
        <div
          className="grid gap-6 md:grid-cols-3 transition-all duration-200"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? `translateX(${dir * 24}px)` : "translateX(0px)",
          }}
        >
          {visible.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-7 shadow-sm"
            >
              <StarRating rating={t.rating} />
              <p className="mt-4 flex-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/70 text-slate-400 dark:text-slate-400 ring-2 ring-slate-100 dark:ring-slate-700">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > page ? 1 : -1); setPage(i); }}
              aria-label={`Go to page ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === page
                  ? "w-6 bg-blue-600 dark:bg-blue-400"
                  : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        {/* 3-column grid: Logo | Nav (true center) | Actions */}
        <div className="mx-auto hidden h-16 w-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-10 md:grid">
          {/* Left — Logo */}
          <Logo />

          {/* Center — Navigation (geometrically centered) */}
          <nav className="flex items-center gap-9">
            {navLinks.map((l) =>
              l.href.startsWith("/") ? (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>

          {/* Right — Actions, right-aligned */}
          <div className="flex items-center justify-end gap-2.5">
            <Button asChild className="h-9 rounded-full bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="h-9 rounded-full border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <Link to="/register">Register</Link>
            </Button>
            <button
              onClick={(e) => toggleTheme(e.clientX, e.clientY)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 shadow-sm transition-all hover:scale-110 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile header */}
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 md:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => toggleTheme(e.clientX, e.clientY)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="flex h-9 w-9 items-center justify-center text-slate-700 dark:text-slate-300" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((l) =>
                l.href.startsWith("/") ? (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    {l.label}
                  </a>
                )
              )}
              <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full dark:border-slate-700 dark:text-slate-200">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 px-10 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
              <ShieldCheck size={15} /> Trusted by 25,000+ patients
            </span>
            <h1
              className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Health, <br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Our Priority.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-slate-500 dark:text-slate-400">
              Book appointments with experienced doctors in just a few clicks.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                className="h-12 rounded-full bg-blue-600 px-7 text-base shadow-lg shadow-blue-500/30 hover:bg-blue-700"
              >
                <Link to="/doctors">
                  Book Appointment <ArrowRight size={18} />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-slate-300 px-7 text-base"
                onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] border-8 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xl shadow-blue-900/10">
              <ImageWithFallback
                src={heroImage}
                alt="Doctor consulting with a patient"
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="absolute -left-4 bottom-8 flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400">
                <CalendarCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Appointment Booked</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Dr. Rahul Sharma · 10:00 AM</p>
              </div>
            </div>
            <div className="absolute -right-2 top-8 flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 shadow-xl">
              <Star className="fill-amber-400 text-amber-400" size={18} />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">4.9 Rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose HealthCare+ */}
      <section id="services" className="mx-auto w-full max-w-[1600px] px-10 pt-20 pb-0">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-slate-900 dark:text-slate-50 md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why Choose HealthCare+
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
          >
            Everything you need for a simple, secure, and hassle-free healthcare experience.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Verified Doctors",
              desc: "Every doctor on our platform is background-checked, credentialed, and peer-reviewed before they see their first patient.",
              gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
              accent: "text-blue-600 dark:text-blue-400",
              hover: "group-hover:from-blue-600 group-hover:to-indigo-500 group-hover:text-white",
            },
            {
              icon: CalendarCheck,
              title: "Easy Appointment Booking",
              desc: "Pick a doctor, choose a time slot, and confirm your booking in under two minutes, from any device.",
              gradient: "from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40",
              accent: "text-teal-600 dark:text-teal-400",
              hover: "group-hover:from-teal-600 group-hover:to-emerald-500 group-hover:text-white",
            },
            {
              icon: Video,
              title: "Video Consultations",
              desc: "Skip the commute. Connect with a specialist face-to-face via encrypted, HD video from wherever you are.",
              gradient: "from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40",
              accent: "text-purple-600 dark:text-purple-400",
              hover: "group-hover:from-purple-600 group-hover:to-violet-500 group-hover:text-white",
            },
            {
              icon: ClipboardList,
              title: "Digital Medical Records",
              desc: "All your prescriptions, lab results, and visit notes, organized in one secure place and shareable in a tap.",
              gradient: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
              accent: "text-amber-600 dark:text-amber-400",
              hover: "group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white",
            },
            {
              icon: Bell,
              title: "Smart Reminders",
              desc: "Never miss a follow-up. Automated reminders alert you before every appointment, so you always show up prepared.",
              gradient: "from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40",
              accent: "text-rose-600 dark:text-rose-400",
              hover: "group-hover:from-rose-600 group-hover:to-pink-500 group-hover:text-white",
            },
            {
              icon: Lock,
              title: "Secure & Private",
              desc: "Your health data is encrypted end-to-end and never sold. We follow industry-standard privacy practices.",
              gradient: "from-slate-50 to-blue-50 dark:from-slate-800/40 dark:to-blue-950/40",
              accent: "text-slate-600 dark:text-slate-400",
              hover: "group-hover:from-slate-700 group-hover:to-blue-600 group-hover:text-white",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div
                className={`flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} ${card.accent} transition-all duration-300 ${card.hover}`}
                style={{ width: "3.25rem", height: "3.25rem" }}
              >
                <card.icon size={24} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-800 dark:text-slate-100">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Statistics row */}
        <div id="about" className="mt-16 grid grid-cols-2 gap-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 p-10 md:grid-cols-4 md:p-12">
          {[
            { value: "250+", label: "Verified Doctors" },
            { value: "25,000+", label: "Happy Patients" },
            { value: "50+", label: "Medical Specialties" },
            { value: "98%", label: "Patient Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="text-3xl font-bold text-white md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <AnimatedNumber value={s.value} duration={1800} />
              </p>
              <p className="mt-1 text-sm text-blue-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Services / Feature Cards */}
      <section className="mx-auto w-full max-w-[1600px] px-10 pt-10 pb-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Search,
              title: "Find Doctors",
              desc: "Search 250+ verified specialists by department, rating and availability.",
              href: "/doctors",
              iconBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
            },
            {
              icon: CalendarCheck,
              title: "Easy Appointment Booking",
              desc: "Book, reschedule or cancel visits in just a few taps, anytime.",
              href: "/login",
              iconBg: "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400",
            },
            {
              icon: Video,
              title: "Online Consultation",
              desc: "Connect with doctors over secure video from the comfort of home.",
              href: "/login",
              iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
            },
            {
              icon: FileText,
              title: "Health Records",
              desc: "Keep all your prescriptions and reports safe in one place.",
              href: "/login",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={item.href}
                className="group block h-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-10 py-14 md:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              A world-class healthcare platform making quality care accessible to everyone.
            </p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {navLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link to={l.href} className="hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Services</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {[
                { label: "Find Doctors", to: "/doctors" },
                { label: "Book Appointment", to: "/login" },
                { label: "Online Consultation", to: "/login" },
                { label: "Health Records", to: "/login" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone size={15} /> 044-4283 0490
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} /> care@healthcareplus.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} /> 24 GST Road, Chennai
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-5 text-center text-sm text-slate-500">
          © 2026 HealthCare+. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
