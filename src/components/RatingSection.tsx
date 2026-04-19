"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RatingItem } from "../../interface";
import addRatingLib from "@/libs/addRating";
import deleteRatingLib from "@/libs/deleteRating";
import getRatings from "@/libs/getRatings";

// ─── Star display (read-only) ────────────────────────────────────────────────
function StarDisplay({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#FBBF24" : "none"}
          stroke={s <= Math.round(value) ? "#FBBF24" : "#D1D5DB"}
          strokeWidth={1.5}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

// ─── Star input (interactive) ─────────────────────────────────────────────────
function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hovered || value);
        return (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill={filled ? "#FBBF24" : "none"}
              stroke={filled ? "#FBBF24" : "#9CA3AF"}
              strokeWidth={1.5}
              className="transition-all duration-100"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        );
      })}
    </span>
  );
}

// ─── Rating breakdown bar ─────────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-slate-600 font-medium">{star}</span>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth={1.5}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-slate-400 text-xs">{count}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RatingSection({ dentistId, isDashboard = false }: { dentistId: string, isDashboard?: boolean }) {
  const { data: session } = useSession();

  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  // Fetch ratings
  const fetchRatings = async () => {
    if (!dentistId) return; // ไม่ทำงานถ้าไม่ได้ส่ง ID มา
    
    try {
      setLoading(true);
      const res = await getRatings(dentistId);
      setRatings(res.data || []);
    } catch {
      // silently fail — ratings are non-critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dentistId]);

  // Computed stats
  const total = ratings.length;
  const avg =
    total > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));

  const userId = (session?.user as any)?.id || (session?.user as any)?._id;
  const myExistingRating = ratings.find(
    (r) => typeof r.user === "object" && r.user._id === userId
  );

  // Submit
  const handleSubmit = async () => {
    if (!session) {
      setFeedback({ text: "Please log in to leave a review.", ok: false });
      return;
    }
    if (myRating === 0) {
      setFeedback({ text: "Please select a star rating.", ok: false });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = (session.user as any)?.accessToken;
      const res = await addRatingLib(dentistId, myRating, myComment, token);

      if (res.success) {
        setFeedback({ text: "Thank you for your review! ✨", ok: true });
        setMyRating(0);
        setMyComment("");
        await fetchRatings();
      } else {
        setFeedback({ text: res.message || "Could not submit review.", ok: false });
      }
    } catch {
      setFeedback({ text: "An error occurred. Please try again.", ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete own rating
  const handleDelete = async (ratingId: string) => {
    if (!confirm("Delete your review?")) return;
    try {
      const token = (session?.user as any)?.accessToken;
      await deleteRatingLib(ratingId, token);
      await fetchRatings();
    } catch {
      alert("Failed to delete review.");
    }
  };

  return (
    <section className="w-full mt-10">
      {/* ── Header ── ซ่อนในหน้า Dashboard */}
      {!isDashboard && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 rounded-full bg-blue-500" />
          <h2 className="text-2xl font-bold text-slate-800">Patient Reviews</h2>
        </div>
      )}

      {/* ── Summary card ── */}
      {!loading && total > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6 shadow-sm">
          {/* Big number */}
          <div className="flex flex-col items-center justify-center min-w-[110px]">
            <span className="text-6xl font-extrabold text-slate-800 leading-none">
              {avg.toFixed(1)}
            </span>
            <StarDisplay value={avg} size={20} />
            <span className="text-sm text-slate-400 mt-1">{total} review{total > 1 ? "s" : ""}</span>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {breakdown.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* ── Leave a review (ซ่อนกล่องนี้ในหน้า Dashboard) ── */}
      {!isDashboard && session && !myExistingRating && (
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Leave a Review
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">Your Rating</label>
            <StarInput value={myRating} onChange={setMyRating} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Comment <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Share your experience with this dentist..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 
                         focus:border-blue-400 resize-none bg-white transition"
            />
            <div className="text-right text-xs text-slate-400 mt-1">{myComment.length}/500</div>
          </div>

          {feedback && (
            <div
              className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium border ${
                feedback.ok
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || myRating === 0}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm
              ${submitting || myRating === 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
              }`}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      )}

      {/* "Already reviewed" notice (ซ่อนในหน้า Dashboard) */}
      {!isDashboard && session && myExistingRating && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm">
          <span className="text-amber-700 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            You have already reviewed this dentist.
          </span>
          <button
            onClick={() => handleDelete(myExistingRating._id)}
            className="text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            Delete review
          </button>
        </div>
      )}

      {/* Not logged in (ซ่อนในหน้า Dashboard) */}
      {!isDashboard && !session && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl px-5 py-4 mb-6 text-sm text-slate-500 text-center">
          <a href="/login" className="text-blue-600 font-semibold hover:underline">Log in</a> to leave a review.
        </div>
      )}

      {/* ── Review list ── */}
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-7 w-7 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-14 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-slate-300">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
          <p className="font-medium">No reviews yet.</p>
          {!isDashboard && <p className="text-sm mt-1">Be the first to review this dentist!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((r) => {
            const isOwner =
              typeof r.user === "object" && r.user._id === userId;
            const userName =
              typeof r.user === "object" ? r.user.name : "Patient";
            const initials = userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={r._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-tight">
                        {userName}
                        {isOwner && (
                          <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Stars + delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StarDisplay value={r.rating} size={15} />
                    {isOwner && !isDashboard && (
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {r.comment && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-13 border-t border-slate-50 pt-3">
                    {r.comment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}