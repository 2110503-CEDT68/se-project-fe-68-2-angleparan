
export default async function createAppt(did: string, finalDateTime: string, token: string) {
  const response = await fetch(`https://be-project-69-demonparan.vercel.app/api/v1/dentists/${did}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({
      apptDate: finalDateTime,
    }),
  });

  return await response.json();
}