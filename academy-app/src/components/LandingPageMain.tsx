'use client'

import { motion } from 'framer-motion';
import { BookOpen, Code, Trophy, Lock, Star, Zap, Shield, ChevronRight, Globe, Users } from 'lucide-react';
import ConnectWallet from './WalletConnect';
import { Button } from './ui/button';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

// ── STATIC DATA ────────────────────────────────────────────────────────────────

const STATS = [
   { value: '12,400+', label: 'Learners enrolled', icon: '👥' },
   { value: '6', label: 'Courses available', icon: '📚' },
   { value: '98,000+', label: 'XP distributed', icon: '⚡' },
   { value: '4.9★', label: 'Average rating', icon: '🏆' },
];

const FEATURES = [
   {
      icon: <Zap className="w-7 h-7" />,
      color: 'bg-sol-yellow/15 text-sol-yellow border-sol-yellow/30',
      title: 'Earn On-Chain XP',
      desc: 'Every lesson completion mints real XP tokens to your wallet. Your progress lives on Solana — forever, verifiable, yours.',
   },
   {
      icon: <Code className="w-7 h-7" />,
      color: 'bg-sol-green/10 text-sol-green border-sol-green/30',
      title: 'Challenge-Based Learning',
      desc: 'No passive videos. Write Rust, deploy programs, and solve real coding challenges with an in-browser editor.',
   },
   {
      icon: <Shield className="w-7 h-7" />,
      color: 'bg-sol-forest/10 text-sol-forest border-sol-forest/30',
      title: 'Soulbound Credentials',
      desc: 'Finish a course and receive a Metaplex Core NFT credential — a soulbound proof of skill that unlocks ecosystem opportunities.',
   },
   {
      icon: <Trophy className="w-7 h-7" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      title: 'Global Leaderboard',
      desc: 'Compete with builders worldwide. Climb the XP ranks and get noticed by Superteam grants, bounties, and hiring DAOs.',
   },
   {
      icon: <Globe className="w-7 h-7" />,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      title: 'Multi-language Support',
      desc: 'Content available in English, Spanish, and Portuguese. Education should have no borders.',
   },
   {
      icon: <Users className="w-7 h-7" />,
      color: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      title: 'Creator Rewards',
      desc: 'Course creators earn XP and SOL rewards when their courses reach completion milestones. Share knowledge, earn on-chain.',
   },
];

const LEARNING_PATH = [
   { title: 'Intro to Solana', icon: BookOpen, slug: 'intro-to-solana', xp: 700, difficulty: 'Beginner', status: 'available', desc: 'Accounts, transactions, and the Solana runtime.' },
   { title: 'Rust for Solana Devs', icon: Code, slug: 'rust-for-solana', xp: 600, difficulty: 'Beginner', status: 'available', desc: 'Ownership, lifetimes, enums — the Rust that matters.' },
   { title: 'Anchor Framework', icon: Star, slug: 'anchor-framework', xp: 2280, difficulty: 'Intermediate', status: 'available', desc: 'PDAs, CPIs, constraints, and real program deployment.' },
   { title: 'DeFi Protocols on Solana', icon: Zap, slug: 'defi-protocols', xp: 900, difficulty: 'Advanced', status: 'locked', desc: 'AMMs, lending, yield — build & deploy DeFi primitives.' },
   { title: 'Build an NFT Marketplace', icon: Trophy, slug: 'nft-marketplace', xp: 960, difficulty: 'Intermediate', status: 'locked', desc: 'Metaplex Core, listings, royalties, and a Next.js storefront.' },
   { title: 'Solana Program Security', icon: Shield, slug: 'program-security', xp: 750, difficulty: 'Advanced', status: 'locked', desc: 'Signer checks, account substitution, and audit patterns.' },
];

const TESTIMONIALS = [
   {
      name: 'Tanaka.sol',
      handle: '@0xTanaka',
      avatar: '🧑🏻‍💻',
      text: "Best Solana learning resource I've found. The in-browser coding challenges make everything click faster than any tutorial series. Got my first bounty within a week of finishing Anchor.",
      xp: '8,200 XP',
      badge: 'Anchor Graduate',
   },
   {
      name: 'Natasha Dev',
      handle: '@devnathi',
      avatar: '👩🏽‍💻',
      text: "The on-chain credentials are a game changer. Showed my Superteam wallet to three DAOs — two hired me. The quality rivals university CS programs, and it's free.",
      xp: '12,500 XP',
      badge: 'DeFi Builder',
   },
   {
      name: 'Kwame Builds',
      handle: '@kwame_sol',
      avatar: '🧑🏿‍💻',
      text: "I'd tried three other platforms before. Superteam Academy is the only one that treats you like a real developer from day one. The security module is elite.",
      xp: '6,800 XP',
      badge: 'Security Auditor',
   },
];

