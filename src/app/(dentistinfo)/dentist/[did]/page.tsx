// import { Suspense } from "react";
// import BookingContent from "@/components/BookingContent";
// import getDentist from "@/libs/getDentist";

// export default async function Booking({ params }: { params: { did: string } }) {
//   const dentist = await getDentist(params.did); // getDentist return DentistItem ตรงๆ แล้ว

//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <BookingContent did={params.did} dentist={dentist} />
//     </Suspense>
//   );
// }