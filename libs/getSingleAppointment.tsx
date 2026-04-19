export default async function getSingleAppointment(apptId: string, token: string) {
    const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/appointments`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch appointments");
    }

    const data = await response.json();
    
    const appointment = data.data.find((appt: any) => appt._id === apptId);
    
    if (!appointment) {
        return { data: null };
    }

    return { data: appointment };
}