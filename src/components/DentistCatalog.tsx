import Card from "./Card"
import Link from "next/link"
import { DentistJson,DentistItem } from "../../interface"

export default async function DentistCatalog({
    dentistsJson
}:{
    dentistsJson:Promise<DentistJson>
}){

    const DentistJsonReady = await dentistsJson
    console.log(DentistJsonReady)

    return (
        <div className="flex flex-wrap gap-5 justify-center p-10 bg-blue-100 min-h-screen">
        
            {DentistJsonReady.data.map((Dentist:DentistItem) => (
                <Card key={Dentist._id}
                    DentistName={Dentist.name}
                    experience={Dentist.experience}
                    expertist={Dentist.expertise}
                    did={Dentist._id}
                />
            ))}
        

            <Link href={`/`}>
            <button className="fixed top-20 left-10 bg-blue-600 hover:bg-blue-900 hover:shadow-xl text-white px-4 py-2 rounded">
                go back home
            </button>
            </Link>
        </div>
        
    )
}