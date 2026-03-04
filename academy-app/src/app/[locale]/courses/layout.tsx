"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import DashboardLayout from "~/components/DashboardLayout";

import Header from "~/components/Header";
import { useAuthenticate } from "~/hooks/use-authenticate";

export default function CourseLayout({ children }: PropsWithChildren) {
   const { isAdmin, authenticated } = useAuthenticate();
   const pathname = usePathname();
   const isLessonPage = pathname?.includes("/lessons/");

   if (authenticated) {
      return (
         <DashboardLayout isAdmin={isAdmin} disablePadding={isLessonPage}>{children}</DashboardLayout>
      );
   }

   return (
      <div className="flex flex-col items-center justify-center font-sans bg-sol-bg">
         <Header />
         <div className="w-full max-w-8xl md:max-w-6xl min-h-screen bg-sol-bg font-display">
            {children}
         </div>
      </div>
   );
}