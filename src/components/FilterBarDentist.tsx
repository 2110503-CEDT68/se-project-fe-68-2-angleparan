"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, FormEvent } from "react"

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [expertise, setExpertise] = useState(searchParams.get("expertise") || "")
  const [minExperience, setMinExperience] = useState(searchParams.get("experience[gte]") || "")
  const [startHour, setStartHour] = useState(searchParams.get("start") || "")
  const [endHour, setEndHour] = useState(searchParams.get("end") || "")
  const [sort, setSort] = useState(searchParams.get("sort") || "")

  const handleFilter = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()

    if (expertise) params.append("expertise", expertise)
    if (minExperience) params.append("experience[gte]", minExperience)
    if (startHour) params.append("start", startHour)
    if (endHour) params.append("end", endHour)
    if (sort) params.append("sort", sort)

    router.push(`/dentist?${params.toString()}`)
  }

  const handleClear = () => {
    setExpertise("")
    setMinExperience("")
    setStartHour("")
    setEndHour("")
    setSort("")
    router.push(`/dentist`)
  }

  return (
    <form onSubmit={handleFilter} className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-500 mb-8 w-full max-w-6xl mx-auto flex flex-wrap gap-4 items-end transition-all">
      
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-semibold text-blue-900 mb-1">Expertise</label>
        <select value={expertise} onChange={(e) => setExpertise(e.target.value)} className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-blue-50">
          <option value="">All Expertise</option>
          <option value="General Dentistry">General Dentistry</option>
          <option value="Pediatric Dentistry">Pediatric Dentistry</option>
          <option value="Orthodontics">Orthodontics</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-semibold text-blue-900 mb-1">Min Exp. (Years)</label>
        <input type="number" min="0" value={minExperience} onChange={(e) => setMinExperience(e.target.value)} className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-blue-50" placeholder="e.g. 3" />
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-semibold text-blue-900 mb-1">Start Hour</label>
        <input type="number" min="0" max="23" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-blue-50" placeholder="e.g. 9" />
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-semibold text-blue-900 mb-1">End Hour</label>
        <input type="number" min="0" max="23" value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-blue-50" placeholder="e.g. 17" />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-semibold text-blue-900 mb-1">Sort By</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-blue-50">
          <option value="">Default</option>
          <option value="experience">Experience (Low - High)</option>
          <option value="-experience">Experience (High - Low)</option>
        </select>
      </div>

      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-colors w-full md:w-auto">
          Filter
        </button>
        <button type="button" onClick={handleClear} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-md shadow-sm transition-colors w-full md:w-auto">
          Clear
        </button>
      </div>
    </form>
  )
}