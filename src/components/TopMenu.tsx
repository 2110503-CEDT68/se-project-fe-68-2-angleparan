import Image from 'next/image'
import TopMenuItem from './TopMenuItem'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from "next/link"

export default async function TopMenu() {
  const session = await getServerSession(authOptions)
  
  const role = session?.user?.role || 'guest'

  let dentistLinkTitle = "Dentists"
  let apptLinkTitle = "Appointments"

  if (role === 'admin') {
    dentistLinkTitle = "Manage Dentists"
    apptLinkTitle = "All Appointments"
  } else if (role === 'dentist') {
    dentistLinkTitle = "Dentist Catalog"
    apptLinkTitle = "My Schedule"
  } else if (role === 'user') {
    dentistLinkTitle = "Create Appointment"
    apptLinkTitle = "My Appointments"
  }

  return (
    <nav className="h-[65px] w-full fixed top-0 bg-white shadow-sm flex items-center px-6 border-b border-blue-100 z-50 transition-all">
      
      <Link href={`/`} className="flex items-center gap-3 mr-8 hover:opacity-80 transition-opacity">
        <Image
          src="/img/logo.png"
          alt="Logo"
          width={45}
          height={45}
          className="object-contain rounded-lg"
        />
        <span className="font-bold text-xl text-blue-900">DentalCare</span>
      </Link>
      
      <div className="flex gap-6 h-full items-center">
        <TopMenuItem title={dentistLinkTitle} pageRef="/dentist" />
        <TopMenuItem title={apptLinkTitle} pageRef="/viewappt"/>
      </div>

      <div className='ml-auto flex items-center'>
        {session ? (
          <div className='flex items-center gap-5'>
            <div className='text-sm font-medium text-blue-900 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm'>
              <span className="font-bold text-blue-600 capitalize">
                {role}
              </span>
              <span className="mx-1 text-gray-400">|</span> 
              {session.user?.name}
            </div>
            
            <Link href="/api/auth/signout">
              <button className='text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors duration-200'>
                Log Out
              </button>
            </Link>
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <Link href="/register">
              <button className='px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200'>
                Register
              </button>
            </Link>
            
            <Link href="/login">
              <button className='px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg'>
                Log In
              </button>
            </Link>
          </div>
        )}
      </div>

    </nav>
  )
}