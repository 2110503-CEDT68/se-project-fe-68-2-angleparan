
import DentistCatalog from "@/components/DentistCatalog";
import getDentists from "@/libs/getDentists";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";


export default function Venue() {
  const Dentists =  getDentists()

  return (
    <main>
      <Suspense fallback={ <p>Loading...<LinearProgress/></p>}>
        <DentistCatalog DentistsJson={Dentists}/>
        </Suspense>
        
    </main>
  );
}