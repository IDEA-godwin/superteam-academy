"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SectionHead, Field, TextInput } from "./Shared";
import { useUpdateProfile } from "~/hooks/queries/useUpdateProfile";
import type { UserProfile } from "~/lib/dummy-data";
import { Globe, Twitter, Github } from "lucide-react";
import { useSession } from "next-auth/react";

export function ProfileTab({ user }: { user: UserProfile }) {
   const [name, setName] = useState(user.name);
   const [bio, setBio] = useState(user.bio);
   const [twitter, setTwitter] = useState(user.twitter);
   const [github, setGithub] = useState(user.github);
   const [website, setWebsite] = useState(user.website);
   const [skillsList, setSkillsList] = useState<{ name: string, level: number }[]>(() =>
      Object.entries(user.skills || {}).map(([name, level]) => ({ name, level }))
   );
   const [savedMessage, setSavedMessage] = useState(false);
   const { publicKey } = useWallet();
   const { data: session } = useSession();
   const updateProfileMutation = useUpdateProfile(publicKey?.toBase58());

   const handleSave = async () => {
      const skillsParsed = skillsList.reduce((acc, curr) => {
         if (curr.name.trim()) {
            acc[curr.name.trim()] = curr.level;
         }
         return acc;
      }, {} as Record<string, number>);

      updateProfileMutation.mutate(
         { name, bio, twitter, github, website, skills: skillsParsed },
         {
            onSuccess: () => {
               setSavedMessage(true);
               setTimeout(() => setSavedMessage(false), 2500);
            }
         }
      );
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
         <div className="card-base p-6">
            <SectionHead>Basic Info</SectionHead>
            <Field label="Display Name">
               <TextInput value={name} onChange={setName} placeholder="Your display name" />
            </Field>
            <Field label="Bio">
               <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-sol-card border border-sol-border rounded-xl px-3.5 py-2.5
                       text-sol-text text-sm placeholder:text-sol-muted resize-none
                       focus:outline-none focus:border-sol-green/60 transition-colors"
               />
               <div className="flex justify-between text-[11px] text-sol-muted mt-1">
                  <span>Max 160 characters. Tell others about you.</span>
                  {bio.length}/160
               </div>
            </Field>

            <Field label="Skills" hint="Add your skills and proficiency level (%)">
               <div className="flex flex-col gap-3">
                  {skillsList.map((skill, index) => (
                     <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                           <TextInput
                              value={skill.name}
                              onChange={(val) => {
                                 const newSkills = [...skillsList];
                                 newSkills[index].name = val;
                                 setSkillsList(newSkills);
                              }}
                              placeholder="Skill (e.g., Rust)"
                           />
                        </div>
                        <div className="flex items-center gap-2 w-28 shrink-0">
                           <input
                              type="number"
                              min="1"
                              max="100"
                              value={skill.level}
                              onChange={(e) => {
                                 const newSkills = [...skillsList];
                                 let val = parseInt(e.target.value);
                                 if (isNaN(val)) val = 1;
                                 if (val > 100) val = 100;
                                 newSkills[index].level = val;
                                 setSkillsList(newSkills);
                              }}
                              className="w-full bg-sol-card border border-sol-border rounded-xl px-3.5 py-2.5
                                 text-sol-text text-sm placeholder:text-sol-muted
                                 focus:outline-none focus:border-sol-green/60 transition-colors"
                           />
                           <span className="text-sol-muted text-sm">%</span>
                        </div>
                        <button
                           onClick={() => {
                              const newSkills = [...skillsList];
                              newSkills.splice(index, 1);
                              setSkillsList(newSkills);
                           }}
                           className="text-sol-muted hover:text-red-500 transition-colors shrink-0 px-1"
                        >
                           ✕
                        </button>
                     </div>
                  ))}
                  <button
                     onClick={() => setSkillsList([...skillsList, { name: '', level: 50 }])}
                     className="sol-btn-ghost text-xs w-fit text-sol-green"
                  >
                     + Add Skill
                  </button>
               </div>
            </Field>

            <SectionHead>Social Links</SectionHead>
            <Field label="Twitter / X">
               <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sol-muted flex items-center justify-center">
                     <Twitter className="w-3.5 h-3.5" />
                  </span>
                  <input
                     type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)}
                     className="w-full bg-sol-card border border-sol-border rounded-xl pl-9 pr-3.5 py-2.5
                         text-sol-text text-sm placeholder:text-sol-muted
                         focus:outline-none focus:border-sol-green/60 transition-colors"
                  />
               </div>
            </Field>
            <Field label="GitHub">
               <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sol-muted flex items-center justify-center">
                     <Github className="w-3.5 h-3.5" />
                  </span>
                  <input
                     type="text" value={github} onChange={(e) => setGithub(e.target.value)}
                     className="w-full bg-sol-card border border-sol-border rounded-xl pl-9 pr-3.5 py-2.5
                         text-sol-text text-sm placeholder:text-sol-muted
                         focus:outline-none focus:border-sol-green/60 transition-colors"
                  />
               </div>
            </Field>
            <Field label="Website">
               <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sol-muted flex items-center justify-center">
                     <Globe className="w-3.5 h-3.5" />
                  </span>
                  <input
                     type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                     className="w-full bg-sol-card border border-sol-border rounded-xl pl-9 pr-3.5 py-2.5
                         text-sol-text text-sm placeholder:text-sol-muted
                         focus:outline-none focus:border-sol-green/60 transition-colors"
                  />
               </div>
            </Field>

            <div className="flex items-center gap-3 mt-2 border-t border-sol-border pt-4">
               <button
                  className="sol-btn-primary"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
               >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
               </button>
               <button className="sol-btn-ghost">Discard Changes</button>
               {savedMessage && <span className="text-xs text-sol-green font-semibold animate-fade-up ml-2">Profile information updated successfully.</span>}
               {updateProfileMutation.isError && <span className="text-xs text-red-500 font-semibold animate-fade-up ml-2">{updateProfileMutation.error?.message || 'Failed to update'}</span>}
            </div>
         </div>

         {/* Avatar preview */}
         <div className="card-base p-6 flex flex-col items-center gap-4 h-fit">
            <div className="text-[11px] font-bold text-sol-muted uppercase tracking-widest">Profile Preview</div>

            {user.avatar === "IMG" && session?.user?.image ? (
               <img src={session.user.image} alt="User Avatar" className="w-24 h-24 rounded-2xl border border-sol-border object-cover" />
            ) : (
               <div className="w-24 h-24 rounded-2xl bg-sol-surface border border-sol-border
                           flex items-center justify-center text-5xl">
                  {user.avatar}
               </div>
            )}

            <div className="text-center">
               <div className="font-extrabold text-sol-text">{name}</div>
               <div className="text-xs text-sol-muted mt-0.5">@{user.github}</div>
            </div>
            <p className="text-xs text-sol-muted text-center leading-relaxed">{bio}</p>
            <div className="w-full pt-4 border-t border-sol-border text-center">
               <p className="text-[11px] text-sol-muted">Avatar is generated from your wallet address</p>
               <button className="sol-btn-ghost mt-3 text-xs py-1.5 w-full justify-center">
                  Connect Wallet to Update
               </button>
            </div>
         </div>
      </div>
   );
}
