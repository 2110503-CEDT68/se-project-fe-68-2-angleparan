export default async function updateAppointment(
  apptId: string, 
  dentistId: string, 
  apptDate: string, 
  token: string
) {
    const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/appointments/${apptId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            dentist: dentistId,
            apptDate: apptDate,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update appointment");
    }

    return await response.json();
}