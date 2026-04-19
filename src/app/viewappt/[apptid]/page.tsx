import getSingleAppointment from "@/libs/getSingleAppointment";
import getDentist from "@/libs/getDentist";
import EditBookingContent from "@/components/EditBookingContent";
import RatingForm from "@/components/RatingForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export default async function EditApptPage({
  params,
  searchParams,
}: {
  params: Promise<{ apptid: string }>;
  searchParams: Promise<{ newDid?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const apptId = resolvedParams.apptid;
  
  const session = await getServerSession(authOptions);
  const token = (session as any)?.user?.accessToken || (session as any)?.accessToken;

  if (!token) {
    return (
      <div className="text-center mt-20 text-xl font-bold text-red-600">
        Unauthorized. Please login.
      </div>
    );
  }

  const apptRes = await getSingleAppointment(apptId, token);
  
  if (!apptRes || !apptRes.data) {
    return (
      <div className="text-center mt-20 text-xl font-bold">
        Appointment Not Found
      </div>
    );
  }
  
  const appointment = apptRes.data;

  const targetDentistId = resolvedSearchParams.newDid 
    ? resolvedSearchParams.newDid 
    : (appointment.dentist as any)?._id || appointment.dentist;
  
  const dentist = await getDentist(targetDentistId);

  // วันที่นัดหมาย
  const apptDate = new Date(appointment.apptDate).toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="bg-slate-50 min-h-screen py-10 pb-20">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        {/* ── Appointment info card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
              {dentist.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Appointment with</p>
              <h1 className="text-xl font-extrabold text-slate-800">{dentist.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span>{apptDate}</span>
          </div>

          {/* ── Rating form (เพิ่ม rating ให้หมอคนนี้ได้ที่นี่) ── */}
          <RatingForm dentistId={targetDentistId} dentistName={dentist.name} />
        </div>

        {/* ── Edit booking section ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EditBookingContent 
            apptId={apptId} 
            currentDentist={dentist} 
            initialDate={appointment.apptDate} 
          />
        </div>

      </div>
    </main>
  );
}
