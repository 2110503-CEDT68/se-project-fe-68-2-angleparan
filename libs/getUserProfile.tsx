export default async function getUserProfile(token: string, userId: string) {
  const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/users/${userId}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Cannot get user profile");
  }

  return await response.json();
}