"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import deleteAppointment from "@/libs/deleteAppointment"
import getAppointment from "@/libs/getAppointments"
import { AppointmentItem, DentistItem, UserItem } from "../../interface"
import Link from "next/link"

interface ApptListProps {
  filterDate?: string
  isAdmin?: boolean
  targetDentistId?: string
}

export default function ApptList({ filterDate, isAdmin, targetDentistId }: ApptListProps) {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)

  const role = session?.user?.role;
  const showPatientInfo = role === "admin" || role === "dentist";

  const fetchData = async () => {
    if (!session?.accessToken) return
    try {
      setLoading(true)
      const query = filterDate && (isAdmin || role === "dentist") ? `?apptDate=${filterDate}` : ""
      const apptRes = await getAppointment(session.accessToken, query) 
      
      // 2. ดักกรองข้อมูลเฉพาะหมอที่เลือก หากมีการส่ง targetDentistId เข้ามา
      let fetchedData = apptRes.data;
      if (targetDentistId) {
        fetchedData = fetchedData.filter((appt: AppointmentItem) => {
           const dentistObj = typeof appt.dentist === "object" ? appt.dentist : null;
           return (dentistObj?._id === targetDentistId) || (appt.dentist === targetDentistId);
        });
      }

      setAppointments(fetchedData)
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
        const dentist = typeof appt.dentist === "object" ? (appt.dentist as DentistItem) : null
        const patient = typeof appt.user === "object" ? (appt.user as UserItem) : null

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

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pr-12 md:pr-0">
              <div className="space-y-4 w-full">
                
                {/* ข้อมูลหมอ */}
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

                {/* ข้อมูลคนไข้ (แสดงเฉพาะ Admin/Dentist) */}
                {showPatientInfo && patient && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Patient Details</p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-slate-700 font-medium">{patient.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span className="text-slate-700 font-medium">{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* ข้อมูลเวลา */}
                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {new Date(appt.apptDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {new Date(appt.apptDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' })}
                  </div>
                  {!showPatientInfo && (
                    <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Exp: {dentist?.experience ?? "-"} Yrs
                    </div>
                  )}
                </div>
              </div>

              {/* ปุ่ม Cancel */}
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