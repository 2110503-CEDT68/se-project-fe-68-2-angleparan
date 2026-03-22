import Link from "next/link"

export default function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white px-4">
      <div className="p-8 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm text-center max-w-md w-full">

        <svg 
          className="w-16 h-16 mx-auto mb-4 text-blue-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
        
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          Please Login First
        </h2>
        <div className="text-blue-700 mb-8">
          Please log in first to access your appointment information.
        </div>
        
        <Link href="/api/auth/signin" className="block w-full">
          <div className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-md">
            Go to Log-In
          </div>
        </Link>
      </div>
    </div>
  );
}