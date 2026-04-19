"use client"
import { ReactNode } from "react"

export default function InteractiveCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-[280px] bg-white rounded-2xl transition-all duration-300 ease-in-out
      border border-slate-100 shadow-sm 
      hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
    >
      {children}
    </div>
  )
}