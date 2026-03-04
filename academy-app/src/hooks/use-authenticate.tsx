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

   const checkAdmin = async () => {
      if (!wallet) return false;

      try {
         const provider = new anchor.AnchorProvider(connection, wallet, {});
         anchor.setProvider(provider);

         const configPda = getConfigPda();
         const program = new anchor.Program(IDL as any);

         // @ts-ignore
         const config = await program?.account.config.fetch(configPda) as any;
         const admin: PublicKey = config.authority;
         return admin.equals(wallet.publicKey);
      } catch (e) {
         // Fallback if config is not initialized or program fails
         setLoading(false)
         return false;
      }
   };

   useEffect(() => {
      if (connected || status === "authenticated") {
         setAuthenticated(true)
      }

      if ((!connected || !wallet) && status !== "authenticated") {
         setAuthenticated(false);
         setIsAdmin(false);
         // setLoading(false)
         return;
      }

      (async () => {
         const adminCheck = await checkAdmin();
         // console.log(adminCheck)
         setIsAdmin(adminCheck);
         setLoading(false)
      })();
   }, [connected, status, wallet, checkAdmin]);

   return {
      loading,
      authenticated,
      isAdmin,
   };
}
