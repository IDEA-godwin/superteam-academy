"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { OnchainAcademy } from "~/types/onchain_academy";
import IDL from "~/types/idl/onchain_academy.json";
import { courseService } from "~/services/course.service";

export function useCourses() {
   const { connection } = useConnection();
   const wallet = useAnchorWallet();

   return useQuery({
      queryKey: ["onchain-courses", wallet?.publicKey?.toBase58()],
      queryFn: async () => {
         // Create provider using an anonymous wallet if not connected
         // getting courses doesn't require signing, just reading.
         // If wallet is connected, use it. Otherwise use a dummy wallet.
         const dummyWallet = wallet || {
            publicKey: anchor.web3.Keypair.generate().publicKey,
            signTransaction: async (tx: any) => tx,
            signAllTransactions: async (txs: any[]) => txs,
         };

         const provider = new anchor.AnchorProvider(connection, dummyWallet as anchor.Wallet, {
            commitment: "confirmed",
         });

         const program = new anchor.Program(IDL as any, provider) as anchor.Program<OnchainAcademy>;

         // Fetch courses from on-chain using the courseService
         const courses = await courseService.getCourses(program);
         return courses;
      },
      // You can adjust this as needed for your cache preferences
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!connection
   });
}
