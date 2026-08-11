import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !loading) onCancel(); }}>
      <DialogContent
        className="max-w-md rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
        onPointerDownOutside={(e) => loading && e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              danger
                ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {message}
        </div>

        <DialogFooter className="mt-6 flex flex-row justify-end gap-3 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl font-medium px-5 ${
              danger
                ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
