

export default async function userLogIn(userEmail:string, userPassword:string) {
    const response = await fetch("https://be-project-69-demonparan.vercel.app/api/v1/auth/login", {
        method : "POST",
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify({
            email: userEmail,
            password: userPassword
        })
    })
    if (!response) {
        throw new Error("Failed to fetch user")
    }
    return await response.json()
}