import React from "react";

function renderInline(text: string) {
   return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((p: string, i: number) => {
      if (p.startsWith("**") && p.endsWith("**"))
         return <strong key={i} className="text-sol-text font-semibold">{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
         return <code key={i} className="bg-sol-green/10 text-sol-green px-1.5 py-0.5 rounded text-[11px] font-mono">{p.slice(1, -1)}</code>;
      return p;
   });
}

export default function MarkdownRenderer({ content }: { content: string }) {
   const lines = content.split("\n");
   const out = [];
   let i = 0, codeBlock: string | null = null;

   while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("\`\`\`")) {
         if (codeBlock !== null) {
            out.push(
               <pre key={`cb-${i}`}
                  className="bg-sol-bg border border-sol-border rounded-xl p-4 my-4
                       overflow-x-auto font-mono text-xs text-sol-green leading-relaxed">
                  <code>{codeBlock}</code>
               </pre>
            );
            codeBlock = null;
         } else { codeBlock = ""; }
         i++; continue;
      }
      if (codeBlock !== null) { codeBlock += line + "\n"; i++; continue; }

      if (line.startsWith("## ")) {
         out.push(
            <h2 key={i} className="text-xl font-bold text-sol-text mt-8 mb-3 flex items-center gap-2">
               <span className="w-1 h-5 bg-sol-green rounded-full shrink-0" />
               {line.slice(3)}
            </h2>
         );
      } else if (line.startsWith("### ")) {
         out.push(<h3 key={i} className="text-base font-bold text-sol-text mt-6 mb-2">{line.slice(4)}</h3>);
      } else if (/^\d+\./.test(line)) {
         const items = [line];
         while (lines[i + 1] && /^\d+\./.test(lines[i + 1])) { i++; items.push(lines[i]); }
         out.push(
            <ol key={i} className="list-decimal list-inside space-y-1.5 my-3 text-sol-subtle text-sm">
               {items.map((it, j) => <li key={j}>{renderInline(it.replace(/^\d+\. /, ""))}</li>)}
            </ol>
         );
      } else if (line.startsWith("> ")) {
         out.push(
            <div key={i} className="border-l-2 border-sol-yellow/60 pl-4 py-1 my-3 bg-sol-yellow/5 rounded-r-lg">
               <p className="text-sm text-sol-subtle italic">{line.slice(2)}</p>
            </div>
         );
      } else if (line.trim()) {
         out.push(<p key={i} className="text-sol-subtle text-sm leading-relaxed my-2">{renderInline(line)}</p>);
      }
      i++;
   }
   return <div>{out}</div>;
}
