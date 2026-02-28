'use client'

import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
// import { DynamicWidget, useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { Button } from '~/components/ui/button'
import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function ConnectWallet({ title }: { title: string }) {
   //    const { sdkHasLoaded, primaryWallet, handleLogOut, setShowAuthFlow } = useDynamicContext()
   //    const isLoggedIn = useIsLoggedIn()

   //    if (isLoggedIn && primaryWallet) return (
   //       <>
   //          <DynamicWidget />
   //          <Button onClick={handleLogOut} variant="outline" className="rounded-full" >
   //             {primaryWallet.address.slice(0, 4)}...{primaryWallet.address.slice(-4)}
   //          </Button>
   //       </>
   //    )

   //    return (
   //       <Button
   //          onClick={() => setShowAuthFlow(true)}
   //          disabled={!sdkHasLoaded}
   //          className="
   //           bg-academy-primary hover:bg-[#2f6b3f] text-background font-extrabold uppercase tracking-wide
   //             text-md w-64 rounded-lg px-8 py-6 shadow-[0_4px_0_#ffd23f] active:shadow-none
   //             hover:shadow-[0_4px_0_#ffd23f] hover:translate-y-0.5 
   //             active:translate-y-1 transition-all duration-100
   //       ">
   //          {title}
   //       </Button>
   //    )
   // }

   // export default function ConnectButton() {
   const { setVisible } = useWalletModal()
   const { connected, disconnect, publicKey } = useWallet()

   useEffect(() => {
      if (connected)
         redirect("/admin")
   }, [connected])

   return connected ? (
      <Button onClick={disconnect} variant="outline" className="rounded-full">
         {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
      </Button>
   ) : (
      <Button
         onClick={() => setVisible(true)}
         className="
         bg-academy-primary hover:bg-[#2f6b3f] text-background font-extrabold uppercase tracking-wide
         text-md w-64 rounded-lg px-8 py-6 shadow-[0_4px_0_#ffd23f] active:shadow-none
         hover:shadow-[0_4px_0_#ffd23f] hover:translate-y-0.5 
         active:translate-y-1 transition-all duration-100
      ">
         {title}
      </Button>
   )
}