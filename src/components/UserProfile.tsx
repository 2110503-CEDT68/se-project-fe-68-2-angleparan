"use client"

import { useSession } from "next-auth/react"

export default function UserProfile() {
  const { data: session } = useSession()
  const user = session?.user

  if (!user) return null

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200 rounded-3xl overflow-hidden relative">
      <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500"></div>
      
      <div className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Patient Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
            <p className="text-sm text-slate-500 font-semibold mb-1">Name</p>
            <p className="text-slate-900 font-bold text-lg">{user.name}</p>
          </div>
          
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
            <p className="text-sm text-slate-500 font-semibold mb-1">Email</p>
            <p className="text-slate-900 font-bold text-lg truncate" title={user.email}>{user.email}</p>
          </div>

          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
            <p className="text-sm text-slate-500 font-semibold mb-1">Phone</p>
            <p className="text-slate-900 font-bold text-lg">{user.phone}</p>
          </div>
        </div>
      </div>
    </div>
  )
}