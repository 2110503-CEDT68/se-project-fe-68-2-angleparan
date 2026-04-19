import { RatingSummaryJson } from "../../interface";

const BASE_URL = "https://be-project-69-demonparan.vercel.app/api/v1";

export default async function getRatingSummary(): Promise<RatingSummaryJson> {
  const response = await fetch(`${BASE_URL}/ratings/summary`, {
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Failed to fetch rating summary");

  return response.json();
}
