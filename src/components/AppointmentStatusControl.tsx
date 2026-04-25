"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppointmentStatus } from "../../interface";
import updateAppointmentStatus from "@/libs/updateAppointmentStatus";

interface AppointmentStatusControlProps {
  apptId: string;
  currentStatus: AppointmentStatus;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "⏳",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "❌",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "🎉",
  },
};

// สถานะที่หมอสามารถเปลี่ยนไปได้
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

export default function AppointmentStatusControl({
  apptId,
  currentStatus,
}: AppointmentStatusControlProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<AppointmentStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  const token = (session?.user as any)?.accessToken;
  const role = session?.user?.role;

  const cfg = STATUS_CONFIG[status];
  const nextStatuses = ALLOWED_TRANSITIONS[status];

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!token) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await updateAppointmentStatus(apptId, newStatus, token);
      if (res.success) {
        setStatus(newStatus);
        setFeedback({ text: `สถานะเปลี่ยนเป็น "${STATUS_CONFIG[newStatus].label}" เรียบร้อยแล้ว`, ok: true });
      } else {
        setFeedback({ text: res.message || "ไม่สามารถเปลี่ยนสถานะได้", ok: false });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || "เกิดข้อผิดพลาด", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Appointment Status
      </p>

      {/* Current status badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${cfg.color} ${cfg.bg} ${cfg.border}`}
      >
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>

      {/* Dentist action buttons */}
      {role === "dentist" && nextStatuses.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">เปลี่ยนสถานะ:</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((next) => {
              const nextCfg = STATUS_CONFIG[next];
              return (
                <button
                  key={next}
                  onClick={() => handleStatusChange(next)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all
                    ${nextCfg.color} ${nextCfg.bg} ${nextCfg.border}
                    hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {loading ? (
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span>{nextCfg.icon}</span>
                  )}
                  {nextCfg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal state messages */}
      {role === "dentist" && status === "cancelled" && (
        <p className="mt-3 text-xs text-red-400 font-medium">การนัดหมายนี้ถูกยกเลิกแล้ว ไม่สามารถเปลี่ยนสถานะได้</p>
      )}
      {role === "dentist" && status === "completed" && (
        <p className="mt-3 text-xs text-emerald-600 font-medium">การนัดหมายเสร็จสิ้นแล้ว</p>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium border ${
            feedback.ok
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
