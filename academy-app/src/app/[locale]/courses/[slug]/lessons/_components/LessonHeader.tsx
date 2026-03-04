import Link from "next/link";
import { Lesson } from "~/lib/dummy-data";

interface Props {
   lesson: Lesson;
   completed: boolean;
   sidebarOpen: boolean;
   setSidebarOpen: (open: boolean) => void;
}

export default function LessonHeader({ lesson, completed, sidebarOpen, setSidebarOpen }: Props) {
   return (
      <header className="h-12 flex items-center justify-between px-4
                       bg-sol-surface border-b border-sol-border shrink-0 z-30">
         <div className="flex items-center gap-2 min-w-0">
            {/* Mobile sidebar toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
               className="p-1.5 rounded-lg hover:bg-sol-border text-sol-subtle hover:text-sol-text transition-colors lg:hidden shrink-0">
               ☰
            </button>
            <Link href={`/courses/${lesson.courseSlug}`}
               className="text-xs text-sol-muted hover:text-sol-green transition-colors hidden sm:block shrink-0">
               ← {lesson.courseTitle}
            </Link>
            <span className="text-sol-border hidden sm:block">/</span>
            <span className="text-xs text-sol-subtle hidden sm:block shrink-0">{lesson.module}</span>
            <span className="text-sol-border">/</span>
            <span className="text-xs text-sol-text font-semibold truncate">{lesson.title}</span>
         </div>

         <div className="flex items-center gap-2 shrink-0">
            {/* XP badge */}
            <span className="sol-badge bg-sol-yellow/20 text-sol-yellow-dk border-sol-yellow/50 hidden sm:inline-flex">
               ⚡ +{lesson.xp} XP
            </span>
            {completed && (
               <span className="sol-badge bg-sol-green/20 text-sol-green border-sol-green/40 animate-fade-up">
                  ✓ Completed!
               </span>
            )}
            {lesson.prev && (
               <Link href={`/courses/${lesson.courseSlug}/lessons/${lesson.prev.id}`}
                  className="sol-btn-ghost py-1.5 text-xs hidden md:inline-flex">
                  ← Prev
               </Link>
            )}
            {lesson.next && (
               <Link href={`/courses/${lesson.courseSlug}/lessons/${lesson.next.id}`}
                  className="sol-btn-primary py-1.5 text-xs">
                  Next →
               </Link>
            )}
         </div>
      </header>
   );
}
