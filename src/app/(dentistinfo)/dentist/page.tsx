import DentistCatalog from "@/components/DentistCatalog";
import getDentists from "@/libs/getDentists";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";

export default async function Dentists({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;

  const params = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    }
  });

  const query = params.toString();
  
  const DentistsPromise = getDentists(query);

  return (
    <main className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">Our Dentists</h1>
        
        <Suspense fallback={<div className="w-full max-w-md mx-auto mt-10"><LinearProgress/></div>}>
          <DentistCatalog dentistsJson={DentistsPromise} />
        </Suspense>
      </div>
    </main>
  );
}