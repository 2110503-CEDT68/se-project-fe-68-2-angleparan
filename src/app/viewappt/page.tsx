"use client"

import { useSession } from "next-auth/react"
import ApptList from "@/components/ApptList"
import UserProfile from "@/components/UserProfile"
import LoginPrompt from "@/components/LoginPrompt"

export default function ViewApptPage() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (!session) {
        return <LoginPrompt />
    }

    return (
        <main className="py-2 flex flex-col bg-blue-100 min-h-screen">
            <UserProfile />
            <div className="text-black text-xl font-bold bg-white px-5 mx-5 py-2 my-2 rounded-lg">Appointment List</div>
            <ApptList />
        </main>
    )
}
