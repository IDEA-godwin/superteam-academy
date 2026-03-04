import { useEffect } from "react";
import { Lesson } from "~/lib/dummy-data";
import MarkdownRenderer from "~/components/MarkdownRenderer";

interface Props {
   lesson: Lesson;
   completed: boolean;
   setCompleted: (val: boolean) => void;
}

export default function DocumentView({ lesson, completed, setCompleted }: Props) {
   // Mark document as read after 3 seconds for demonstration
   useEffect(() => {
      if (!completed) {
         const t = setTimeout(() => {
            setCompleted(true);
         }, 3000);
         return () => clearTimeout(t);
      }
   }, [completed, setCompleted]);

   return (
      <div className="flex-1 overflow-y-auto w-full h-full">
         <div className="max-w-3xl mx-auto px-6 py-12 pb-24 animate-fade-up">

            {/* Lesson header */}
            <div className="mb-10 text-center flex flex-col items-center">
               <div className="flex items-center gap-2 text-sm text-sol-muted mb-4 font-bold tracking-widest uppercase">
                  <span>{lesson.module}</span>
                  <span className="w-1 h-1 rounded-full bg-sol-border inline-block" />
                  <span>{lesson.duration}</span>
               </div>
               <h1 className="text-4xl lg:text-5xl font-extrabold text-sol-text leading-tight mb-4">{lesson.title}</h1>
            </div>

            <MarkdownRenderer content={lesson.content} />

            <div className="mt-16 pt-8 border-t border-sol-border text-center">
               <p className="text-sol-muted text-sm px-6">
                  {completed ? "You have completed this document." : "Reading..."}
               </p>
            </div>
         </div>
      </div>
   );
}
