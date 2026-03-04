import { useState, useRef, useEffect, useCallback } from "react";
import { Lesson } from "~/lib/dummy-data";
import MarkdownRenderer from "~/components/MarkdownRenderer";
import CodeEditor from "../CodeEditor";

interface Props {
   lesson: Lesson;
   completed: boolean;
   setCompleted: (val: boolean) => void;
}

export default function ChallengeView({ lesson, completed, setCompleted }: Props) {
   const [code, setCode] = useState(lesson.starterCode || "");
   const [showSolution, setShowSolution] = useState(false);
   const [hintIdx, setHintIdx] = useState(-1);
   const [panelWidth, setPanelWidth] = useState(50);
   const dragging = useRef(false);
   const containerRef = useRef<HTMLDivElement>(null);

   const onMouseDown = useCallback((e: React.MouseEvent) => { dragging.current = true; e.preventDefault(); }, []);

   useEffect(() => {
      const onMove = (e: MouseEvent) => {
         if (!dragging.current || !containerRef.current) return;
         const rect = containerRef.current.getBoundingClientRect();
         const pct = ((e.clientX - rect.left) / rect.width) * 100;
         setPanelWidth(Math.min(Math.max(pct, 25), 75));
      };
      const onUp = () => { dragging.current = false; };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
   }, []);

   return (
      <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">

         {/* LEFT: content */}
         <div className="overflow-y-auto shrink-0" style={{ width: `${panelWidth}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-6 pb-24">

               {/* Lesson header */}
               <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-sol-muted mb-2">
                     <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-sol-green inline-block" />
                     {lesson.duration} · {lesson.module}
                  </div>
                  <h1 className="text-2xl font-extrabold text-sol-text">{lesson.title}</h1>
               </div>

               <MarkdownRenderer content={lesson.content} />

               {/* Hints */}
               {lesson.hints && lesson.hints.length > 0 && (
                  <div className="mt-8 card-base p-4 border-sol-yellow/30">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-sol-text flex items-center gap-2">
                           💡 Hints
                        </span>
                        <span className="text-xs text-sol-muted">
                           {Math.max(0, hintIdx + 1)}/{lesson.hints.length}
                        </span>
                     </div>
                     {hintIdx >= 0 && (
                        <div className="space-y-2 mb-3">
                           {lesson.hints.slice(0, hintIdx + 1).map((h, i) => (
                              <div key={i}
                                 className="text-xs text-sol-subtle bg-sol-yellow/5 rounded-lg p-3
                                border border-sol-yellow/25 animate-fade-up">
                                 {i + 1}. {h}
                              </div>
                           ))}
                        </div>
                     )}
                     <button
                        onClick={() => setHintIdx(Math.min(hintIdx + 1, lesson.hints!.length - 1))}
                        disabled={hintIdx >= lesson.hints.length - 1}
                        className="sol-btn-ghost text-xs py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                        {hintIdx < 0
                           ? "Show first hint"
                           : hintIdx >= lesson.hints.length - 1
                              ? "No more hints"
                              : "Next hint →"}
                     </button>
                  </div>
               )}

               {/* Solution toggle */}
               {lesson.solutionCode && (
                  <div className="mt-4 card-base p-4">
                     <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="flex items-center justify-between w-full text-sm font-bold
                          text-sol-subtle hover:text-sol-text transition-colors">
                        <span className="flex items-center gap-2">
                           🔓 {showSolution ? "Hide" : "Show"} Solution
                        </span>
                        <span className="text-xs opacity-60">{showSolution ? "▲" : "▼"}</span>
                     </button>
                     {showSolution && (
                        <div className="mt-3 animate-fade-up">
                           <pre className="bg-sol-bg border border-sol-border rounded-xl p-4 overflow-x-auto
                                 font-mono text-xs text-sol-green leading-relaxed">
                              <code>{lesson.solutionCode}</code>
                           </pre>
                           <button
                              onClick={() => { setCode(lesson.solutionCode!); setShowSolution(false); }}
                              className="mt-2 sol-btn-ghost text-xs py-1.5">
                              Copy to editor
                           </button>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* ── Divider ── */}
         <div onMouseDown={onMouseDown}
            className="w-1 bg-sol-border hover:bg-sol-green/40 cursor-col-resize
                 shrink-0 transition-colors duration-150 relative group z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-3 h-8 rounded-full bg-sol-muted group-hover:bg-sol-green
                      transition-colors duration-150 opacity-50" />
         </div>

         {/* RIGHT: editor */}
         <CodeEditor
            code={code}
            setCode={setCode}
            starterCode={lesson.starterCode || ""}
            language={lesson.language}
            testCases={lesson.testCases}
            onComplete={() => setCompleted(true)}
         />
      </div>
   );
}
