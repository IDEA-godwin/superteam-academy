import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { OnchainAcademy } from "~/types/onchain_academy";
import IDL from "~/types/idl/onchain_academy.json";
import { getConfigPda } from "~/lib/derive-pda";

const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || process.env.NEXT_PULIC_DEVNET_URL || "https://api.devnet.solana.com";

class LevelingService {
   private connection: Connection;
   private program: anchor.Program<OnchainAcademy>;

   constructor() {
      this.connection = new Connection(RPC_URL);
      const provider = new anchor.AnchorProvider(this.connection, {} as any, { commitment: "confirmed" });
      this.program = new anchor.Program(IDL as any, provider) as anchor.Program<OnchainAcademy>;
   }

   /**
    * Gets the current XP total for a wallet by querying their Token-2022 associated token account.
    */
   async getXpBalance(walletPubkey: string | PublicKey): Promise<number> {
      try {
         const pubkey = new PublicKey(walletPubkey);
         const configPda = getConfigPda();
         const config = await this.program.account.config.fetch(configPda);
         const xpMintPubkey = config.xpMint;

         const xpAta = getAssociatedTokenAddressSync(
            xpMintPubkey,
            pubkey,
            false,
            TOKEN_2022_PROGRAM_ID
         );

         const balance = await this.connection.getTokenAccountBalance(xpAta);
         return Number(balance.value.amount);
      } catch (error: any) {
         // Could throw if ATA doesn't exist or isn't created yet
         console.warn("Could not fetch XP balance (ATA might not exist yet):", error.message);
         return 0;
      }
   }

   /**
    * Retrieves the achievements as Metaplex Core assets using Helius DAS API.
    */
   async getAchievements(walletPubkey: string | PublicKey) {
      try {
         const pubkeyStr = walletPubkey.toString();
         const response = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               jsonrpc: "2.0",
               id: "1",
               method: "getAssetsByOwner",
               params: { ownerAddress: pubkeyStr, page: 1, limit: 100 },
            }),
         });

         if (!response.ok) return [];

         const data = await response.json();
         // Returning all assets. Frontend can filter by Metaplex Core or attributes later.
         return data.result?.items || [];
      } catch (error) {
         console.error("Error fetching achievements:", error);
         return [];
      }
   }

   /**
    * Level = floor(sqrt(totalXP / 100))
    */
   calculateLevel(xp: number): number {
      if (xp < 0) return 0;
      return Math.floor(Math.sqrt(xp / 100));
   }

   /**
    * Utility to calculate XP required for the NEXT level
    */
   calculateXpToNextLevel(currentLevel: number, currentXp: number): number {
      const nextLevel = currentLevel + 1;
      const totalXpNeeded = Math.pow(nextLevel, 2) * 100;
      return totalXpNeeded - currentXp;
   }
}


export const levelingService = new LevelingService();
