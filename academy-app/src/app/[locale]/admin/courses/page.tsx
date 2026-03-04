"use client";

import { useEffect, useState } from "react";
import { AnchorWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { WebUploader } from "@irys/web-upload";
import Solana from "@irys/web-upload-solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { client } from "~/sanity/lib/client";
import { adminService } from "~/services/admin.service";
import { OnchainAcademy } from "~/types/onchain_academy";
import { ICourse, Difficulty } from "~/types/course";
import { useCourses } from "~/hooks/use-courses";

import IDL from "~/types/idl/onchain_academy.json"
import { txIdToBytes } from "~/lib/arweave";

export default function AdminCoursesPage() {
   const { connection } = useConnection();
   const wallet = useAnchorWallet();

   const adapter = useWallet()

   const { data: onchainData, refetch: refetchOnchain, isLoading: onchainLoading } = useCourses();

   const [courses, setCourses] = useState<ICourse[]>([]);
   const [loading, setLoading] = useState(true);
   const [registeringCourseId, setRegisteringCourseId] = useState<string | null>(null);

   useEffect(() => {
      const fetchCourses = async () => {
         try {
            const query = `*[_type == "course"]{
               courseId,
               slug,
               title,
               description,
               thumbnail,
               creator,
               difficulty,
               lessonCount,
               xpPerLesson,
               track,
               prerequisite,
               creatorRewardXp,
               minCompletionsForReward,
               modules
            }`;
            const data = await client.fetch(query);
            setCourses(data);
         } catch (error) {
            console.error("Failed to fetch courses from CMS:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchCourses();
   }, []);

   const getIrys = async (wallet: any) => {
      // 1. Create the WebIrys object
      const webIrys = await WebUploader(Solana).withProvider(wallet).withRpc("https://api.devnet.solana.com").devnet()
      return webIrys;
   };

   const handleRegister = async (course: ICourse) => {
      if (!wallet) return;
      console.log("on-chain data ", adapter)
      console.log(course)
      // Programmatic guard against duplicate registration
      const isAlreadyRegistered = onchainData?.some(c => c.account.courseId === course.courseId);
      if (isAlreadyRegistered) {
         toast.error("This course is already registered on-chain.");
         return;
      }

      setRegisteringCourseId(course.courseId);

      try {
         const irys = await getIrys(adapter)
         const provider = new anchor.AnchorProvider(connection, wallet, {});
         anchor.setProvider(provider);
         const program = new anchor.Program(IDL as any) as anchor.Program<OnchainAcademy>;

         const courseContent = {
            id: course.courseId,
            slug: course.slug,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail ? "ipfs://mocked-or-sanity-cdn-url" : undefined, // Simplify for now
            creatorName: course.creator.creatorName,
            difficulty: course.difficulty,
            challengeCount: course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.filter((l: any) => l.lessonType === 3).length || 0), 0) || 0,
            xpTotal: course.xpPerLesson * course.lessonCount,
            duration: "Self-Paced",
            modules: course.modules
         }
         const receipt = await irys.upload(JSON.stringify(courseContent));
         const contentTxId = txIdToBytes(receipt.id);

         const txString = await adminService.createCourse(program, wallet, course, contentTxId);
         console.log("Successfully registered on-chain:", txString);
         toast.success("Course Registered Successfully!");
         refetchOnchain();
      } catch (error) {
         console.error("Error registering course:", error);
         toast.error("Registration failed. See console for details.");
      } finally {
         setRegisteringCourseId(null);
      }
   };


   return (
      <div className="max-w-4xl animate-fade-up space-y-6">

         <div className="card-base p-6 border-b border-sol-border">
            <h1 className="text-2xl font-black text-sol-text tracking-tight">Course Synchronization</h1>
            <p className="text-sol-muted mt-2">View courses defined in Sanity CMS and publish them to the Solana blockchain.</p>
         </div>

         <div className="space-y-4">
            {loading || onchainLoading ? (
               <div className="text-center p-8 text-sol-muted animate-pulse">Loading CMS courses...</div>
            ) : courses.length === 0 ? (
               <div className="text-center p-8 text-sol-muted card-base">No courses found in CMS.</div>
            ) : (
               courses.map((course) => {
                  const isRegistered = onchainData?.some(c => c.account.courseId === course.courseId);

                  return (
                     <div key={course.courseId} className="card-base p-5 flex flex-col md:flex-row gap-4 justify-between items-center transition-all hover:bg-sol-surface/30">
                        <div className="flex-1">
                           <div className="flex gap-2 items-center mb-1">
                              <span className="bg-sol-green/20 text-sol-green px-2 py-0.5 rounded text-xs font-bold font-mono">
                                 {course.courseId}
                              </span>
                              {course.difficulty && (
                                 <span className="text-xs text-sol-muted uppercase font-bold tracking-wider">
                                    • {course.difficulty}
                                 </span>
                              )}
                           </div>
                           <h3 className="text-lg font-bold text-sol-text">{course.title}</h3>
                           <div className="text-sm text-sol-muted mt-1 flex flex-wrap gap-x-4 gap-y-1">
                              <span>👤 {course.creator?.creatorName}</span>
                              <span>📚 {course.lessonCount || 0} Lessons</span>
                              <span>⭐ {course.xpPerLesson || 0} XP/Lesson</span>
                           </div>
                        </div>
                        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                           <Button
                              onClick={() => handleRegister(course)}
                              disabled={registeringCourseId === course.courseId || isRegistered}
                              variant={isRegistered ? "outline" : "default"}
                              className="w-full md:w-auto"
                           >
                              {registeringCourseId === course.courseId ? "Registering..." : isRegistered ? "Already Registered" : "Register On-Chain"}
                           </Button>
                        </div>
                     </div>
                  )
               })
            )}
         </div>

      </div>
   );
}
