"use client"

import InteractiveCard from "./InteractiveCard";
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function Card(
  { DentistName, experience, expertist, did, workingHours }: 
  { DentistName: string; experience: number; expertist: string; did: string; workingHours?: { start: number; end: number }; }
) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const editApptId = searchParams.get("apptid");

  const targetUrl = mode === "edit" && editApptId
    ? `/viewappt/${editApptId}?newDid=${did}`
    : `/dentist/${did}/appointments`;

  const buttonText = mode === "edit" ? "Select for Update" : "Book Dentist";

  return (
    <InteractiveCard>
      <div className="flex flex-col h-full justify-between p-4">
        
        <div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
            {DentistName.charAt(0)}
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800 line-clamp-1" title={DentistName}>
            {DentistName}
          </h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p><span className="font-semibold text-slate-700">Experience:</span> {experience} years</p>
            <p><span className="font-semibold text-slate-700">Expertise:</span> {expertist}</p>

            <p>
              <span className="font-semibold text-slate-700">Working Hours:</span>{' '}
              {workingHours?.start !== undefined && workingHours?.end !== undefined 
                ? `${workingHours.start.toString().padStart(2, '0')}:00 - ${workingHours.end.toString().padStart(2, '0')}:00` 
                : '-'}
            </p>
          </div>
        </div>

        <Link href={targetUrl} className="mt-6 w-full">
          <button className={`w-full font-semibold px-4 py-2 rounded-lg transition-all duration-300 border 
            ${mode === "edit" 
              ? "bg-amber-50 text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white" 
              : "bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"}`}>
            {buttonText}
          </button>
        </Link>
        
      </div>
    </InteractiveCard>
  )
}