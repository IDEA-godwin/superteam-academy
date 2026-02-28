'use client'

import * as anchor from "@coral-xyz/anchor"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { useIsAdmin } from "~/hooks/use-is-admin"

import DashboardLayout from "~/components/DashboardLayout"

import { PROGRAM_ID } from "~/lib/constants"

import IDL from "~/types/idl/onchain_academy.json"
import { getConfigPda } from "~/lib/derive-pda"

export default function Page() {

   const { connection } = useConnection()
   const { connected } = useWallet()
   const wallet = useAnchorWallet()

   // const { admin, loading } = useIsAdmin()

   useEffect(() => {
      (async () => {
         if(connected)
            if (!(await isAdmin())) redirect("/dashboard")
      })()

   }, [connected])


   const isAdmin = async () => {
      if (!wallet) return

      const provider = new anchor.AnchorProvider(connection, wallet)
      anchor.setProvider(provider)

      const configPda = getConfigPda()

      const program = new anchor.Program(IDL as any)
      // @ts-ignore
      const config = await program?.account.config.fetch(configPda)
      const admin: PublicKey = config.authority
      
      return admin.equals(wallet.publicKey)
   }

   const createCourse = () => {}

   const updateCourse = () => {}

   const updateConfig = () => {}

   const registerMinter = () => {}

   const revokeMinter = () => {}

   const createArchievement = () => {} 

   const deactivateArchievement = () => {}

   // if (loading) return <>Loading ...</>

   return (
      <DashboardLayout>
         <>well welll seems you an admin</>
      </DashboardLayout>
   )
}