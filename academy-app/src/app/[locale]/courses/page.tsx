"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCourses } from "~/hooks/use-courses";
import { SanityCourseData, useCourseList } from "~/hooks/queries/useCourseData";

type Path = {
   id: string,
   title: string,
   icon: string,
   courses: number,
   hours: number,
   color: string,
   border: string,
   tagCls: string,
   tag: string
}


const LEARNING_PATHS: Array<Path> = [
   {
      id: "solana-fundamentals",
      title: "Solana Fundamentals",
      icon: "◎",
      courses: 6, hours: 12,
      color: "from-sol-green/15 to-sol-forest/10",
      border: "border-sol-green/40",
      tagCls: "bg-sol-green/15 text-sol-green border-sol-green/40",
      tag: "Most Popular",
   },
   {
      id: "defi-developer",
      title: "DeFi Developer",
      icon: "⟠",
      courses: 8, hours: 24,
      color: "from-sol-yellow/20 to-sol-forest/10",
      border: "border-sol-yellow/40",
      tagCls: "bg-sol-yellow/25 text-sol-yellow border-sol-yellow/50",
      tag: "Advanced",
   },
   {
      id: "nft-creator",
      title: "NFT & Digital Assets",
      icon: "◈",
      courses: 5, hours: 10,
      color: "from-sol-forest/15 to-sol-green/10",
      border: "border-sol-forest/40",
      tagCls: "bg-sol-forest/15 text-sol-forest border-sol-forest/40",
      tag: "New",
   },
];

const DIFFICULTIES = ["all", "beginner", "intermediate", "advance"];
const TOPICS = ["all", "blockchain", "programs", "defi", "frontend", "rust", "security"];
const DURATIONS = ["all", "0-4h", "4-8h", "8h+"];

// beginner=emerald  intermediate=amber/yellow  advanced=forest
const DIFF_CLS = {
   BEGINNER: "bg-sol-green/10  text-sol-green  border-sol-green/35",
   INTERMEDIATE: "bg-sol-yellow/20 text-sol-yellow  border-sol-yellow/50",
   ADVANCED: "bg-sol-forest/15 text-sol-forest border-sol-forest/40",
   ALL: ""
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
   return (
      <button onClick={onClick}
         className={[
            "px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 text-left w-full",
            active
               ? "bg-sol-green/15 text-sol-green border-sol-green/50"
               : "bg-sol-surface text-sol-subtle border-sol-border hover:border-sol-forest/50 hover:text-sol-text",
         ].join(" ")}>
         {label === "all" ? "All" : label.charAt(0).toUpperCase() + label.slice(1)}
      </button>
   );
}

function ProgressRing({ pct, size = 36 }: { pct: number, size?: number }) {
   const r = (size - 6) / 2;
   const circ = 2 * Math.PI * r;
   const dash = (pct / 100) * circ;
   return (
      <svg width={size} height={size} className="-rotate-90">
         <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={3}
            stroke="var(--color-sol-border)" fill="none" />
         <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={3}
            stroke={pct === 100 ? "var(--color-sol-green)" : "var(--color-sol-yellow)"}
            fill="none" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
   );
}

