export default async function deleteRecord(id: string, token: string) {
  const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/records/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete record");
  }

  return await response.json();
}