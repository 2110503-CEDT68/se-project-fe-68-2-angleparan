export default async function deleteAppointment(id: string, token: string) {
    const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/appointments/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete appointment");
    }

    return await response.json();
}