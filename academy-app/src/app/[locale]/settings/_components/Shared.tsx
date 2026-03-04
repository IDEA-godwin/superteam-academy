import React from 'react';


export function SectionHead({ children }: { children: React.ReactNode }) {
   return (
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-sol-border">
         <span className="w-[3px] h-5 bg-sol-green rounded-full shrink-0" />
         <h3 className="text-sm font-extrabold text-sol-text">{children}</h3>
      </div>
   );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
   return (
      <div className="mb-4">
         <label className="block text-xs font-bold text-sol-subtle mb-1.5 uppercase tracking-wide">{label}</label>
         {children}
         {hint && <p className="text-[11px] text-sol-muted mt-1.5">{hint}</p>}
      </div>
   );
}

export function TextInput({ value, onChange, type = "text", placeholder }: {
   value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
   return (
      <input
         type={type}
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         className="w-full bg-sol-card border border-sol-border rounded-xl px-3.5 py-2.5
                 text-sol-text text-sm placeholder:text-sol-muted
                 focus:outline-none focus:border-sol-green/60 transition-colors"
      />
   );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
   return (
      <div
         onClick={() => onChange(!checked)}
         className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${checked ? "bg-sol-green" : "bg-sol-border"
            }`}
      >
         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"
            }`} />
      </div>
   );
}

export function ToggleRow({ label, sub, checked, onChange }: {
   label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
   return (
      <div className="flex items-center justify-between py-3 border-b border-sol-border/50 last:border-0">
         <div>
            <div className="text-sm font-semibold text-sol-text">{label}</div>
            {sub && <div className="text-xs text-sol-muted mt-0.5">{sub}</div>}
         </div>
         <Toggle checked={checked} onChange={onChange} />
      </div>
   );
}
