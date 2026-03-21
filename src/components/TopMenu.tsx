import Image from 'next/image'
import TopMenuItem from './TopMenuItem'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from "next/link"

export default async function TopMenu() {
  const session = await getServerSession(authOptions)
  return (
    <div className="h-[50px] w-full fixed top-0 bg-white flex px-5 border-y border-gray-300 gap-8">

      <Image
        src="/img/logo.png"
        alt="Logo"
        width={45}
        height={45}
        className="object-contain rounded-lg"
      />
      
      <TopMenuItem title="Booking" pageRef="/booking" />
      
      <TopMenuItem title="View Appointment" pageRef="/viewappt"/>

      <div className='h-full flex items-center justify-center absolute right-0 px-5'>
      
      {
        session?
        <div className='flex gap-6'>
        <Link href="/api/auth/signout">
          <div className='text-cyan-600 text-mb'>
            Sign-Out
          </div>
        </Link>
        <div className='text-black'>
          {session.user.role === 'admin'? 'Admin' : 'User' }: {session.user?.name}
        </div>
        </div> :
        <Link href="/api/auth/signin">
          <div className='text-cyan-600 text-mb'> 
            Sign-In
          </div>
        </Link>
      }
      </div>

    </div>
  )
}
