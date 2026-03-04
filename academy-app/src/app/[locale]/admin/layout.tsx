import { PropsWithChildren } from "react";
import DashboardLayout from "~/components/DashboardLayout";


export default function AdminLayout({ children }: PropsWithChildren) {

   return (
      <DashboardLayout>
         {children}
      </DashboardLayout>
   )
}