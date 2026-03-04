"use client";

import Link from "next/link";
import DashboardLayout from "~/components/DashboardLayout";

// ── DATA ──────────────────────────────────────────────────────────────────────
const USER = {
   name: "Maya Okonkwo",
   avatar: "👩🏾‍💻",
   level: 14,
   xp: 8420,
   xpToNext: 1580,
   rank: 7,
   streak: 22,
};

const IN_PROGRESS = [
   {
      slug: "anchor-framework",
      title: "Anchor Framework Deep Dive",
      icon: "⚓",
      progress: 65,
      nextLesson: "PDAs and seeds",
      nextLessonId: "l7",
      xp: 1200,
      difficulty: "intermediate",
   },
   {
      slug: "defi-protocols",
      title: "Building DeFi Protocols",
      icon: "⟠",
      progress: 20,
      nextLesson: "AMM math deep dive",
      nextLessonId: "l3",
      xp: 2500,
      difficulty: "advanced",
   },
];

const RECOMMENDED = [
   { slug: "program-security", title: "Solana Program Security", icon: "⬢", difficulty: "advanced", xp: 2000 },
   { slug: "compressed-nfts", title: "Compressed NFTs (cNFTs)", icon: "⬡", difficulty: "intermediate", xp: 700 },
   { slug: "rust-for-solana", title: "Rust for Solana Devs", icon: "⚙", difficulty: "intermediate", xp: 1800 },
];

const ACHIEVEMENTS = [
   { icon: "🔥", label: "22-Day Streak", sub: "Keep it up!" },
   { icon: "⚡", label: "XP Grinder", sub: "8,000+ XP earned" },
   { icon: "🏆", label: "Top 10 Global", sub: "Rank #7" },
   { icon: "🔐", label: "First PDA", sub: "Anchor milestone" },
   { icon: "🌐", label: "dApp Deployer", sub: "Deployed to devnet" },
   { icon: "◎", label: "SOL Native", sub: "1 year on Solana" },
];

const ACTIVITY = [
   { time: "2h ago", icon: "✅", text: "Completed lesson: Account types in Anchor" },
   { time: "5h ago", icon: "⚡", text: "Earned 120 XP — PDAs and seeds" },
   { time: "1d ago", icon: "🏆", text: "Reached Rank #7 on global leaderboard" },
   { time: "2d ago", icon: "🔥", text: "20-day streak milestone achieved!" },
   { time: "3d ago", icon: "✅", text: "Completed Module 1: Getting Started with Anchor" },
   { time: "4d ago", icon: "📚", text: "Started course: Building DeFi Protocols" },
];

// 4 weeks of streak data (1 = active, 0 = missed)
const STREAK_GRID = [
   0, 1, 1, 1, 0, 1, 1,
   1, 1, 0, 1, 1, 1, 1,
   0, 1, 1, 1, 1, 0, 1,
   1, 1, 1, 1, 1, 1, 1,
];
const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, yellow = false }: { pct: number; yellow?: boolean }) {
   return (
      <div className="h-2 rounded-full bg-sol-border overflow-hidden">
         <div
            className={`h-full rounded-full transition-all duration-700 ${yellow ? "bg-sol-yellow" : "bg-sol-green"}`}
            style={{ width: `${pct}%` }}
         />
      </div>
   );
}

function DiffBadge({ diff }: { diff: string }) {
   const cls =
      diff === "beginner"
         ? "bg-sol-green/10 text-sol-green border-sol-green/30"
         : diff === "intermediate"
            ? "bg-sol-yellow/20 text-[#7a5800] border-sol-yellow/50"
            : "bg-sol-forest/15 text-sol-forest border-sol-forest/40";
   return <span className={`sol-badge ${cls}`}>{diff}</span>;
}

