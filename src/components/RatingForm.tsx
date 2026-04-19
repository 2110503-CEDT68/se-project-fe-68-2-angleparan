"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RatingItem } from "../../interface";
import addRatingLib from "@/libs/addRating";
import deleteRatingLib from "@/libs/deleteRating";
import getRatings from "@/libs/getRatings";

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hovered || value);
        return (
          <button key={s} type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}>
            <svg width={30} height={30} viewBox="0 0 24 24"
              fill={filled ? "#FBBF24" : "none"}
              stroke={filled ? "#FBBF24" : "#9CA3AF"}
              strokeWidth={1.5} className="transition-all duration-100">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        );
      })}
    </span>
  );
}

function StarDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#FBBF24" : "none"}
          stroke={s <= Math.round(value) ? "#FBBF24" : "#D1D5DB"}
          strokeWidth={1.5}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// ─── Props ────────────────────────────────────────────────────────────────────
interface RatingFormProps {
  dentistId: string;
  dentistName: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RatingForm({ dentistId, dentistName }: RatingFormProps) {
  const { data: session } = useSession();

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [existingRating, setExistingRating] = useState<RatingItem | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);

  const userId = (session?.user as any)?.id || (session?.user as any)?._id;
  const token = (session?.user as any)?.accessToken;

  // ตรวจสอบว่า user เคย rate หมอคนนี้แล้วหรือยัง
  useEffect(() => {
    if (!session || !dentistId) return;
    (async () => {
      try {
        const res = await getRatings(dentistId);
        const mine = res.data.find(
          (r) => typeof r.user === "object" && r.user._id === userId
        );
        setExistingRating(mine ?? null);
      } catch {
        // ignore
      } finally {
        setLoadingCheck(false);
      }
    })();
  }, [session, dentistId, userId]);

  const handleSubmit = async () => {
    if (myRating === 0) {
      setFeedback({ text: "กรุณาเลือกดาวก่อนส่งรีวิว", ok: false });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await addRatingLib(dentistId, myRating, myComment, token);
      if (res.success) {
        setFeedback({ text: "ขอบคุณสำหรับรีวิวของคุณ! ✨", ok: true });
        setExistingRating(res.data);
        setMyRating(0);
        setMyComment("");
      } else {
        setFeedback({ text: res.message || "ไม่สามารถส่งรีวิวได้", ok: false });
      }
    } catch {
      setFeedback({ text: "เกิดข้อผิดพลาด กรุณาลองใหม่", ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRating || !confirm("ต้องการลบรีวิวของคุณใช่ไหม?")) return;
    try {
      await deleteRatingLib(existingRating._id, token);
      setExistingRating(null);
      setFeedback({ text: "ลบรีวิวเรียบร้อยแล้ว", ok: true });
    } catch {
      setFeedback({ text: "ไม่สามารถลบรีวิวได้", ok: false });
    }
  };

  if (!session) return null;

  if (loadingCheck) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        กำลังตรวจสอบ...
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
        รีวิวทันตแพทย์ {dentistName}
      </h3>

      {existingRating ? (
        // แสดงรีวิวที่เคยส่งไปแล้ว
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StarDisplay value={existingRating.rating} size={16} />
              <span className="text-sm font-semibold text-amber-700">{existingRating.rating}/5</span>
            </div>
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
              ลบรีวิว
            </button>
          </div>
          {existingRating.comment && (
            <p className="text-sm text-slate-600 mt-1">{existingRating.comment}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            รีวิวเมื่อ {new Date(existingRating.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      ) : (
        // ฟอร์มกรอกรีวิวใหม่
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-5">
          {/* Star selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">ให้คะแนน</label>
            <div className="flex items-center gap-3">
              <StarInput value={myRating} onChange={setMyRating} />
              {myRating > 0 && (
                <span className="text-sm font-semibold text-amber-600 animate-in fade-in">
                  {STAR_LABELS[myRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              ความคิดเห็น <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="แชร์ประสบการณ์การรักษากับทันตแพทย์คนนี้..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 
                         focus:border-blue-400 resize-none bg-white transition"
            />
            <div className="text-right text-xs text-slate-400 mt-1">{myComment.length}/500</div>
          </div>

          {feedback && (
            <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium border ${
              feedback.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}>
              {feedback.text}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || myRating === 0}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm
              ${submitting || myRating === 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"}`}>
            {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
          </button>
        </div>
      )}

      {feedback && !existingRating && (
        <div className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium border ${
          feedback.ok
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}
