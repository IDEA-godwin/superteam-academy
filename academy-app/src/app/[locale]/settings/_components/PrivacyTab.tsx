"use client";

import { useState } from "react";
import { SectionHead, ToggleRow } from "./Shared";

export function PrivacyTab() {
   const [prefs, setPrefs] = useState({
      publicProfile: true,
      showXp: true,
      showStreak: true,
      showCourses: true,
      allowSearch: true,
      shareProgress: false,
   });
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="card-base p-6">
            <SectionHead>Profile Visibility</SectionHead>
            <ToggleRow label="Public Profile" sub="Anyone can view your profile page" checked={prefs.publicProfile} onChange={(v) => setPrefs({ ...prefs, publicProfile: v })} />
            <ToggleRow label="Show XP & Level" sub="Display on leaderboard and profile" checked={prefs.showXp} onChange={(v) => setPrefs({ ...prefs, showXp: v })} />
            <ToggleRow label="Show Streak" sub="Display your streak on your profile" checked={prefs.showStreak} onChange={(v) => setPrefs({ ...prefs, showStreak: v })} />
            <ToggleRow label="Show Courses" sub="Others can see your course progress" checked={prefs.showCourses} onChange={(v) => setPrefs({ ...prefs, showCourses: v })} />
            <ToggleRow label="Appear in Search" sub="Discoverable by username" checked={prefs.allowSearch} onChange={(v) => setPrefs({ ...prefs, allowSearch: v })} />
            <ToggleRow label="Share Progress" sub="Share learning data with Superteam" checked={prefs.shareProgress} onChange={(v) => setPrefs({ ...prefs, shareProgress: v })} />
         </div>

         <div className="flex flex-col gap-6">
            {/* Data export */}
            <div className="card-base p-6">
               <SectionHead>Your Data</SectionHead>
               <p className="text-sm text-sol-subtle leading-relaxed mb-4">
                  Export a full copy of your data — profile info, course progress, XP history, achievements, and credentials.
               </p>
               <button className="sol-btn-ghost w-full justify-center text-sm">
                  📥 Export My Data
               </button>
            </div>

            {/* Danger zone */}
            <div className="card-base p-6 border-red-200">
               <div className="flex items-center gap-2 pb-3 mb-4 border-b border-red-100">
                  <span className="w-[3px] h-5 bg-red-400 rounded-full shrink-0" />
                  <h3 className="text-sm font-extrabold text-red-600">Danger Zone</h3>
               </div>
               <p className="text-sm text-sol-subtle leading-relaxed mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
               </p>
               {showDeleteConfirm ? (
                  <div className="space-y-3">
                     <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                        ⚠️ This will permanently delete your account, all XP, credentials, and progress. Are you absolutely sure?
                     </div>
                     <div className="flex gap-2">
                        <button
                           className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl text-sm font-bold
                             hover:bg-red-700 transition-colors"
                        >
                           Yes, Delete Everything
                        </button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="sol-btn-ghost flex-1 justify-center text-sm">
                           Cancel
                        </button>
                     </div>
                  </div>
               ) : (
                  <button
                     onClick={() => setShowDeleteConfirm(true)}
                     className="w-full py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl
                         text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                     Delete Account
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
