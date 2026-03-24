"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import deleteAppointment from "@/libs/deleteAppointment"
import getAppointment from "@/libs/getAppointments"
import { AppointmentItem, DentistItem } from "../../interface"
import Link from "next/link"

type AppointmentWithDentist = Omit<AppointmentItem, "dentist"> & {
  dentist: string | DentistItem
}

interface ApptListProps {
  filterDate?: string
  isAdmin?: boolean
}

export default function ApptList({ filterDate, isAdmin }: ApptListProps) {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<AppointmentWithDentist[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!session?.accessToken) return
    try {
      setLoading(true)
      const query = filterDate && isAdmin ? `?apptDate=${filterDate}` : ""
      const apptRes = await getAppointment(session.accessToken, query) 
      setAppointments(apptRes.data)
    } catch (err) {
      console.error("FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [session?.accessToken, filterDate])

  const handleCancel = async (apptId: string) => {
    if (!session?.accessToken) return
    if (!confirm("Are you sure you want to cancel this booking?")) return

    try {
      await deleteAppointment(apptId, session.accessToken)
      setAppointments((prev) => prev.filter((item) => item._id !== apptId))
      alert("Booking cancelled successfully")
    } catch (err) {
      console.error("DELETE ERROR:", err)
      alert("Failed to cancel booking")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-blue-500">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <p className="text-slate-500 font-medium text-lg">No appointments found.</p>
        {filterDate && <p className="text-slate-400 text-sm mt-1">Try selecting a different date.</p>}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {appointments.map((appt) => {
        const dentist = typeof appt.dentist === "string" ? null : appt.dentist

        return (
          <div
            key={appt._id}
            className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-6"
          >
            <Link href={`/viewappt/${appt._id}`}>
              <button 
                title="Edit Appointment"
                className="absolute top-5 right-5 p-2.5 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pr-12 md:pr-0">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100 shadow-sm">
                    {dentist?.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl mb-0.5">{dentist?.name ?? "Unknown Dentist"}</h3>
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                      {dentist?.expertise ?? "General Dentistry"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {new Date(appt.apptDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {new Date(appt.apptDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' })}
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Exp: {dentist?.experience ?? "-"} Yrs
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col absolute right-5 bottom-5 pt-5 md:pt-0 border-t md:border-t-0 border-slate-100 md:ml-4">
                <button
                  onClick={() => handleCancel(appt._id)}
                  className="w-full md:w-auto px-5 py-2.5 bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}