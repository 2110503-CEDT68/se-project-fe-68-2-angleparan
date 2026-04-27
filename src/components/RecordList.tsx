"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import getRecords from "@/libs/getRecords"
import deleteRecord from "@/libs/deleteRecord"
import updateRecord from "@/libs/updateRecord"
import { RecordItem } from "../../interface" 
import RatingForm from "@/components/RatingForm";


interface RecordListProps {
  filterDate: string;
  searchName: string;
  sortOrder: string;
  role: string;
}

export default function RecordList({ filterDate, searchName, sortOrder, role }: RecordListProps) {
  const { data: session } = useSession();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับจัดการ UI ยืด/หด และฟอร์ม Edit
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [openRatingId, setOpenRatingId] = useState<string | null>(null);


  

  const fetchData = async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      let queryStr = `?sort=${sortOrder}`;
      if (filterDate) queryStr += `&apptDate=${filterDate}`;
      
      const res = await getRecords(session.accessToken, queryStr);
      let fetchedData: RecordItem[] = res.data;

      if (searchName.trim()) {
        const query = searchName.toLowerCase();
        fetchedData = fetchedData.filter((rec: RecordItem) => {
          const pName = rec.user?.name?.toLowerCase() || "";
          const dName = rec.dentist?.name?.toLowerCase() || "";
          return pName.includes(query) || dName.includes(query);
        });
      }

      setRecords(fetchedData);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.accessToken, filterDate, searchName, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!session?.accessToken) return;
    if (!confirm("Are you sure you want to delete this record permanently?")) return;
    try {
      await deleteRecord(id, session.accessToken);
      setRecords((prev) => prev.filter((r) => r._id !== id));
      alert("Record deleted successfully");
    } catch (err) {
      alert("Failed to delete record");
    }
  };

  const handleSaveEdit = async (id: string, status: string) => {
    if (!session?.accessToken) return;
    try {
      // แยกว่าจะอัปเดตฟิลด์ไหนตาม Status
      const body = status === 'cancelled' 
        ? { cancelReason: editValue } 
        : { treatmentDetails: editValue };

      const res = await updateRecord(id, session.accessToken, body);
      
      // อัปเดต UI 
      setRecords((prev) => prev.map((rec) => 
        rec._id === id ? { ...rec, ...body, updatedAt: res.data?.updatedAt || new Date().toISOString() } : rec
      ));
      
      setEditingId(null);
    } catch (err) {
      alert("Failed to update record");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
    // หากปิด Accordion ให้ยกเลิกการ Edit ด้วย
    if (editingId === id) setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-blue-500">
        <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-500 font-medium text-lg">No records found.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-500 border-red-200';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <div className="space-y-5">
      {records.map((rec) => {
        const dentist = rec.dentist;
        const patient = rec.user;
        const createdDate = new Date(rec.updatedAt || rec.createdAt);
        const apptDateObj = rec.apptDate ? new Date(rec.apptDate) : null;

        const isExpanded = expandedIds.includes(rec._id);
        const isEditing = editingId === rec._id;

        // เช็คสิทธิ์การแก้ไข
        const canEditTreatment = (role === "admin" || role === "dentist") && rec.status === "completed";
        const canEditReason = (role === "admin" || role === "dentist" || role === "user") && rec.status === "cancelled";
        const canEdit = canEditTreatment || canEditReason;

        return (
          <div key={rec._id} className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 px-6 pt-6 pb-3 flex flex-col gap-4">
            
            {/* Header: Profile & Status */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 shrink-0">
                  {dentist?.name?.charAt(0) || "D"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{dentist?.name || "Unknown Dentist"}</h3>
                  <p className="text-xs text-slate-500">{dentist?.expertise || "General Dentistry"}</p>
                </div>
                
                {(role === "admin" || role === "dentist") && patient && (
                  <>
                    <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2"></div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <h3 className="font-bold text-slate-700 text-sm">Patient: {patient.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(rec.status)}`}>
                  {rec.status}
                </span>
                {apptDateObj && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span>
                      {apptDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {apptDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable Body: Details / Reason */}
            {isExpanded && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {rec.status === 'cancelled' ? (
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Cancellation Reason</p>
                      {canEdit && !isEditing && (
                        <button onClick={() => { setEditingId(rec._id); setEditValue(rec.cancelReason || ""); }} className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full text-slate-900 bg-white text-sm p-2 rounded-lg border-red-200 focus:border-red-400 focus:ring focus:ring-red-200 outline-none transition-all" rows={3} placeholder="Enter cancellation reason..." />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-md">Cancel</button>
                          <button onClick={() => handleSaveEdit(rec._id, rec.status)} className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-sm whitespace-pre-wrap">{rec.cancelReason || "No reason provided."}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Treatment Details</p>
                      {canEdit && !isEditing && (
                        <button onClick={() => { setEditingId(rec._id); setEditValue(rec.treatmentDetails || ""); }} className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full text-slate-900 bg-white text-sm p-2 rounded-lg border-emerald-200 focus:border-emerald-400 focus:ring focus:ring-emerald-200 outline-none transition-all" rows={3} placeholder="Enter treatment details..." />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-md">Cancel</button>
                          <button onClick={() => handleSaveEdit(rec._id, rec.status)} className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-sm whitespace-pre-wrap">{rec.treatmentDetails || "No details provided."}</p>
                    )}
                  </div>
                )}

                {/* Footer: Date & Delete (ย้ายมาอยู่ในส่วนที่ขยายออกมาเพื่อให้ข้างนอกดูคลีนๆ) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M15 16l2 2 4-4"/></svg>
                    Record updated: {createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute:'2-digit' })}
                  </div>
                  <div className="flex row gap-1.5">
                  {rec.status === "completed" && (
                    <button
                      onClick={() => setOpenRatingId(rec._id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors text-xs font-medium w-full sm:w-auto"
                    >
                      Review
                    </button>
                  )}
                  {role === "admin" && (
                    <button 
                      onClick={() => handleDelete(rec._id)} 
                      title="Delete Record" 
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-xs font-medium w-full sm:w-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      Delete
                    </button>
                  )}
                  </div>
                </div>
              </div>
            )}

            {/* ลูกศรชี้ลง/ขึ้น ตรงกลางด้านล่างสุด */}
            <div className="flex justify-center border-t border-slate-50 pt-2 mt-1">
              <button 
                onClick={() => toggleExpand(rec._id)} 
                className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                title={isExpanded ? "Collapse Details" : "Expand Details"}
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                )}
              </button>
            </div>

            

            {openRatingId === rec._id && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                onClick={() => setOpenRatingId(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative"
                >
                  {/* ปุ่มปิด */}
                  <button
                    onClick={() => setOpenRatingId(null)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>

                  {/* RatingForm */}
                  <RatingForm
                    dentistId={
                      (typeof rec.dentist === "object"
                        ? rec.dentist._id
                        : rec.dentist) || ""
                    }
                    dentistName={
                      typeof rec.dentist === "object"
                        ? rec.dentist.name
                        : "Unknown Dentist"
                    }
                    appointmentStatus={rec.status}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}