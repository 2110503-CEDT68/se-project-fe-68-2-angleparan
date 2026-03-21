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
            className="bg-slate-200 rounded px-5 mx-5 py-2 my-2 text-black"
          >
            <div className="text-md">
              Dentist : {dentist?.name ?? "Unknown"}
            </div>

            <div className="text-md">
              Experience : {dentist?.experience ?? "-"} years
            </div>

            <div className="text-md">
              Expertise : {dentist?.expertise ?? "-"}
            </div>

            <div className="text-md">
              Appointment Date :{" "}
              {new Date(appt.apptDate).toLocaleString()}
            </div>

            <button
              className="block rounded-md bg-sky-600 hover:bg-red-600 px-3 py-1 text-white shadow-sm"
            >
              Cancel Booking
            </button>
          </div>
        )
      })}
    </>
  )
}
