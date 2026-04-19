"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import ApptList from "@/components/ApptList"
import UserProfile from "@/components/UserProfile"
import ApptFilter from "@/components/ApptFilter"
import LoginPrompt from "@/components/LoginPrompt"
import RatingSection from "@/components/RatingSection"
import getRatings from "@/libs/getRatings"
import getUserProfile from "@/libs/getUserProfile"

export default function ViewApptPage() {
    const { data: session, status } = useSession()
    const [filterDate, setFilterDate] = useState<string>("")
    
    // State สำหรับเก็บค่าเฉลี่ยดาว, จำนวนรีวิว และ Dentist ID จริงๆ
    const [avgRating, setAvgRating] = useState<number>(0)
    const [ratingCount, setRatingCount] = useState<number>(0)
    const [actualDentistId, setActualDentistId] = useState<string>("")
    
    // State สำหรับควบคุม Tab ของหมอ (สลับระหว่าง Appt List กับ Reviews)
    const [activeTab, setActiveTab] = useState<"appointments" | "reviews">("appointments")

    useEffect(() => {
        const fetchDentistData = async () => {
            const userId = (session?.user as any)?.id || (session?.user as any)?._id;
            const token = (session?.user as any)?.accessToken || (session?.user as any)?.token;
            
            if (session?.user?.role === "dentist" && userId && token) {
                try {
                    // 1. ดึงข้อมูล User Profile เพื่อเอา Dentist ID 
                    const userRes = await getUserProfile(token, userId);
                    const userData = userRes.data || userRes;
                    const dId = userData?.dentistProfile?._id || userData?.dentistProfile?.id;

                    if (dId) {
                        setActualDentistId(dId);

                        // 2. ดึงข้อมูล Rating ตาม Dentist ID จริงๆ
                        const ratingsRes = await getRatings(dId);
                        if (ratingsRes && ratingsRes.count > 0) {
                            setRatingCount(ratingsRes.count);
                            const avg = ratingsRes.data.reduce((sum: any, r: any) => sum + r.rating, 0) / ratingsRes.count;
                            setAvgRating(avg);
                        }
                    } else {
                        console.warn("User is a dentist but no dentistProfile found in DB.");
                    }
                } catch (error) {
                    console.error("Failed to fetch dentist data/ratings:", error);
                }
            }
        };

        if (status === "authenticated") {
            fetchDentistData();
        }
    }, [session, status]);

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

    // ฟังก์ชันวาดดาว
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
        <main className="py-12 flex flex-col items-center bg-slate-50 min-h-screen">
            <div className="w-full max-w-5xl px-4 md:px-6 space-y-8">
                
                {/* ── Header Section ── */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {isAdmin ? "Appointment Management" : isDentist ? "Dentist Dashboard" : "My Appointments"}
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg">
                        {isAdmin ? "Manage all patient bookings and schedules." 
                         : isDentist ? "View your profile, ratings, and manage your upcoming patient appointments." 
                         : "View and manage your upcoming dental visits."}
                    </p>

                    {/* ป้ายแสดงดาวโผล่มาเฉพาะเมื่อเป็นหมอและมีรีวิว */}
                    {isDentist && ratingCount > 0 && (
                        <div className="flex items-center justify-center gap-1.5 mt-4 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 inline-flex">
                            <span className="flex gap-0.5">{renderStars(avgRating)}</span>
                            <span className="text-slate-800 font-bold">{avgRating.toFixed(1)}</span>
                            <span className="text-slate-500 text-sm">({ratingCount} review{ratingCount > 1 ? "s" : ""})</span>
                        </div>
                    )}
                </div>

                {/* แสดง UserProfile สำหรับผู้ใช้หรือหมอ (แอดมินไม่ต้องเห็น) */}
                {!isAdmin && <UserProfile />}

                {/* ── Tabs สำหรับหน้า Dashboard ของหมอเท่านั้น ── */}
                {isDentist && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-slate-200/60 p-1.5 rounded-2xl inline-flex gap-1 border border-slate-200/50 shadow-inner">
                            <button
                                onClick={() => setActiveTab("appointments")}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                    activeTab === "appointments"
                                        ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                            >
                                Appointments
                            </button>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                    activeTab === "reviews"
                                        ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                            >
                                Patient Reviews
                            </button>
                        </div>
                    </div>
                )}

                {/* ── ส่วนแสดงผล: Appointments (สำหรับ Admin, Patient หรือ Dentist ที่เลือกแท็บ Appointments) ── */}
                {(!isDentist || activeTab === "appointments") && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        
                        {/* Filter อยู่ติดกับ Appt List (Admin และ Dentist ได้เห็น) */}
                        {(isAdmin || isDentist) && (
                            <ApptFilter filterDate={filterDate} setFilterDate={setFilterDate} />
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
                )}

                {/* ── ส่วนแสดงผล: Reviews (สำหรับ Dentist ที่เลือกแท็บ Reviews เท่านั้น) ── */}
                {isDentist && activeTab === "reviews" && actualDentistId && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                            Patient Reviews
                        </h2>
                        {/* ส่ง isDashboard เพื่อให้คอมโพเนนต์ซ่อนส่วนเขียนรีวิว */}
                        <RatingSection dentistId={actualDentistId} isDashboard={true} />
                    </div>
                )}

            </div>
        </main>
    )
}