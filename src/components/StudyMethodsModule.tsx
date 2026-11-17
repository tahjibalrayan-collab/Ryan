import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Copy,
  Layers,
  ListChecks,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import {
  assembleSmartRoutine,
  GLOBAL_STUDY_METHODS,
  GLOBAL_STUDY_TIPS,
  INITIAL_SAVED_ROUTINE,
  STRUGGLE_OPTIONS,
} from '../data/seedData';
import {
  AppTheme,
  GeneratedRoutine,
  Language,
  MethodTradition,
  RoutineBlock,
  StudyMethod,
  SubjectAllocation,
} from '../types';
import { getThemeTokens } from '../utils/themeStyles';

interface StudyMethodsModuleProps {
  lang: Language;
  theme: AppTheme;
  onApplyToTimer: (opts: {
    minutes: number;
    subject?: string;
    topic?: string;
    method?: string;
  }) => void;
  savedRoutines: GeneratedRoutine[];
  onSaveRoutine: (routine: GeneratedRoutine) => void;
  onDeleteRoutine: (id: string) => void;
}

const TRADITION_FILTERS: Array<{ id: 'All' | MethodTradition; en: string; bn: string }> = [
  { id: 'All', en: 'All 12 Worldwide', bn: 'সব ১২টি মেথড' },
  { id: 'Korean Focus', en: 'Korean', bn: 'কোরিয়ান' },
  { id: 'Japanese Kaizen', en: 'Japanese', bn: 'জাপানিজ' },
  { id: 'Chinese Intensive', en: 'Chinese', bn: 'চাইনিজ' },
  { id: 'Ivy League Recall', en: 'Ivy League (US/UK)', bn: 'আইভি লিগ' },
  { id: 'European & Classical', en: 'European', bn: 'ইউরোপীয়' },
  { id: 'Global STEM & Synthesis', en: 'STEM & Global', bn: 'স্টেম ও গ্লোবাল' },
];

