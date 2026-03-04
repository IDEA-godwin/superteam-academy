
import { BN, Program } from '@coral-xyz/anchor'
import { SystemProgram, PublicKey } from '@solana/web3.js'
import { OnchainAcademy } from '~/types/onchain_academy'
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { getCoursePda, getEnrollmentPda } from '~/lib/derive-pda';

// ── Bitmap helpers (from INTEGRATION.md) ──────────────────────────────────────

export function isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean {
   const wordIndex = Math.floor(lessonIndex / 64);
   const bitIndex = lessonIndex % 64;
   return !lessonFlags[wordIndex].and(new BN(1).shln(bitIndex)).isZero();
}

export function countCompletedLessons(lessonFlags: BN[]): number {
   return lessonFlags.reduce((sum, word) => {
      let count = 0;
      let w = word.clone();
      while (!w.isZero()) {
         count += w.and(new BN(1)).toNumber();
         w = w.shrn(1);
      }
      return sum + count;
   }, 0);
}

export function getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[] {
   const completed: number[] = [];
   for (let i = 0; i < lessonCount; i++) {
      if (isLessonComplete(lessonFlags, i)) completed.push(i);
   }
   return completed;
}

// ── CourseService ─────────────────────────────────────────────────────────────

class CourseService {

   /** Fetch all active courses from on-chain */
   async getCourses(program: Program<OnchainAcademy>) {
      const all = await program.account.course.all();
      return all.filter(c => c.account.isActive);
   }

   /** Fetch a single course PDA account */
   async getCourseOnchain(program: Program<OnchainAcademy>, coursePda: PublicKey) {
      // const coursePda = getCoursePda(courseId);
      return program.account.course.fetchNullable(coursePda);
   }

   /**
    * Fetch the learner's enrollment for a course.
    * Returns null if the learner is not enrolled (or has closed enrollment).
    */
   async getEnrollment(
      program: Program<OnchainAcademy>,
      courseId: string,
      learnerPubkey: PublicKey,
   ) {
      const enrollmentPda = getEnrollmentPda(courseId, learnerPubkey);
      return program.account.enrollment.fetchNullable(enrollmentPda);
   }

   async getAllWalletEnrollments(program: Program<OnchainAcademy>, wallet: AnchorWallet) {
      const enrollments = await program.account.enrollment.all();
      return enrollments
      // return enrollments.filter(e => e.account.learner.equals(wallet.publicKey));
   }

   /** Enroll the connected wallet in a course. Learner wallet signs. */
   async enrollCourse(
      program: Program<OnchainAcademy>,
      wallet: AnchorWallet,
      courseId: string,
      prerequisiteIds: string[] = [],
   ) {
      const coursePda = getCoursePda(courseId);
      const enrollmentPda = getEnrollmentPda(courseId, wallet.publicKey);

      const remainingAccounts = prerequisiteIds.flatMap(pid => [
         { pubkey: getCoursePda(pid), isWritable: false, isSigner: false },
         { pubkey: getEnrollmentPda(pid, wallet.publicKey), isWritable: false, isSigner: false },
      ]);

      return await program.methods
         .enroll(courseId)
         .accountsPartial({
            course: coursePda,
            enrollment: enrollmentPda,
            learner: wallet.publicKey,
            systemProgram: SystemProgram.programId,
         })
         .remainingAccounts(remainingAccounts)
         .rpc();
   }

   /** Close enrollment (learner signs). Reclaims rent. */
   async closeEnrollment(
      program: Program<OnchainAcademy>,
      wallet: AnchorWallet,
      courseId: string,
   ) {
      const coursePda = getCoursePda(courseId);
      const enrollmentPda = getEnrollmentPda(courseId, wallet.publicKey);
      await program.methods
         .closeEnrollment()
         .accountsPartial({
            course: coursePda,
            enrollment: enrollmentPda,
            learner: wallet.publicKey,
         })
         .rpc();
   }
}

export const courseService = new CourseService();