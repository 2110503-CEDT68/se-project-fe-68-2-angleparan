
export default async function userRegister(
  name: string, 
  email: string, 
  phone: string, 
  password: string
) {
    const response = await fetch("https://be-project-69-demonparan.vercel.app/api/v1/auth/register", {
        method : "POST",
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: "user" // Set default role 
        })
    })
    
    if (!response.ok) {
        throw new Error("Failed to register user")
    }
    return await response.json()
}