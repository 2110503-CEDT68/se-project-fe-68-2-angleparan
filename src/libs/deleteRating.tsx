const BASE_URL = "https://be-project-69-demonparan.vercel.app/api/v1";

export default async function deleteRating(ratingId: string, token: string) {
  const response = await fetch(`${BASE_URL}/ratings/${ratingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
