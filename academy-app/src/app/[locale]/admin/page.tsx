'use client'

import DashboardLayout from "~/components/DashboardLayout"

const AdminNav = [
   { id: "dashboard", icon: "🏠", labelKey: "dashboard", path: "/dashboard" },
   { id: "courses", icon: "🔥", labelKey: "courses", path: "/courses" },
   { id: "leaderboard", icon: "🏆", labelKey: "leaderboard", path: "/leaderboard" },
   { id: "profile", icon: "👤", labelKey: "profile", path: "/profile" },
   { id: "settings", icon: "⚙️", labelKey: "settings", path: "/settings" }
]

export default function Page() {

   // if (loading) return <>Loading ...</>

   return (
      <DashboardLayout isAdmin={true}>
         <>well welll seems you an admin</>
      </DashboardLayout>
   )
}