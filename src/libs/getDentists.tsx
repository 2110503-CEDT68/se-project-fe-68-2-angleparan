import { DentistJson } from "../../interface"

export default async function getDentist():Promise<DentistJson>{
    const response = await fetch("https://be-project-69-demonparan.vercel.app/api/v1/dentists")//แก้ backend

    if(!response.ok){
        throw new Error("Failed to fetch Dentist")
    }

    return await response.json()
}
