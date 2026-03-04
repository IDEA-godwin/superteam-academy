"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";

// ── Custom component map ──────────────────────────────────────────────────────
const components: PortableTextComponents = {
   types: {
      // Handles code blocks inserted via @sanity/code-input
      code: ({ value }) => (
         <div className="my-6 rounded-xl overflow-hidden border border-sol-border">
            {value.filename && (
               <div className="flex items-center gap-2 px-4 py-2 bg-sol-surface border-b border-sol-border text-xs font-mono text-sol-muted">
                  <span className="text-sol-green">📄</span>
                  {value.filename}
               </div>
            )}
            <pre className="bg-sol-bg px-5 py-4 overflow-x-auto font-mono text-sm text-sol-green leading-relaxed">
               <code>{value.code}</code>
            </pre>
            {value.language && (
               <div className="px-4 py-1.5 bg-sol-surface text-[10px] font-bold uppercase tracking-widest text-sol-muted border-t border-sol-border">
                  {value.language}
               </div>
            )}
         </div>
      ),

      // Inline images from the body
      image: ({ value }) =>
         value?.asset?.url ? (
            <img
               src={value.asset.url}
               alt={value.alt || ""}
               className="my-6 rounded-xl border border-sol-border w-full object-contain"
            />
         ) : null,
   },

   block: {
      h1: ({ children }) => (
         <h1 className="text-3xl font-extrabold text-sol-text mt-10 mb-4">{children}</h1>
      ),
      h2: ({ children }) => (
         <h2 className="text-2xl font-bold text-sol-text mt-8 mb-3">{children}</h2>
      ),
      h3: ({ children }) => (
         <h3 className="text-xl font-semibold text-sol-text mt-6 mb-2">{children}</h3>
      ),
      normal: ({ children }) => (
         <p className="text-sol-subtle leading-relaxed mb-4">{children}</p>
      ),
      blockquote: ({ children }) => (
         <blockquote className="border-l-4 border-sol-green/40 pl-4 my-4 text-sol-muted italic">
            {children}
         </blockquote>
      ),
   },

   marks: {
      code: ({ children }) => (
         <code className="font-mono text-sm bg-sol-surface border border-sol-border rounded px-1.5 py-0.5 text-sol-green">
            {children}
         </code>
      ),
      strong: ({ children }) => (
         <strong className="font-bold text-sol-text">{children}</strong>
      ),
      em: ({ children }) => <em className="italic opacity-80">{children}</em>,
      link: ({ value, children }) => (
         <a
            href={value?.href}
            target="_blank"
            rel="noreferrer"
            className="text-sol-green underline underline-offset-2 hover:opacity-80 transition-opacity"
         >
            {children}
         </a>
      ),
   },

   list: {
      bullet: ({ children }) => (
         <ul className="list-disc list-inside space-y-1.5 mb-4 text-sol-subtle pl-2">{children}</ul>
      ),
      number: ({ children }) => (
         <ol className="list-decimal list-inside space-y-1.5 mb-4 text-sol-subtle pl-2">{children}</ol>
      ),
   },

   listItem: {
      bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
      number: ({ children }) => <li className="leading-relaxed">{children}</li>,
   },
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
   value: any[]; // Portable Text blocks array from Sanity
}

export default function PortableTextRenderer({ value }: Props) {
   if (!value || value.length === 0) return null;
   return <PortableText value={value} components={components} />;
}
