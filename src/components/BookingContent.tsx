"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addappt } from "@/redux/features/apptSlice";
import { useSession } from "next-auth/react";
import { DentistItem } from "../../interface";

export default function BookingContent({
  did,
  dentist,
}: {
  did: string;
  dentist: DentistItem;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const userId = session?.user?._id;

  const [apptDate, setApptDate] = useState<Dayjs | null>(null);

  const handleApptVenue = () => {
    if (apptDate && did && userId) {
      dispatch(addappt({
        _id: Date.now().toString(),
        dentist: did,
        user: userId,
        apptDate: apptDate.format("YYYY-MM-DD"),
      }));
      alert("Booking Successful!");
    }
  };

  return (
    <main className="w-full flex flex-col items-center pt-10">
      <h1 className="text-5xl font-bold">Make an Appointment</h1>

      {/* Card หมอ */}
      <div className="bg-blue-100 rounded-lg p-5 mt-10 w-80 shadow border-2 border-blue-400" >
        <h2 className="text-xl font-semibold">{dentist.name}</h2>
        <p className="text-md text-gray-600">Experience : {dentist.experience} year</p>
        <p className="text-md text-gray-600">Expertise : {dentist.expertise}</p>
      </div>

      <div className="w-fit space-y-3 my-10 flex flex-col ">

        <p>please select date</p>

        <div className="w-full mb-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className="bg-white w-full"
            value={apptDate}
            onChange={(newValue) => setApptDate(newValue)}
          />
        </LocalizationProvider>
      </div>

      <Button
        variant="contained"
        className="bg-blue-500 hover:bg-blue-700 w-full"
        onClick={handleApptVenue}
      >
        Book Dentist
      </Button>
      </div>
    </main>
  );
}