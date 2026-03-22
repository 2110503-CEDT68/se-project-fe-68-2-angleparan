"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import getAppointment from "@/libs/getAppointments"
import { AppointmentItem, DentistItem } from "../../interface"

type AppointmentWithDentist = Omit<AppointmentItem, "dentist"> & {
  dentist: string | DentistItem
}

export default function ApptList() {
  const { data: session } = useSession()

  const [appointments, setAppointments] = useState<AppointmentWithDentist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.accessToken) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const apptRes = await getAppointment(session.accessToken!)

        console.log("appt:", apptRes)

        setAppointments(apptRes.data)

      } catch (err) {
        console.error("FETCH ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session?.accessToken])

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Loading...
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No Appointment
      </div>
    )
  }

  return (
    <>
      {appointments.map((appt) => {
        const dentist =
          typeof appt.dentist === "string"
            ? null
            : appt.dentist

        return (
          <div
            key={appt._id}
            className="relative h-auto bg-white rounded-lg px-5 mx-5 py-4 my-2 text-black"
          >
            <button className="absolute top-3 right-3 p-1 text-gray-600 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>

            <div className="text-md">
              <span className="font-semibold">Dentist :</span> {dentist?.name ?? "Unknown"}
            </div>

            <div className="text-md">
              <span className="font-semibold">Experience :</span> {dentist?.experience ?? "-"} years
            </div>

            <div className="text-md">
              <span className="font-semibold">Expertise :</span> {dentist?.expertise ?? "-"}
            </div>

            <div className="text-md">
              <span className="font-semibold">Appointment Date :</span>{" "}
              {new Date(appt.apptDate).toLocaleString()}
            </div>

            <div className="absolute right-3 bottom-3">
            <button
              className="block rounded-md bg-red-700 hover:bg-red-800 px-3 py-1 text-white shadow-sm"
            >
              Cancel Booking
            </button>
            </div>
          </div>
        )
      })}
    </>
  )
}
