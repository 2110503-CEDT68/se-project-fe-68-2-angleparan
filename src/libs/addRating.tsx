const BASE_URL = "https://be-project-69-demonparan.vercel.app/api/v1";

export default async function addRating(
  dentistId: string,
  rating: number,
  comment: string,
  token: string
) {
  const response = await fetch(`${BASE_URL}/dentists/${dentistId}/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });

  return response.json();
}
