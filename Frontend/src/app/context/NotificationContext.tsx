import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CalendarCheck, FileText, Bell, Star, type LucideIcon } from "lucide-react";
import api from "../../api/api";

export interface NotifItem {
  id: number;
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  color: string;
  rawItem?: any;
}

interface NotificationContextType {
  notifs: NotifItem[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: number) => Promise<void>;
  deleteNotif: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (isNaN(diffInSeconds) || diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const mapBackendToNotifItem = (item: any): NotifItem => {
    let Icon = CalendarCheck;
    let color = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50";

    const type = (item.type || "").toLowerCase();
    if (type === "appointment") {
      Icon = CalendarCheck;
      color = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50";
    } else if (type === "report" || type === "prescription") {
      Icon = FileText;
      color = "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50";
    } else if (type === "rating") {
      Icon = Star;
      color = "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50";
    } else {
      Icon = Bell;
      color = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50";
    }

    return {
      id: item.id,
      icon: Icon,
      title: item.title || "Notification",
      desc: item.message || "",
      time: formatRelativeTime(item.createdAt),
      unread: !item.isRead,
      color: color,
      rawItem: item,
    };
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const storedPatientStr = localStorage.getItem("patient");
      const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
      const patientId = storedPatient?.id || 1;

      const res = await api.get(`/notifications?userId=${patientId}`);
      if (Array.isArray(res.data)) {
        const formatted = res.data.map(mapBackendToNotifItem);
        setNotifs(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener("notificationsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("notificationsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchNotifications]);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      const storedPatientStr = localStorage.getItem("patient");
      const storedPatient = storedPatientStr ? JSON.parse(storedPatientStr) : null;
      const patientId = storedPatient?.id || 1;

      await api.patch(`/notifications/read-all?userId=${patientId}`);
    } catch (error) {
      console.error("Failed to mark all read:", error);
      fetchNotifications();
    }
  };

  const markOneRead = async (id: number) => {
    const target = notifs.find((n) => n.id === id);
    if (!target || !target.unread) return;

    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchNotifications();
    }
  };

  const deleteNotif = async (id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifs,
        unreadCount,
        loading,
        refreshNotifications: fetchNotifications,
        markAllRead,
        markOneRead,
        deleteNotif,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
