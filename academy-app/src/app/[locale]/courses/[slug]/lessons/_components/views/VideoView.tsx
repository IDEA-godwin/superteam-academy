import { useEffect } from "react";
import { Lesson } from "~/lib/dummy-data";
import MarkdownRenderer from "~/components/MarkdownRenderer";

interface Props {
   lesson: Lesson;
   completed: boolean;
   setCompleted: (val: boolean) => void;
}

export default function VideoView({ lesson, completed, setCompleted }: Props) {
   // Mark video as read/watched after 5 seconds for demonstration
   useEffect(() => {
      if (!completed) {
         const t = setTimeout(() => {
            setCompleted(true);
         }, 5000);
         return () => clearTimeout(t);
      }
   }, [completed, setCompleted]);

   return (
      <div className="flex-1 overflow-y-auto w-full h-full bg-sol-bg">
         <div className="max-w-4xl mx-auto px-6 py-8 pb-24">

            {/* Video Player Header */}
            <div className="mb-6">
               <h1 className="text-3xl font-extrabold text-sol-text mb-2 animate-fade-up">
                  {lesson.title}
               </h1>
               <div className="flex items-center gap-2 text-sm text-sol-muted font-bold tracking-wider uppercase animate-fade-up" style={{ animationDelay: "100ms" }}>
                  <span>{lesson.module}</span>
                  <span className="w-1 h-1 rounded-full bg-sol-border inline-block" />
                  <span>{lesson.duration}</span>
               </div>
            </div>

            {/* Video Player */}
            {lesson.videoUrl && (
               <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-sol-border shadow-2xl mb-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
                  <iframe
                     src={lesson.videoUrl}
                     title={lesson.title}
                     className="absolute inset-0 w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                  />
               </div>
            )}

            {/* Transcript / Notes */}
            <div className="bg-sol-surface rounded-xl border border-sol-border p-8 animate-fade-up" style={{ animationDelay: "300ms" }}>
               <MarkdownRenderer content={lesson.content} />

               <div className="mt-8 pt-6 border-t border-sol-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-sol-muted">
                     {completed ? "✓ Video completed" : "Watching video..."}
                  </span>
               </div>
            </div>

         </div>
      </div>
   );
}
