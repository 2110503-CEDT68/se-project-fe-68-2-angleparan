"use client"

interface AdminFilterProps {
  filterDate: string
  setFilterDate: (date: string) => void
}

export default function ApptFilter({ filterDate, setFilterDate }: AdminFilterProps) {
  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200 rounded-3xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filter Appointments
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-end">
        <div className="w-full sm:flex-1 max-w-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium"
          />
        </div>
        
        <button 
          onClick={() => setFilterDate("")}
          className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors flex items-center justify-center gap-2 h-[50px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          Clear Filter
        </button>
      </div>
    </div>
  )
}