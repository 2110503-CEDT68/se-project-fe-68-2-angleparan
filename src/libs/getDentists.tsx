import {resolve} from "path"
export default async function getDentist(){
    const response = await fetch("https://a08-venue-explorer-backend.vercel.app/api/v1/venues")//แก้ backend

    if(!response.ok){
        throw new Error("Failed to fetch Dentist")
    }

    return await response.json()
}
