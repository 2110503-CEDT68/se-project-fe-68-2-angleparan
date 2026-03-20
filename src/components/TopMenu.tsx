import Image from 'next/image'
import TopMenuItem from './TopMenuItem'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from "next/link"

export default async function TopMenu() {
  const session = await getServerSession(authOptions)
  return (
    <div className="h-[50px] bg-white fixed top-0 inset-x-0 z-30 border-y border-gray-300 flex items-center justify-end pr-2 gap-8">

      <div className='flex item-center justify-center absolute left-0 h-full px-5 underline gap-20'>
      
      {
        session?
        <Link href="/api/auth/signout">
          <div className='text-cyan-600 text-mb absolute top-3'>
            Sign-Out of {session.user?.name} 
          </div>
        </Link> :
        <Link href="/api/auth/signin">
          <div className='text-cyan-600 text-mb absolute top-3'> 
            Sign-In
          </div>
        </Link>
      }

      <TopMenuItem title="My Booking" pageRef="/mybooking"/>

      </div>

      <TopMenuItem title="Booking" pageRef="/booking" />

      <Image
        src="/img/logo.png"
        alt="Logo"
        width={45}
        height={45}
        className="object-contain"
      />

    </div>
  )
}
