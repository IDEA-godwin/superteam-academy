import { NextResponse } from "next/server";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
   getAssociatedTokenAddressSync,
   createAssociatedTokenAccountInstruction,
   TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { OnchainAcademy } from "~/types/onchain_academy";
import IDL from "~/types/idl/onchain_academy.json";
import { getCoursePda, getConfigPda, getEnrollmentPda } from "~/lib/derive-pda";
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

// ── POST /api/course/complete-lesson ─────────────────────────────────────────

export async function POST(req: Request) {
   try {
      const { courseId, lessonIndex, learnerPubkey } = await req.json();

      if (!courseId || lessonIndex === undefined || !learnerPubkey) {
         return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const { program, backendSigner, connection } = getBackendProgram();

      const learner = new PublicKey(learnerPubkey);
      const configPda = getConfigPda();
      const coursePda = getCoursePda(courseId);
      const enrollmentPda = getEnrollmentPda(courseId, learner);

      // Fetch config to get xpMint address
      const config = await program.account.config.fetch(configPda);
      const xpMint = config.xpMint;

      // Derive learner's Token-2022 XP ATA
      const learnerXpAta = getAssociatedTokenAddressSync(
         xpMint,
         learner,
         false,
         TOKEN_2022_PROGRAM_ID,
      );

      // Create ATA if it doesn't exist yet
      const ataInfo = await connection.getAccountInfo(learnerXpAta);
      if (!ataInfo) {
         const createAtaIx = createAssociatedTokenAccountInstruction(
            backendSigner.publicKey, // payer
            learnerXpAta,
            learner,
            xpMint,
            TOKEN_2022_PROGRAM_ID,
         );
         const { Transaction } = await import("@solana/web3.js");
         const tx = new Transaction().add(createAtaIx);
         const { blockhash } = await connection.getLatestBlockhash();
         tx.recentBlockhash = blockhash;
         tx.feePayer = backendSigner.publicKey;
         tx.sign(backendSigner);
         await connection.sendRawTransaction(tx.serialize());
      }

      // Call complete_lesson — backend signer signs
      const txSig = await program.methods
         .completeLesson(lessonIndex)
         .accountsPartial({
            config: configPda,
            course: coursePda,
            enrollment: enrollmentPda,
            learner,
            learnerTokenAccount: learnerXpAta,
            xpMint,
            backendSigner: backendSigner.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
         })
         .signers([backendSigner])
         .rpc();

      // Re-fetch enrollment to return updated bitmap state
      const enrollment = await program.account.enrollment.fetch(enrollmentPda);
      const { getCompletedLessonIndices } = await import("~/services/course.service");
      const onchainCourse = await program.account.course.fetch(coursePda);
      const completedIndices = getCompletedLessonIndices(
         enrollment.lessonFlags as BN[],
         onchainCourse.lessonCount,
      );

      return NextResponse.json({
         ok: true,
         txSig,
         completedLessons: completedIndices,
         completedCount: completedIndices.length,
         lessonCount: onchainCourse.lessonCount,
      });

   } catch (error: any) {
      console.error("[complete-lesson API]", error);
      const code = error?.error?.errorCode?.code;
      if (code === "LessonAlreadyCompleted") {
         return NextResponse.json({ error: "LessonAlreadyCompleted" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
