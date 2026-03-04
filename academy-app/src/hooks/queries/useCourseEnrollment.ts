"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { OnchainAcademy } from "~/types/onchain_academy";
import { courseService, getCompletedLessonIndices } from "~/services/course.service";
import type { BN } from "@coral-xyz/anchor";

import IDL from "~/types/idl/onchain_academy.json"

export interface EnrollmentState {
   enrolled: boolean;
   finalized: boolean;
   lessonsDone: Set<number>;
   completedCount: number;
   progress: number; // 0-100
   credentialAsset: string | null;
}

export function useCourseEnrollment(courseId: string, lessonCount: number) {
   const wallet = useAnchorWallet();
   const { connection } = useConnection();

   const queryKey = ["enrollment", courseId, wallet?.publicKey?.toBase58()];

   const query = useQuery<EnrollmentState>({
      queryKey,
      enabled: !!wallet && !!courseId,
      staleTime: 0, // always re-fetch after mutations
      queryFn: async (): Promise<EnrollmentState> => {
         if (!wallet) return notEnrolled(lessonCount);

         const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
         const program = new Program<OnchainAcademy>(IDL, provider);

         const enrollment = await courseService.getEnrollment(program, courseId, wallet.publicKey);

         if (!enrollment) return notEnrolled(lessonCount);

         const flags = enrollment.lessonFlags as BN[];
         const completedIndices = getCompletedLessonIndices(flags, lessonCount);
         const completedCount = completedIndices.length;

         return {
            enrolled: true,
            finalized: !!enrollment.completedAt,
            lessonsDone: new Set(completedIndices),
            completedCount,
            progress: lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0,
            credentialAsset: enrollment.credentialAsset?.toBase58() ?? null,
         };
      },
   });

   const queryClient = useQueryClient();

   // Enroll mutation
   const enrollMutation = useMutation({
      mutationFn: async (prerequisiteIds: string[] = []) => {
         if (!wallet) throw new Error("Wallet not connected");
         const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
         const program = new Program<OnchainAcademy>(IDL, provider);
         return courseService.enrollCourse(program, wallet, courseId, prerequisiteIds);
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey }),
   });

   return { ...query, enroll: enrollMutation };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function notEnrolled(lessonCount: number): EnrollmentState {
   return {
      enrolled: false,
      finalized: false,
      lessonsDone: new Set(),
      completedCount: 0,
      progress: 0,
      credentialAsset: null,
   };
}
