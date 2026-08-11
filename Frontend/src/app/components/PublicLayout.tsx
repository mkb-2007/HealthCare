import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Doctors",  href: "/doctors" },
  { label: "Services", href: "/#services" },
  { label: "About",    href: "/#about" },
  { label: "Contact",  href: "/#contact" },
];

const linkBase = "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400";
const linkIdle = `${linkBase} text-slate-600 dark:text-slate-300`;
const linkActive = `${linkBase} text-blue-600 dark:text-blue-400`;

export function PublicLayout({
  children,
  loginMessage,
}: {
  children: ReactNode;
  loginMessage?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/doctors"
      ? location.pathname.startsWith("/doctors")
      : location.pathname === href;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Header — 3-column grid identical to Landing page ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">

        {/* Desktop: Logo | Nav (true center) | Actions */}
        <div className="mx-auto hidden h-16 w-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-10 md:grid">
          {/* Left — Logo */}
          <Logo to="/" />

          {/* Center — Navigation (geometrically centered) */}
          <nav className="flex items-center gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={isActive(link.href) ? linkActive : linkIdle}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — Actions, right-aligned */}
          <div className="flex items-center justify-end gap-2.5">
            <Button
              asChild
              className="h-9 rounded-full bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-full border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
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
          <Logo to="/" />
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => toggleTheme(e.clientX, e.clientY)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center text-slate-700 dark:text-slate-300"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    isActive(link.href)
                      ? "text-sm font-medium text-blue-600 dark:text-blue-400"
                      : "text-sm font-medium text-slate-600 dark:text-slate-300"
                  }
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                className="rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full dark:border-slate-700 dark:text-slate-200"
              >
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Optional login nudge banner */}
      {loginMessage && (
        <div className="bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          {loginMessage}{" "}
          <Link to="/login" className="underline underline-offset-2 hover:text-blue-100">
            Login now
          </Link>
        </div>
      )}

      {/* Page content — max-width matches header container */}
      <main className="mx-auto w-full max-w-[1600px] px-10 py-8">{children}</main>
    </div>
  );
}
