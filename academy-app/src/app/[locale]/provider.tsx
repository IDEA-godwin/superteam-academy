'use client'

import dynamic from "next/dynamic";
import { PropsWithChildren, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import GlobalLoader from "~/components/GlobalLoader";

const WalletProvider = dynamic(
   () => import("~/components/providers/wallet-provider").then(m => m.SolanaProvider), {
   ssr: false
}
)


export default function Providers({ children }: PropsWithChildren) {
   const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
         queries: {
            staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
            retry: 1, // Only retry failed requests once
            refetchOnWindowFocus: false, // Don't refetch when switching tabs unless stale
         },
      },
   }));

   return (
      <QueryClientProvider client={queryClient}>
         <SessionProvider>
            <WalletProvider>
               {/* <GlobalLoader /> */}
               {children}
            </WalletProvider>
         </SessionProvider>
         <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
   )
}