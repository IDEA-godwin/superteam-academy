"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import DashboardLayout from '~/components/DashboardLayout';


import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserProfile } from "~/hooks/queries/useUserProfile";
import { useUserGamification } from "~/hooks/queries/useUserGamification";
import LoadingSplash from "~/components/LoadingSplash";

import type { IUserProfile } from "~/types/user";
import { Calendar1Icon } from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";

const RARITY_STYLE: Record<string, string> = {
   common: "border-sol-border   text-sol-muted",
   uncommon: "border-sol-green/40 text-sol-green",
   rare: "border-sol-yellow/50 text-[#7a5800]",
   epic: "border-sol-forest/50 text-sol-forest",
};

export default function Page() {
   const [isPublic, setIsPublic] = useState(true);

   const { data: session, status } = useSession();
   const { publicKey } = useWallet();

   const { data: profileData, isLoading: isProfileLoading } = useUserProfile(publicKey?.toBase58());
   const { data: gamificationData, isLoading: isGamificationLoading } = useUserGamification();

   if (status === 'loading' || isProfileLoading || isGamificationLoading) {
      return (
         <DashboardLayout>
            <LoadingSplash message="Loading profile data..." fullScreen={false} />
         </DashboardLayout>
      );
   }

   const dbUser = profileData?.user;
   const achievements = gamificationData?.achievements || [];
   const credentials = gamificationData?.credentials || [];
   const completed = gamificationData?.completedCourses || [];

   // Compose Real Data with Baseline DB Gamification Data
   const user: IUserProfile = {
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
      github: dbUser?.github || "",
      website: dbUser?.website || "",
      joinDate: dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      skills: dbUser?.skills || {}
   };

   return (
      <DashboardLayout>
         <div className="flex flex-col gap-6 animate-fade-up">

            {/* ── Profile Header ── */}
            <div className="card-base p-6 lg:p-8">
               <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                     <div className="relative shrink-0">
                        {user.avatar === "IMG" && session?.user?.image ? (
                           <img src={session.user.image} alt={user.name} className="w-24 h-24 rounded-2xl border border-sol-border object-cover" />
                        ) : (
                           <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-sol-surface to-sol-border
                               flex items-center justify-center text-5xl border border-sol-border">
                              {user.avatar}
                           </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-sol-green text-[#f7eacb] text-[10px]
                            font-bold px-2 py-0.5 rounded-full border-2 border-sol-card">
                           Lv.{user.level}
                        </div>
                     </div>

                     {/* Info */}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                           <h1 className="text-2xl font-black text-sol-text">{user.name}</h1>
                           {user.rank > 0 && (
                              <span className="sol-badge bg-sol-yellow/20 text-[#7a5800] border-sol-yellow/50">
                                 Rank #{user.rank}
                              </span>
                           )}
                        </div>
                        <p className="text-sol-subtle text-sm mb-3">
                           @{user.email || ""}
                        </p>

                        {/* Bio or Prompt */}
                        {!user.bio ? (
                           <Link href="/settings" className="inline-block text-sol-green text-sm hover:underline mb-4 font-semibold">
                              + Add a short bio to tell others about yourself
                           </Link>
                        ) : (
                           <p className="text-sol-subtle text-sm leading-relaxed mb-4 max-w-xl">{user.bio}</p>
                        )}

                        {/* Social links */}
                        <div className="flex flex-wrap gap-3">
                           {[
                              { icon: <SiX className="w-3.5 h-3.5" />, label: user.twitter || "Add Twitter", href: !user.twitter ? "/settings" : "#", prompt: !user.twitter },
                              { icon: <SiGithub className="w-3.5 h-3.5" />, label: user.github, href: user.github === "Not connected" ? "/settings" : "#", prompt: user.github === "Not connected" },
                              { icon: <Calendar1Icon className="w-3.5 h-3.5" />, label: `Joined ${user.joinDate}`, href: null },
                           ].map((link) =>
                              link.href ? (
                                 <Link key={link.label} href={link.href}
                                    className={`flex items-center gap-1.5 text-xs transition-colors font-semibold ${link.prompt ? "text-sol-yellow hover:text-sol-green" : "text-sol-muted hover:text-sol-green"}`}>
                                    <span>{link.icon}</span>{link.label}
                                 </Link>
                              ) : (
                                 <span key={link.label} className="flex items-center gap-1.5 text-xs text-sol-muted font-semibold">
                                    <span>{link.icon}</span>{link.label}
                                 </span>
                              )
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Move Edit Profile to the far right/end */}
                  <div className="flex shrink-0 w-full lg:w-auto justify-end">
                     <Link href="/settings" className="sol-btn-ghost text-xs flex items-center gap-2 bg-sol-surface/50 hover:bg-sol-surface">
                        <span>✏️</span> Edit Profile
                     </Link>
                  </div>
               </div>

               {/* Public/private toggle */}
               <div className="flex items-center justify-between mt-6 pt-5 border-t border-sol-border">
                  <div className="flex items-center gap-2 text-sm">
                     <span className={`w-2 h-2 rounded-full ${isPublic ? "bg-sol-green animate-pulse-dot" : "bg-sol-muted"}`} />
                     <span className="font-semibold text-sol-subtle">
                        {isPublic ? "Public profile" : "Private profile"}
                     </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                     <span className="text-xs text-sol-muted font-semibold">
                        {isPublic ? "Make private" : "Make public"}
                     </span>
                     <div className="relative">
                        <input type="checkbox" className="sr-only" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                        <div
                           onClick={() => setIsPublic(!isPublic)}
                           className={`w-10 h-6 rounded-full cursor-pointer transition-colors duration-200 ${isPublic ? "bg-sol-green" : "bg-sol-border"
                              }`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-1"
                              }`} />
                        </div>
                     </div>
                  </label>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

               {/* ── LEFT ── */}
               <div className="flex flex-col gap-6">

                  {/* Achievement Badge Showcase */}
                  <div className="card-base p-5">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <span className="w-[3px] h-5 bg-sol-green rounded-full" />
                           <h2 className="text-[15px] font-extrabold text-sol-text">Achievements</h2>
                        </div>
                        <span className="text-xs text-sol-muted">{achievements.length} earned</span>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {achievements.map((a, i) => (
                           <div key={i}
                              className={`flex items-start gap-3 p-3 rounded-xl border bg-sol-surface/50
                               hover:scale-[1.02] transition-transform cursor-pointer ${RARITY_STYLE[a.rarity]}`}>
                              <span className="text-2xl shrink-0">{a.icon}</span>
                              <div className="min-w-0">
                                 <div className="text-[12px] font-bold text-sol-text leading-tight">{a.label}</div>
                                 <div className="text-[10px] text-sol-muted mt-0.5 leading-snug">{a.desc}</div>
                                 <span className="text-[10px] font-bold uppercase tracking-wide mt-1 block">{a.rarity}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* On-chain credentials */}
                  <div className="card-base p-5">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="w-[3px] h-5 bg-sol-yellow rounded-full" />
                        <h2 className="text-[15px] font-extrabold text-sol-text">On-Chain Credentials</h2>
                     </div>
                     {credentials.map((c) => (
                        <div key={c.id} className="border border-sol-border rounded-2xl overflow-hidden">
                           {/* Colored header banner */}
                           <div className={`bg-linear-to-r ${c.color} p-4 flex items-center gap-4`}>
                              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                                 {c.icon}
                              </div>
                              <div>
                                 <div className="text-[#f7eacb] font-black text-base">{c.course}</div>
                                 <div className="text-[#f7eacb]/70 text-xs font-semibold">{c.track} Track · {c.level}</div>
                              </div>
                              <div className="ml-auto">
                                 <span className="bg-white/20 text-[#f7eacb] border border-white/30 rounded-full px-3 py-1 text-[11px] font-bold">
                                    cNFT
                                 </span>
                              </div>
                           </div>
                           {/* Details */}
                           <div className="p-4 bg-sol-card space-y-3">
                              <div className="flex gap-3 flex-wrap">
                                 <span className="sol-badge bg-sol-green/10 text-sol-green border-sol-green/30">⚡ {c.xp} XP</span>
                                 <span className="sol-badge bg-sol-surface text-sol-muted border-sol-border">🗓 {c.date}</span>
                                 <span className="sol-badge bg-sol-yellow/15 text-[#7a5800] border-sol-yellow/40">🔄 {c.evolvedTo}</span>
                              </div>
                              <div className="bg-sol-surface rounded-xl p-3 border border-sol-border">
                                 <p className="text-[10px] font-bold text-sol-muted mb-1 uppercase tracking-wide">Mint Address</p>
                                 <p className="font-mono text-xs text-sol-subtle">{c.mintAddress}</p>
                              </div>
                              <div className="flex gap-2">
                                 <Link href={`/certificates/${c.id}`} className="sol-btn-primary text-xs py-2 flex-1 justify-center">
                                    View Certificate
                                 </Link>
                                 <button className="sol-btn-ghost text-xs py-2 flex-1 justify-center">
                                    Verify on Explorer ↗
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Completed courses */}
                  <div className="card-base p-5">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="w-[3px] h-5 bg-sol-forest rounded-full" />
                        <h2 className="text-[15px] font-extrabold text-sol-text">Completed Courses</h2>
                     </div>
                     {completed.length === 0 ? (
                        <p className="text-sm text-sol-muted text-center py-6">No completed courses yet.</p>
                     ) : (
                        <div className="flex flex-col gap-2">
                           {completed.map((c) => (
                              <Link key={c.slug} href={`/courses/${c.slug}`}
                                 className="flex items-center gap-4 p-4 rounded-xl bg-sol-surface border border-sol-border
                               hover:border-sol-green/30 transition-colors group">
                                 <span className="text-3xl opacity-40 group-hover:opacity-70 transition-opacity">{c.icon}</span>
                                 <div className="flex-1">
                                    <div className="font-bold text-sm text-sol-text">{c.title}</div>
                                    <div className="text-xs text-sol-muted">Completed {c.completedDate}</div>
                                 </div>
                                 <span className="sol-badge bg-sol-green/10 text-sol-green border-sol-green/30">⚡ {c.xp} XP</span>
                                 <span className="text-lg">✅</span>
                              </Link>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               {/* ── RIGHT: Sidebar ── */}
               <div className="flex flex-col gap-6">

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                     {[
                        { label: "XP Earned", value: user.xp.toLocaleString(), accent: "text-sol-yellow" },
                        { label: "Day Streak", value: `${user.streak}🔥`, accent: "text-sol-text" },
                        { label: "Courses", value: "1", accent: "text-sol-green" },
                     ].map((s) => (
                        <div key={s.label} className="card-base px-2 py-3 text-center">
                           <div className={`text-lg font-black ${s.accent}`}>{s.value}</div>
                           <div className="text-[9px] text-sol-muted font-semibold uppercase tracking-wide mt-1">{s.label}</div>
                        </div>
                     ))}
                  </div>

                  <div className="card-base p-5">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="w-[3px] h-5 bg-sol-green rounded-full" />
                        <h2 className="text-[15px] font-extrabold text-sol-text">Skill Map</h2>
                     </div>

                     {Object.keys(user.skills).length === 0 ? (
                        <div className="flex justify-center text-center p-6 border border-dashed border-sol-border rounded-xl bg-sol-surface/50">
                           <div className="flex flex-col items-center gap-3">
                              <span className="text-3xl grayscale opacity-50">🧭</span>
                              <p className="text-xs text-sol-muted font-semibold">You haven't mapped any skills yet!</p>
                              <Link href="/settings" className="sol-btn-primary text-[10px] py-1.5 px-3">
                                 + Add your skills
                              </Link>
                           </div>
                        </div>
                     ) : (
                        <>
                           <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {Object.entries(user.skills).map(([skill, val]) => (
                                 <div key={skill} className="flex flex-col items-start justify-between">
                                    <span className="text-[13px] font-semibold text-sol-subtle capitalize">{skill}</span>
                                    <div className="flex items-center gap-2">
                                       <div className="w-20 h-1.5 rounded-full bg-sol-border overflow-hidden">
                                          <div className="h-full rounded-full bg-sol-green transition-all duration-700" style={{ width: `${val}%` }} />
                                       </div>
                                       <span className="text-[11px] font-bold text-sol-green w-8 text-right">{val}%</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>

      </DashboardLayout >
   );
}

