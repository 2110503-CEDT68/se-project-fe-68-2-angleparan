import { AppointmentStatus } from "../../interface";

export default async function updateAppointmentStatus(
  apptId: string,
  status: AppointmentStatus,
  token: string,
  treatmentDetails?: string,
  cancelReason?: string
) {
  // จัดเตรียมข้อมูล Payload ตาม Status
  const bodyData: any = { status };
  
  if (status === "completed" && treatmentDetails) {
    bodyData.treatmentDetails = treatmentDetails;
  }
  
  if (status === "cancelled" && cancelReason) {
    bodyData.cancelReason = cancelReason;
  }

  const response = await fetch(
    `https://be-project-69-demonparan.vercel.app/api/v1/appointments/${apptId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update appointment status");
  }

  return await response.json();
}