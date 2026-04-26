"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation" // เพิ่ม useRouter
import getAppointment from "@/libs/getAppointments"
import { AppointmentItem, AppointmentStatus, DentistItem, UserItem } from "../../interface"
import AppointmentStatusControl, { STATUS_CONFIG } from "./AppointmentStatusControl"

interface ApptListProps {
  filterDate?: string
  isAdmin?: boolean
  targetDentistId?: string
}

export default function ApptList({ filterDate, isAdmin, targetDentistId }: ApptListProps) {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [navigatingId, setNavigatingId] = useState<string | null>(null) // State สำหรับเช็คว่ากำลังไปหน้าไหน

  const role = session?.user?.role;
  const showPatientInfo = role === "admin" || role === "dentist";

  const fetchData = async () => {
    if (!session?.accessToken) return
    try {
      setLoading(true)
      const query = filterDate && (isAdmin || role === "dentist") ? `?apptDate=${filterDate}` : ""
      const apptRes = await getAppointment(session.accessToken, query) 
      
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

  const handleStatusUpdated = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(appt => appt._id === id ? { ...appt, status: newStatus } : appt));
  };

  // ฟังก์ชันกดไปหน้าแก้ไข
  const handleNavigate = (id: string) => {
    setNavigatingId(id); // แสดงไอคอนโหลด
    router.push(`/viewappt/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-blue-500">
        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <p className="text-slate-500 font-medium">No appointments found.</p>
        {filterDate && <p className="text-slate-400 text-xs mt-1">Try selecting a different date.</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4 relative">
      {appointments.map((appt) => {
        const dentist = typeof appt.dentist === "object" ? (appt.dentist as DentistItem) : null
        const patient = typeof appt.user === "object" ? (appt.user as UserItem) : null
        const status: AppointmentStatus = appt.status ?? "pending"
        
        const statusBadge = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        const isCancelled = status === "cancelled"
        const isNavigating = navigatingId === appt._id;

        return (
          <div
            key={appt._id}
            className={`group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border
              ${isCancelled ? "border-red-100 opacity-80" : "border-slate-200 hover:border-blue-300"}`}
          >
            <div className="flex flex-col gap-4">
              
              {/* Header: Dentist Info (Left) + Status & Button (Right) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Left: Dentist */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-200 shrink-0">
                    {dentist?.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{dentist?.name ?? "Unknown Dentist"}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-100">
                      {dentist?.expertise ?? "General Dentistry"}
                    </span>
                  </div>
                </div>

                {/* Right: Status Badge & Edit Button - จับมัดรวมกันไม่ให้ทับ */}
                <div className="flex items-center w-full sm:w-auto justify-end gap-2">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${statusBadge.color} ${statusBadge.bg} ${statusBadge.border}`}>
                    <span className="mr-1.5 text-sm">{statusBadge.icon}</span>
                    {statusBadge.label}
                  </div>

                  <button 
                    onClick={() => handleNavigate(appt._id)}
                    disabled={isNavigating}
                    title="Edit/View Details"
                    className={`p-2 rounded-xl transition-all border flex items-center justify-center w-[38px] h-[38px]
                      ${isNavigating 
                        ? "bg-blue-50 border-blue-200 text-blue-600 opacity-70 cursor-wait" 
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-100 hover:border-blue-200"}`}
                  >
                    {isNavigating ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Patient Info (Admin/Dentist only) */}
              {showPatientInfo && patient && (
                <div className="px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest sm:mr-2">Patient</p>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-slate-700 font-semibold text-sm">{patient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="text-slate-700 font-semibold text-sm">{patient.phone}</span>
                  </div>
                </div>
              )}
              
              {/* Date & Time Info */}
              <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {new Date(appt.apptDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {new Date(appt.apptDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' })}
                </div>
              </div>

              {/* Status Control Integration */}
              <AppointmentStatusControl 
                apptId={appt._id} 
                currentStatus={status} 
                isAdmin={isAdmin}
                onStatusUpdated={(newStatus) => handleStatusUpdated(appt._id, newStatus)} 
              />
              
            </div>
          </div>
        )
      })}
    </div>
  )
}