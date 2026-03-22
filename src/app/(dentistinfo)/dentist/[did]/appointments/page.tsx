import { Suspense } from "react";
import BookingContent from "@/components/BookingContent";
import getDentist from "@/libs/getDentist";
import { LinearProgress } from "@mui/material";

export default async function AppointmentsPage({ params }: { params: Promise<{ did: string }> }) {
  const resolvedParams = await params;

  const dentistResponse = await getDentist(resolvedParams.did);

  const dentist = dentistResponse;

  return (
    <main className="bg-slate-50 min-h-screen py-10">
      <Suspense fallback={<div className="max-w-md mx-auto mt-20"><LinearProgress /></div>}>
        <BookingContent did={resolvedParams.did} dentist={dentist} />
      </Suspense>
    </main>
  );
}