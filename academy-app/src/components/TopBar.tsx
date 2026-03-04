"use client";
import { useMemo } from "react";

import { useAuthenticate } from "~/hooks/use-authenticate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import ConnectWallet from "./WalletConnect";
import { useLeveling } from "~/hooks/use-leveling";
import { useUserProfile } from "~/hooks/queries/useUserProfile";
import { useWallet } from "@solana/wallet-adapter-react";

export default function TopBar() {

   const { isAdmin } = useAuthenticate()
   const { publicKey } = useWallet();
   const { xp } = useLeveling();
   const { data: profile } = useUserProfile(publicKey?.toBase58());

   const streak = profile?.user?.streak || 0;
   const activityHistory = profile?.user?.activityHistory || [];

   return (
      <header className="sticky bg-sol-bg top-0 z-40">
         <div className="flex items-baseline-last justify-end-safe px-6 h-24 max-w-265 mx-auto w-full pb-4">

            <div className="flex items-center gap-2 mt-12">
               {/* Streak / XP / Gems pills */}
               {!isAdmin && <>
                  <StreakCalendarDropDown streak={streak} activityHistory={activityHistory} />
                  <div
                     className="sol-badge bg-sol-card text-sol-text border-sol-border hover:border-sol-green cursor-pointer">
                     <span className="text-sm">⚡</span>
                     <span className="tracking-tight">{xp.toLocaleString()}</span>
                  </div>
               </>}

               {/* Avatar */}
               <div className="rounded-full  border-2 border-duo-green flex items-center text-xl cursor-pointer hover:scale-110 transition-transform duration-150">
                  <ConnectWallet />
               </div>
            </div>
         </div>
      </header>
   );
}

// 4 weeks of streak data grid
const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const StreakCalendarDropDown = ({ streak, activityHistory = [] }: { streak: number, activityHistory?: string[] }) => {
   const { grid, daysToShow } = useMemo(() => {
      const g = [];
      const today = new Date();

      const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
      const daysToSaturday = 6 - dayOfWeek;
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + daysToSaturday);

      const daysCount = streak < 7 ? 7 : 28;

      for (let i = daysCount - 1; i >= 0; i--) {
         const d = new Date(endOfWeek);
         d.setDate(d.getDate() - i);
         const dateString = d.toISOString().split("T")[0];
         g.push(activityHistory.includes(dateString) ? 1 : 0);
      }
      return { grid: g, daysToShow: daysCount };
   }, [activityHistory, streak]);

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <div
               className={`sol-badge bg-sol-card border hover:border-sol-green cursor-pointer ${streak === 0 ? "text-sol-muted border-sol-border/50 opacity-80" : "text-sol-text border-sol-border"}`}>
               <span className={`text-sm ${streak === 0 ? 'grayscale opacity-60' : ''}`}>🔥</span>
               <span className="tracking-tight">{streak}</span>
            </div>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="p-0">
            <div className="card-base rounded-sm p-6 w-82">
               <div className="flex items-center justify-between mb-5">
                  <div className="flex justify-between items-center w-full">
                     <div className="text-[11px] font-bold text-sol-muted uppercase tracking-widest mb-1">Current Streak</div>
                     <div className={`font-black ${streak === 0 ? 'text-sol-muted' : 'text-sol-text'}`}>
                        <span className={streak === 0 ? 'grayscale opacity-60' : ''}>🔥</span> {streak} Days
                     </div>
                  </div>
                  {/* <span className="sol-badge bg-sol-yellow/20 text-[#7a5800] border-sol-yellow/50">Personal best!</span> */}
               </div>
               {/* Day labels */}
               <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  {WEEK_LABELS.map((d, i) => (
                     <div key={i} className="text-[10px] font-bold text-sol-muted text-center uppercase">{d}</div>
                  ))}
               </div>
               {/* Grid cells */}
               <div className="grid grid-cols-7 gap-1.5">
                  {grid.map((active, i) => (
                     <div
                        key={i}
                        className={`aspect-square rounded-md transition-all duration-100 ${active ? "bg-sol-green" : "bg-sol-border opacity-50"
                           }`}
                     />
                  ))}
               </div>
               <p className="text-xs text-sol-muted mt-3 text-right">Last {daysToShow} days</p>
            </div>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}