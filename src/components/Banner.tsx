"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react";

export default function Banner() {
  const router = useRouter()
  const { data: session } = useSession()

  const videoSrc = "/clinic.mp4" 

  return (
    <div className="relative w-full h-[93.6vh] overflow-hidden bg-black">
      
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {session && (
        <div className="z-10 absolute top-5 right-10 font-semibold text-white text-xl drop-shadow-lg">
          Welcome {session.user?.name}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <button
          className="bg-white text-black px-8 py-4 rounded-md font-bold text-lg 
                     hover:bg-black hover:text-white transition-all duration-300 
                     shadow-xl transform hover:scale-105"
          onClick={() => router.push("/dentist")}
        >
          Explore our Dentist →
        </button>
      </div>

    </div>
  );
}