"use client"

interface RecordFilterProps {
  filterDate: string; setFilterDate: (d: string) => void;
  searchName: string; setSearchName: (n: string) => void;
  sortOrder: string; setSortOrder: (s: string) => void;
  role: string;
}

export default function RecordFilter({ filterDate, setFilterDate, searchName, setSearchName, sortOrder, setSortOrder, role }: RecordFilterProps) {
  // Placeholder ตาม Role
  const searchPlaceholder = role === "user" ? "Search Dentist Name..." : role === "dentist" ? "Search Patient Name..." : "Search Patient or Dentist...";

  const handleClear = () => {
    setFilterDate("");
    setSearchName("");
    setSortOrder("-createdAt");
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        Search & Filter Records
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Search Name</label>
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-700 font-medium placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-700 font-medium [color-scheme:light]"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sort</label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-700 font-medium"
            >
              <option value="-apptDate">Newest First</option>
              <option value="apptDate">Oldest First</option>
            </select>
          </div>
          
          <button 
            onClick={handleClear}
            className="px-5 py-3 h-[50px] text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors flex items-center justify-center"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}