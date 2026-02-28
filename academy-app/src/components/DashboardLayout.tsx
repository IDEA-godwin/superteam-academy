'use client'

import { PropsWithChildren, useState } from "react";
import Sidebar from "~/components/Sidebar";


export default function DashboardLayout({
   children
}: PropsWithChildren) {
   const[activeNav, setActiveNav] = useState("learn");

   return (
      <div className="flex min-h-screen font-sans">
         <Sidebar active={activeNav} setActive={setActiveNav} />

         {/* Offset for fixed sidebar */}
         <div className="ml-55 flex flex-col flex-1 min-h-screen">
            {children}
            {/* <TopBar />

            <div className="grid grid-cols-[1fr_340px] max-w-[1060px] w-full mx-auto px-6 pt-7 pb-20 items-start gap-0">
               <LessonPath />
               <RightPanel /> */}
            {/* </div> */}
         </div>
      </div>
   )
}