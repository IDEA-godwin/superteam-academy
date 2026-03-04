"use client";

import { useState, useEffect, useTransition } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "~/i18n/navigation";
import { useLocale } from "next-intl";
import { SectionHead, Field, ToggleRow } from "./Shared";

export function PreferencesTab() {
   const [notifs, setNotifs] = useState({
      emailUpdates: true,
      pushReminders: false,
      weeklyDigest: true,
      newCourses: true,
      achievements: true,
   });

   const locale = useLocale();
   const router = useRouter();
   const pathname = usePathname();
   const [isPending, startTransition] = useTransition();

   const { theme, setTheme } = useTheme();
   const [mounted, setMounted] = useState(false);

   useEffect(() => setMounted(true), []);

   const onLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextLocale = e.target.value;
      startTransition(() => {
         router.replace(pathname, { locale: nextLocale });
      });
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

         <div className="flex flex-col gap-6">
            <div className="card-base p-6">
               <SectionHead>Language</SectionHead>
               <Field label="Interface Language">
                  <select
                     value={locale}
                     onChange={onLanguageChange}
                     disabled={isPending}
                     className="w-full bg-sol-card border border-sol-border rounded-xl px-3.5 py-2.5
                         text-sol-text text-sm focus:outline-none focus:border-sol-green/60 transition-colors"
                  >
                     <option value="en">🇺🇸 English</option>
                     <option value="es">🇪🇸 Español</option>
                     <option value="pt">🇧🇷 Português</option>
                  </select>
               </Field>
            </div>

            {/* Application Theme */}
            <div className="card-base p-6">
               <SectionHead>Application Theme</SectionHead>
               <Field label="Interface Theme">
                  {mounted ? (
                     <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-sol-card border border-sol-border rounded-xl px-3.5 py-2.5
                               text-sol-text text-sm focus:outline-none focus:border-sol-green/60 transition-colors"
                     >
                        <option value="dark">🌙 Dark Mode</option>
                        <option value="light">☀️ Light Mode</option>
                        <option value="system">💻 System Default</option>
                     </select>
                  ) : (
                     <div className="w-full bg-sol-card border border-sol-border rounded-xl px-3.5 py-2.5 text-sol-muted text-sm animate-pulse">
                        Loading theme preferences...
                     </div>
                  )}
               </Field>
            </div>
         </div>
      </div>
   );
}
