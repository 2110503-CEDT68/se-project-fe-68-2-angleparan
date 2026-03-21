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
      <h1 className="text-xl font-medium">Dentist Booking</h1>

      {/* Card หมอ */}
      <div className="bg-gray-100 rounded-lg p-5 mt-4 w-80 shadow">
        <h2 className="text-lg font-semibold">{dentist.name}</h2>
        <p className="text-sm text-gray-600">Experience : {dentist.experience} year</p>
        <p className="text-sm text-gray-600">Expertise : {dentist.expertise}</p>
      </div>

      <div className="w-fit space-y-5 my-10 flex flex-col">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className="bg-white w-full"
            value={apptDate}
            onChange={(newValue) => setApptDate(newValue)}
          />
        </LocalizationProvider>

        <Button
          variant="contained"
          className="bg-blue-500 hover:bg-blue-700 w-full mt-5"
          onClick={handleApptVenue}
        >
          Book Dentist
        </Button>
      </div>
    </main>
  );
}