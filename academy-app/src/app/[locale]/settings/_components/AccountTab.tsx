"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { SectionHead, Field, TextInput } from "./Shared";
import type { UserProfile } from "~/lib/dummy-data";

export function AccountTab({ user }: { user: UserProfile }) {
   const [email, setEmail] = useState(user.email);
   const { data: session } = useSession();
   const { publicKey, wallet, disconnect } = useWallet();
   const { setVisible } = useWalletModal();

   const isConnected = !!session?.user;

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Email */}
         <div className="card-base p-6">
            <SectionHead>Email Address</SectionHead>
            <Field label="Email" hint="Used for course updates and credential notifications.">
               <TextInput value={email} onChange={setEmail} type="email" />
            </Field>

            <button className="sol-btn-primary text-xs py-2">Update Email</button>
         </div>

         {/* Connected accounts */}
         <div className="card-base p-6">
            <SectionHead>Connected Accounts</SectionHead>

            {/* GitHub */}
            <div className="flex items-center justify-between py-3 border-b border-sol-border/50 last:border-0">
               <div className="flex items-center gap-3">
                  <span className="text-2xl">🐙</span>
                  <div>
                     <div className="text-sm font-bold text-sol-text">GitHub</div>
                     {isConnected && <div className="text-xs text-sol-muted">{session.user?.name || session.user?.email}</div>}
                  </div>
               </div>
               <button
                  onClick={() => isConnected ? signOut() : signIn("github")}
                  className={isConnected ? "sol-btn-ghost text-xs py-1.5" : "sol-btn-primary text-xs py-1.5"}
               >
                  {isConnected ? "Disconnect" : "Connect"}
               </button>
            </div>

            {/* Google */}
            <div className="flex items-center justify-between py-3 border-b border-sol-border/50 last:border-0">
               <div className="flex items-center gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                     <div className="text-sm font-bold text-sol-text">Google</div>
                  </div>
               </div>
               <button
                  onClick={() => signIn("google")}
                  className="sol-btn-primary text-xs py-1.5"
               >
                  Connect
               </button>
            </div>
         </div>

         {/* Connected wallets */}
         <div className="card-base p-6 lg:col-span-2">
            <SectionHead>Connected Wallets</SectionHead>

            {publicKey ? (
               <div className="flex items-center justify-between p-4 bg-sol-surface rounded-xl
                           border border-sol-border mb-3">
                  <div className="flex items-center gap-3">
                     {wallet?.adapter.icon ? (
                        <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full" />
                     ) : (
                        <span className="text-2xl">👻</span>
                     )}
                     <div>
                        <div className="text-sm font-bold text-sol-text">{wallet?.adapter.name || "Wallet"}</div>
                        <div className="font-mono text-xs text-sol-muted">
                           {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="sol-badge bg-sol-green/10 text-sol-green border-sol-green/30 text-xs">Primary</span>
                     <button onClick={disconnect} className="sol-btn-ghost text-xs py-1.5">Disconnect</button>
                  </div>
               </div>
            ) : (
               <div className="text-center py-6 border border-dashed border-sol-border rounded-xl mb-4">
                  <p className="text-sol-muted text-sm mb-2">No wallet connected.</p>
                  <button onClick={() => setVisible(true)} className="sol-btn-primary text-xs">
                     Connect Wallet
                  </button>
               </div>
            )}

            {publicKey && (
               <button onClick={() => setVisible(true)} className="sol-btn-ghost text-xs w-full justify-center">
                  + Switch / Add Another Wallet
               </button>
            )}
         </div>
      </div>
   );
}
