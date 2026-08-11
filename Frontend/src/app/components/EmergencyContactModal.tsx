import React from "react";
import { useNavigate } from "react-router";
import { Phone, MessageSquare, AlertTriangle, User, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

export interface EmergencyContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  relationship?: string;
  phone?: string;
}

export function EmergencyContactModal({
  open,
  onOpenChange,
  contactName,
  relationship,
  phone,
}: EmergencyContactModalProps) {
  const navigate = useNavigate();

  const hasContact = Boolean(contactName?.trim() && phone?.trim());

  const handleCall = () => {
    if (!phone) return;
    try {
      toast.info(`Initiating call to ${phone}...`);
      window.location.href = `tel:${phone}`;
    } catch (err) {
      console.error(err);
      toast.error(`Calling not supported on this device. Phone: ${phone}`);
    }
  };

  const handleMessage = () => {
    if (!phone) return;
    try {
      toast.info(`Opening SMS for ${phone}...`);
      window.location.href = `sms:${phone}`;
    } catch (err) {
      console.error(err);
      toast.error(`SMS not supported on this device. Phone: ${phone}`);
    }
  };

  const handleGoToProfile = () => {
    onOpenChange(false);
    navigate("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl backdrop-blur-md">
        {hasContact ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Phone size={20} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Emergency Contact
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Primary contact during medical emergencies
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Contact Name
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                    👤 {contactName}
                  </p>
                </div>
              </div>

              {relationship && (
                <div className="flex items-start gap-3 border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs">
                    <HeartHandshake size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Relationship
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {relationship}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Phone Number
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                    {phone}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-xl border-slate-200 dark:border-slate-700"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                className="w-full sm:flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={handleMessage}
              >
                <MessageSquare size={16} /> Message
              </Button>
              <Button
                className="w-full sm:flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleCall}
              >
                <Phone size={16} /> Call
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 ring-8 ring-amber-50 dark:ring-amber-950/30">
                <AlertTriangle size={28} />
              </div>
              <DialogTitle className="mt-4 text-center text-xl font-bold text-slate-900 dark:text-slate-50">
                No Emergency Contact Added
              </DialogTitle>
              <DialogDescription className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                You haven&apos;t added an emergency contact yet. Please add one from your Profile page so healthcare providers or family members can be contacted during emergencies.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 rounded-xl border-slate-200 dark:border-slate-700"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                className="w-full sm:flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleGoToProfile}
              >
                Go to Profile
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
