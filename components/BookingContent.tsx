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
import { LinearProgress, CircularProgress } from "@mui/material";
import createAppt from "@/libs/createAppointment";
import getAvailability from "@/libs/getAvailability"; // Import ที่สร้างมาใหม่

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
  
  const [bookedHours, setBookedHours] = useState<number[]>([]);
  const [isFetchingHours, setIsFetchingHours] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const workStart = dentist.workingHours?.start ?? 9;
  const workEnd = dentist.workingHours?.end ?? 17;
  const hourOptions = [];
  for (let i = workStart; i < workEnd; i++) {
    hourOptions.push(i);
  }

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!apptDate) return;
      
      setIsFetchingHours(true);
      setHour(""); 
      setFeedbackMsg(null);

      try {
        const formattedDate = apptDate.format("YYYY-MM-DD");
        const data = await getAvailability(did, formattedDate);
        setBookedHours(data);
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setIsFetchingHours(false);
      }
    };

    fetchAvailability();
  }, [apptDate, did]);

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

  const handleChangeDentist = () => {
    if (apptDate) sessionStorage.setItem("savedApptDate", apptDate.toISOString());
    if (hour) sessionStorage.setItem("savedApptHour", hour);
    router.push("/dentist");
  };

  const handleHourSelect = (selectedHour: string) => {
    setHour(selectedHour);
    setFeedbackMsg(null);
  };

  const handleBooking = async () => {
    setFeedbackMsg(null);

    if (!apptDate || hour === "") {
      setFeedbackMsg({ text: "Please select both date and time.", isError: true });
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

      const token = (session as any)?.user?.accessToken; 

      if (!token) {
        setFeedbackMsg({ text: "Authentication error: No token found.", isError: true });
        setIsLoading(false);
        return;
      }

      const result = await createAppt(did, finalDateTime, token);

      if (result.success) {
        setFeedbackMsg({ text: "Booking Successful! Redirecting...", isError: false });
        sessionStorage.removeItem("savedApptDate");
        sessionStorage.removeItem("savedApptHour");
        
        setTimeout(() => {
          router.push("/viewappt"); 
        }, 1500);
      } else {
        setFeedbackMsg({ text: `Failed to book: ${result.message}`, isError: true });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setFeedbackMsg({ text: "An error occurred while booking. Please try again.", isError: true });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4">
      
      <div className="w-full flex justify-start mb-4">
        <button 
          onClick={() => router.back()} 
          className="text-slate-500 hover:text-red-600 flex items-center gap-2 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Cancel Booking
        </button>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">Make an Appointment</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-start">
        
        <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-blue-500 w-full md:w-1/3 sticky top-24">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
            {dentist.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{dentist.name}</h2>
          <div className="text-sm text-slate-600 space-y-2 mt-4">
            <p className="flex justify-between"><span className="font-semibold text-slate-700">Experience:</span> <span>{dentist.experience} years</span></p>
            <p className="flex justify-between"><span className="font-semibold text-slate-700">Expertise:</span> <span>{dentist.expertise}</span></p>
            <p className="flex justify-between border-t pt-2">
              <span className="font-semibold text-slate-700">Working Hours:</span>
              <span className="text-blue-600 font-medium">
                {workStart.toString().padStart(2, "0")}:00 - {workEnd.toString().padStart(2, "0")}:00
              </span>
            </p>
          </div>
          
          <button 
            onClick={handleChangeDentist}
            className="mt-8 w-full text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-400 font-semibold py-2.5 rounded-lg transition-all"
          >
            Change Dentist
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md w-full md:w-2/3">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
            Select Date
          </h3>
          
          <div className="mb-8">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                className="w-full"
                value={apptDate}
                onChange={(newValue) => setApptDate(newValue)}
                disablePast
                slotProps={{ textField: { variant: 'outlined', sx: { backgroundColor: '#f8fafc' } } }}
              />
            </LocalizationProvider>
          </div>

          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2 border-t pt-6">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
            Select Time
          </h3>

          {!apptDate ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
              Please select a date first to see available time slots.
            </div>
          ) : isFetchingHours ? (
            <div className="flex justify-center p-8">
              <CircularProgress size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {hourOptions.map((h) => {
                const isBooked = bookedHours.includes(h);
                const isSelected = hour === h.toString();

                return (
                  <button
                    key={h}
                    onClick={() => handleHourSelect(h.toString())}
                    disabled={isBooked}
                    className={`relative p-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1
                      ${isBooked 
                        ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-70" 
                        : isSelected 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" 
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                  >
                    <span className="text-base tracking-wide">
                      {h.toString().padStart(2, "0")}:00
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isBooked 
                        ? "bg-slate-200 text-slate-500" 
                        : isSelected 
                          ? "bg-blue-500 text-white" 
                          : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {isBooked ? "Booked" : "Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-10">
            {feedbackMsg && (
              <div 
                className={`mb-4 text-center font-medium px-4 py-2 rounded-lg border ${
                  feedbackMsg.isError 
                    ? 'text-red-600 bg-red-50 border-red-200' 
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={isLoading || !apptDate || hour === ""}
              className={`w-full py-3.5 rounded-xl font-bold text-lg text-white transition-all
                ${isLoading || !apptDate || hour === "" 
                  ? "bg-slate-300 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"}`}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}