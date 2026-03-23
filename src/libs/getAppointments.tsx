import { AppointmentJson } from "../../interface"

export default async function getAppointment(token: string, query: string = ""): Promise<AppointmentJson> {
  const response = await fetch(
    `https://be-project-69-demonparan.vercel.app/api/v1/appointments${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    }
  )

  if (!response.ok) {
    const text = await response.text()
    console.error("Fetch appointment error:", text)
    throw new Error("Failed to fetch appointments")
  }

  return response.json()
}