import Card from "./Card"
import Link from "next/link"
import { DentistJson, DentistItem } from "../../interface"
import FilterBar from "./FilterBarDentist"

export default async function DentistCatalog({
    dentistsJson
}: {
    dentistsJson: Promise<DentistJson>
}) {

    const DentistJsonReady = await dentistsJson

    return (
        <div className="flex flex-col items-center w-full">
            
            <FilterBar />

            <div className="flex w-full fixed top-17 left-6 max-w-7xl mb-6">
                <Link href={`/`}>
                    <button className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2 transition-colors">
                        ← Back to Home
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
                {DentistJsonReady.data.length > 0 ? (
                    DentistJsonReady.data.map((Dentist: DentistItem) => (
                        <Card key={Dentist._id}
                            DentistName={Dentist.name}
                            experience={Dentist.experience}
                            expertist={Dentist.expertise}
                            did={Dentist._id}
                            workingHours={Dentist.workingHours}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10 text-lg">
                        No dentists found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    )
}