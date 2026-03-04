'use client'

import { PropsWithChildren, useEffect } from "react";
import Sidebar from "~/components/Sidebar";
import TopBar from "~/components/TopBar";
import { useSession } from "next-auth/react";

interface LayoutProps extends PropsWithChildren {
   isAdmin?: boolean;
   disablePadding?: boolean;
}

export default function DashboardLayout({
   children,
   isAdmin,
   disablePadding
}: LayoutProps) {
   const { data: session } = useSession();

   return (
      <div className={`flex h-screen w-full bg-sol-bg font-sans ${disablePadding ? 'overflow-hidden' : ''}`}>
         <Sidebar />
         {/* Offset for fixed sidebar */}
         <div className="mb-16 md:mb-0 md:ml-20 lg:ml-64 flex flex-col flex-1 h-full transition-all duration-200">
            <TopBar />

            {/* The main scrollable area for normal pages, or fixed full-height for IDE pages */}
            <main className={`flex-1 w-full mx-auto relative ${!disablePadding ? 'max-w-5xl pt-7 px-4 md:px-6 pb-20' : 'px-4 pb-2 overflow-hidden'}`}>
               {children}
            </main>
         </div>
      </div>
   )
}