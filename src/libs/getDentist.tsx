import { DentistItem } from "../../interface"

export default async function getDentist(id: string): Promise<DentistItem> {
  const response = await fetch(
    `http://localhost:5000/api/v1/dentists/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dentist");
  }

  const json = await response.json();
  return json.data; // ← ดึงแค่ object เดียวออกมาเลย
}