function SectionHead({ children }: { children: React.ReactNode }) {
   return (
      <div className="flex items-center gap-2 mb-4">
         <span className="w-[3px] h-5 bg-sol-green rounded-full shrink-0" />
         <h2 className="text-[15px] font-extrabold text-sol-text">{children}</h2>
      </div>
   );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
   return (
      <DashboardLayout>
         <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 animate-fade-up">

            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-6">

               {/* XP / Level / Rank hero card */}
               <div className="card-base p-6">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <p className="text-[11px] font-bold text-sol-muted uppercase tracking-widest mb-1">Your Progress</p>
                        <div className="flex items-end gap-3">
                           <span className="text-3xl font-black text-sol-text">Level {USER.level}</span>
                           {/* <span className="text-sm font-bold text-sol-green mb-0.5">{USER.xp.toLocaleString()} XP</span> */}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-black text-sol-text">Rank #{USER.rank}</div>
                        <div className="text-xs text-sol-muted">Global Leaderboard</div>
                     </div>
                  </div>
                  <ProgressBar pct={(USER.xp / (USER.xp + USER.xpToNext)) * 100} />
                  <div className="flex justify-between mt-2 text-xs text-sol-muted">
                     <span>{USER.xp.toLocaleString()} XP</span>
                     <span>{USER.xpToNext.toLocaleString()} XP to Level {USER.level + 1}</span>
                  </div>
               </div>

               {/* Continue Learning */}
               <div>
                  <SectionHead>Continue Learning</SectionHead>
                  <div className="flex flex-col gap-3">
                     {IN_PROGRESS.map((course) => (
                        <div key={course.slug} className="card-base p-5">
                           <div className="flex gap-4 items-start">
                              <div className="text-4xl opacity-40 leading-none shrink-0 mt-1">{course.icon}</div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-bold text-sm text-sol-text">{course.title}</span>
                                    <DiffBadge diff={course.difficulty} />
                                 </div>
                                 <p className="text-xs text-sol-muted mb-3">
                                    Next up: <span className="text-sol-subtle font-semibold">{course.nextLesson}</span>
                                 </p>
                                 <ProgressBar pct={course.progress} />
                                 <div className="flex justify-between mt-1.5 text-[11px] text-sol-muted">
                                    <span>{course.progress}% complete</span>
                                    <span className="text-sol-yellow font-semibold">⚡ {course.xp} XP total</span>
                                 </div>
                              </div>
                              <Link
                                 href={`/courses/${course.slug}/lessons/${course.nextLessonId}`}
                                 className="sol-btn-primary shrink-0 text-xs py-2 px-4"
                              >
                                 Continue →
                              </Link>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Recommended Next */}
               <div className="card-base p-5">
                  <p className="text-sm font-extrabold text-sol-text mb-4">✨ Recommended</p>
                  <div className="flex flex-col gap-2.5">
                     {RECOMMENDED.map((c) => (
                        <Link
                           key={c.slug}
                           href={`/courses/${c.slug}`}
                           className="flex items-center gap-3 p-3 rounded-xl bg-sol-surface border border-sol-border
                           hover:border-sol-green/40 hover:bg-sol-green/5 transition-all duration-150 group"
                        >
                           <span className="text-2xl opacity-40 group-hover:opacity-70 transition-opacity">{c.icon}</span>
                           <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-sol-text leading-tight truncate">{c.title}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                 <DiffBadge diff={c.difficulty} />
                                 <span className="text-[10px] text-sol-yellow font-bold">⚡ {c.xp} XP</span>
                              </div>
                           </div>
                           <span className="text-sol-muted group-hover:text-sol-green transition-colors text-sm">→</span>
                        </Link>
                     ))}
                  </div>
               </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-6">

               {/* Streak + XP stat pills */}
               <div className="grid grid-cols-2 gap-3 lg:hidden">
                  {[
                     { label: "XP Earned", value: USER.xp.toLocaleString(), icon: "⚡", color: "text-sol-yellow" },
                     { label: "Day Streak", value: USER.streak, icon: "🔥", color: "text-sol-green" },
                  ].map((s) => (
                     <div key={s.label} className="card-base p-4 text-center">
                        <div className={`text-2xl font-black ${s.color}`}>{s.icon} {s.value}</div>
                        <div className="text-[11px] text-sol-muted mt-1 font-semibold uppercase tracking-wide">{s.label}</div>
                     </div>
                  ))}
               </div>

               {/* Recent Achievements */}
               <div className="card-base p-5">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-sm font-extrabold text-sol-text">🏆 Achievements</p>
                     <button className="text-xs text-sol-green font-semibold hover:underline">View all</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     {ACHIEVEMENTS.map((a, i) => (
                        <div
                           key={i}
                           className="flex items-center gap-2.5 p-2.5 rounded-xl bg-sol-surface border border-sol-border"
                        >
                           <span className="text-xl">{a.icon}</span>
                           <div className="min-w-0">
                              <div className="text-[12px] font-bold text-sol-text leading-tight">{a.label}</div>
                              <div className="text-[10px] text-sol-muted truncate">{a.sub}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div>
                  <SectionHead>Recent Activity</SectionHead>
                  <div className="card-base overflow-hidden">
                     {ACTIVITY.map((item, i) => (
                        <div
                           key={i}
                           className={`flex items-center gap-3 px-5 py-3.5 ${i < ACTIVITY.length - 1 ? "border-b border-sol-border" : ""
                              }`}
                        >
                           <span className="text-lg w-7 text-center shrink-0">{item.icon}</span>
                           <p className="flex-1 text-sm text-sol-subtle">{item.text}</p>
                           <span className="text-[11px] text-sol-muted shrink-0">{item.time}</span>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>
      </DashboardLayout>
   );
}