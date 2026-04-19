
export default async function userRegister(
  name: string, 
  email: string, 
  phone: string, 
  password: string,
  role: string = "user",
  dentistData?: {
    expertise: string;
    experience: number;
    workingHours: { start: number; end: number };
  }
) {
    const payload: any = {
        name,
        email,
        phone,
        password,
        role
    };

    if (role === "dentist" && dentistData) {
        payload.expertise = dentistData.expertise;
        payload.experience = dentistData.experience;
        payload.workingHours = dentistData.workingHours;
    }

    const response = await fetch("https://be-project-69-demonparan.vercel.app/api/v1/auth/register", {
        method : "POST",
        headers : {
            "Content-Type": "application/json",
        },
        body : JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || "Failed to register user");
    }
    return await response.json();
}