"use client"

import { useSession } from "next-auth/react"

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="text-center text-gray-500 mt-10">
        Loading user...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center text-red-500 mt-10">
        Please login first
      </div>
    )
  }

  const user = session.user

  return (
    <div className="px-5 mx-5 py-4 my-3 mt-4 bg-white shadow-lg rounded-2xl p-6 text-black">
      
      <h2 className="text-xl font-bold mb-4 text-center">
        User Profile
      </h2>

      <div className="space-y-2">
        <div>
          <span className="font-semibold">Name:</span> {user.name}
        </div>

        <div>
          <span className="font-semibold">Email:</span> {user.email}
        </div>

        <div>
          <span className="font-semibold">Phone:</span> {user.phone}
        </div>

        <div>
          <span className="font-semibold">Role:</span>{" "}
          <span
            className={`px-2 py-1 rounded text-white text-sm ${
              user.role === "admin"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          >
            {user.role}
          </span>
        </div>

        <div>
          <span className="font-semibold">User ID:</span> {user._id}
        </div>
      </div>
    </div>
  )
}
