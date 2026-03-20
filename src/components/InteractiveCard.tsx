"use client"
import { ReactNode, useState } from "react"

export default function InteractiveCard({ children }: { children: ReactNode }) {

  const [hover, setHover] = useState(false)

  return (
    <div
      className="w-xs h-100 p-3 m-10 rounded-lg transition 
      border border-transparent bg-gray-100 
      hover:border-black-300 hover:shadow-md"
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {children}
    </div>
  )
}