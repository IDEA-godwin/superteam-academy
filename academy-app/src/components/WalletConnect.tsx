'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import { Button } from '~/components/ui/button'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthenticate } from '~/hooks/use-authenticate'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, Wallet } from 'lucide-react'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import AuthModal from './AuthModal'
import LoadingSplash from './LoadingSplash'

export default function ConnectWallet({ title }: { title?: string }) {
   const { push } = useRouter()
   const pathname = usePathname()
   const { connected, disconnect, publicKey } = useWallet()
   const { setVisible } = useWalletModal()

   const { loading, isAdmin, authenticated } = useAuthenticate()
   const [isAuthOpen, setIsAuthOpen] = useState(false)
   const { data: session } = useSession()

   useEffect(() => {
      if (!authenticated && pathname !== '/') push('/');
      if (connected && !loading) {
         if (authenticated && pathname !== "/") return;
         if (!isAdmin) push('/dashboard');
         else push('/admin');
         // @ts-ignore
         if (session?.user?.customToken) {
            // @ts-ignore
            sessionStorage.setItem('lms_academy_user_token', session.user.customToken);
         }
         fetch('/api/user', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${sessionStorage.getItem('lms_academy_user_token') || ''}`
            },
            body: JSON.stringify({ wallet: publicKey?.toBase58() })
         }).then(res => res.json()).then(data => {
            if (data?.token) {
               sessionStorage.setItem('lms_academy_user_token', data.token);
            }
         }).catch(console.error);
      }
   }, [connected, publicKey, loading, authenticated, isAdmin, pathname, push, session]);


   // if (loading) return <LoadingSplash />;

   return authenticated ? (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full flex items-center gap-2">
               {!!session?.user ? (
                  <>
                     {session?.user?.image ? (
                        <img src={session.user.image} alt="User Avatar" className="w-5 h-5 rounded-full" />
                     ) : (
                        <div className="w-5 h-5 rounded-full bg-sol-green" />
                     )}
                     <span className="text-sm font-medium">
                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                     </span>
                  </>
               ) : (
                  <>
                     <Wallet className="w-4 h-4 text-sol-green" />
                     {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                  </>
               )}
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-56 bg-sol-surface border-sol-border">
            <DropdownMenuLabel className="font-normal">
               <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-sol-text min-h-4">
                     {!!session?.user
                        ? (session?.user?.name || "Connected User")
                        : "Wallet User"}
                  </p>
                  <p className="text-xs leading-none text-sol-muted min-h-3">
                     {!!session?.user
                        ? (session?.user?.email)
                        : "Connected via Solana"}
                  </p>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sol-border" />

            {connected ? (
               <DropdownMenuItem className="p-3 cursor-default" onSelect={(e) => e.preventDefault()}>
                  <Wallet className="mr-2 h-4 w-4 text-sol-green" />
                  <span className="font-semibold">
                     {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                  </span>
               </DropdownMenuItem>
            ) : (
               <DropdownMenuItem onClick={() => setVisible(true)} className="p-3 cursor-pointer text-sol-green hover:text-sol-forest focus:text-sol-forest focus:bg-sol-green/10">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Connect Wallet</span>
               </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-sol-border" />
            <DropdownMenuItem
               onClick={async (e) => {
                  e.preventDefault();
                  if (connected) await disconnect();
                  if (!!session?.user) await signOut();
               }}
               className="text-red-500 hover:text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer p-3"
            >
               <LogOut className="mr-2 h-4 w-4" />
               <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   ) : (
      <>
         <Button
            onClick={() => setIsAuthOpen(true)}
            className={`bg-sol-green hover:bg-sol-forest text-sol-bg font-extrabold uppercase tracking-wide
               text-md w-64 rounded-lg px-8 py-6 shadow-sol-yellow shadow-md active:shadow-none
               hover:shadow-sol-yellow hover:translate-y-0.5 active:translate-y-1 transition-all duration-100
               ${!title ? "hidden" : ""}
            `}
         >
            {title}
         </Button>

         <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
         />
      </>
   )
}