export const StudyMethodsModule: React.FC<StudyMethodsModuleProps> = ({
  lang,
  theme,
  onApplyToTimer,
  savedRoutines,
  onSaveRoutine,
  onDeleteRoutine,
}) => {
  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);

  const [traditionFilter, setTraditionFilter] = useState<'All' | MethodTradition>('All');
  const [tipsFilter, setTipsFilter] = useState<'All' | MethodTradition>('All');
  const [tipsStruggleFilter, setTipsStruggleFilter] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<StudyMethod>(GLOBAL_STUDY_METHODS[0]);

  // Routine Builder State
  const [startTime, setStartTime] = useState('18:00');
  const [allocations, setAllocations] = useState<SubjectAllocation[]>([
    { id: 'sub-1', subject: 'Chemistry', minutes: 60, difficulty: 'problem-solving' },
    { id: 'sub-2', subject: 'Linear Algebra', minutes: 45, difficulty: 'conceptual' },
    { id: 'sub-3', subject: 'Biology / Theory', minutes: 35, difficulty: 'memorization' },
  ]);
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([
    'forgetting',
    'procrastination',
  ]);
  const [customStruggle, setCustomStruggle] = useState('');
  const [activeRoutine, setActiveRoutine] = useState<GeneratedRoutine>(
    savedRoutines[0] ?? INITIAL_SAVED_ROUTINE
  );
  const [completedBlockIdxs, setCompletedBlockIdxs] = useState<number[]>([]);
  const [buildFeedback, setBuildFeedback] = useState<string | null>(null);
  const [copiedBanner, setCopiedBanner] = useState(false);

  const filteredMethods =
    traditionFilter === 'All'
      ? GLOBAL_STUDY_METHODS
      : GLOBAL_STUDY_METHODS.filter((m) => m.tradition === traditionFilter);

  const filteredTips = GLOBAL_STUDY_TIPS.filter((tip) => {
    const matchesTradition = tipsFilter === 'All' || tip.tradition === tipsFilter;
    const matchesStruggle =
      tipsStruggleFilter === 'All' || tip.solvesStruggles.includes(tipsStruggleFilter);
    return matchesTradition && matchesStruggle;
  });

  const handleAddAllocation = () => {
    setAllocations((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        subject: '',
        minutes: 45,
        difficulty: 'conceptual',
      },
    ]);
  };

  const handleUpdateAllocation = (id: string, patch: Partial<SubjectAllocation>) => {
    setAllocations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const handleRemoveAllocation = (id: string) => {
    if (allocations.length <= 1) return;
    setAllocations((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleStruggle = (id: string) => {
    setSelectedStruggles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBuildRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = allocations.filter((a) => a.subject.trim().length > 0 && a.minutes > 0);
    if (valid.length === 0) {
      setBuildFeedback(
        lang === 'bn'
          ? 'কমপক্ষে একটি সাবজেক্ট এবং সময় লিখুন।'
          : 'Please enter at least one subject and study duration.'
      );
      return;
    }

    const generated = assembleSmartRoutine(
      valid,
      selectedStruggles,
      customStruggle,
      lang,
      startTime
    );

    const routine: GeneratedRoutine = {
      id: `routine-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...generated,
    };

    setActiveRoutine(routine);
    setCompletedBlockIdxs([]);
    onSaveRoutine(routine);
    setBuildFeedback(
      lang === 'bn'
        ? `রুটিন তৈরি হয়েছে! (${routine.dailyPlan.length}টি ব্লক · মোট ${routine.totalMinutes} মিনিট)`
        : `Routine built & saved! (${routine.dailyPlan.length} blocks · ${routine.totalMinutes}m total)`
    );
    window.setTimeout(() => setBuildFeedback(null), 5000);
  };

  const toggleBlockDone = (idx: number) => {
    setCompletedBlockIdxs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleCopyRoutine = () => {
    const lines = [
      `${lang === 'bn' ? activeRoutine.titleBn : activeRoutine.title}`,
      `${lang === 'bn' ? activeRoutine.diagnosisBn : activeRoutine.diagnosis}`,
      '',
      ...activeRoutine.dailyPlan.map(
        (b, i) =>
          `${i + 1}. [${b.timeSlot}] ${b.subject} (${b.durationMinutes}m) — ${
            lang === 'bn' ? b.methodBn : b.method
          }\n   ${lang === 'bn' ? b.objectiveBn : b.objective}`
      ),
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    setCopiedBanner(true);
    window.setTimeout(() => setCopiedBanner(false), 2500);
  };

  return (
    <div className="space-y-12">
      {/* Masthead */}
      <section className={`border-b pb-6 ${tk.borderSubtle}`}>
        <div className="max-w-3xl">
          <p className={`text-xs font-medium tracking-wide ${tk.accentText}`}>
            {t.brand} · {t.subtitle}
          </p>
          <h1
            className={`mt-2 text-3xl font-medium tracking-tight sm:text-4xl [text-wrap:balance] ${tk.headingText}`}
          >
            {t.methodsTitle}
          </h1>
          <p className={`mt-2.5 text-sm leading-relaxed ${tk.mutedText}`}>
            {t.methodsDesc}
          </p>
        </div>
      </section>

      {/* 01. Clean Routine Builder + Side-by-Side Execution Guide */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`text-xl font-medium ${tk.headingText}`}>
              {lang === 'bn'
                ? '০১. সাবজেক্ট ও সমস্যা অনুযায়ী রুটিন বিল্ডার এবং নির্দেশিকা'
                : '01. Automated Routine Builder & Execution Timetable'}
            </h2>
            <p className={`mt-1 text-sm ${tk.mutedText}`}>{t.routineBuilderDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Side: Builder Form (5 cols) */}
          <form
            onSubmit={handleBuildRoutine}
            className={`space-y-5 rounded-2xl border p-6 lg:col-span-5 ${tk.cardSurface}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="routine-start-time" className="block text-xs font-medium">
                  {lang === 'bn' ? 'শুরুর সময়' : 'Start Time'}
                </label>
                <input
                  id="routine-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`font-mono-tabular mt-1.5 rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
                />
              </div>

              <div className="text-right">
                <span className={`block text-[11px] ${tk.mutedText}`}>
                  {lang === 'bn' ? 'মোট সময়' : 'Total Planned'}
                </span>
                <span className={`font-mono-tabular text-lg font-semibold ${tk.accentText}`}>
                  {allocations.reduce((sum, a) => sum + (a.minutes || 0), 0)}{' '}
                  {lang === 'bn' ? 'মিনিট' : 'mins'}
                </span>
              </div>
            </div>

            {/* Subject Inputs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{t.subjectsAllocLabel}</span>
                <button
                  type="button"
                  onClick={handleAddAllocation}
                  className={`inline-flex items-center gap-1 text-xs font-medium ${tk.accentText} hover:underline`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.addSubjectBtn}</span>
                </button>
              </div>

              {allocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className={`grid grid-cols-12 items-center gap-2 rounded-xl border p-2 ${tk.subCardSurface}`}
                >
                  <input
                    type="text"
                    value={alloc.subject}
                    onChange={(e) =>
                      handleUpdateAllocation(alloc.id, { subject: e.target.value })
                    }
                    placeholder={lang === 'bn' ? 'সাবজেক্ট...' : 'Subject...'}
                    className={`col-span-5 rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
                  />
                  <div className="col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      min={10}
                      max={240}
                      step={5}
                      value={alloc.minutes}
                      onChange={(e) =>
                        handleUpdateAllocation(alloc.id, {
                          minutes: Math.max(10, Number(e.target.value) || 30),
                        })
                      }
                      className={`font-mono-tabular w-full rounded-lg border px-2 py-1.5 text-center text-xs focus:outline-none ${tk.inputSurface}`}
                    />
                    <span className={`text-[11px] ${tk.mutedText}`}>m</span>
                  </div>
                  <select
                    value={alloc.difficulty}
                    onChange={(e) =>
                      handleUpdateAllocation(alloc.id, {
                        difficulty: e.target.value as SubjectAllocation['difficulty'],
                      })
                    }
                    className={`col-span-3 rounded-lg border px-1.5 py-1.5 text-[11px] focus:outline-none ${tk.inputSurface}`}
                  >
                    <option value="problem-solving">
                      {lang === 'bn' ? 'ম্যাথ/প্রবলেম' : 'Problems'}
                    </option>
                    <option value="conceptual">
                      {lang === 'bn' ? 'কনসেপ্ট' : 'Concept'}
                    </option>
                    <option value="memorization">
                      {lang === 'bn' ? 'মুখস্থ/থিওরি' : 'Memory'}
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllocation(alloc.id)}
                    aria-label="Remove subject"
                    className={`col-span-1 flex justify-center hover:text-rose-500 ${tk.mutedText}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Struggles Checklist */}
            <div className="space-y-2.5">
              <span className="block text-xs font-medium">{t.strugglesLabel}</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STRUGGLE_OPTIONS.map((st) => {
                  const active = selectedStruggles.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleStruggle(st.id)}
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                        active ? tk.activeTabBtn : tk.inputSurface
                      }`}
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-current/35">
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="leading-snug">{lang === 'bn' ? st.bn : st.en}</span>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customStruggle}
                onChange={(e) => setCustomStruggle(e.target.value)}
                placeholder={t.customStrugglePlaceholder}
                className={`mt-1 w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none ${tk.inputSurface}`}
              />
            </div>

            {buildFeedback && (
              <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-3.5 py-2 text-xs font-medium text-emerald-500">
                {buildFeedback}
              </div>
            )}

            <button
              type="submit"
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tk.primaryBtn}`}
            >
              <Wand2 className="h-4 w-4" />
              <span>{t.buildRoutineBtn}</span>
            </button>

            {savedRoutines.length > 0 && (
              <div className={`border-t pt-4 ${tk.borderSubtle}`}>
                <p className={`text-xs font-medium ${tk.mutedText}`}>
                  {t.savedRoutinesTitle}
                </p>
                <div className="mt-2 space-y-1.5">
                  {savedRoutines.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                        activeRoutine?.id === r.id ? tk.subCardSurface : tk.inputSurface
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRoutine(r);
                          setCompletedBlockIdxs([]);
                        }}
                        className="truncate text-left font-medium"
                      >
                        {lang === 'bn' ? r.titleBn : r.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteRoutine(r.id);
                          if (activeRoutine?.id === r.id) {
                            const fallback =
                              savedRoutines.find((item) => item.id !== r.id) ??
                              INITIAL_SAVED_ROUTINE;
                            setActiveRoutine(fallback);
                          }
                        }}
                        aria-label="Delete routine"
                        className={`shrink-0 hover:text-rose-500 ${tk.mutedText}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Right Side: Clean Timetable Display + How-To-Execute Panel (7 cols) */}
          <div className={`space-y-6 rounded-2xl border p-6 lg:col-span-7 ${tk.cardSurface}`}>
            <div className={`border-b pb-5 ${tk.borderSubtle}`}>
              <div className={`flex flex-wrap items-center justify-between gap-3 text-xs ${tk.mutedText}`}>
                <span>
                  {lang === 'bn'
                    ? 'গ্লোবাল স্টাডি রুটিন টাইমটেবিল'
                    : 'Automated Method-Matched Timetable'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular font-medium">
                    {activeRoutine.totalMinutes} {lang === 'bn' ? 'মিনিট' : 'mins total'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRoutine}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium ${tk.inputSurface}`}
                  >
                    <Copy className="h-3 w-3" />
                    <span>
                      {copiedBanner
                        ? lang === 'bn'
                          ? 'কপি হয়েছে'
                          : 'Copied'
                        : lang === 'bn'
                        ? 'কপি'
                        : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>

              <h3 className={`mt-1.5 font-display text-2xl font-medium ${tk.headingText}`}>
                {lang === 'bn' ? activeRoutine.titleBn : activeRoutine.title}
              </h3>
              <p className={`mt-2 text-xs leading-relaxed ${tk.mutedText}`}>
                {lang === 'bn' ? activeRoutine.diagnosisBn : activeRoutine.diagnosis}
              </p>
            </div>

            {/* Clean Structured Schedule Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${tk.headingText}`}>
                  {lang === 'bn' ? 'সময়সূচি ও করণীয়' : 'Structured Timetable Blocks'}
                </span>
                <span className={`font-mono-tabular ${tk.mutedText}`}>
                  {completedBlockIdxs.length}/{activeRoutine.dailyPlan.length}{' '}
                  {lang === 'bn' ? 'সম্পন্ন' : 'done'}
                </span>
              </div>

              <div className={`divide-y rounded-xl border ${tk.divideSubtle} ${tk.subCardSurface}`}>
                {activeRoutine.dailyPlan.map((block: RoutineBlock, idx: number) => {
                  const isChecked = completedBlockIdxs.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col gap-3 p-4 transition-opacity sm:flex-row sm:items-center sm:justify-between ${
                        isChecked ? 'opacity-55' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleBlockDone(idx)}
                          aria-label={`Mark ${block.subject} block complete`}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : tk.borderSubtle
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`font-mono-tabular font-semibold ${tk.accentText}`}>
                              {block.timeSlot}
                            </span>
                            <span className={tk.mutedText}>·</span>
                            <span
                              className={`font-semibold ${tk.headingText} ${
                                isChecked ? 'line-through' : ''
                              }`}
                            >
                              {block.subject}
                            </span>
                            <span className={tk.mutedText}>·</span>
                            <span className={tk.mutedText}>
                              {lang === 'bn' ? block.methodBn : block.method}
                            </span>
                          </div>
                          <p className="text-sm font-medium">
                            {lang === 'bn' ? block.objectiveBn : block.objective}
                          </p>
                          <p className={`text-xs leading-relaxed ${tk.mutedText}`}>
                            {lang === 'bn' ? block.techniqueStepBn : block.techniqueStep}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className={`font-mono-tabular text-[11px] ${tk.mutedText}`}>
                          +{block.breakMinutes}m rest
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onApplyToTimer({
                              minutes: block.durationMinutes,
                              subject: block.subject,
                              topic: lang === 'bn' ? block.objectiveBn : block.objective,
                              method: lang === 'bn' ? block.methodBn : block.method,
                            })
                          }
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${tk.primaryBtn}`}
                        >
                          <span className="font-mono-tabular">{block.durationMinutes}m</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matched Global Tips + Side-by-Side How to Follow Box */}
            <div className={`grid grid-cols-1 gap-6 border-t pt-5 sm:grid-cols-2 ${tk.borderSubtle}`}>
              <div>
                <h4 className={`flex items-center gap-2 text-xs font-semibold ${tk.headingText}`}>
                  <Layers className={`h-3.5 w-3.5 ${tk.accentText}`} />
                  <span>
                    {lang === 'bn'
                      ? 'আপনার সমস্যার সেরা কৌশল'
                      : 'Matched World-Wide Tactics'}
                  </span>
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {activeRoutine.matchedTips.map((tip) => (
                    <li key={tip.id} className="text-xs leading-relaxed">
                      <span className="font-semibold">
                        {lang === 'bn' ? tip.titleBn : tip.title}:
                      </span>{' '}
                      <span className={tk.mutedText}>
                        {lang === 'bn' ? tip.descriptionBn : tip.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-xl border p-4 ${tk.subCardSurface}`}>
                <h4 className={`flex items-center gap-2 text-xs font-semibold ${tk.headingText}`}>
                  <ListChecks className={`h-3.5 w-3.5 ${tk.accentText}`} />
                  <span>
                    {lang === 'bn'
                      ? 'এই রুটিন যেভাবে অনুসরণ করবেন (নির্দেশনা)'
                      : 'How to Execute This Routine'}
                  </span>
                </h4>
                <ol className={`mt-2.5 space-y-1.5 text-xs leading-relaxed ${tk.mutedText}`}>
                  <li>
                    1.{' '}
                    {lang === 'bn'
                      ? 'পড়ার ব্লকের পাশে মিনিট বাটনে ক্লিক করে সরাসরি টাইমার চালু করুন।'
                      : 'Click the minute button on any block above to load it directly into the Focus Timer.'}
                  </li>
                  <li>
                    2.{' '}
                    {lang === 'bn'
                      ? 'প্রতিটি ব্লক শেষে Done চাপুন যাতে ১-৪-৭ রিপিটেশন অটো সেভ হয়।'
                      : 'Press "Done" when the alarm rings to lock Day 1 and auto-schedule Day 4 & Day 7.'}
                  </li>
                  <li>
                    3.{' '}
                    {lang === 'bn'
                      ? 'ফোন দূরে রাখুন ও বিরতির সময় স্ক্রিন এড়িয়ে চলুন।'
                      : 'Keep your phone in another room during sprints and take screen-free breaks.'}
                  </li>
                </ol>
                <p className={`mt-3 border-t pt-2.5 text-[11px] ${tk.borderSubtle} ${tk.accentText}`}>
                  {lang === 'bn' ? activeRoutine.rule147NoteBn : activeRoutine.rule147Note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Worldwide Study Methods (12 Frameworks Across All Regions) + Clear Side-by-Side How-To Panel */}
      <section className={`space-y-6 border-t pt-10 ${tk.borderSubtle}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-xl font-medium ${tk.headingText}`}>
              {lang === 'bn'
                ? '০২. বিশ্বসেরা ১২টি স্টাডি ফ্রেমওয়ার্ক ও ধাপে ধাপে নির্দেশিকা'
                : '02. World-Wide Study Methods (12 Frameworks + How-To Guide)'}
            </h2>
          </div>

          <div className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 ${tk.subCardSurface}`}>
            {TRADITION_FILTERS.map((tab) => {
              const active = traditionFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTraditionFilter(tab.id)}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active ? tk.primaryBtn : tk.mutedText
                  }`}
                >
                  {lang === 'bn' ? tab.bn : tab.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Bookshelf Row of Global Method Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {filteredMethods.map((method) => {
            const isSelected = selectedMethod.id === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method)}
                className={`group relative flex h-52 flex-col justify-between rounded-r-xl rounded-l-sm border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? '-translate-y-2 ring-2 ring-current shadow-xl'
                    : 'hover:-translate-y-1 opacity-90 hover:opacity-100 shadow-md'
                }`}
                style={{ backgroundColor: method.coverColor, color: method.textColor }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-2 rounded-l-sm"
                  style={{ backgroundColor: method.spineColor }}
                />
                <div className="pl-2">
                  <div className="flex items-center justify-between gap-1 text-[10px] opacity-75">
                    <span className="truncate">
                      {lang === 'bn' ? method.originBn : method.origin}
                    </span>
                    <span className="font-mono-tabular shrink-0 font-semibold">
                      {method.defaultMinutes}m
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-display text-base font-medium leading-snug">
                    {lang === 'bn' ? method.titleBn : method.title}
                  </h3>
                </div>

                <div className="space-y-2 pl-2">
                  <p className="line-clamp-2 text-[11px] leading-relaxed opacity-80">
                    {lang === 'bn' ? method.subtitleBn : method.subtitle}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/15 pt-2 text-[10px] opacity-90">
                    <span className="truncate">{method.tradition}</span>
                    <span className="font-semibold">
                      {isSelected ? (lang === 'bn' ? 'খোলা' : 'Active') : lang === 'bn' ? 'দেখুন' : 'View'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className={`${tk.shelfLedge} h-3.5 w-full rounded-md border-t border-white/10`} />

        {/* Selected Method Overview + Side-by-Side Clear Instructions ("How to Do It") */}
        <div className={`grid grid-cols-1 gap-8 rounded-2xl border p-6 lg:grid-cols-12 lg:p-8 ${tk.cardSurface}`}>
          <div className="space-y-4 lg:col-span-5">
            <div className={`flex flex-wrap items-center gap-2 text-xs ${tk.mutedText}`}>
              <span>{selectedMethod.tradition}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'bn' ? selectedMethod.originBn : selectedMethod.origin}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-mono-tabular font-semibold ${tk.accentText}`}>
                {selectedMethod.defaultMinutes} {lang === 'bn' ? 'মিনিট' : 'min block'}
              </span>
            </div>

            <h3 className={`font-display text-2xl font-medium ${tk.headingText}`}>
              {lang === 'bn' ? selectedMethod.titleBn : selectedMethod.title}
            </h3>
            <p className={`text-sm leading-relaxed ${tk.mutedText}`}>
              {lang === 'bn' ? selectedMethod.summaryBn : selectedMethod.summary}
            </p>

            <div className={`rounded-xl border p-3.5 ${tk.subCardSurface}`}>
              <p className={`text-xs font-semibold ${tk.headingText}`}>
                {lang === 'bn' ? 'সবচেয়ে কার্যকর যে ক্ষেত্রে:' : 'Best Applied For'}
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${tk.mutedText}`}>
                {lang === 'bn' ? selectedMethod.bestForBn : selectedMethod.bestFor}
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  onApplyToTimer({
                    minutes: selectedMethod.defaultMinutes,
                    method: lang === 'bn' ? selectedMethod.titleBn : selectedMethod.title,
                  })
                }
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${tk.primaryBtn}`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {lang === 'bn'
                    ? `${selectedMethod.defaultMinutes} মিনিটের টাইমারে চালু করুন`
                    : `Start ${selectedMethod.defaultMinutes}m Focus Timer`}
                </span>
              </button>
            </div>
          </div>

          <div className={`border-t pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 ${tk.borderSubtle}`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${tk.accentText}`}>
                {lang === 'bn'
                  ? 'কীভাবে করবেন — ধাপে ধাপে নির্দেশিকা'
                  : 'How to Apply It — Step-by-Step Instructions'}
              </h4>
              <BookOpen className={`h-4 w-4 ${tk.mutedText}`} />
            </div>
            <ol className="mt-4 space-y-3.5">
              {(lang === 'bn' ? selectedMethod.stepsBn : selectedMethod.steps).map((step, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  <span
                    className={`font-mono-tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold ${tk.subCardSurface} ${tk.accentText}`}
                  >
                    0{idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 03. Global Tips & Tricks Bank */}
      <section className={`space-y-6 border-t pt-10 ${tk.borderSubtle}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-xl font-medium ${tk.headingText}`}>
              {lang === 'bn'
                ? '০৩. সম্পূর্ণ গ্লোবাল টিপস অ্যান্ড ট্রিকস ভান্ডার'
                : '03. Complete Global Tips & Tricks Bank'}
            </h2>
            <p className={`mt-1 text-xs ${tk.mutedText}`}>
              {lang === 'bn'
                ? 'সারা বিশ্বের সেরা স্টাডি কৌশলসমূহ একসাথে।'
                : 'Practical cognitive tactics curated from Seoul, Tokyo, Peking, Harvard, Oxford, Germany, Italy, Singapore & Nalanda.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={tipsStruggleFilter}
              onChange={(e) => setTipsStruggleFilter(e.target.value)}
              aria-label="Filter tips by study struggle"
              className={`rounded-xl border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
            >
              <option value="All">
                {lang === 'bn' ? 'সব ধরনের সমস্যা' : 'All Study Struggles'}
              </option>
              {STRUGGLE_OPTIONS.map((st) => (
                <option key={st.id} value={st.id}>
                  {lang === 'bn' ? st.bn : st.en}
                </option>
              ))}
            </select>

            <div className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 ${tk.subCardSurface}`}>
              {TRADITION_FILTERS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTipsFilter(tab.id)}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    tipsFilter === tab.id ? tk.primaryBtn : tk.mutedText
                  }`}
                >
                  {lang === 'bn' ? tab.bn : tab.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredTips.map((tip) => (
            <div key={tip.id} className={`flex flex-col justify-between rounded-xl border p-5 ${tk.cardSurface}`}>
              <div>
                <div className={`flex items-center justify-between gap-2 text-[11px] ${tk.mutedText}`}>
                  <span>{tip.origin}</span>
                  <span className={`font-mono-tabular ${tk.accentText}`}>
                    {tip.idealMinutes}m
                  </span>
                </div>
                <h3 className={`mt-2 text-sm font-semibold leading-snug ${tk.headingText}`}>
                  {lang === 'bn' ? tip.titleBn : tip.title}
                </h3>
                <p className={`mt-2 text-xs leading-relaxed ${tk.mutedText}`}>
                  {lang === 'bn' ? tip.descriptionBn : tip.description}
                </p>
              </div>
              <div className={`mt-4 border-t pt-2.5 text-[11px] ${tk.borderSubtle} ${tk.accentText}`}>
                {tip.tradition}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
