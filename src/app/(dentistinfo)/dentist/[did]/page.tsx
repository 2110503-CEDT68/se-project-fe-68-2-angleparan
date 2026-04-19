import getDentist from "@/libs/getDentist";
import getRatings from "@/libs/getRatings";
import Link from "next/link";
import RatingSection from "@/components/RatingSection";

export default async function DentistDetailPage({
  params,
}: {
  params: Promise<{ did: string }>;
}) {
  const resolvedParams = await params;
  const { did } = resolvedParams;

  const dentist = await getDentist(did);

  let avgRating = 0;
  let ratingCount = 0;
  try {
    const ratingsRes = await getRatings(did);
    ratingCount = ratingsRes.count;
    if (ratingCount > 0) {
      avgRating = ratingsRes.data.reduce((sum, r) => sum + r.rating, 0) / ratingCount;
    }
  } catch {
    // ratings are non-critical
  }

  const workStart = dentist.workingHours?.start ?? 9;
  const workEnd = dentist.workingHours?.end ?? 17;

  const renderStars = (value: number) =>
    [1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill={s <= Math.round(value) ? "#FBBF24" : "none"}
        stroke={s <= Math.round(value) ? "#FBBF24" : "#D1D5DB"}
        strokeWidth={1.5}
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ));

  return (
    <main className="bg-slate-50 min-h-screen pb-20">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-extrabold text-5xl flex items-center justify-center border-4 border-white/40 shadow-xl shrink-0">
            {dentist.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-1">Dental Specialist</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-sm mb-2">{dentist.name}</h1>
            {ratingCount > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="flex gap-0.5">{renderStars(avgRating)}</span>
                <span className="text-white font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-blue-200 text-sm">({ratingCount} review{ratingCount > 1 ? "s" : ""})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Expertise</p>
              <p className="font-bold text-slate-800 leading-snug">{dentist.expertise}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Experience</p>
              <p className="font-bold text-slate-800">{dentist.experience} Years</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Working Hours</p>
              <p className="font-bold text-slate-800">{workStart.toString().padStart(2,"0")}:00 – {workEnd.toString().padStart(2,"0")}:00</p>
            </div>
          </div>
        </div>

        {/* Book button */}
        <div className="flex items-center gap-4 mb-10">
          <Link href={`/dentist/${did}/appointments`} className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              Book an Appointment
            </button>
          </Link>
          <Link href="/dentist">
            <button className="text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors">← Back to Dentists</button>
          </Link>
        </div>

        {/* Ratings section */}
        <RatingSection dentistId={did} />
      </div>
    </main>
  );
}
