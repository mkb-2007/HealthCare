import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Bell, Search, Menu, X, LogOut, Sun, Moon,
  CalendarCheck, FileText, Star, CheckCheck, ChevronRight,
  User, Settings, ChevronDown, AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NotifItem {
  id: number;
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  color: string;
}

const initialNotifs: NotifItem[] = [
  {
    id: 1, icon: CalendarCheck, title: "Appointment confirmed",
    desc: "Your appointment with Dr. Rahul Sharma on Aug 04 is confirmed.",
    time: "2h ago", unread: true,
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
  },
  {
    id: 2, icon: FileText, title: "New lab report available",
    desc: "Your Complete Blood Count report is ready to view.",
    time: "5h ago", unread: true,
    color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50",
  },
  {
    id: 3, icon: CalendarCheck, title: "Appointment rescheduled",
    desc: "Dr. Meera Iyer's slot moved to Aug 09 at 02:30 PM.",
    time: "1d ago", unread: true,
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
  },
  {
    id: 4, icon: Bell, title: "Appointment reminder",
    desc: "Reminder: Dr. Meera Iyer tomorrow at 02:30 PM. Don't miss it!",
    time: "2d ago", unread: false,
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
  },
  {
    id: 5, icon: Star, title: "Rate your visit",
    desc: "How was your consultation with Dr. Ananya Verma? Share your experience.",
    time: "5d ago", unread: false,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50",
  },
  {
    id: 6, icon: FileText, title: "Prescription ready",
    desc: "Dr. Vikram Nair has uploaded your prescription. View it now.",
    time: "6d ago", unread: false,
    color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50",
  },
];

function NotificationPanel({
  onClose,
  notifTo,
}: {
  onClose: () => void;
  notifTo: string;
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { notifs, unreadCount, markAllRead, markOneRead } = useNotifications();

  const visible = filter === "unread" ? notifs.filter((n) => n.unread) : notifs;

  return (
    <div className="absolute right-0 top-12 z-50 w-[22rem] rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck size={13} /> Mark all read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800 px-4 pt-2 pb-0">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-2 px-3 text-sm font-medium capitalize border-b-2 transition-colors ${filter === tab
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            {tab === "unread" ? `Unread (${unreadCount})` : "All"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
        {visible.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
            No {filter === "unread" ? "unread " : ""}notifications
          </div>
        ) : (
          visible.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => markOneRead(n.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${n.unread ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                  }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {n.title}
                    </p>
                    {n.unread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {n.desc}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{n.time}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
        <Link
          to={notifTo}
          onClick={onClose}
          className="flex items-center justify-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all notifications <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

import { ConfirmDialog } from "./ui/ConfirmDialog";

function LogoutConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title="Confirm Logout"
      message="Are you sure you want to log out of your account? Any unsaved changes will be lost."
      confirmText="Yes, Logout"
      cancelText="Cancel"
      danger
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

function ProfileDropdown({
  user,
  logoutTo,
  profileTo,
  settingsTo,
  isAdmin = false,
}: {
  user: { name: string; role: string; photo?: string };
  logoutTo: string;
  profileTo: string;
  settingsTo: string;
  isAdmin?: boolean;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [currentPatient, setCurrentPatient] = useState(() =>
    JSON.parse(localStorage.getItem("patient") || "{}")
  );

  useEffect(() => {
    const handleStorage = () => {
      setCurrentPatient(JSON.parse(localStorage.getItem("patient") || "{}"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const photoUrl = currentPatient.profileImageUrl
    ? currentPatient.profileImageUrl
    : (currentPatient.profileImage
        ? (currentPatient.profileImage.startsWith("http")
            ? currentPatient.profileImage
            : `http://localhost:8080/uploads/profile/${currentPatient.profileImage}`)
        : user.photo);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = isAdmin
    ? [{ icon: Settings, label: "Settings", to: settingsTo }]
    : [
        { icon: User, label: "My Profile", to: profileTo },
        { icon: Settings, label: "Settings", to: settingsTo },
      ];

  const handleLogout = () => {
    localStorage.removeItem("patient");
    sessionStorage.removeItem("hcp-auth");
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400">
          {photoUrl && (
            <AvatarImage src={photoUrl} alt={currentPatient.fullName || user.name} className="object-cover" />
          )}
          <AvatarFallback className="font-semibold text-xs bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400">
            {user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden leading-tight sm:block text-left">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{user.role}</p>
        </div>
        <ChevronDown
          size={15}
          className={`hidden sm:block text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10">
          {/* Menu items */}
          <div className="p-1.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { setOpen(false); navigate(item.to); }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <item.icon size={16} />
                </span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-1.5">
            <button
              onClick={() => { setOpen(false); setConfirmLogout(true); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400">
                <LogOut size={16} />
              </span>
              Logout
            </button>
          </div>
        </div>
      )}

      <LogoutConfirmDialog
        open={confirmLogout}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          handleLogout();
        }}
      />
    </div>
  );
}

export function DashboardLayout({
  navItems,
  children,
  user,
  logoutTo = "/",
  title,
  searchValue,
  onSearchChange,
}: {
  navItems: NavItem[];
  children: ReactNode;
  user: { name: string; role: string; photo?: string };
  logoutTo?: string;
  title?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [sidebarLogoutOpen, setSidebarLogoutOpen] = useState(false);

  // Derive notifications route from nav items (admin vs patient)
  const isAdmin = navItems.some((n) => n.to.startsWith("/admin"));
  const notifRoute = isAdmin ? "/admin" : "/notifications";

  // Click-outside to close notification panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close notif panel on route change
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-slate-100 dark:border-slate-800 px-6">
        <Logo to={navItems[0]?.to ?? "/"} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to !== navItems[0].to && location.pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${active
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              <Icon className="h-4.5 w-4.5" size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 dark:border-slate-800 p-4">
        <button
          onClick={() => setSidebarLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 text-slate-400 dark:text-slate-500"
            >
              <X size={20} />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-md md:px-8">
          <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          {title && (
            <h2 className="hidden text-lg font-semibold text-slate-800 dark:text-slate-100 sm:block">{title}</h2>
          )}
          <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <Input
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search..."
              className="rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 pl-9"
            />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={(e) => toggleTheme(e.clientX, e.clientY)}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 shadow-sm transition-all hover:scale-110 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotificationPanel
                onClose={() => setNotifOpen(false)}
                notifTo={notifRoute}
              />
            )}
          </div>

          <ProfileDropdown
            user={user}
            logoutTo={logoutTo}
            profileTo={isAdmin ? "/admin/settings" : "/profile"}
            settingsTo={isAdmin ? "/admin/settings" : "/settings"}
            isAdmin={isAdmin}
          />
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      <LogoutConfirmDialog
        open={sidebarLogoutOpen}
        onCancel={() => setSidebarLogoutOpen(false)}
        onConfirm={() => {
          setSidebarLogoutOpen(false);
          localStorage.removeItem("patient");
          sessionStorage.removeItem("hcp-auth");
          navigate("/login");
        }}
      />
    </div>
  );
}
