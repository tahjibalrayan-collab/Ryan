import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Copy,
  Layers,
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
  { id: 'All', en: 'All Frameworks', bn: 'সব মেথড' },
  { id: 'Korean Focus', en: 'Korean Focus', bn: 'কোরিয়ান ফোকাস' },
  { id: 'Japanese Kaizen', en: 'Japanese Kaizen', bn: 'জাপানিজ কাইজেন' },
  { id: 'Chinese Intensive', en: 'Chinese Intensive', bn: 'চাইনিজ ইনটেনসিভ' },
  { id: 'Ivy League Recall', en: 'Ivy League Recall', bn: 'আইভি লিগ রিকল' },
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
  const isPaper = theme === 'paper';

  const [traditionFilter, setTraditionFilter] = useState<'All' | MethodTradition>('All');
  const [tipsFilter, setTipsFilter] = useState<'All' | MethodTradition>('All');
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

  const filteredTips =
    tipsFilter === 'All'
      ? GLOBAL_STUDY_TIPS
      : GLOBAL_STUDY_TIPS.filter((tip) => tip.tradition === tipsFilter);

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

  const handleUpdateAllocation = (
    id: string,
    patch: Partial<SubjectAllocation>
  ) => {
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

  const cardSurface = isPaper
    ? 'border-[#C6BEB0] bg-[#EFECE5] text-[#211E19]'
    : 'border-white/8 bg-[#16181D] text-[#F4F2ED]';
  const inputSurface = isPaper
    ? 'border-[#C6BEB0] bg-white text-[#211E19] placeholder:text-[#888072]'
    : 'border-white/10 bg-[#111215] text-[#F4F2ED] placeholder:text-[#5F6573]';
  const mutedText = isPaper ? 'text-[#665E52]' : 'text-[#9CA3AF]';
  const headingText = isPaper ? 'text-[#1F1C18]' : 'text-[#F4F2ED]';
  const accentText = isPaper ? 'text-[#8D5B16]' : 'text-[#D4A359]';

  return (
    <div className="space-y-12">
      {/* Masthead */}
      <section
        className={`border-b pb-6 ${isPaper ? 'border-[#C6BEB0]' : 'border-white/8'}`}
      >
        <div className="max-w-3xl">
          <p className={`text-xs font-medium tracking-wide ${accentText}`}>
            {t.brand} · {t.subtitle}
          </p>
          <h1
            className={`mt-2 text-3xl font-medium tracking-tight sm:text-4xl [text-wrap:balance] ${headingText}`}
          >
            {t.methodsTitle}
          </h1>
          <p className={`mt-2.5 text-sm leading-relaxed ${mutedText}`}>
            {t.methodsDesc}
          </p>
        </div>
      </section>

      {/* 01. Prominent Automated Subject & Struggle Routine Builder */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`text-xl font-medium ${headingText}`}>
              {lang === 'bn'
                ? '০১. সাবজেক্ট ও সমস্যা অনুযায়ী স্মার্ট রুটিন বিল্ডার'
                : '01. Automated Subject & Struggle Routine Builder'}
            </h2>
            <p className={`mt-1 text-sm ${mutedText}`}>{t.routineBuilderDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Input Form */}
          <form
            onSubmit={handleBuildRoutine}
            className={`space-y-5 rounded-2xl border p-6 lg:col-span-5 ${cardSurface}`}
          >
            {/* Start Time + Total Planned Preview */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="routine-start-time" className="block text-xs font-medium">
                  {lang === 'bn' ? 'শুরুর সময়' : 'Session Start Time'}
                </label>
                <input
                  id="routine-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`font-mono-tabular mt-1.5 rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${inputSurface}`}
                />
              </div>

              <div className="text-right">
                <span className={`block text-[11px] ${mutedText}`}>
                  {lang === 'bn' ? 'মোট বরাদ্দ সময়' : 'Planned Total'}
                </span>
                <span className={`font-mono-tabular text-lg font-semibold ${accentText}`}>
                  {allocations.reduce((sum, a) => sum + (a.minutes || 0), 0)}{' '}
                  {lang === 'bn' ? 'মিনিট' : 'mins'}
                </span>
              </div>
            </div>

            {/* Subject Allocations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{t.subjectsAllocLabel}</span>
                <button
                  type="button"
                  onClick={handleAddAllocation}
                  className={`inline-flex items-center gap-1 text-xs font-medium ${accentText} hover:underline`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.addSubjectBtn}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {allocations.map((alloc) => (
                  <div
                    key={alloc.id}
                    className={`grid grid-cols-12 items-center gap-2 rounded-xl border p-2 ${
                      isPaper
                        ? 'border-[#C6BEB0] bg-[#E8E3D8]/60'
                        : 'border-white/8 bg-[#121419]'
                    }`}
                  >
                    <input
                      type="text"
                      value={alloc.subject}
                      onChange={(e) =>
                        handleUpdateAllocation(alloc.id, { subject: e.target.value })
                      }
                      placeholder={lang === 'bn' ? 'সাবজেক্ট...' : 'Subject...'}
                      className={`col-span-5 rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none ${inputSurface}`}
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
                        className={`font-mono-tabular w-full rounded-lg border px-2 py-1.5 text-center text-xs focus:outline-none ${inputSurface}`}
                      />
                      <span className={`text-[11px] ${mutedText}`}>m</span>
                    </div>
                    <select
                      value={alloc.difficulty}
                      onChange={(e) =>
                        handleUpdateAllocation(alloc.id, {
                          difficulty: e.target.value as SubjectAllocation['difficulty'],
                        })
                      }
                      className={`col-span-3 rounded-lg border px-1.5 py-1.5 text-[11px] focus:outline-none ${inputSurface}`}
                    >
                      <option value="problem-solving">
                        {lang === 'bn' ? 'প্রবলেম/ম্যাথ' : 'Problems'}
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
                      className={`col-span-1 flex justify-center hover:text-red-400 ${mutedText}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className={`text-[11px] ${mutedText}`}>
                {lang === 'bn'
                  ? 'টিপস: ৭৫+ মিনিটের সাবজেক্ট অটোমেটিক বিরতিসহ ২টি স্মার্ট স্প্রিন্টে ভাগ হবে।'
                  : 'Note: Any 75+ min subject automatically splits into two sprints with an active rest break.'}
              </p>
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
                        active
                          ? isPaper
                            ? 'border-[#1D355E] bg-[#1D355E]/10 text-[#1F1C18]'
                            : 'border-[#D4A359]/60 bg-[#D4A359]/10 text-[#F4F2ED]'
                          : isPaper
                          ? 'border-[#C6BEB0] bg-white/60 text-[#544D42]'
                          : 'border-white/8 bg-[#111215] text-[#9CA3AF]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          active
                            ? 'border-[#D4A359] bg-[#D4A359] text-[#111215]'
                            : 'border-white/20'
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="leading-snug">
                        {lang === 'bn' ? st.bn : st.en}
                      </span>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customStruggle}
                onChange={(e) => setCustomStruggle(e.target.value)}
                placeholder={t.customStrugglePlaceholder}
                className={`mt-2 w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none ${inputSurface}`}
              />
            </div>

            {buildFeedback && (
              <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-3.5 py-2 text-xs font-medium text-emerald-300">
                <span className={isPaper ? 'text-emerald-900' : 'text-emerald-200'}>
                  {buildFeedback}
                </span>
              </div>
            )}

            <button
              type="submit"
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                isPaper
                  ? 'bg-[#1D355E] text-white hover:bg-[#152849]'
                  : 'bg-[#D4A359] text-[#111215] hover:bg-[#DFB26D]'
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span>{t.buildRoutineBtn}</span>
            </button>

            {savedRoutines.length > 0 && (
              <div
                className={`border-t pt-4 ${
                  isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
                }`}
              >
                <p className={`text-xs font-medium ${mutedText}`}>
                  {t.savedRoutinesTitle}
                </p>
                <div className="mt-2 space-y-1.5">
                  {savedRoutines.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                        activeRoutine?.id === r.id
                          ? isPaper
                            ? 'bg-[#E2DCD0] text-[#1F1C18]'
                            : 'bg-[#22252E] text-[#F4F2ED]'
                          : `${mutedText} hover:bg-white/5`
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
                        className="shrink-0 text-[#717786] hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Generated Routine Blueprint Output */}
          <div className={`rounded-2xl border p-6 lg:col-span-7 ${cardSurface}`}>
            <div className="space-y-6">
              <div
                className={`border-b pb-5 ${
                  isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
                }`}
              >
                <div className={`flex flex-wrap items-center justify-between gap-3 text-xs ${mutedText}`}>
                  <span>
                    {lang === 'bn'
                      ? 'গ্লোবাল টিপস-ভিত্তিক পার্সোনালাইজড রুটিন'
                      : 'Method-Matched Study Routine'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tabular">
                      {activeRoutine.totalMinutes} {lang === 'bn' ? 'মিনিট' : 'mins total'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRoutine}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${inputSurface}`}
                    >
                      <Copy className="h-3 w-3" />
                      <span>
                        {copiedBanner
                          ? lang === 'bn'
                            ? 'কপি হয়েছে'
                            : 'Copied'
                          : lang === 'bn'
                          ? 'কপি করুন'
                          : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
                <h3 className={`mt-1.5 font-display text-2xl font-medium ${headingText}`}>
                  {lang === 'bn' ? activeRoutine.titleBn : activeRoutine.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${mutedText}`}>
                  {lang === 'bn' ? activeRoutine.diagnosisBn : activeRoutine.diagnosis}
                </p>
              </div>

              {/* Daily Study Blocks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-medium ${mutedText}`}>
                    {lang === 'bn' ? 'সময়ভিত্তিক পড়ার ব্লক' : 'Time-Blocked Execution Schedule'}
                  </h4>
                  <span className={`font-mono-tabular text-[11px] ${mutedText}`}>
                    {completedBlockIdxs.length}/{activeRoutine.dailyPlan.length}{' '}
                    {lang === 'bn' ? 'সম্পন্ন' : 'completed'}
                  </span>
                </div>

                <div
                  className={`divide-y rounded-xl border ${
                    isPaper
                      ? 'divide-[#C6BEB0] border-[#C6BEB0] bg-white/70'
                      : 'divide-white/8 border-white/8 bg-[#121419]'
                  }`}
                >
                  {activeRoutine.dailyPlan.map((block: RoutineBlock, idx: number) => {
                    const isChecked = completedBlockIdxs.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col gap-3 p-4 transition-opacity sm:flex-row sm:items-start sm:justify-between ${
                          isChecked ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleBlockDone(idx)}
                            aria-label={`Mark ${block.subject} block complete`}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              isChecked
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : isPaper
                                ? 'border-[#ABA292]'
                                : 'border-white/20 hover:border-[#D4A359]'
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5" />}
                          </button>

                          <div className="space-y-1">
                            <div className={`flex flex-wrap items-center gap-2 text-xs ${mutedText}`}>
                              <span className={`font-mono-tabular font-medium ${accentText}`}>
                                {block.timeSlot}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`font-semibold ${headingText} ${
                                  isChecked ? 'line-through' : ''
                                }`}
                              >
                                {block.subject}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{lang === 'bn' ? block.methodBn : block.method}</span>
                            </div>
                            <p className="text-sm font-medium">
                              {lang === 'bn' ? block.objectiveBn : block.objective}
                            </p>
                            <p className={`text-xs leading-relaxed ${mutedText}`}>
                              {lang === 'bn' ? block.techniqueStepBn : block.techniqueStep}
                            </p>
                            <p className={`font-mono-tabular text-[11px] ${mutedText}`}>
                              {lang === 'bn'
                                ? `পরবর্তী বিরতি: ${block.breakMinutes} মিনিট`
                                : `Rest after block: ${block.breakMinutes}m`}
                            </p>
                          </div>
                        </div>

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
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            isPaper
                              ? 'border-[#C6BEB0] bg-white text-[#1F1C18] hover:border-[#1D355E]'
                              : 'border-white/10 bg-[#1B1E26] text-[#F4F2ED] hover:border-[#D4A359]/60 hover:text-[#D4A359]'
                          }`}
                        >
                          <span className="font-mono-tabular">{block.durationMinutes}m</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Matched Tips & 1-4-7 Rule Reminder */}
              <div
                className={`grid grid-cols-1 gap-6 border-t pt-5 sm:grid-cols-2 ${
                  isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
                }`}
              >
                <div>
                  <h4 className={`flex items-center gap-2 text-xs font-medium ${mutedText}`}>
                    <Layers className={`h-3.5 w-3.5 ${accentText}`} />
                    <span>
                      {lang === 'bn'
                        ? 'আপনার সমস্যার সেরা কৌশলসমূহ'
                        : 'Matched Global Tricks'}
                    </span>
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {activeRoutine.matchedTips.map((tip) => (
                      <li key={tip.id} className="text-xs leading-relaxed">
                        <span className="font-semibold">
                          {lang === 'bn' ? tip.titleBn : tip.title}:
                        </span>{' '}
                        <span className={mutedText}>
                          {lang === 'bn' ? tip.descriptionBn : tip.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={`flex items-center gap-2 text-xs font-medium ${mutedText}`}>
                    <BookOpen className={`h-3.5 w-3.5 ${accentText}`} />
                    <span>
                      {lang === 'bn' ? '১-৪-৭ রুল ইন্টিগ্রেশন' : '1-4-7 Retention Rule'}
                    </span>
                  </h4>
                  <p className={`mt-3 text-xs leading-relaxed ${mutedText}`}>
                    {lang === 'bn'
                      ? activeRoutine.rule147NoteBn
                      : activeRoutine.rule147Note}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. World-Class Study Frameworks Shelf */}
      <section
        className={`space-y-6 border-t pt-10 ${
          isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-xl font-medium ${headingText}`}>
              {lang === 'bn'
                ? '০২. বিশ্বসেরা স্টাডি ফ্রেমওয়ার্কসমূহ'
                : '02. World-Class Study Frameworks'}
            </h2>
          </div>

          <div
            className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 ${
              isPaper
                ? 'border-[#C6BEB0] bg-[#E8E3D8]'
                : 'border-white/8 bg-[#181A1F]'
            }`}
          >
            {TRADITION_FILTERS.map((tab) => {
              const active = traditionFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTraditionFilter(tab.id)}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? isPaper
                        ? 'bg-[#1D355E] text-white'
                        : 'bg-[#262932] text-[#F4F2ED]'
                      : mutedText
                  }`}
                >
                  {lang === 'bn' ? tab.bn : tab.en}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-5 px-2 pb-5 sm:grid-cols-2 lg:grid-cols-5">
            {filteredMethods.map((method) => {
              const isSelected = selectedMethod.id === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`group relative flex h-60 flex-col justify-between rounded-r-xl rounded-l-sm border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? '-translate-y-2 border-[#D4A359] shadow-[0_18px_36px_-12px_rgba(0,0,0,0.85)]'
                      : 'border-white/10 hover:-translate-y-1.5 hover:border-white/25 shadow-[0_12px_24px_-10px_rgba(0,0,0,0.75)]'
                  }`}
                  style={{ backgroundColor: method.coverColor }}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-2.5 rounded-l-sm opacity-95"
                    style={{ backgroundColor: method.spineColor }}
                  />
                  <div className="pl-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#B7BCC8]">
                      <span className="truncate">
                        {lang === 'bn' ? method.originBn : method.origin}
                      </span>
                      <span className="font-mono-tabular shrink-0 text-[#D4A359]">
                        {method.defaultMinutes}m
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-medium leading-snug text-[#F4F2ED]">
                      {lang === 'bn' ? method.titleBn : method.title}
                    </h3>
                  </div>

                  <div className="space-y-3 pl-2">
                    <p className="line-clamp-3 text-xs leading-relaxed text-[#B2B7C4]">
                      {lang === 'bn' ? method.subtitleBn : method.subtitle}
                    </p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-[#D4A359]">
                      <span>{method.tradition}</span>
                      <span>
                        {isSelected
                          ? lang === 'bn'
                            ? 'খোলা আছে'
                            : 'Open'
                          : lang === 'bn'
                          ? 'দেখুন'
                          : 'Inspect'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div
            className={`${isPaper ? 'shelf-ledge-light' : 'shelf-ledge'} h-4 w-full rounded-md border-t border-white/10`}
          />
        </div>

        {/* Selected Method Protocol */}
        <div
          className={`grid grid-cols-1 gap-8 rounded-2xl border p-6 lg:grid-cols-12 lg:p-8 ${cardSurface}`}
        >
          <div className="space-y-4 lg:col-span-5">
            <div className={`flex flex-wrap items-center gap-2 text-xs ${mutedText}`}>
              <span>{selectedMethod.tradition}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'bn' ? selectedMethod.originBn : selectedMethod.origin}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-mono-tabular font-medium ${accentText}`}>
                {selectedMethod.defaultMinutes} {lang === 'bn' ? 'মিনিট' : 'min block'}
              </span>
            </div>

            <h3 className={`font-display text-2xl font-medium ${headingText}`}>
              {lang === 'bn' ? selectedMethod.titleBn : selectedMethod.title}
            </h3>
            <p className={`text-sm leading-relaxed ${mutedText}`}>
              {lang === 'bn' ? selectedMethod.summaryBn : selectedMethod.summary}
            </p>

            <div className="pt-2">
              <p className={`text-xs font-medium ${mutedText}`}>
                {lang === 'bn' ? 'সবচেয়ে কার্যকর:' : 'Best Applied For'}
              </p>
              <p className="mt-1 text-sm">
                {lang === 'bn' ? selectedMethod.bestForBn : selectedMethod.bestFor}
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() =>
                  onApplyToTimer({
                    minutes: selectedMethod.defaultMinutes,
                    method:
                      lang === 'bn'
                        ? selectedMethod.titleBn
                        : selectedMethod.title,
                  })
                }
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-[#D4A359] px-4 py-2.5 text-xs font-semibold text-[#111215] transition-colors hover:bg-[#DFB26D]"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {lang === 'bn'
                    ? `${selectedMethod.defaultMinutes} মিনিটের টাইমারে ব্যবহার করুন`
                    : `Start ${selectedMethod.defaultMinutes}m Timer with Method`}
                </span>
              </button>
            </div>
          </div>

          <div
            className={`border-t pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 ${
              isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
            }`}
          >
            <h4 className={`text-xs font-medium tracking-wide ${mutedText}`}>
              {lang === 'bn' ? 'ধাপে ধাপে কার্যকর পদ্ধতি' : 'Execution Protocol'}
            </h4>
            <ol className="mt-4 space-y-3.5">
              {(lang === 'bn' ? selectedMethod.stepsBn : selectedMethod.steps).map(
                (step, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <span
                      className={`font-mono-tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium ${
                        isPaper
                          ? 'border-[#C6BEB0] bg-white text-[#8D5B16]'
                          : 'border-white/10 bg-[#1E2128] text-[#D4A359]'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </li>
                )
              )}
            </ol>
          </div>
        </div>
      </section>

      {/* 03. Complete Global Tips & Tricks Bank */}
      <section
        className={`space-y-6 border-t pt-10 ${
          isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-xl font-medium ${headingText}`}>
              {lang === 'bn'
                ? '০৩. সম্পূর্ণ গ্লোবাল টিপস অ্যান্ড ট্রিকস ভান্ডার'
                : '03. Complete Global Tips & Tricks Bank'}
            </h2>
            <p className={`mt-1 text-xs ${mutedText}`}>
              {lang === 'bn'
                ? 'কোরিয়া, জাপান, চীন এবং হার্ভার্ড-অক্সফোর্ডের সেরা পড়ার ট্রিকসগুলো একসাথে।'
                : 'Proven study tactics from Seoul, Tokyo, Peking, Harvard, and Oxford gathered in one vault.'}
            </p>
          </div>

          <div
            className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 ${
              isPaper
                ? 'border-[#C6BEB0] bg-[#E8E3D8]'
                : 'border-white/8 bg-[#181A1F]'
            }`}
          >
            {TRADITION_FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTipsFilter(tab.id)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  tipsFilter === tab.id
                    ? isPaper
                      ? 'bg-[#1D355E] text-white'
                      : 'bg-[#262932] text-[#F4F2ED]'
                    : mutedText
                }`}
              >
                {lang === 'bn' ? tab.bn : tab.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredTips.map((tip) => (
            <div
              key={tip.id}
              className={`flex flex-col justify-between rounded-xl border p-5 ${cardSurface}`}
            >
              <div>
                <div className={`flex items-center justify-between gap-2 text-[11px] ${mutedText}`}>
                  <span>{tip.origin}</span>
                  <span className={`font-mono-tabular ${accentText}`}>
                    {tip.idealMinutes}m
                  </span>
                </div>
                <h3 className={`mt-2 text-sm font-semibold leading-snug ${headingText}`}>
                  {lang === 'bn' ? tip.titleBn : tip.title}
                </h3>
                <p className={`mt-2 text-xs leading-relaxed ${mutedText}`}>
                  {lang === 'bn' ? tip.descriptionBn : tip.description}
                </p>
              </div>
              <div
                className={`mt-4 border-t pt-2.5 text-[11px] ${
                  isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
                } ${accentText}`}
              >
                {tip.tradition}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
