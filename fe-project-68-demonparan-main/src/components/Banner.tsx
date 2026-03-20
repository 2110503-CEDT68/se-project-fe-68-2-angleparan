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
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-[2] px-6">
        <h1 className="text-[2.5rem] mb-[15px] font-bold">
          where every event finds its venue</h1>
        <p className="text-[1.2rem] leading-[1.6]">
          บริการสถานที่จัดเลี้ยงระดับพรีเมียม ตอบโจทย์ทุกช่วงเวลาสำคัญของคุณ 
          ไม่ว่าจะเป็นงานแต่งงาน งานสัมมนา หรืองานปาร์ตี้ส่วนตัว
        </p>
      </div>

      {
        session? 
        <div className="z-30 absolute top-5 right-10 font-semibold text-black text-xl">
          Welcome {session.user?.name}
        </div> : null
      }

      <button
          className="absolute bottom-6 right-6 bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-black hover:text-white z-[3]"
          onClick={(e) => {e.stopPropagation(); router.push("/venue")}}
        >
          Select Venue
      </button>

    </div>
  );
}