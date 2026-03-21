"use client"

import { useSession } from "next-auth/react"
import ApptList from "@/components/ApptList"
import UserProfile from "@/components/UserProfile"

export default function ViewApptPage() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (!session) {
        return <div>Please login first</div>
    }

    return (
        <main className="py-2 flex flex-col justify-center">
            <UserProfile />
            <div className="text-black text-xl bg-white px-5 mx-5 py-2 my-2 rounded-lg">Appointment List</div>
            <ApptList />
        </main>
    )
}
