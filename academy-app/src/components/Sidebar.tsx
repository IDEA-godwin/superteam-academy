"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const NAV = [
   { id: "dashboard", icon: "🏠", labelKey: "dashboard", path: "/dashboard" },
   { id: "courses", icon: "🔥", labelKey: "courses", path: "/courses" },
   { id: "leaderboard", icon: "🏆", labelKey: "leaderboard", path: "/leaderboard" },
   { id: "profile", icon: "👤", labelKey: "profile", path: "/profile" },
   { id: "settings", icon: "⚙️", labelKey: "settings", path: "/settings" }
];

export default function Sidebar() {
   const pathname = usePathname();
   const t = useTranslations("Navigation");

   return (
      <aside className="fixed bg-sol-bg bottom-0 md:top-0 left-0 w-full h-16 border-t-2 md:border-t-0 md:w-20 lg:w-64 md:h-screen md:border-r-2 border-sol-text flex flex-row md:flex-col px-2 md:px-3 lg:px-7 py-0 md:py-10 z-[100] md:overflow-y-auto overflow-x-hidden transition-all duration-200">

         {/* Logo */}
         <div className="hidden md:flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-2 pb-6 mb-4 overflow-hidden">
            <span className="text-[20px] font-black text-duo-green tracking-tight hidden lg:block whitespace-nowrap">Superteam<br />Academy</span>
            <span className="text-[20px] font-black text-duo-green tracking-tight block lg:hidden">SA</span>
         </div>

         {/* Nav items */}
         <nav className="flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-1.5 flex-1 items-center md:items-stretch h-full md:h-auto">
            {NAV.map(item => {
               const isActive = pathname.includes(item.path);

               return (
                  <Link
                     key={item.id}
                     href={item.path}
                     className={[
                        "flex items-center justify-center lg:justify-start gap-3.5 px-3 md:px-0 lg:px-3.5 py-2 md:py-3 rounded-[14px] md:border-2 transition-all duration-200",
                        "text-sm font-extrabold uppercase tracking-wide",
                        isActive
                           ? "bg-sol-green/60 text-duo-green-dark md:border-sol-green"
                           : "bg-transparent text-duo-muted border-transparent hover:bg-duo-surface hover:text-sol-text hover:bg-sol-green/50",
                     ].join(" ")}
                  >
                     <span className="text-[24px] md:text-[20px] w-7 text-center shrink-0">{item.icon}</span>
                     <span className="hidden lg:inline whitespace-nowrap">{t(item.labelKey)}</span>
                  </Link>
               )
            })}
         </nav>
      </aside>
   )
}