import { useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { patientNav, patientUser } from "../lib/nav";
import { useNotifications } from "../context/NotificationContext";

export function Notifications() {
  const { notifs, unreadCount, markAllRead, markOneRead, deleteNotif } = useNotifications();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const promptDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      deleteNotif(deleteId);
      toast.success("Notification deleted successfully.");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      toast.error("Unable to delete notification. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout navItems={patientNav} user={patientUser} title="Notifications">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Notifications</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Stay up to date with your health activity.</p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={16} /> Mark all read
        </Button>
      </div>
      <div className="space-y-3">
        {notifs.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => markOneRead(n.id)}
              className={`flex items-start gap-4 rounded-2xl border p-5 shadow-sm cursor-pointer transition-colors relative group ${
                n.unread ? "border-blue-100 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${n.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">{n.title}</h3>
                  {n.unread && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{n.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">{n.time}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => promptDelete(e, n.id)}
                  className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                  title="Delete Notification"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          );
        })}
        {notifs.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">No notifications yet</p>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteModal}
        title="Delete Notification?"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setShowDeleteModal(false)}
      />
    </DashboardLayout>
  );
}
