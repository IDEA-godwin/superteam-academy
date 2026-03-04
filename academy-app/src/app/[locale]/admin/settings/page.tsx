"use client";

import { SectionHead, Field, TextInput } from "../../settings/_components/Shared";
import { Button } from "~/components/ui/button";



export default function AdminSettingsPage() {

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
         
         {/* Platform Init */}
         <div className="card-base p-6">
            <SectionHead>Platform Initialization</SectionHead>
            <p className="text-sm text-sol-muted mb-4">One-time setup for the Config PDA and XP Mint.</p>
            <Button className="w-full">Initialize</Button>
         </div>

         {/* Config & Security */}
         <div className="card-base p-6">
            <SectionHead>Configuration & Security</SectionHead>
            <p className="text-sm text-sol-muted mb-4">Rotate backend signer or deactivate old minter.</p>
            <Field label="New Backend Signer">
               <TextInput value="" onChange={() => { }} placeholder="Provider Pubkey" />
            </Field>
            <Button className="w-full mt-2">Update Config</Button>
         </div>

         {/* Minter Management */}
         <div className="card-base p-6">
            <SectionHead>Minter Delegates</SectionHead>
            <p className="text-sm text-sol-muted mb-4">Authorize external wallets to mint XP.</p>
            <Field label="Minter Pubkey">
               <TextInput value="" onChange={() => { }} placeholder="Delegated Pubkey" />
            </Field>
            <Field label="Label">
               <TextInput value="" onChange={() => { }} placeholder="e.g. irl-events" />
            </Field>
            <Field label="Max XP Per Call">
               <TextInput value="" onChange={() => { }} placeholder="1000" />
            </Field>
            <div className="flex gap-3 mt-2">
               <Button className="flex-1">Register</Button>
               <Button variant="outline" className="flex-1 text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-500">Revoke</Button>
            </div>
         </div>

         {/* Achievements */}
         <div className="card-base p-6">
            <SectionHead>Achievements</SectionHead>
            <p className="text-sm text-sol-muted mb-4">Launch special NFT campaigns.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <Field label="Achievement ID">
                  <TextInput value="" onChange={() => { }} placeholder="hackathon-winner" />
               </Field>
               <Field label="Name">
                  <TextInput value="" onChange={() => { }} placeholder="Hackathon Winner" />
               </Field>
               <Field label="Max Supply">
                  <TextInput value="" onChange={() => { }} placeholder="100" />
               </Field>
               <Field label="XP Reward">
                  <TextInput value="" onChange={() => { }} placeholder="500" />
               </Field>
            </div>
            <div className="flex gap-3">
               <Button className="flex-1">Create Achievement Type</Button>
               <Button variant="outline" className="flex-1 text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-500">Deactivate</Button>
            </div>
         </div>

      </div>
   );
}
