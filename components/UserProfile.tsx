"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import getUserProfile from "@/libs/getUserProfile"
import updateUserProfile from "@/libs/updateUserProfile"
import { DentistItem, UserItem } from "../../interface"

// เพิ่ม Interface รับ targetId
interface UserProfileProps {
  targetId?: string;
}

export default function UserProfile({ targetId }: UserProfileProps) {
  const { data: session } = useSession()
  const user = session?.user as UserItem
  
  const [dentistInfo, setDentistInfo] = useState<DentistItem | null>(null)
  // เพิ่ม State สำหรับเก็บข้อมูลพื้นฐานของเป้าหมาย (ป้องกันการแสดงผลอีเมล/ชื่อของ Admin)
  const [targetUserBaseInfo, setTargetUserBaseInfo] = useState<{name: string, email: string, phone: string} | null>(null)
  const [loading, setLoading] = useState(false)

  // -- States สำหรับ Modal --
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null)

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    expertise: "",
    experience: 0,
    workingHoursStart: 9,
    workingHoursEnd: 17,
  })

  // กำหนด ID ที่จะดึงข้อมูล ถ้ามี targetId แสดงว่าดึงของหมอเป้าหมาย ถ้าไม่มีดึงของตัวเอง
  const userIdToFetch = targetId || user?._id;
  // บังคับให้เป็น Dentist Mode หากกำลังดู Profile ของเป้าหมาย (targetId)
  const isDentistMode = targetId ? true : user?.role === "dentist";

  const fetchProfileData = async () => {
    if (!session?.accessToken || !userIdToFetch) return;
    setLoading(true)
    try {
      const userProfileRes = await getUserProfile(session.accessToken, userIdToFetch)
      
      if (userProfileRes.success) {
        if (userProfileRes.data.dentistProfile) {
          const dProfile = userProfileRes.data.dentistProfile;
          setDentistInfo(dProfile)
          setProfileForm(prev => ({
            ...prev,
            expertise: dProfile.expertise || "",
            experience: dProfile.experience || 0,
            workingHoursStart: dProfile.workingHours?.start || 9,
            workingHoursEnd: dProfile.workingHours?.end || 17,
          }))
        }
        
        // เก็บข้อมูล User พื้นฐานที่ดึงมาจาก API
        setTargetUserBaseInfo({
            name: userProfileRes.data.name || "",
            email: userProfileRes.data.email || "",
            phone: userProfileRes.data.phone || ""
        })

        setProfileForm(prev => ({
          ...prev,
          name: userProfileRes.data.name || "",
          phone: userProfileRes.data.phone || "",
        }))
      }
    } catch (error) {
      console.error("Error fetching profile info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [userIdToFetch, session?.accessToken])

  const openModal = () => {
    setFeedbackMsg(null)
    setIsModalOpen(true)
  }
  
  const closeModal = () => {
    setFeedbackMsg(null)
    setIsModalOpen(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackMsg(null)

    if (!session?.accessToken) {
      setFeedbackMsg({ text: "Session expired. Please log in again.", isError: true });
      return;
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name: profileForm.name,
        phone: profileForm.phone,
      }

      if (isDentistMode) {
        payload.expertise = profileForm.expertise
        payload.experience = profileForm.experience
        payload.workingHours = {
          start: profileForm.workingHoursStart,
          end: profileForm.workingHoursEnd
        }
      }

      // ใช้ userIdToFetch ในการอัปเดต เพื่อให้ Admin แก้ของหมอได้
      const data = await updateUserProfile(session.accessToken as string, userIdToFetch, payload)

      if (data.success) {
        setFeedbackMsg({ text: "Profile updated successfully!", isError: false });
        fetchProfileData();
        
        setTimeout(() => {
          closeModal();
          setIsSubmitting(false);
        }, 1500);

      } else {
        setFeedbackMsg({ text: `Failed to update: ${data.message || "Unknown error"}`, isError: true });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error)
      setFeedbackMsg({ text: "An error occurred while updating. Please try again.", isError: true });
      setIsSubmitting(false);
    }
  }

  if (!user && !targetId) return null

  // ส่วนแสดงผลด้านล่าง ให้แก้ไขตัวแปรที่แสดงข้อมูลจาก user เป็น targetUserBaseInfo ให้หมด 
  // เช่น {targetUserBaseInfo?.email} แทน {user.email}

  return (
    <>
      <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200 rounded-3xl overflow-hidden relative">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500"></div>
        
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {isDentistMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              {isDentistMode ? "Dentist Profile" : "Patient Profile"}
            </h2>
            
            <button 
              onClick={openModal}
              className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-sm font-semibold rounded-xl transition-colors border border-slate-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Edit Profile
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-4">
              <span className="text-blue-500 text-sm font-medium animate-pulse">Loading profile data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <p className="text-sm text-slate-500 font-semibold mb-1">Name</p>
                <p className="text-slate-900 font-bold text-lg">{dentistInfo?.name || targetUserBaseInfo?.name}</p>
              </div>
              
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <p className="text-sm text-slate-500 font-semibold mb-1">Email</p>
                <p className="text-slate-900 font-bold text-lg truncate" title={targetUserBaseInfo?.email}>{targetUserBaseInfo?.email}</p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <p className="text-sm text-slate-500 font-semibold mb-1">Phone</p>
                <p className="text-slate-900 font-bold text-lg">{targetUserBaseInfo?.phone}</p>
              </div>

              {isDentistMode && dentistInfo && (
                <>
                  <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Expertise</p>
                    <p className="text-slate-900 font-bold text-lg">{dentistInfo.expertise}</p>
                  </div>
                  <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Experience</p>
                    <p className="text-slate-900 font-bold text-lg">{dentistInfo.experience} Years</p>
                  </div>
                  {dentistInfo.workingHours && (
                  <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Working Hours</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {String(dentistInfo.workingHours.start).padStart(2, '0')}:00 - {String(dentistInfo.workingHours.end).padStart(2, '0')}:00
                    </p>
                  </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Popup Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Edit Profile</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {feedbackMsg && (
                <div className={`p-4 mb-5 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
                  feedbackMsg.isError 
                    ? "bg-red-50 text-red-600 border-red-200" 
                    : "bg-green-50 text-green-600 border-green-200"
                }`}>
                  {feedbackMsg.isError ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  )}
                  {feedbackMsg.text}
                </div>
              )}

              <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(Read-only)</span></label>
                  <input type="email" disabled value={user.email} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" required value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>

                {isDentistMode && (
                  <>
                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Expertise</label>
                      <input type="text" value={profileForm.expertise} onChange={e => setProfileForm({...profileForm, expertise: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Experience (Years)</label>
                        <input type="number" min="0" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Working Hours</label>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" max="23" value={profileForm.workingHoursStart} onChange={e => setProfileForm({...profileForm, workingHoursStart: Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-center outline-none" />
                          <span className="text-slate-400">-</span>
                          <input type="number" min="0" max="23" value={profileForm.workingHoursEnd} onChange={e => setProfileForm({...profileForm, workingHoursEnd: Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-center outline-none" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                form="profile-form"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}