"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import ConnectWallet from "./WalletConnect";

export default function TopBar() {
   return (
      <header className="sticky bg-sol-bg top-0 z-40">
         <div className="flex items-baseline-last justify-end-safe px-6 h-24 max-w-265 mx-auto w-full pb-4">
            {/* Stats row */}
            <div className="flex items-center gap-2 mt-12">
               {/* Streak / XP / Gems pills */}
               <StreakCalendarDropDown />
               <div
                  className="sol-badge bg-sol-card text-sol-text border-sol-border hover:border-sol-green cursor-pointer">
                  <span className="text-sm">⚡</span>
                  <span className="tracking-tight">8432</span>
               </div>

               {/* Avatar */}
               <div className="rounded-full  border-2 border-duo-green flex items-center text-xl cursor-pointer hover:scale-110 transition-transform duration-150">
                  <ConnectWallet />
               </div>
            </div>
         </div>
      </header>
   );
}

// 4 weeks of streak data (1 = active, 0 = missed)
const STREAK_GRID = [
   0, 1, 1, 1, 0, 1, 1,
   1, 1, 0, 1, 1, 1, 1,
   0, 1, 1, 1, 1, 0, 1,
   1, 1, 1, 1, 1, 1, 1,
];
const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const StreakCalendarDropDown = () => {
   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <div
               className="sol-badge bg-sol-card text-sol-text border-sol-border hover:border-sol-green cursor-pointer">
               <span className="text-sm">🔥</span>
               <span className="tracking-tight">47</span>
            </div>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="p-0">
            <div className="card-base rounded-sm p-6 w-82">
               <div className="flex items-center justify-between mb-5">
                  <div className="flex justify-between items-center w-full">
                     <div className="text-[11px] font-bold text-sol-muted uppercase tracking-widest mb-1">Current Streak</div>
                     <div className="font-black text-sol-text">🔥 47 Days</div>
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
                  {STREAK_GRID.map((active, i) => (
                     <div
                        key={i}
                        className={`aspect-square rounded-md transition-all duration-100 ${active ? "bg-sol-green" : "bg-sol-border opacity-50"
                           }`}
                     />
                  ))}
               </div>
               <p className="text-xs text-sol-muted mt-3 text-right">Last 28 days</p>
            </div>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}