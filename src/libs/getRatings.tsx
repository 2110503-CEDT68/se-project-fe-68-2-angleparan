import { RatingJson } from "../../interface";

const BASE_URL = "http://localhost:5000/api/v1";

export default async function getRatings(dentistId: string): Promise<RatingJson> {
  const response = await fetch(`${BASE_URL}/dentists/${dentistId}/ratings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ratings");
  }

  return response.json();
}
