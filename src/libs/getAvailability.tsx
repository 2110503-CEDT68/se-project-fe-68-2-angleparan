export default async function getAvailability(did: string, date: string): Promise<number[]> {
  try {
    const response = await fetch(
      `https://be-project-69-demonparan.vercel.app/api/v1/dentists/${did}/availability?date=${date}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch availability");
    }

    const json = await response.json();
    if (json.success) {
      return json.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}