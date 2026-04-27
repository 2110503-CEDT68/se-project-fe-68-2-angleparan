export default async function updateRecord(id: string, token: string, body: object) {
  const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/records/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to update record");
  }

  return await response.json();
}