"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppointmentStatus } from "../../interface";
import updateAppointmentStatus from "@/libs/updateAppointmentStatus";

interface AppointmentStatusControlProps {
  apptId: string;
  currentStatus: AppointmentStatus;
  isAdmin?: boolean;
  onStatusUpdated?: (newStatus: AppointmentStatus) => void;
}

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: "⏳",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    icon: "❌",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    icon: "🎉",
  },
};

export default function AppointmentStatusControl({
  apptId,
  currentStatus,
  isAdmin,
  onStatusUpdated,
}: AppointmentStatusControlProps) {
  const { data: session } = useSession();
  const [loadingAction, setLoadingAction] = useState<AppointmentStatus | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<AppointmentStatus | null>(null);
  const [modalText, setModalText] = useState("");

  const token = (session?.user as any)?.accessToken;
  const role = session?.user?.role;

  // Determine allowed actions
  let availableActions: AppointmentStatus[] = [];
  if (role === "user") {
    if (currentStatus === "pending" || currentStatus === "confirmed") {
      availableActions = ["cancelled"];
    }
  } else if (role === "dentist" || isAdmin) {
  availableActions = [];

  if (currentStatus === "pending") {
    availableActions = ["confirmed"];
  }

  if (currentStatus === "confirmed") {
    availableActions = ["completed"];
  }

  // 🔥 ALWAYS allow cancel
  availableActions.push("cancelled");
}



  const initiateStatusChange = (newStatus: AppointmentStatus) => {
    setFeedback(null);
    if (newStatus === "completed" || newStatus === "cancelled") {
      setModalAction(newStatus);
      setModalText("");
      setModalOpen(true);
    } else {
      executeStatusChange(newStatus);
    }
  };

  const executeStatusChange = async (newStatus: AppointmentStatus, text?: string) => {
    if (!token) return;
    setLoadingAction(newStatus);
    try {
      let treatmentDetails = undefined;
      let cancelReason = undefined;

      if (newStatus === "completed") treatmentDetails = text || modalText;
      if (newStatus === "cancelled") cancelReason = text || modalText;

      const res = await updateAppointmentStatus(apptId, newStatus, token, treatmentDetails, cancelReason);
      
      if (res.success !== false) {
        setFeedback({ text: `Status updated to "${STATUS_CONFIG[newStatus].label}"`, ok: true });
        setModalOpen(false);
        if (onStatusUpdated) onStatusUpdated(newStatus);
      } else {
        setFeedback({ text: res.message || "Failed to update status", ok: false });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || "An error occurred", ok: false });
    } finally {
      setLoadingAction(null);
    }
  };

  if (!role || availableActions.length === 0) {
    if (role === "dentist" || isAdmin) {
      if (currentStatus === "cancelled") return <p className="mt-3 text-[13px] text-red-500 font-semibold border-l-2 border-red-400 pl-2">This appointment has been cancelled.</p>;
      if (currentStatus === "completed") return <p className="mt-3 text-[13px] text-emerald-600 font-semibold border-l-2 border-emerald-400 pl-2">This appointment is completed.</p>;
    }
    return null;
  }

  return (
    <div className="w-full mt-3 pt-4 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {role !== "user" && (
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider min-w-max">
            Action:
          </span>
        )}
        
        <div className="flex flex-wrap gap-2 w-full">
          {availableActions.map((next) => {
            const nextCfg = STATUS_CONFIG[next];
            const isRevert = next === "pending" && currentStatus !== "pending";
            const isLoading = loadingAction === next;

            if (role === "user" && next === "cancelled") {
              return (
                <button
                  key={next}
                  onClick={() => initiateStatusChange(next)}
                  disabled={loadingAction !== null}
                  className="w-full sm:w-auto px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 sm:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  )}
                  Cancel Booking
                </button>
              );
            }

            return (
              <button
                key={next}
                onClick={() => initiateStatusChange(next)}
                disabled={loadingAction !== null}
                className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-1.5
                  ${isRevert 
                    ? "bg-white text-amber-600 border-amber-200 hover:bg-amber-50 sm:ml-auto shadow-sm" 
                    : `bg-white ${nextCfg.color} ${nextCfg.border} hover:${nextCfg.bg} shadow-sm`}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <span className="text-sm">{isRevert ? "⏪" : nextCfg.icon}</span>
                )}
                {isRevert ? "Revert to Pending" : (next === "completed" ? "Complete Record" : nextCfg.label)}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
          feedback.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {feedback.text}
        </div>
      )}

      {/* Modal */}
      {modalOpen && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {modalAction === "completed" ? "Complete Appointment" : "Cancel Appointment"}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {modalAction === "completed" 
                ? "Please provide treatment details for the medical record." 
                : "Please state the reason for cancellation."}
            </p>
            
            <textarea
              autoFocus
              className="w-full h-28 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 text-sm resize-none mb-4"
              placeholder={modalAction === "completed" ? "E.g., Scaling and root planing done..." : "E.g., Unexpected schedule conflict..."}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => executeStatusChange(modalAction, modalText)}
                disabled={loadingAction !== null || modalText.trim().length === 0}
                className={`px-4 py-2 text-sm text-white font-semibold rounded-lg transition-all flex items-center gap-2
                  ${modalAction === "completed" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingAction === modalAction && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}