const DIFF_CLS: Record<string, string> = {
   Beginner: 'text-sol-green  bg-sol-green/10  border-sol-green/30',
   Intermediate: 'text-sol-yellow bg-sol-yellow/15 border-sol-yellow/30',
   Advanced: 'text-sol-forest bg-sol-forest/10 border-sol-forest/30',
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
const LandingPageMain = () => {
   const hero = useTranslations('Hero');
   const stats = useTranslations('Stats');
   const path = useTranslations('LearningPath');
   const feat = useTranslations('Features');
   const how = useTranslations('HowItWorks');
   const testi = useTranslations('Testimonials');
   const cta = useTranslations('LandingCTA');
   const locale = useLocale();

   const fadeUp = (delay = 0) => ({
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.5, delay },
   });

   return (
      <main className="flex flex-col w-full items-center overflow-hidden">

         {/* ── HERO ─────────────────────────────────────────────────────────── */}
         <section className="relative w-full min-h-[88vh] flex items-center justify-center px-6 overflow-hidden">
            {/* Background glow blobs */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-sol-yellow/15 blur-[140px] rounded-full" />
               <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-sol-green/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
               {/* Pill badge */}
               <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 border border-sol-green/40 bg-sol-green/10 rounded-full px-4 py-1.5 text-xs font-bold text-sol-green uppercase tracking-widest mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-sol-green animate-pulse" />
                  {hero('badge')}
               </motion.div>

               <motion.h1 {...fadeUp(0.05)} className="text-5xl md:text-7xl font-black leading-[1.05] mb-6 text-sol-forest dark:text-sol-yellow">
                  {hero('title')}
               </motion.h1>

               <motion.p {...fadeUp(0.1)} className="text-lg md:text-xl text-sol-subtle max-w-xl mx-auto mb-10 leading-relaxed">
                  {hero('subtitle')}
               </motion.p>

               <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <ConnectWallet title={hero('start')} />
                  <Button
                     variant="outline"
                     className="border-sol-green hover:bg-sol-yellow border text-sol-text font-extrabold uppercase tracking-wide text-md w-64 rounded-lg px-8 py-6 shadow-sol-green shadow-md active:shadow-none dark:bg-sol-bg dark:hover:bg-sol-yellow dark:text-sol-text hover:shadow-sol-green hover:translate-y-0.5 active:translate-y-1 transition-all duration-100"
                  >
                     <Link href={`/${locale}/courses`}>{hero('browse')}</Link>
                  </Button>
               </motion.div>

               {/* Micro social proof */}
               <motion.p {...fadeUp(0.2)} className="mt-8 text-xs text-sol-muted">
                  {hero('socialProof', { count: '12,400' })}
               </motion.p>
            </div>
         </section>

         {/* ── STATS BAR ────────────────────────────────────────────────────── */}
         <section className="w-full border-y border-sol-border bg-sol-surface/60 py-8 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { value: '12,400+', labelKey: 'learners', icon: '👥' },
                  { value: '6', labelKey: 'courses', icon: '📚' },
                  { value: '98,000+', labelKey: 'xp', icon: '⚡' },
                  { value: '4.9★', labelKey: 'rating', icon: '🏆' },
               ].map((s, i) => (
                  <motion.div key={s.labelKey} {...fadeUp(i * 0.06)} className="text-center">
                     <div className="text-2xl mb-1">{s.icon}</div>
                     <div className="text-2xl font-black text-sol-text">{s.value}</div>
                     <div className="text-xs text-sol-muted mt-0.5">{stats(s.labelKey as any)}</div>
                  </motion.div>
               ))}
            </div>
         </section>

         {/* ── LEARNING PATH ────────────────────────────────────────────────── */}
         <section className="w-full py-24 px-6">
            <div className="max-w-5xl mx-auto">
               <motion.div {...fadeUp()} className="text-center mb-14">
                  <span className="inline-block text-xs font-bold text-sol-green uppercase tracking-widest border border-sol-green/30 bg-sol-green/10 rounded-full px-3 py-1 mb-4">{path('badge')}</span>
                  <h2 className="text-3xl md:text-4xl font-black text-sol-text mb-3">{path('title')}</h2>
                  <p className="text-sol-subtle max-w-lg mx-auto">{path('subtitle')}</p>
               </motion.div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {LEARNING_PATH.map((course, i) => {
                     const Icon = course.icon;
                     const locked = course.status === 'locked';
                     return (
                        <motion.div key={course.slug} {...fadeUp(i * 0.07)}>
                           <Link
                              href={locked ? '#' : `/${locale}/courses/${course.slug}`}
                              className={`group block card-base p-5 h-full transition-all duration-200 ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-sol-green/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sol-green/5'}`}
                           >
                              <div className="flex items-start justify-between mb-3">
                                 <div className="w-10 h-10 rounded-xl bg-sol-surface border border-sol-border flex items-center justify-center text-sol-green shrink-0">
                                    {locked ? <Lock className="w-4 h-4 text-sol-muted" /> : <Icon className="w-5 h-5" />}
                                 </div>
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_CLS[course.difficulty]}`}>
                                    {course.difficulty}
                                 </span>
                              </div>

                              <h3 className="font-bold text-sol-text text-sm mb-1 group-hover:text-sol-green transition-colors">{course.title}</h3>
                              <p className="text-xs text-sol-muted leading-relaxed mb-4">{course.desc}</p>

                              {/* Progress rail — empty (not enrolled) */}
                              <div className="h-1.5 rounded-full bg-sol-border overflow-hidden mb-3">
                                 <div className="h-full bg-sol-green rounded-full" style={{ width: '0%' }} />
                              </div>

                              <div className="flex items-center justify-between">
                                 <span className="text-[11px] text-sol-yellow font-semibold">⚡ {course.xp} XP</span>
                                 {!locked && (
                                    <span className="text-[11px] text-sol-green font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                       Start <ChevronRight className="w-3 h-3" />
                                    </span>
                                 )}
                              </div>
                           </Link>
                        </motion.div>
                     );
                  })}
               </div>

               <motion.div {...fadeUp(0.3)} className="text-center mt-10">
                  <Link href={`/${locale}/courses`}>
                     <Button variant="outline" className="border-sol-green/50 text-sol-green hover:bg-sol-green/10 font-bold">
                        {path('viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
                     </Button>
                  </Link>
               </motion.div>
            </div>
         </section>

         {/* ── FEATURE HIGHLIGHTS ───────────────────────────────────────────── */}
         <section className="w-full py-24 px-6 bg-sol-surface/40 border-y border-sol-border">
            <div className="max-w-5xl mx-auto">
               <motion.div {...fadeUp()} className="text-center mb-14">
                  <span className="inline-block text-xs font-bold text-sol-yellow uppercase tracking-widest border border-sol-yellow/30 bg-sol-yellow/10 rounded-full px-3 py-1 mb-4">{feat('badge')}</span>
                  <h2 className="text-3xl md:text-4xl font-black text-sol-text mb-3">{feat('title')}</h2>
                  <p className="text-sol-subtle max-w-lg mx-auto">{feat('subtitle')}</p>
               </motion.div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                     { icon: <Zap className="w-7 h-7" />, color: 'bg-sol-yellow/15 text-sol-yellow border-sol-yellow/30', titleKey: 'xpTitle', descKey: 'xpDesc' },
                     { icon: <Code className="w-7 h-7" />, color: 'bg-sol-green/10  text-sol-green  border-sol-green/30', titleKey: 'challengeTitle', descKey: 'challengeDesc' },
                     { icon: <Shield className="w-7 h-7" />, color: 'bg-sol-forest/10 text-sol-forest border-sol-forest/30', titleKey: 'credentialTitle', descKey: 'credentialDesc' },
                     { icon: <Trophy className="w-7 h-7" />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', titleKey: 'leaderboardTitle', descKey: 'leaderboardDesc' },
                     { icon: <Globe className="w-7 h-7" />, color: 'bg-blue-500/10  text-blue-400   border-blue-500/30', titleKey: 'multiLangTitle', descKey: 'multiLangDesc' },
                     { icon: <Users className="w-7 h-7" />, color: 'bg-pink-500/10  text-pink-400   border-pink-500/30', titleKey: 'creatorTitle', descKey: 'creatorDesc' },
                  ].map((f, i) => (
                     <motion.div key={f.titleKey} {...fadeUp(i * 0.06)} className="card-base p-6">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.color}`}>
                           {f.icon}
                        </div>
                        <h3 className="font-bold text-sol-text text-sm mb-2">{feat(f.titleKey as any)}</h3>
                        <p className="text-xs text-sol-muted leading-relaxed">{feat(f.descKey as any)}</p>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
         <section className="w-full py-24 px-6">
            <div className="max-w-4xl mx-auto">
               <motion.div {...fadeUp()} className="text-center mb-14">
                  <span className="inline-block text-xs font-bold text-sol-green uppercase tracking-widest border border-sol-green/30 bg-sol-green/10 rounded-full px-3 py-1 mb-4">{how('badge')}</span>
                  <h2 className="text-3xl md:text-4xl font-black text-sol-text mb-3">{how('title')}</h2>
               </motion.div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Connector line */}
                  <div className="hidden md:block absolute top-12 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-sol-border" />

                  {(['1', '2', '3'] as const).map((n, i) => (
                     <motion.div key={n} {...fadeUp(i * 0.1)} className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-2xl bg-sol-card border border-sol-border flex items-center justify-center text-4xl mb-5 relative z-10">
                           {how(`step${n}Icon` as any)}
                        </div>
                        <div className="text-[10px] font-black text-sol-muted tracking-widest uppercase mb-2">{how(`step${n}Label` as any)}</div>
                        <h3 className="font-bold text-sol-text text-base mb-2">{how(`step${n}Title` as any)}</h3>
                        <p className="text-xs text-sol-muted leading-relaxed">{how(`step${n}Desc` as any)}</p>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
         <section className="w-full py-24 px-6 bg-sol-surface/40 border-y border-sol-border">
            <div className="max-w-5xl mx-auto">
               <motion.div {...fadeUp()} className="text-center mb-14">
                  <span className="inline-block text-xs font-bold text-purple-400 uppercase tracking-widest border border-purple-400/30 bg-purple-400/10 rounded-full px-3 py-1 mb-4">{testi('badge')}</span>
                  <h2 className="text-3xl md:text-4xl font-black text-sol-text mb-3">{testi('title')}</h2>
                  <p className="text-sol-subtle max-w-lg mx-auto">{testi('subtitle')}</p>
               </motion.div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {TESTIMONIALS.map((t, i) => (
                     <motion.div key={t.handle} {...fadeUp(i * 0.08)} className="card-base p-6 flex flex-col">
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-4">
                           {[...Array(5)].map((_, k) => <span key={k} className="text-sol-yellow text-sm">★</span>)}
                        </div>
                        <p className="text-sm text-sol-subtle leading-relaxed mb-6 flex-1">"{t.text}"</p>
                        <div className="flex items-center gap-3">
                           <span className="text-3xl">{t.avatar}</span>
                           <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-sol-text">{t.name}</div>
                              <div className="text-xs text-sol-muted">{t.handle}</div>
                           </div>
                           <div className="text-right shrink-0">
                              <div className="text-xs font-bold text-sol-yellow">⚡ {t.xp}</div>
                              <div className="text-[10px] text-sol-muted">{t.badge}</div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>

               {/* Partner bar */}
               <motion.div {...fadeUp(0.2)} className="mt-16 flex flex-col items-center gap-5">
                  <p className="text-xs text-sol-muted uppercase tracking-widest font-bold">{testi('partnerLabel')}</p>
                  <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
                     {['Superteam', 'Solana Foundation', 'Metaplex', 'Helius', 'Anchor'].map(p => (
                        <span key={p} className="text-sm font-extrabold text-sol-text">{p}</span>
                     ))}
                  </div>
               </motion.div>
            </div>
         </section>

         {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
         <section className="w-full py-24 px-6">
            <div className="max-w-3xl mx-auto text-center">
               <motion.div {...fadeUp()}>
                  <h2 className="text-3xl md:text-5xl font-black text-sol-text mb-4">
                     {cta('title')} <span className="text-sol-green">{cta('titleHighlight')}</span>
                  </h2>
                  <p className="text-sol-subtle mb-10 text-lg">{cta('subtitle')}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                     <ConnectWallet title={cta('primaryCta')} />
                     <Link href={`/${locale}/courses`} className="text-sm text-sol-muted hover:text-sol-green transition-colors underline underline-offset-4">
                        {cta('secondaryCta')}
                     </Link>
                  </div>
               </motion.div>
            </div>
         </section>

      </main>
   );
};

export default LandingPageMain;