"use client";

import { useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";

import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from '~/lib/derive-pda';
import IDL from "~/types/idl/onchain_academy.json";
import { useSession } from "next-auth/react";

export function useAuthenticate() {
   const { connected } = useWallet();
   const { data: session } = useSession()
   const [authenticated, setAuthenticated] = useState(connected || !!session?.user);
   const [isAdmin, setIsAdmin] = useState(false);
   const [loading, setLoading] = useState(true);
   const { status } = useSession()

   const { connection } = useConnection();
   const wallet = useAnchorWallet();

   useEffect(() => {
      // 1. Determine base authentication
      const isWalletConnected = connected && !!wallet;
      const isWeb2Auth = status === "authenticated";

      if (isWalletConnected || isWeb2Auth) {
         setAuthenticated(true);
      } else if (status !== "loading") {
         setAuthenticated(false);
         setIsAdmin(false);
      }

      // 2. Handle admin check if wallet is connected
      let isMounted = true;
      const verifyAdmin = async () => {
         if (!wallet) {
            if (isMounted && status !== "loading") setLoading(false);
            return;
         }

         try {
            const provider = new anchor.AnchorProvider(connection, wallet, {});
            anchor.setProvider(provider);
            const configPda = getConfigPda();
            const program = new anchor.Program(IDL as any);
            // @ts-ignore
            const config = await program?.account.config.fetch(configPda) as any;
            const admin: PublicKey = config.authority;
            if (isMounted) {
               setIsAdmin(admin.equals(wallet.publicKey));
               setLoading(false);
            }
         } catch (e) {
            // Fallback if config is not initialized or program fails
            if (isMounted) {
               setIsAdmin(false);
               setLoading(false);
            }
         }
      };

      // Only check admin when wallet state changes
      if (isWalletConnected) {
         verifyAdmin();
      } else if (status !== "loading") {
         setLoading(false);
      }

      return () => { isMounted = false; };
   }, [connected, wallet, status, connection]);

   return {
      loading,
      authenticated,
      isAdmin,
   };
}
