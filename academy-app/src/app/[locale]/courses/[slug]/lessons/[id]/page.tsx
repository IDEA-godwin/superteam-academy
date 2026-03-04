"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
   Lesson,
   DUMMY_LESSON_CHALLENGE,
   DUMMY_LESSON_DOCUMENT,
   DUMMY_LESSON_VIDEO
} from "~/lib/dummy-data";

import LessonHeader from "../_components/LessonHeader";
import LessonSidebar from "../_components/LessonSidebar";
import ChallengeView from "../_components/views/ChallengeView";
import DocumentView from "../_components/views/DocumentView";
import VideoView from "../_components/views/VideoView";

export default function LessonPage() {
   const params = useParams();
   const id = params?.id as string;

   const [lesson, setLesson] = useState<Lesson>(DUMMY_LESSON_CHALLENGE);
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [completed, setCompleted] = useState(false);

   useEffect(() => {
      // Simulate fetching lesson data based on ID
      if (id === "l5") setLesson(DUMMY_LESSON_VIDEO);
      else if (id === "l6") setLesson(DUMMY_LESSON_DOCUMENT);
      else setLesson(DUMMY_LESSON_CHALLENGE);

      setCompleted(false); // Reset completion state on navigation
   }, [id]);

   return (
      <div className="flex flex-col h-full w-full bg-sol-bg font-display overflow-hidden relative">
         <LessonHeader
            lesson={lesson}
            completed={completed}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
         />

         <div className="flex flex-1 overflow-hidden relative">
            <LessonSidebar
               moduleName={lesson.module}
               courseSlug={lesson.courseSlug}
               sidebarOpen={sidebarOpen}
               setSidebarOpen={setSidebarOpen}
            />

            {/* --- The Dynamic Content Router --- */}
            <main className="flex-1 overflow-y-auto">
               {lesson.type === "challenge" && (
                  <ChallengeView lesson={lesson} completed={completed} setCompleted={setCompleted} />
               )}
               {lesson.type === "document" && (
                  <DocumentView lesson={lesson} completed={completed} setCompleted={setCompleted} />
               )}
               {lesson.type === "video" && (
                  <VideoView lesson={lesson} completed={completed} setCompleted={setCompleted} />
               )}
            </main>
         </div>

         {/* Bottom progress strip */}
         <div className="h-1 bg-sol-border shrink-0 z-30 relative">
            <div
               className="h-full bg-linear-to-r from-sol-green to-sol-forest transition-all duration-700"
               style={{ width: completed ? "100%" : "60%" }}
            />
         </div>
      </div>
   );
}