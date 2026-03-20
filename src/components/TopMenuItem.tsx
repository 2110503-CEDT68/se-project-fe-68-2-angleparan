import Link from 'next/link'

export default function TopMenuItem ({
    title,
    pageRef
} : {
    title:string
    pageRef:string
}) {
    return (
        <Link 
            className='h-full flex items-center justify-center !text-gray-500 font-bold text-[14px] !hover:text-black' 
            href={pageRef}
        >
            {title}
        </Link>
    )
}