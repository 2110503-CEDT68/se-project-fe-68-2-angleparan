
import Link from 'next/link'

export default function TopMenuItem ({
    title,
    pageRef
} : {
    title: string
    pageRef: string
}) {
    return (
        <Link href={pageRef} className="h-full flex items-center relative group">
            <div className='text-gray-500 font-semibold text-[15px] group-hover:text-blue-600 transition-colors duration-300'>
                {title}
            </div>
            <div className="absolute bottom-4 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></div>
        </Link>
    )
}