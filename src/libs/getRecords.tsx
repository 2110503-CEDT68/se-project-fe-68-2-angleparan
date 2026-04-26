export default async function getRecords(token: string, query: string = "") {
  const response = await fetch(
    `https://be-project-69-demonparan.vercel.app/api/v1/records${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch records");
  }

  return response.json();
}