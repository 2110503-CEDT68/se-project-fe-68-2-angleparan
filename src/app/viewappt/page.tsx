"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import ApptList from "@/components/ApptList"
import UserProfile from "@/components/UserProfile"
import ApptFilter from "@/components/ApptFilter"
import LoginPrompt from "@/components/LoginPrompt"

export default function ViewApptPage() {
    const { data: session, status } = useSession()
    const [filterDate, setFilterDate] = useState<string>("")

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-blue-600 font-semibold animate-pulse">Loading data...</span>
                </div>
            </div>
        )
    }

    if (!session) {
        return <LoginPrompt />
    }

    const role = session.user.role;
    const isAdmin = role === "admin";
    const isDentist = role === "dentist";

    return (
        <main className="py-12 flex flex-col items-center bg-slate-50 min-h-screen">
            <div className="w-full max-w-5xl px-4 md:px-6 space-y-8">
                
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {isAdmin ? "Appointment Management" : isDentist ? "Dentist Dashboard" : "My Appointments"}
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg">
                        {isAdmin ? "Manage all patient bookings and schedules." 
                         : isDentist ? "View your profile and manage your upcoming patient appointments." 
                         : "View and manage your upcoming dental visits."}
                    </p>
                </div>

                {/* การแสดงผลส่วนหัวตาม Role */}
                {isAdmin ? (
                    <ApptFilter filterDate={filterDate} setFilterDate={setFilterDate} />
                ) : isDentist ? (
                    <>
                        <UserProfile />
                        <ApptFilter filterDate={filterDate} setFilterDate={setFilterDate} />
                    </>
                ) : (
                    <UserProfile />
                )}

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {isAdmin || isDentist ? "All Appointments" : "Your Schedule"}
                        </h2>
                    </div>
                    
                    <ApptList filterDate={filterDate} isAdmin={isAdmin} />
                </div>
            </div>
        </main>
    )
}