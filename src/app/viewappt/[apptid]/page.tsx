import getSingleAppointment from "@/libs/getSingleAppointment";
import getDentist from "@/libs/getDentist";
import EditBookingContent from "@/components/EditBookingContent";
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
    return <div className="text-center mt-20 text-xl font-bold text-red-600">Unauthorized. Please login.</div>;
  }

  const apptRes = await getSingleAppointment(apptId, token);
  
  if (!apptRes || !apptRes.data) {
    return <div className="text-center mt-20 text-xl font-bold">Appointment Not Found</div>;
  }
  
  const appointment = apptRes.data;

  const targetDentistId = resolvedSearchParams.newDid 
    ? resolvedSearchParams.newDid 
    : appointment.dentist._id || appointment.dentist;
  
  const dentistRes = await getDentist(targetDentistId);
  const dentist = dentistRes;

  return (
    <main className="bg-slate-50 min-h-screen py-10">
      <EditBookingContent 
        apptId={apptId} 
        currentDentist={dentist} 
        initialDate={appointment.apptDate} 
      />
    </main>
  );
}