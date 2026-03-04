"use client";

import { useTranslations } from 'next-intl';
import { useState, useMemo } from "react";

import DashboardLayout from '~/components/DashboardLayout';


import { useEffect } from "react";
import LoadingSplash from "~/components/LoadingSplash";
import { dataService } from "~/services/data.service";
import type { LeaderboardUser, CourseFilter } from "~/lib/dummy-data";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLeveling } from "~/hooks/use-leveling";
import { useUserProfile } from "~/hooks/queries/useUserProfile";
import { useLeaderboard } from "~/hooks/queries/useLeaderboard";

const CURRENT_USER = "sol_maya";

const PERIODS = ["weekly", "monthly", "all-time"] as const;
type Period = typeof PERIODS[number];

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const RANK_COLORS: Record<number, string> = {
   1: "from-[#ffd700] to-[#c8a800]",
   2: "from-[#c0c0c0] to-[#999]",
   3: "from-[#cd7f32] to-[#a0522d]",
};


export default function LeaderboardPage() {
   const { publicKey } = useWallet();
   const { xp, level } = useLeveling();
   const { data: profile } = useUserProfile(publicKey?.toBase58());

   const [period, setPeriod] = useState<Period>("all-time");
   const [course, setCourse] = useState("all");
   const [expanded, setExpanded] = useState<string | null>(null);
   const [courseFilters, setCourseFilters] = useState<CourseFilter[]>([]);

   const { data: leaderboardData, isLoading: isLeaderboardLoading } = useLeaderboard(period, course);

   useEffect(() => {
      dataService.getCourseFilters().then(setCourseFilters);
   }, []);

   const filtered = leaderboardData || [];

   if (isLeaderboardLoading && filtered.length === 0) {
      return (
         <DashboardLayout>
            <LoadingSplash message="Updating rankings..." fullScreen={false} />
         </DashboardLayout>
      );
   }

   // Re-rank after filter
   const ranked = filtered.map((u, i) => ({ ...u, filteredRank: i + 1 }));

   const podium = ranked.slice(0, 3);
   const rest = ranked.slice(3);

   // Identify the current user's row — prefer wallet pubkey match, fallback to dummy username
   const myEntry = publicKey
      ? (ranked.find(u => u.username === publicKey.toBase58()) || ranked.find(u => u.username === CURRENT_USER))
      : ranked.find(u => u.username === CURRENT_USER);

   const myEntryDisplay = myEntry ? {
      ...myEntry,
      name: publicKey ? (profile?.user?.name || myEntry.name) : myEntry.name,
      avatar: publicKey ? (profile?.user?.avatar || myEntry.avatar) : myEntry.avatar,
      xp: publicKey ? xp : myEntry.xp,
      level: publicKey ? level : myEntry.level,
      streak: publicKey ? (profile?.user?.streak ?? myEntry.streak) : myEntry.streak,
   } : null;

   return (
      <DashboardLayout>
         <div className="flex flex-col gap-6 animate-fade-up">

            {/* ── Filter bar ── */}
            <div className="flex items-center gap-3 flex-wrap">
               {/* Period pills */}
               <div className="flex gap-1.5 bg-sol-surface border border-sol-border rounded-xl p-1">
                  {PERIODS.map((p) => (
                     <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-150 ${period === p
                           ? "bg-sol-green text-[#f7eacb]"
                           : "text-sol-muted hover:text-sol-subtle"
                           }`}
                     >
                        {p.replace("-", " ")}
                     </button>
                  ))}
               </div>

               {/* Course filter */}
               <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="bg-sol-card border border-sol-border rounded-xl px-3 py-2
                     text-sol-subtle text-xs font-semibold focus:outline-none
                     focus:border-sol-green/50 transition-colors"
               >
                  {courseFilters.map((c) => (
                     <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
               </select>

               <span className="text-xs text-sol-muted ml-auto font-semibold">
                  {ranked.length} learners
               </span>
            </div>

            {/* ── My position callout (if not in top 3) ── */}
            {myEntryDisplay && myEntryDisplay.filteredRank > 3 && (
               <div className="card-base p-4 border-sol-green/30 bg-sol-green/5 flex items-center gap-4">
                  <span className="text-2xl">{myEntryDisplay.avatar}</span>
                  <div className="flex-1">
                     <span className="text-sm font-bold text-sol-text">Your position: </span>
                     <span className="text-sm text-sol-subtle">
                        #{myEntryDisplay.filteredRank} · {myEntryDisplay.xp.toLocaleString()} XP · Level {myEntryDisplay.level}
                     </span>
                  </div>
                  <span className="sol-badge bg-sol-green/10 text-sol-green border-sol-green/30">
                     🔥 {myEntryDisplay.streak}d streak
                  </span>
               </div>
            )}

            {/* ── Top 3 Podium ── */}
            {podium.length === 3 && (
               <div className="card-base p-6">
                  <div className="flex items-end justify-center gap-4">
                     {/* 2nd */}
                     <PodiumSlot user={podium[1]} position={2} height={100} />
                     {/* 1st */}
                     <PodiumSlot user={podium[0]} position={1} height={130} />
                     {/* 3rd */}
                     <PodiumSlot user={podium[2]} position={3} height={80} />
                  </div>
               </div>
            )}

            {/* ── Full rankings table ── */}
            <div className="card-base overflow-hidden">
               <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-4
                        px-5 py-2.5 border-b border-sol-border">
                  <span className="text-[10px] font-bold text-sol-muted uppercase tracking-widest w-8">#</span>
                  <span className="text-[10px] font-bold text-sol-muted uppercase tracking-widest">User</span>
                  <span className="text-[10px] font-bold text-sol-muted uppercase tracking-widest hidden sm:block text-right">Level</span>
                  <span className="text-[10px] font-bold text-sol-muted uppercase tracking-widest hidden sm:block text-right">Streak</span>
                  <span className="text-[10px] font-bold text-sol-muted uppercase tracking-widest text-right">XP</span>
               </div>

               {ranked.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                     <span className="text-4xl opacity-30">🏆</span>
                     <p className="text-sol-subtle font-semibold">No entries yet for this filter</p>
                     <p className="text-xs text-sol-muted">Be the first to earn XP and claim the top spot!</p>
                  </div>
               ) : ranked.map((user, i) => {
                  const isMe = publicKey
                     ? (user.username === publicKey.toBase58() || user.username === CURRENT_USER)
                     : user.username === CURRENT_USER;
                  const isOpen = expanded === user.username;
                  return (
                     <div key={user.username}>
                        <button
                           onClick={() => setExpanded(isOpen ? null : user.username)}
                           className={[
                              "w-full grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto]",
                              "gap-x-4 px-5 py-3.5 text-left transition-all duration-150",
                              "border-b border-sol-border/50 last:border-0",
                              isMe ? "bg-sol-green/5 hover:bg-sol-green/8" : "hover:bg-sol-surface/60",
                           ].join(" ")}
                        >
                           {/* Rank */}
                           <div className={`w-8 text-center font-black text-sm shrink-0 ${user.filteredRank <= 3 ? "text-sol-yellow" : "text-sol-muted"
                              }`}>
                              {RANK_MEDAL[user.filteredRank] ?? `#${user.filteredRank}`}
                           </div>

                           {/* Avatar + name */}
                           <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0">{user.avatar}</span>
                              <div className="min-w-0">
                                 <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-sol-text">{user.name}</span>
                                    {isMe && (
                                       <span className="sol-badge bg-sol-green/10 text-sol-green border-sol-green/30 text-[10px]">You</span>
                                    )}
                                    <span className="text-base">{user.badge}</span>
                                 </div>
                                 <span className="text-xs text-sol-muted">@{user.username}</span>
                              </div>
                           </div>

                           {/* Level */}
                           <div className="hidden sm:flex items-center justify-end">
                              <span className="sol-badge bg-sol-forest/10 text-sol-forest border-sol-forest/30 text-xs">
                                 Lv.{user.level}
                              </span>
                           </div>

                           {/* Streak */}
                           <div className="hidden sm:flex items-center justify-end">
                              <span className="text-sm font-bold text-sol-subtle">🔥 {user.streak}d</span>
                           </div>

                           {/* XP */}
                           <div className="flex items-center justify-end">
                              <span className="sol-badge bg-sol-yellow/15 text-[#7a5800] border-sol-yellow/40 font-bold">
                                 ⚡ {user.xp.toLocaleString()}
                              </span>
                           </div>
                        </button>

                        {/* Expanded detail row — country, twitter, courses */}
                        {isOpen && (
                           <div className={`px-5 py-4 border-b border-sol-border/50 ${isMe ? "bg-sol-green/5" : "bg-sol-surface/40"}`}>
                              <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
                                 {user.country && (
                                    <div className="flex items-center gap-1.5">
                                       <span className="text-sol-muted font-semibold">Country</span>
                                       <span className="text-base">{user.country}</span>
                                    </div>
                                 )}
                                 {user.twitter && (
                                    <div className="flex items-center gap-1.5">
                                       <span className="text-sol-muted font-semibold">Twitter</span>
                                       <span className="text-sol-green font-mono">{user.twitter}</span>
                                    </div>
                                 )}
                                 <div className="flex items-center gap-1.5">
                                    <span className="text-sol-muted font-semibold">Courses</span>
                                    <span className="text-sol-subtle">{user.courses?.length ?? 0} completed</span>
                                 </div>
                                 {user.courses && user.courses.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 w-full">
                                       {user.courses.map(c => (
                                          <span key={c} className="sol-badge bg-sol-card text-sol-subtle border-sol-border text-[10px]">
                                             {c.replace(/-/g, ' ')}
                                          </span>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>
      </DashboardLayout>
   );
}


function PodiumSlot({ user, position, height }: { user: any; position: number; height: number }) {
   const isMe = user.username === CURRENT_USER;
   return (
      <div className="flex flex-col items-center gap-2">
         {position === 1 && <span className="text-2xl">👑</span>}
         <span className="text-3xl">{user.avatar}</span>
         {user.country && <span className="text-base leading-none">{user.country}</span>}
         <div className="text-center">
            <div className={`text-sm font-black ${isMe ? "text-sol-green" : "text-sol-text"}`}>{user.name}</div>
            <div className="text-xs text-sol-muted">⚡ {user.xp.toLocaleString()}</div>
         </div>
         <div
            className={`w-20 rounded-t-xl flex items-center justify-center text-xl font-black
                    bg-linear-to-b ${RANK_COLORS[position]}`}
            style={{ height }}
         >
            {RANK_MEDAL[position]}
         </div>
      </div>
   );
}