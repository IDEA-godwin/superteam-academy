import { NextResponse } from "next/server";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
   getAssociatedTokenAddressSync,
   TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { OnchainAcademy } from "~/types/onchain_academy";
import IDL from "~/types/idl/onchain_academy.json"
import { getCoursePda, getConfigPda, getEnrollmentPda } from "~/lib/derive-pda";
import { MPL_CORE_PROGRAM_ID, } from "~/lib/constants";
import { SystemProgram } from "@solana/web3.js";
import fs from "fs";

// ── Setup ─────────────────────────────────────────────────────────────────────

function getBackendProgram() {
   const keyPath = process.env.ANCHOR_WALLET!;
   const rawKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
   const backendSigner = Keypair.fromSecretKey(Uint8Array.from(rawKey));

   const connection = new Connection(
      process.env.NEXT_PUBLIC_DEVNET_URL || "https://api.devnet.solana.com",
      "confirmed",
   );

   // NodeWallet is the correct name in Anchor ≥ 0.30 (previously exported as Wallet)
   const { NodeWallet } = require("@coral-xyz/anchor");
   const wallet = new NodeWallet(backendSigner);
   const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
   const program = new Program<OnchainAcademy>(IDL as any, provider);

   return { program, backendSigner, connection };
}

// ── POST /api/course/finalize ─────────────────────────────────────────────────
// Body: { courseId, learnerPubkey, credentialName, metadataUri }
// Steps:
//   1. finalize_course (backend signed) — awards 50% bonus XP
//   2. issue_credential  OR  upgrade_credential (backend signed) — mints/updates NFT

export async function POST(req: Request) {
   try {
      const { courseId, learnerPubkey, credentialName, metadataUri, existingCredentialAsset } =
         await req.json();

      if (!courseId || !learnerPubkey || !credentialName || !metadataUri) {
         return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { program, backendSigner } = getBackendProgram();

      const learner = new PublicKey(learnerPubkey);
      const configPda = getConfigPda();
      const coursePda = getCoursePda(courseId);
      const enrollmentPda = getEnrollmentPda(courseId, learner);

      const config = await program.account.config.fetch(configPda);
      const xpMint = config.xpMint;

      const learnerXpAta = getAssociatedTokenAddressSync(
         xpMint, learner, false, TOKEN_2022_PROGRAM_ID,
      );

      // Fetch course to get creator info
      const courseAccount = await program.account.course.fetch(coursePda);
      const creator = courseAccount.creator;
      const creatorXpAta = getAssociatedTokenAddressSync(
         xpMint, creator, false, TOKEN_2022_PROGRAM_ID,
      );

      // Step 1: finalize_course
      const finalizeTx = await program.methods
         .finalizeCourse()
         .accountsPartial({
            config: configPda,
            course: coursePda,
            enrollment: enrollmentPda,
            learner,
            learnerTokenAccount: learnerXpAta,
            creatorTokenAccount: creatorXpAta,
            creator,
            xpMint,
            backendSigner: backendSigner.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
         })
         .signers([backendSigner])
         .rpc();

      // Re-fetch enrollment for completed data
      const enrollment = await program.account.enrollment.fetch(enrollmentPda);
      const coursesCompleted = 1; // MVP: increment is tracked off-chain; credential stores running total
      const totalXp = 1000//enrollment.xpEarned instanceof BN
      // ? enrollment.xpEarned.toNumber()
      // : (enrollment.xpEarned as any);

      // Determine track collection from config (stored in config.trackCollections or via course.trackId)
      // MVP: use config authority as fallback payer; track collection must be pre-created by admin
      const trackCollection = (config as any).trackCollections?.[courseAccount.trackId] ??
         new PublicKey("11111111111111111111111111111111"); // placeholder — admin must set

      let credentialTx: string;
      let credentialAsset: string;

      if (existingCredentialAsset) {
         // upgrade_credential
         credentialAsset = existingCredentialAsset;
         credentialTx = await program.methods
            .upgradeCredential(credentialName, metadataUri, coursesCompleted, new BN(totalXp))
            .accountsPartial({
               config: configPda,
               course: coursePda,
               enrollment: enrollmentPda,
               learner,
               credentialAsset: new PublicKey(existingCredentialAsset),
               trackCollection,
               payer: backendSigner.publicKey,
               backendSigner: backendSigner.publicKey,
               mplCoreProgram: MPL_CORE_PROGRAM_ID,
               systemProgram: SystemProgram.programId,
            })
            .signers([backendSigner])
            .rpc();
      } else {
         // issue_credential — generate new asset keypair
         const { Keypair: KP } = await import("@solana/web3.js");
         const credentialKp = KP.generate();
         credentialAsset = credentialKp.publicKey.toBase58();

         credentialTx = await program.methods
            .issueCredential(credentialName, metadataUri, coursesCompleted, new BN(totalXp))
            .accountsPartial({
               config: configPda,
               course: coursePda,
               enrollment: enrollmentPda,
               learner,
               credentialAsset: credentialKp.publicKey,
               trackCollection,
               payer: backendSigner.publicKey,
               backendSigner: backendSigner.publicKey,
               mplCoreProgram: MPL_CORE_PROGRAM_ID,
               systemProgram: SystemProgram.programId,
            })
            .signers([backendSigner, credentialKp])
            .rpc();
      }

      return NextResponse.json({
         ok: true,
         finalizeTx,
         credentialTx,
         credentialAsset,
      });

   } catch (error: any) {
      console.error("[finalize API]", error);
      const code = error?.error?.errorCode?.code;
      if (code === "CourseAlreadyFinalized") {
         return NextResponse.json({ error: "CourseAlreadyFinalized" }, { status: 409 });
      }
      if (code === "CourseNotCompleted") {
         return NextResponse.json({ error: "CourseNotCompleted — not all lessons done" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
