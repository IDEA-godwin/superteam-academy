"use client";

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import DashboardLayout from '~/components/DashboardLayout';

export default function CertificatePage() {
   const params = useParams();

   return (
      <DashboardLayout>
         <div className="max-w-7xl mx-auto px-6 py-16 text-center">
            <h1 className="text-3xl font-extrabold text-sol-text mb-8">Certificate of Completion</h1>

            <div className="card-base p-12 inline-block max-w-3xl w-full relative overflow-hidden">
               {/* Decorative background elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-sol-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-sol-yellow/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

               <div className="relative z-10">
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-2xl font-bold text-sol-green mb-2">Superteam Academy</h2>
                  <p className="text-sol-text text-xl mb-8">This certifies that</p>
                  <div className="text-4xl font-extrabold text-sol-text mb-8 border-b-2 border-sol-border inline-block px-10 pb-2">
                     Student Name
                  </div>
                  <p className="text-sol-subtle mb-6">has successfully completed the course</p>
                  <h3 className="text-2xl font-bold text-sol-text mb-10">Course Title Goes Here</h3>

                  <div className="flex justify-between items-end border-t border-sol-border/50 pt-6 mt-10">
                     <div className="text-left">
                        <p className="text-xs text-sol-muted uppercase tracking-widest font-bold mb-1">Date</p>
                        <p className="text-sm font-semibold text-sol-text">March 2026</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-sol-muted uppercase tracking-widest font-bold mb-1">Credential ID</p>
                        <p className="text-sm font-mono text-sol-subtle">{params.id}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
               <button className="sol-btn-primary">Verify On-Chain</button>
               <button className="sol-btn-ghost">Share on Twitter</button>
            </div>
         </div>
      </DashboardLayout>
   );
}
