"use client"
import styles from "./card.module.css";
import Image from "next/image";
import InteractiveCard from "./InteractiveCard";
import { useState } from "react"
import Link from "next/link"

export default function Card(
  { DentistName, imgSrc,experience,expertist, onRate ,did}: 
  { DentistName: string; imgSrc: string;experience:string ; expertist:string;
    onRate?:(value:number)=>void , did:string }
) {
   const [value,setValue] = useState<number | null>(0)
  return (
    <InteractiveCard >
       
        <Image src={imgSrc} alt={DentistName} width={300} height={200}
          className="w-full h-50 object-cover rounded-sm" />
        <div className="p-2">
          <h2 className="mb-2 text-xl">{DentistName}</h2>
          <div className="p-1">
          <h6>experience : {experience} year</h6>
          <h6>expertist : {expertist}</h6>
          </div>
        </div>
      <Link href={`/booking`}>
          <button className="bg-blue-600 hover:bg-blue-900 hover:shadow-xl text-white px-4 py-2 rounded ml-auto block mt-4">
              book Dentist
          </button>
        </Link>

      
     </InteractiveCard>
  )
}