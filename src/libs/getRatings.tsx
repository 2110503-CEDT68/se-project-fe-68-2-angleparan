import { RatingJson } from "../../interface";

const BASE_URL = "https://be-project-69-demonparan.vercel.app/api/v1";

export default async function getRatings(dentistId: string): Promise<RatingJson> {
  const response = await fetch(`${BASE_URL}/dentists/${dentistId}/ratings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ratings");
  }

  return response.json();
}
