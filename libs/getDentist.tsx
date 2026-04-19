import { DentistItem } from "../../interface"

export default async function getDentist(id: string): Promise<DentistItem> {
  const response = await fetch(
    `https://be-project-69-demonparan.vercel.app/api/v1/dentists/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dentist");
  }

  const json = await response.json();
  return json.data; // ← ดึงแค่ object เดียวออกมาเลย
}