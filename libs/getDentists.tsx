import { DentistJson } from "../../interface"

export default async function getDentist(queryString?: string):Promise<DentistJson>{
    let url = "https://be-project-69-demonparan.vercel.app/api/v1/dentists"

    if (queryString) url += `?${queryString}`

    const response = await fetch(url, { cache: "no-store" })

    if(!response.ok){
        throw new Error("Failed to fetch Dentist")
    }

    return await response.json()
}
