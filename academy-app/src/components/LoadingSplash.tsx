import { Loader2 } from "lucide-react";

interface LoadingSplashProps {
   message?: string;
   fullScreen?: boolean;
}

export default function LoadingSplash({
   message = "Loading...",
   fullScreen = true
}: LoadingSplashProps) {
   return (
      <div className={`
         flex flex-col items-center justify-center bg-sol-bg
         ${fullScreen ? 'fixed inset-0 z-100 bg-opacity-90 backdrop-blur-md' : 'w-full h-full min-h-[400px] rounded-xl'}
         animate-fade-in
      `}>
         <div className="relative flex items-center justify-center mb-6">
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-16 h-16 bg-sol-green/20 rounded-full animate-ping"></div>
            {/* Inner circle */}
            <div className="relative w-16 h-16 bg-sol-surface border border-sol-border rounded-full flex items-center justify-center shadow-lg">
               <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>⚡</span>
            </div>

            {/* Spinning loader */}
            <Loader2 className="absolute w-[72px] h-[72px] text-sol-green animate-spin" strokeWidth={1.5} />
         </div>

         <div className="flex flex-col items-center gap-2">
            <h2 className="text-sol-text font-black text-lg tracking-tight">Superteam Academy</h2>
            <p className="text-sol-muted font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">
               {message}
            </p>
         </div>
      </div>
   );
}
