"use client"

import { useTranslations } from 'next-intl'
import { useState } from "react"

import DashboardLayout from '~/components/DashboardLayout'


import { useEffect, useTransition } from "react"
import LoadingSplash from "~/components/LoadingSplash"
import { dataService } from "~/services/data.service"
import type { UserProfile } from "~/lib/dummy-data"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "~/i18n/navigation"
import { useLocale } from "next-intl"
import { useSession, signIn, signOut } from "next-auth/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useUserProfile } from "~/hooks/queries/useUserProfile"

const TABS = [
   { id: "profile", icon: "👤", label: "Profile" },
   { id: "account", icon: "🔐", label: "Account" },
   { id: "preferences", icon: "⚙️", label: "Preferences" },
   { id: "privacy", icon: "🛡", label: "Privacy" },
] as const
type TabId = typeof TABS[number]["id"]

import { ProfileTab } from "./_components/ProfileTab"
import { AccountTab } from "./_components/AccountTab"
import { PreferencesTab } from "./_components/PreferencesTab"
import { PrivacyTab } from "./_components/PrivacyTab"

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function Page() {
   const [activeTab, setActiveTab] = useState<TabId>("profile")

   const { data: session, status } = useSession()
   const { publicKey } = useWallet()

   const { data: profileData, isLoading: isProfileLoading } = useUserProfile(publicKey?.toBase58())

   if (status === 'loading' || isProfileLoading) {
      return null;
   }

   const dbUser = profileData?.user;

   let user: UserProfile | null = null;
   if (status === 'authenticated' || (publicKey && dbUser)) {
      user = {
         name: session?.user?.name || dbUser?.name || (publicKey ? `Wallet User` : "Guest"),
         email: session?.user?.email || dbUser?.email || "No email",
         username: publicKey ? publicKey.toBase58().slice(0, 8) : (session?.user?.email?.split('@')[0] || dbUser?.email?.split('@')[0] || "guest"),
         avatar: session?.user?.image || dbUser?.avatar ? "IMG" : (publicKey ? "👻" : "👤"),
         level: dbUser?.level ?? 0,
         rank: dbUser?.rank ?? 0,
         xp: dbUser?.xp ?? 0,
         streak: dbUser?.streak ?? 0,
         bio: dbUser?.bio || "",
         twitter: dbUser?.twitter || "",
         github: dbUser?.github || (session?.user?.name ? "Connected via OAuth" : "Not connected"),
         website: dbUser?.website || "",
         joinDate: dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
         skills: dbUser?.skills || {}
      }
   }

   if (!user) {
      return (
         <DashboardLayout>
            <div className="flex flex-col items-center justify-center p-12 mt-20 text-center animate-fade-up">
               <span className="text-4xl mb-4 grayscale opacity-50">👤</span>
               <h2 className="text-xl font-bold text-sol-text mb-2">Connect to view settings</h2>
               <p className="text-sol-muted text-sm max-w-sm mb-6">
                  Please sign in with Web2 or connect your wallet to view and manage your account preferences.
               </p>
            </div>
         </DashboardLayout>
      )
   }

   const TAB_CONTENT: Record<TabId, React.ReactNode> = {
      profile: <ProfileTab user={user} />,
      account: <AccountTab user={user} />,
      preferences: <PreferencesTab />,
      privacy: <PrivacyTab />,
   }

   return (
      <DashboardLayout>
         <div className="flex flex-col gap-6 animate-fade-up">
            {/* Tab bar */}
            <div className="flex gap-1 bg-sol-surface border border-sol-border rounded-xl p-1 w-fit">
               {TABS.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={[
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-150",
                        activeTab === tab.id
                           ? "bg-sol-green text-[#f7eacb]"
                           : "text-sol-muted hover:text-sol-subtle",
                     ].join(" ")}
                  >
                     <span>{tab.icon}</span>
                     <span className="hidden sm:inline">{tab.label}</span>
                  </button>
               ))}
            </div>

            {/* Active tab content */}
            <div className="animate-fade-up">
               {TAB_CONTENT[activeTab]}
            </div>
         </div>
      </DashboardLayout>
   )
}