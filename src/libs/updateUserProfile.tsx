export default async function updateUserProfile(token: string, userId: string, payload: any) {
  const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update user profile");
  }

  return await response.json();
}