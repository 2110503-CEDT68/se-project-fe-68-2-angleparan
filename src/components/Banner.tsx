"use client"

import Image from "next/image";
import { useRouter } from "next/navigation"
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Banner() {

  const router = useRouter()

  const images = [
    "/img/cover.jpg",
    "/img/cover2.jpg",
    "/img/cover3.jpg",
    "/img/cover4.jpg"
  ]

  const [index,setIndex] = useState(0)

  function changeImage(){
    setIndex((index+1)%images.length)
  }

  const { data:session } = useSession()
  console.log(session?.user.token)

  return (
    <div className="relative w-full h-[50vh] overflow-hidden"
         onClick={changeImage}
    >

      <Image 
        src={images[index]}
        alt="cover" 
        fill
        className="object-cover" 
      />

      {
        session? 
        <div className="z-30 absolute top-5 right-10 font-semibold text-black text-xl">
          Welcome {session.user?.name}
        </div> : <div>test</div>
      }

      <button
          className="absolute bottom-6 right-166 bg-white text-black px-6 py-5 rounded-md font-semibold hover:bg-black hover:text-white z-[3]"
          onClick={(e) => {e.stopPropagation(); router.push("/venue")}}
        >
          Create Appointment
      </button>

    </div>
  );
}