"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useSession } from "next-auth/react";
import { DentistItem } from "../../interface";
import LoginPrompt from "./LoginPrompt";
import { LinearProgress } from "@mui/material";
import createAppt from "@/libs/createAppointment"; 

export default function BookingContent({
  did,
  dentist,
}: {
  did: string;
  dentist: DentistItem;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [apptDate, setApptDate] = useState<Dayjs | null>(null);
  const [hour, setHour] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedDate = sessionStorage.getItem("savedApptDate");
    const savedHour = sessionStorage.getItem("savedApptHour");
    if (savedDate) setApptDate(dayjs(savedDate));
    if (savedHour) setHour(savedHour);
  }, []);

  if (status === "loading") {
    return <div className="max-w-md mx-auto mt-20"><LinearProgress /></div>;
  }

  if (status === "unauthenticated" || !session) {
    return <LoginPrompt />;
  }

  const workStart = dentist.workingHours?.start ?? 9;
  const workEnd = dentist.workingHours?.end ?? 17;
  const hourOptions = [];
  for (let i = workStart; i < workEnd; i++) {
    hourOptions.push(i);
  }

  const handleChangeDentist = () => {
    if (apptDate) sessionStorage.setItem("savedApptDate", apptDate.toISOString());
    if (hour) sessionStorage.setItem("savedApptHour", hour);
    router.push("/dentist");
  };

  const handleBooking = async () => {
    if (!apptDate || hour === "") {
      alert("Please select both date and time.");
      return;
    }

    setIsLoading(true);
    try {
      const finalDateTime = apptDate
        .set("hour", Number(hour))
        .set("minute", 0)
        .set("second", 0)
        .subtract(7, "hour")
        .format("YYYY-MM-DDTHH:mm:ss");

      console.log("Sending Date to Backend:", finalDateTime);

      const token = (session as any)?.user?.accessToken; 

      if (!token) {
        alert("Authentication error: No token found.");
        return;
      }

      const result = await createAppt(did, finalDateTime, token);

      if (result.success) {
        alert("Booking Successful!");
        sessionStorage.removeItem("savedApptDate");
        sessionStorage.removeItem("savedApptHour");
        router.push("/viewappt"); 
      } else {
        alert(`Failed to book: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">Make an Appointment</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
        
        <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-blue-500 w-full md:w-1/3 flex flex-col justify-between h-fit">
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {dentist.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{dentist.name}</h2>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-semibold text-slate-700">Experience:</span> {dentist.experience} years</p>
              <p><span className="font-semibold text-slate-700">Expertise:</span> {dentist.expertise}</p>
              <p>
                <span className="font-semibold text-slate-700">Working Hours:</span>{" "}
                {workStart.toString().padStart(2, "0")}:00 - {workEnd.toString().padStart(2, "0")}:00
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleChangeDentist}
            className="mt-6 w-full text-blue-600 border border-blue-200 hover:bg-blue-50 font-semibold py-2 rounded-lg transition-colors"
          >
            Change Dentist
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-md w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-2">Select Date & Time</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment Date</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  className="w-full bg-slate-50"
                  value={apptDate}
                  onChange={(newValue) => setApptDate(newValue)}
                  disablePast
                />
              </LocalizationProvider>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Time (Hour)</label>
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              >
                <option value="" disabled>-- Choose Time --</option>
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}:00 - {(h + 1).toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleBooking}
              disabled={isLoading || !apptDate || hour === ""}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all mt-4
                ${isLoading || !apptDate || hour === "" 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"}`}
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}