function CourseCard({ course, index }: { course: SanityCourseData, index: number }) {
   return (
      //@ts-ignore
      <Link href={`/courses/${course.slug.current}`}
         className="card-base group flex flex-col hover:border-sol-green/50 hover:-translate-y-1 hover:shadow-sol-green animate-fade-up"
         style={{ animationDelay: `${index * 55}ms` }}>

         {/* Thumbnail banner */}
         <div className="relative h-36 rounded-t-2xl bg-linear-to-br from-sol-surface to-sol-bg
                      flex items-center justify-center overflow-hidden border-b border-sol-border">
            <span className="text-5xl opacity-25 group-hover:opacity-55 group-hover:scale-110 transition-all duration-300 select-none">
               {course.thumbnail ?? "⬡"}
            </span>
            {/* {course.progress > 0 && (
               <div className="absolute bottom-0 inset-x-0 h-1 bg-sol-border">
                  <div className="h-full bg-sol-green transition-all duration-500" style={{ width: `${course.progress}%` }} />
               </div>
            )}
            {course.progress === 100 && (
               <div className="absolute top-3 right-3 sol-badge bg-sol-green/20 border-sol-green/50 text-sol-green">
                  ✓ Done
               </div>
            )} */}
         </div>

         <div className="flex flex-col flex-1 p-5 gap-3">
            <div className="flex items-center gap-2 flex-wrap">
               <span className={`sol-badge ${DIFF_CLS[course.difficulty]}`}>{course.difficulty}</span>
               <span className="sol-badge bg-sol-surface text-sol-muted border-sol-border">{course.title}</span>
            </div>

            <div>
               <h3 className="font-bold text-base text-sol-text leading-tight mb-1.5
                         group-hover:text-sol-green transition-colors duration-150">
                  {course.title}
               </h3>
               <p className="text-sol-subtle text-xs leading-relaxed line-clamp-2">{course.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-sol-border">
               <div className="flex items-center gap-3 text-xs text-sol-muted">
                  <span>⏱ {"self paced"}h</span>
                  <span className="font-semibold text-sol-yellow">⚡ {course.xpPerLesson * course.lessonCount} XP</span>
                  {/* <span>👥 {(course.students / 1000).toFixed(1)}k</span> */}
               </div>
               {/* {course.progress > 0 && course.progress < 100 && (
                  <div className="flex items-center gap-1.5">
                     <ProgressRing pct={course.progress} />
                     <span className="text-xs font-semibold text-sol-yellow">{course.progress}%</span>
                  </div>
               )} */}
            </div>
         </div>
      </Link>
   );
}

function PathCard({ path }: { path: Path }) {
   return (
      <div className={`card-base bg-linear-to-br ${path.color} border ${path.border}
                     p-5 hover:scale-[1.02] hover:shadow-sol-green transition-all duration-200 cursor-pointer`}>
         <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{path.icon}</span>
            <span className={`sol-badge text-[10px] ${path.tagCls}`}>{path.tag}</span>
         </div>
         <h3 className="font-bold text-sol-text mb-1">{path.title}</h3>
         <p className="text-sol-subtle text-xs">{path.courses} courses · {path.hours}h total</p>
         <div className="mt-4 text-xs font-semibold text-sol-green">Start path →</div>
      </div>
   );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function Page() {
   const [search, setSearch] = useState("");
   const [diff, setDiff] = useState("all");
   const [topic, setTopic] = useState("all");
   const [dur, setDur] = useState("all");
   const t = useTranslations("Courses");

   const [courses, setCourses] = useState<SanityCourseData[] | undefined>([]);

   const { data: onchainData, isLoading: onchainLoading } = useCourses();
   const { data: courseList, isLoading: courseListLoading } = useCourseList()

   const filtered = useMemo(() => courses?.filter(c => {
      const q = search.toLowerCase();
      if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false;
      // if (diff !== "all" && c.difficulty !== diff) return false;
      // if (topic !== "all" && c.topic !== topic) return false;
      // if (dur === "0-4h" && c.duration > 4) return false;
      // if (dur === "4-8h" && (c.duration <= 4 || c.duration > 8)) return false;
      // if (dur === "8h+" && c.duration <= 8) return false;
      return true;
   }), [search, diff, topic, dur]);

   useEffect(() => {
      (async () => {
         if (!onchainLoading && !courseListLoading) {
            const courses = courseList?.filter(course => onchainData?.some(c => c.account.courseId === course.courseId))
            setCourses(courses)
         }
      })()
   }, [onchainLoading, courseListLoading]);

   const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value.toLowerCase();
      setCourses(courses?.filter(c => !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)))
   };



   return (
      <>
         <div className="bg-sol-glow border-sol-border">
            <div className="max-w-7xl mx-auto px-6 pt-14 pb-6">
               <div className="flex items-start justify-between gap-6 mb-8">
                  <div className="animate-fade-up max-w-xl">
                     <span className="sol-badge bg-sol-green/10 text-sol-green border-sol-green/35 mb-4">
                        {t('badge')}
                     </span>
                     <h1 className="text-4xl font-extrabold text-sol-text leading-tight mt-3 mb-3">
                        {t('title')}
                     </h1>
                     <p className="text-sol-subtle text-base leading-relaxed">
                        {t('subtitle')}
                     </p>
                  </div>
               </div>

               {/* Search */}
               <div className="relative max-w-lg">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sol-muted">🔍</span>
                  <input type="text" placeholder={t('searchPlaceholder')}
                     value={search} onChange={e => onSearchChange(e)}
                     className="w-full bg-sol-card border border-sol-border rounded-xl pl-10 pr-4 py-3
                         text-sol-text text-sm placeholder:text-sol-muted
                         focus:outline-none focus:border-sol-green/60 transition-all duration-200" />
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-6 py-10">
            <section className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <span className="h-px flex-1 bg-sol-border" />
                  <h2 className="text-[11px] font-bold text-sol-muted uppercase tracking-widest whitespace-nowrap">
                     {t('learningPaths')}
                  </h2>
                  <span className="h-px flex-1 bg-sol-border" />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {LEARNING_PATHS.map(p => <PathCard key={p.id} path={p} />)}
               </div>
            </section>

            {/* ── Filters + Grid ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-8">
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-sol-subtle text-sm">
                        <span className="text-sol-text font-semibold">{courses?.length}</span> {t('coursesFound', { count: '' }).replace('{count} ', '')}
                     </p>
                     <div className="flex items-center gap-3">
                        <DropdownMenu>
                           <DropdownMenuTrigger className="flex items-center gap-2 bg-sol-card border border-sol-border rounded-lg px-3 py-1.5 text-sol-subtle text-xs focus:outline-none hover:border-sol-green/40 transition-colors">
                              <Filter className="w-4 h-4" />
                              {t('filters')}
                              {(diff !== "all" || topic !== "all" || dur !== "all") && (
                                 <span className="flex items-center justify-center w-4 h-4 rounded-full bg-sol-green text-[10px] text-sol-bg font-bold">!</span>
                              )}
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-64 p-4 border-sol-border bg-sol-card rounded-xl shadow-xl z-50">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-sol-border">
                                 <h3 className="text-[11px] font-bold text-sol-muted uppercase tracking-widest">{t('filters')}</h3>
                                 {(diff !== "all" || topic !== "all" || dur !== "all") && (
                                    <button
                                       onClick={() => { setDiff("all"); setTopic("all"); setDur("all"); }}
                                       className="text-[10px] text-sol-muted hover:text-sol-green transition-colors"
                                    >
                                       {t('filtersReset')}
                                    </button>
                                 )}
                              </div>
                              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                 {[
                                    { label: t('difficulty'), items: DIFFICULTIES, val: diff, set: setDiff },
                                    { label: t('topic'), items: TOPICS, val: topic, set: setTopic },
                                    { label: t('duration'), items: DURATIONS, val: dur, set: setDur },
                                 ].map(g => (
                                    <div key={g.label} className="mb-5 last:mb-0">
                                       <p className="text-[11px] text-sol-muted font-bold uppercase tracking-wider mb-2">{g.label}</p>
                                       <div className="flex flex-wrap gap-1.5">
                                          {g.items.map(item => (
                                             <FilterPill key={item} label={item} active={g.val === item} onClick={() => {
                                                // e.preventDefault(); // prevent dropdown close if needed
                                                g.set(item)
                                             }} />
                                          ))}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </DropdownMenuContent>
                        </DropdownMenu>

                        <select className="bg-sol-card border border-sol-border rounded-lg px-3 py-1.5
                                    text-sol-subtle text-xs focus:outline-none focus:border-sol-green/40 transition-colors">
                           <option>{t('sortPopular')}</option>
                           <option>{t('sortNewest')}</option>
                           <option>{t('sortDuration')}</option>
                        </select>
                     </div>
                  </div>

                  {courses && courses.length === 0 ? (
                     <div className="card-base p-16 text-center">
                        <div className="text-4xl mb-3 opacity-30">🔍</div>
                        <p className="text-sol-subtle font-semibold mb-4">{t('noResults')}</p>
                        <button onClick={() => { setSearch(""); setDiff("all"); setTopic("all"); setDur("all"); }}
                           className="sol-btn-ghost text-xs">
                           {t('clearFilters')}
                        </button>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {courses && courses.map((c, i) => <CourseCard key={c.courseId} course={c} index={i} />)}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </>
   );
}



