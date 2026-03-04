import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { rust } from "@codemirror/lang-rust";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import confetti from "canvas-confetti";
import { TestCase } from "~/lib/dummy-data";

interface CodeEditorProps {
   code: string;
   setCode: (val: string) => void;
   starterCode: string;
   language?: "rust" | "typescript" | "javascript" | "json";
   testCases?: TestCase[];
   onComplete: () => void;
}

export default function CodeEditor({ code, setCode, starterCode, language = "rust", testCases = [], onComplete }: CodeEditorProps) {
   const [isExecuting, setIsExecuting] = useState(false);
   const [results, setResults] = useState<{ id: string; passed: boolean }[] | null>(null);

   const getLanguageExtension = () => {
      switch (language) {
         case "rust": return rust();
         case "typescript": return javascript({ typescript: true });
         case "javascript": return javascript();
         case "json": return json();
         default: return rust();
      }
   };

   const handleRun = () => {
      if (isExecuting) return;
      setIsExecuting(true);
      setResults(null);

      // Simulate a network delay for code execution
      setTimeout(() => {
         let allPassed = true;
         const evaluatedResults = testCases.map(tc => {
            // Mock validation by checking if the required snippet is present
            const passed = code.includes(tc.validationSnippet);
            if (!passed) allPassed = false;
            return { id: tc.id, passed };
         });

         setResults(evaluatedResults);
         setIsExecuting(false);

         if (allPassed && testCases.length > 0) {
            triggerConfetti();
            onComplete();
         }
      }, 1200);
   };

   const triggerConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
         confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#14F195", "#9945FF"]
         });
         confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#14F195", "#9945FF"]
         });

         if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
   };

   // A custom dark theme tailored to match the 'sol-bg' / 'sol-green' aesthetics.
   const customTheme = EditorView.theme({
      "&": {
         backgroundColor: "transparent",
         color: "var(--color-sol-text)"
      },
      ".cm-content": {
         fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
         fontSize: "12px",
      },
      ".cm-gutters": {
         backgroundColor: "var(--color-sol-surface)", // Use our CSS variable
         color: "var(--color-sol-muted)",
         border: "none",
         borderRight: "1px solid var(--color-sol-border)"
      },
      ".cm-activeLineGutter": {
         backgroundColor: "var(--color-sol-border)",
         color: "#fff"
      },
      ".cm-activeLine": {
         backgroundColor: "rgba(255, 255, 255, 0.03)"
      },
      ".cm-selectionBackground, .cm-focused .cm-selectionBackground, ::selection": {
         backgroundColor: "var(--color-sol-green-dk)"
      },
      "&.cm-focused": {
         outline: "none"
      },
      ".cm-scroller": {
         overflow: "auto"
      }
   });

   return (
      <div className="flex flex-col flex-1 overflow-hidden bg-sol-bg">
         {/* Editor toolbar */}
         <div className="flex items-center justify-between px-4 py-2
                   bg-sol-surface border-b border-sol-border shrink-0">
            <div className="flex items-center gap-2">
               {/* Fake traffic lights using brand colors */}
               <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-sol-yellow" />
                  <span className="w-3 h-3 rounded-full bg-sol-green" />
               </div>
               <span className="text-xs text-sol-muted font-mono ml-1">
                  {language === "rust" ? "lib.rs" : language === "typescript" ? "index.ts" : language === "json" ? "data.json" : "script.js"}
               </span>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => setCode(starterCode)}
                  disabled={isExecuting}
                  className="sol-btn-ghost py-1 text-xs disabled:opacity-50">Reset</button>
               <button onClick={handleRun}
                  disabled={isExecuting}
                  className="sol-btn-primary py-1 text-xs min-w-[100px] flex justify-center items-center gap-2">
                  {isExecuting ? (
                     <>
                        <span className="w-3 h-3 border-2 border-sol-bg border-t-transparent rounded-full animate-spin" />
                        Running
                     </>
                  ) : (
                     "▶ Run Tests"
                  )}
               </button>
            </div>
         </div>

         {/* Code area */}
         <div className="flex-1 overflow-hidden relative">
            <CodeMirror
               value={code}
               height="100%"
               extensions={[getLanguageExtension()]}
               theme={customTheme}
               onChange={(value) => setCode(value)}
               className="h-full absolute inset-0 text-sol-green"
               basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  history: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  defaultKeymap: true,
                  searchKeymap: true,
                  historyKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
               }}
            />
         </div>

         {/* Output panel */}
         {results && (
            <div className="border-t shrink-0 p-4 font-mono text-xs leading-relaxed animate-fade-up bg-sol-surface/50 border-sol-border">
               <div className="mb-2 text-sol-muted font-bold tracking-widest uppercase text-[10px]">Test Results</div>
               <div className="space-y-1.5">
                  {testCases.map(tc => {
                     const passed = results.find(r => r.id === tc.id)?.passed;
                     return (
                        <div key={tc.id} className="flex items-start gap-2">
                           {passed ? (
                              <span className="text-sol-green shrink-0 mt-0.5">✓ [PASS]</span>
                           ) : (
                              <span className="text-red-400 shrink-0 mt-0.5">✗ [FAIL]</span>
                           )}
                           <span className={passed ? "text-sol-text" : "text-red-300"}>
                              {tc.description}
                           </span>
                        </div>
                     );
                  })}
               </div>

               {/* Final status summary */}
               <div className="mt-4 pt-3 border-t border-sol-border/30 font-semibold">
                  {results.every(r => r.passed) ? (
                     <span className="text-sol-green">All tests passed! Amazing work. 🎉</span>
                  ) : (
                     <span className="text-red-400">Some tests failed. Check your logic and run again.</span>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}
