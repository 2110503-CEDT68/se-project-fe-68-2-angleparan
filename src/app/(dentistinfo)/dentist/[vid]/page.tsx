import { Suspense } from "react";
import BookingContent from "@/components/BookingContent";
import getDentist from "@/libs/getDentist";

export default async function Booking({ params }: { params: { vid: string } }) {
  const dentist = await getDentist(params.vid); // getDentist return DentistItem ตรงๆ แล้ว

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent did={params.vid} dentist={dentist} />
    </Suspense>
  );
}