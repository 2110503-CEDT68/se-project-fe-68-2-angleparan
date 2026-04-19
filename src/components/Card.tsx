"use client"

import InteractiveCard from "./InteractiveCard";
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function StarMini({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width={12} height={12} viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#FBBF24" : "none"}
          stroke={s <= Math.round(value) ? "#FBBF24" : "#D1D5DB"}
          strokeWidth={1.5}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

export default function Card(
  { DentistName, experience, expertist, did, workingHours , averageRating, ratingCount}: 
  { DentistName: string; experience: number; expertist: string; did: string; workingHours?: { start: number; end: number };averageRating?: number;  ratingCount?: number;}
) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const editApptId = searchParams.get("apptid");

const targetUrl = mode === "edit" && editApptId
  ? `/viewappt/${editApptId}?newDid=${did}`
  : `/dentist/${did}`; 

  const buttonText = mode === "edit" ? "Select for Update" : "Book Dentist";

  return (
    <InteractiveCard>
      <Link href={targetUrl} className="block flex flex-col h-full justify-between p-4 group">
        <div>
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
              {DentistName.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={DentistName}>
              {DentistName}
            </h2>
          </div>

          {/* Rating — แสดงเฉพาะเมื่อมี review */}
          
          {averageRating !== undefined && ratingCount !== undefined && ratingCount > 0 ? (
            <div className="flex items-center gap-1.5 mb-3">
              <StarMini value={averageRating} />
              <span className="text-xs font-semibold text-amber-600">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({ratingCount} review{ratingCount > 1 ? "s" : ""})</span>
            </div>
          ) : (
            console.log( "avg:", averageRating, "count:", ratingCount),
            <div className="flex items-center gap-1.5 mb-3">
              <StarMini value={0} />
              <span className="text-xs text-slate-400">No reviews yet</span>
            </div>
          )}

          {/* Details */}
          <div className="text-sm text-slate-600 space-y-1.5">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span><span className="font-semibold text-slate-700">Expertise:</span> {expertist}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span><span className="font-semibold text-slate-700">Experience:</span> {experience} yrs</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>
                <span className="font-semibold text-slate-700">Hours:</span>{' '}
                {workingHours?.start !== undefined && workingHours?.end !== undefined
                  ? `${workingHours.start.toString().padStart(2,'0')}:00 - ${workingHours.end.toString().padStart(2,'0')}:00`
                  : '-'}
              </span>
            </p>
          </div>
        </div>

          <button className={`w-full font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 border 
            ${mode === "edit" 
              ? "bg-amber-50 text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white" 
              : "bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"}`}>
            {buttonText}
          </button>
      </Link>
    </InteractiveCard>
  )
}