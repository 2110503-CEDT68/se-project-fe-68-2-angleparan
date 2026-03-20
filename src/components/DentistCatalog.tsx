import Card from "./Card"
import Link from "next/link"

export default async function DentistCatalog({DentistsJson}:{DentistsJson:any}){

    const DentistJsonReady = await DentistsJson

    return (
        <div className="flex flex-wrap gap-5 justify-center p-10 bg-blue-100 min-h-screen">
        
            {DentistJsonReady.data.map((Dentist:any) => (
                <Card
                    key={Dentist.id}
                    did={Dentist.id}
                    DentistName={Dentist.name}
                    experience={Dentist.dailyrate}
                    expertist={Dentist.district}
                    imgSrc={Dentist.picture}
                />
            ))}
        

            <Link href={`/`}>
            <button className="fixed bottom-10 left-10 bg-blue-600 hover:bg-blue-900 hover:shadow-xl text-white px-4 py-2 rounded">
                go back home
            </button>
            </Link>
        </div>
        
    )
}