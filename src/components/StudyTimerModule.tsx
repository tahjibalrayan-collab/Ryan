import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import {
  addDaysToDateKey,
  formatDateKey,
  GLOBAL_STUDY_METHODS,
} from '../data/seedData';
import { AppTheme, Language, SpacedRepetitionItem, StudyLog } from '../types';
import { playTimerCompletionBeep } from '../utils/audioEngine';

interface StudyTimerModuleProps {
  lang: Language;
  theme: AppTheme;
  preloadedSession: {
    minutes: number;
    subject?: string;
    topic?: string;
    method?: string;
    reviewItemId?: string;
  } | null;
  onClearPreloaded: () => void;
  studyLogs: StudyLog[];
  onLogSession: (
    log: Omit<StudyLog, 'id' | 'completedAt' | 'dateKey'>,
    reviewItemId?: string
  ) => void;
  onDeleteLog: (id: string) => void;
  spacedItems: SpacedRepetitionItem[];
  onAdvanceReview: (id: string) => void;
  onDeleteSpacedItem: (id: string) => void;
}

const PRESET_MINUTES = [25, 35, 45, 60];

export const StudyTimerModule: React.FC<StudyTimerModuleProps> = ({
  lang,
  theme,
  preloadedSession,
  onClearPreloaded,
  studyLogs,
  onLogSession,
  onDeleteLog,
  spacedItems,
  onAdvanceReview,
  onDeleteSpacedItem,
}) => {
  const t = UI_TEXT[lang];
  const isPaper = theme === 'paper';

  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('60');
  const [secondsLeft, setSecondsLeft] = useState<number>(60 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinishedAlert, setIsFinishedAlert] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [subject, setSubject] = useState<string>('Chemistry');
  const [topic, setTopic] = useState<string>('Chemical Bonding & Hybridization');
  const [method, setMethod] = useState<string>(GLOBAL_STUDY_METHODS[0].title);
  const [activeReviewItemId, setActiveReviewItemId] = useState<string | undefined>(undefined);
  const [reviewFilter, setReviewFilter] = useState<'due' | 'day4' | 'day7' | 'finished'>('due');
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const todayKey = formatDateKey(new Date());

  useEffect(() => {
    if (!preloadedSession) return;
    const mins = Math.max(1, Math.min(180, preloadedSession.minutes || 35));
    setIsRunning(false);
    setIsFinishedAlert(false);
    setDurationMinutes(mins);
    setCustomMinutesInput(String(mins));
    setSecondsLeft(mins * 60);
    if (preloadedSession.subject) setSubject(preloadedSession.subject);
    if (preloadedSession.topic) setTopic(preloadedSession.topic);
    if (preloadedSession.method) setMethod(preloadedSession.method);
    setActiveReviewItemId(preloadedSession.reviewItemId);
    onClearPreloaded();
  }, [preloadedSession, onClearPreloaded]);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          setIsRunning(false);
          setIsFinishedAlert(true);
          if (soundEnabled) {
            playTimerCompletionBeep();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  const handleSelectDuration = (mins: number) => {
    const clamped = Math.max(1, Math.min(180, mins));
    setIsRunning(false);
    setIsFinishedAlert(false);
    setDurationMinutes(clamped);
    setCustomMinutesInput(String(clamped));
    setSecondsLeft(clamped * 60);
  };

  const handleCustomMinutesBlur = () => {
    const parsed = parseInt(customMinutesInput, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 180) {
      handleSelectDuration(parsed);
    } else {
      setCustomMinutesInput(String(durationMinutes));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinishedAlert(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const handleDone = () => {
    const cleanSubject = subject.trim() || 'General Study';
    const cleanTopic = topic.trim() || 'Focused Practice';
    const elapsedSeconds = durationMinutes * 60 - secondsLeft;
    const loggedMinutes =
      elapsedSeconds >= 60 ? Math.round(elapsedSeconds / 60) : durationMinutes;

    const currentReviewItem = activeReviewItemId
      ? spacedItems.find((i) => i.id === activeReviewItemId)
      : undefined;

    onLogSession(
      {
        subject: cleanSubject,
        topic: cleanTopic,
        method,
        durationMinutes: loggedMinutes,
      },
      activeReviewItemId
    );

    setIsRunning(false);
    setIsFinishedAlert(false);
    setSecondsLeft(durationMinutes * 60);
    setActiveReviewItemId(undefined);

    const day4Date = addDaysToDateKey(todayKey, 3);
    const day7Date = addDaysToDateKey(todayKey, 6);

    if (currentReviewItem?.stageIndex === 1) {
      setCompletionBanner(
        lang === 'bn'
          ? `৭ম দিনের রিভিশন সম্পন্ন! "${cleanSubject} — ${cleanTopic}" টপিকটি সম্পূর্ণ ফিনিশ হয়েছে।`
          : `Day 7 completed! "${cleanSubject} — ${cleanTopic}" is now Finished.`
      );
    } else if (currentReviewItem?.stageIndex === 0) {
      setCompletionBanner(
        lang === 'bn'
          ? `৪র্থ দিনের রিকল সম্পন্ন! ৭ম দিনের ফাইনাল রিভিশন ${currentReviewItem.day7Date}-এ নির্ধারিত হয়েছে।`
          : `Day 4 Recall done! Final Day 7 Finish scheduled for ${currentReviewItem.day7Date}.`
      );
    } else {
      setCompletionBanner(
        lang === 'bn'
          ? `"${cleanSubject} — ${cleanTopic}" ১ম দিন হিসেবে সেভ হয়েছে। ৪র্থ দিন রিকল (${day4Date}) ও ৭ম দিন ফিনিশ (${day7Date}) রিমাইন্ডার সেট হয়েছে।`
          : `Day 1 locked for "${cleanSubject} — ${cleanTopic}". Day 4 Recall (${day4Date}) & Day 7 Finish (${day7Date}) scheduled.`
      );
    }
    window.setTimeout(() => setCompletionBanner(null), 6500);
  };

  const totalSeconds = durationMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progressRatio);

  const minsDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secsDisplay = String(secondsLeft % 60).padStart(2, '0');

  const todaysLogs = useMemo(
    () => studyLogs.filter((l) => l.dateKey === todayKey),
    [studyLogs, todayKey]
  );

  const totalMinutesToday = useMemo(
    () => todaysLogs.reduce((sum, l) => sum + l.durationMinutes, 0),
    [todaysLogs]
  );

  const dueItems = useMemo(
    () => spacedItems.filter((item) => item.stageIndex < 2 && item.nextReviewDate <= todayKey),
    [spacedItems, todayKey]
  );
  const day4Items = useMemo(
    () => spacedItems.filter((item) => item.stageIndex === 0),
    [spacedItems]
  );
  const day7Items = useMemo(
    () => spacedItems.filter((item) => item.stageIndex === 1),
    [spacedItems]
  );
  const finishedItems = useMemo(
    () => spacedItems.filter((item) => item.stageIndex === 2),
    [spacedItems]
  );

  const displayedSpacedItems =
    reviewFilter === 'due'
      ? dueItems
      : reviewFilter === 'day4'
      ? day4Items
      : reviewFilter === 'day7'
      ? day7Items
      : finishedItems;

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
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${
          isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
        }`}
      >
        <div>
          <p className={`text-xs font-medium ${accentText}`}>{t.timerEyebrow}</p>
          <h1 className={`mt-1.5 text-3xl font-medium tracking-tight ${headingText}`}>
            {t.timerTitle}
          </h1>
          <p className={`mt-1.5 text-sm ${mutedText}`}>{t.timerDesc}</p>
        </div>

        <div className={`flex items-center gap-6 text-xs ${mutedText}`}>
          <div>
            <span className="block">{t.todayCompleted}</span>
            <span className={`font-mono-tabular text-base font-medium ${headingText}`}>
              {todaysLogs.length} · {totalMinutesToday}m
            </span>
          </div>
          <div className={`h-8 w-px ${isPaper ? 'bg-[#C6BEB0]' : 'bg-white/10'}`} />
          <div>
            <span className="block">{t.dueTodayLabel}</span>
            <span
              className={`font-mono-tabular text-base font-medium ${
                dueItems.length > 0 ? accentText : 'text-emerald-500'
              }`}
            >
              {dueItems.length} {lang === 'bn' ? 'টি টপিক' : 'topics'}
            </span>
          </div>
        </div>
      </section>

      {completionBanner && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className={isPaper ? 'text-emerald-900' : 'text-emerald-100'}>
              {completionBanner}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCompletionBanner(null)}
            className="text-xs opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Countdown Timer */}
        <section
          className={`flex flex-col justify-between rounded-2xl border p-6 lg:col-span-5 lg:p-8 ${cardSurface}`}
        >
          <div className="space-y-6">
            {/* Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className={`inline-flex items-center gap-1 rounded-xl border p-1 ${
                  isPaper
                    ? 'border-[#C6BEB0] bg-[#E3DDD0]'
                    : 'border-white/8 bg-[#111215]'
                }`}
              >
                {PRESET_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectDuration(mins)}
                    className={`font-mono-tabular whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      durationMinutes === mins
                        ? isPaper
                          ? 'bg-[#203864] text-white'
                          : 'bg-[#262932] text-[#D4A359]'
                        : mutedText
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="custom-mins" className={`text-xs ${mutedText}`}>
                  {lang === 'bn' ? 'কাস্টম' : 'Custom'}
                </label>
                <input
                  id="custom-mins"
                  type="number"
                  min={1}
                  max={180}
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  onBlur={handleCustomMinutesBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomMinutesBlur();
                  }}
                  className={`font-mono-tabular w-16 rounded-lg border px-2.5 py-1.5 text-center text-xs focus:outline-none ${inputSurface}`}
                />
                <button
                  type="button"
                  onClick={() => setSoundEnabled((v) => !v)}
                  aria-label="Toggle timer sound"
                  className={`rounded-lg border p-2 transition-colors ${inputSurface}`}
                >
                  {soundEnabled ? (
                    <Volume2 className={`h-4 w-4 ${accentText}`} />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SVG Ring */}
            <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 260 260">
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  fill="none"
                  stroke={isPaper ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth="7"
                />
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  fill="none"
                  stroke={isFinishedAlert ? '#10B981' : isPaper ? '#203864' : '#D4A359'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-[stroke-dashoffset] duration-500 ease-linear"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-[11px] font-medium ${mutedText}`}>
                  {isFinishedAlert
                    ? lang === 'bn'
                      ? 'সময় শেষ!'
                      : 'Session Complete'
                    : isRunning
                    ? lang === 'bn'
                      ? 'গভীর ফোকাস চলছে'
                      : 'Deep Focus Active'
                    : activeReviewItemId
                    ? lang === 'bn'
                      ? '১-৪-৭ রিকল মোড'
                      : '1-4-7 Recall Mode'
                    : lang === 'bn'
                    ? 'প্রস্তুত'
                    : 'Ready'}
                </span>
                <div className={`font-mono-tabular mt-1 text-5xl font-medium tracking-tight ${headingText}`}>
                  {minsDisplay}:{secsDisplay}
                </div>
                <span className={`mt-2 max-w-[160px] truncate text-xs ${mutedText}`}>
                  {subject || 'Subject'}
                </span>
              </div>
            </div>

            {isFinishedAlert && (
              <div className="flex items-center justify-between rounded-xl border border-[#D4A359]/40 bg-[#D4A359]/15 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#D4A359]" />
                  <span>
                    {lang === 'bn'
                      ? 'সময় সম্পন্ন! Done ক্লিক করে ১-৪-৭ লগ সেভ করুন।'
                      : 'Timer finished! Click Done to lock in 1-4-7.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={playTimerCompletionBeep}
                  className="underline"
                >
                  {lang === 'bn' ? 'বিপ বাজান' : 'Beep'}
                </button>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3.5 pt-2">
              <div>
                <label htmlFor="timer-subject" className="block text-xs font-medium">
                  {t.subjectNameLabel}
                </label>
                <input
                  id="timer-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Chemistry"
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none ${inputSurface}`}
                />
              </div>

              <div>
                <label htmlFor="timer-topic" className="block text-xs font-medium">
                  {t.topicStudiedLabel}
                </label>
                <input
                  id="timer-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Chemical Bonding"
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none ${inputSurface}`}
                />
              </div>

              <div>
                <label htmlFor="timer-method" className="block text-xs font-medium">
                  {t.techniqueLabel}
                </label>
                <select
                  id="timer-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none ${inputSurface}`}
                >
                  {GLOBAL_STUDY_METHODS.map((m) => (
                    <option key={m.id} value={lang === 'bn' ? m.titleBn : m.title}>
                      {lang === 'bn' ? m.titleBn : m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            className={`mt-6 flex items-center gap-3 border-t pt-5 ${
              isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsFinishedAlert(false);
                setIsRunning((r) => !r);
              }}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isPaper
                  ? 'bg-[#203864] text-white hover:bg-[#192D52]'
                  : 'bg-[#262932] text-[#F4F2ED] hover:bg-[#313541]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>{t.pauseTimer}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>{secondsLeft < totalSeconds ? t.resumeTimer : t.startTimer}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset timer"
              className={`rounded-lg border p-2.5 transition-colors ${inputSurface}`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDone}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-[#D4A359] px-5 py-2.5 text-sm font-semibold text-[#111215] transition-colors hover:bg-[#DFB26D]"
            >
              <Check className="h-4 w-4" />
              <span>{t.doneBtn}</span>
            </button>
          </div>
        </section>

        {/* Right Column: Strict 1-4-7 Spaced Repetition + Daily Log */}
        <div className="space-y-8 lg:col-span-7">
          <section className={`rounded-2xl border p-6 ${cardSurface}`}>
            <div
              className={`flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${
                isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className={`h-4 w-4 ${accentText}`} />
                <div>
                  <h2 className={`text-base font-medium ${headingText}`}>
                    {t.rule147Title}
                  </h2>
                  <p className={`text-xs ${mutedText}`}>{t.rule147Subtitle}</p>
                </div>
              </div>

              <div
                className={`inline-flex flex-wrap items-center gap-1 rounded-lg border p-1 ${
                  isPaper
                    ? 'border-[#C6BEB0] bg-[#E3DDD0]'
                    : 'border-white/8 bg-[#111215]'
                }`}
              >
                {(
                  [
                    { id: 'due', label: `${t.dueQueueTab} (${dueItems.length})` },
                    { id: 'day4', label: `${t.day4Tab} (${day4Items.length})` },
                    { id: 'day7', label: `${t.day7Tab} (${day7Items.length})` },
                    { id: 'finished', label: `${t.finishedTab} (${finishedItems.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReviewFilter(tab.id)}
                    className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      reviewFilter === tab.id
                        ? isPaper
                          ? 'bg-[#203864] text-white'
                          : 'bg-[#262932] text-[#F4F2ED]'
                        : mutedText
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {displayedSpacedItems.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500/70" />
                <p className="mt-2.5 text-sm font-medium">
                  {lang === 'bn'
                    ? 'এই তালিকায় কোনো বাকি টপিক নেই'
                    : 'No topics waiting in this 1-4-7 stage'}
                </p>
                <p className={`mt-1 text-xs ${mutedText}`}>
                  {lang === 'bn'
                    ? 'নতুন কোনো সাবজেক্ট ও টপিক পড়ে Done চাপলে ১-৪-৭ সাইকেল শুরু হবে।'
                    : 'Study a topic and press Done to begin its Day 1 → Day 4 → Day 7 cycle.'}
                </p>
              </div>
            ) : (
              <div
                className={`mt-4 divide-y ${
                  isPaper ? 'divide-[#C6BEB0]' : 'divide-white/8'
                }`}
              >
                {displayedSpacedItems.map((item) => {
                  const isDue = item.stageIndex < 2 && item.nextReviewDate <= todayKey;
                  const isFinished = item.stageIndex === 2;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`font-semibold ${headingText}`}>
                            {item.subject}
                          </span>
                          <span aria-hidden="true" className={mutedText}>
                            ·
                          </span>
                          <span className={`font-mono-tabular ${mutedText}`}>
                            {item.durationMinutes}m
                          </span>
                          <span aria-hidden="true" className={mutedText}>
                            ·
                          </span>
                          <span
                            className={`font-mono-tabular ${
                              isFinished
                                ? 'text-emerald-500'
                                : isDue
                                ? accentText
                                : mutedText
                            }`}
                          >
                            {isFinished
                              ? lang === 'bn'
                                ? 'টপিক শেষ (সম্পন্ন)'
                                : 'Finished'
                              : isDue
                              ? lang === 'bn'
                                ? 'আজ রিমাইন্ডার!'
                                : 'Due Today'
                              : `${lang === 'bn' ? 'পরবর্তী:' : 'Next:'} ${item.nextReviewDate}`}
                          </span>
                        </div>

                        <p className="truncate text-sm font-medium">{item.topic}</p>

                        {/* Visual 1-4-7 Milestone Bar */}
                        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${mutedText}`}>
                          <span className="text-emerald-500">
                            {lang === 'bn' ? `দিন ১ (${item.day1Date}) ✓` : `Day 1 (${item.day1Date}) ✓`}
                          </span>
                          <span aria-hidden="true">→</span>
                          <span
                            className={
                              item.stageIndex >= 1
                                ? 'text-emerald-500'
                                : item.stageIndex === 0 && isDue
                                ? `font-semibold ${accentText}`
                                : ''
                            }
                          >
                            {lang === 'bn'
                              ? `দিন ৪ রিকল (${item.day4Date})${item.stageIndex >= 1 ? ' ✓' : ''}`
                              : `Day 4 Recall (${item.day4Date})${item.stageIndex >= 1 ? ' ✓' : ''}`}
                          </span>
                          <span aria-hidden="true">→</span>
                          <span
                            className={
                              item.stageIndex === 2
                                ? 'text-emerald-500'
                                : item.stageIndex === 1 && isDue
                                ? `font-semibold ${accentText}`
                                : ''
                            }
                          >
                            {lang === 'bn'
                              ? `দিন ৭ ফিনিশ (${item.day7Date})${item.stageIndex === 2 ? ' ✓' : ''}`
                              : `Day 7 Finish (${item.day7Date})${item.stageIndex === 2 ? ' ✓' : ''}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isFinished && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSubject(item.subject);
                                setTopic(item.topic);
                                setActiveReviewItemId(item.id);
                                handleSelectDuration(25);
                              }}
                              className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${inputSurface}`}
                            >
                              {t.reviewNow}
                            </button>
                            <button
                              type="button"
                              onClick={() => onAdvanceReview(item.id)}
                              className="whitespace-nowrap rounded-lg bg-[#232A24] px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-[#2C372E]"
                            >
                              {item.stageIndex === 0 ? t.completeDay4 : t.finishTopic}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteSpacedItem(item.id)}
                          aria-label={`Remove ${item.topic}`}
                          className="rounded-lg p-1.5 text-[#6E7483] hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Daily Subject Checkoff Log */}
          <section className={`rounded-2xl border p-6 ${cardSurface}`}>
            <div
              className={`flex items-center justify-between border-b pb-4 ${
                isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
              }`}
            >
              <div>
                <h2 className={`text-base font-medium ${headingText}`}>
                  {t.dailyCheckoffTitle}
                </h2>
                <p className={`text-xs ${mutedText}`}>{t.dailyCheckoffSub}</p>
              </div>
              <span className={`font-mono-tabular text-xs ${mutedText}`}>{todayKey}</span>
            </div>

            {studyLogs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium">
                  {lang === 'bn' ? 'আজ কোনো সেশন সেভ হয়নি' : 'No sessions logged yet'}
                </p>
              </div>
            ) : (
              <div
                className={`mt-3 divide-y ${
                  isPaper ? 'divide-[#C6BEB0]' : 'divide-white/8'
                }`}
              >
                {studyLogs.slice(0, 8).map((log) => {
                  const isToday = log.dateKey === todayKey;
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isToday ? 'text-emerald-500' : mutedText
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`font-semibold ${headingText}`}>
                              {log.subject}
                            </span>
                            <span aria-hidden="true" className={mutedText}>
                              ·
                            </span>
                            <span className={`truncate ${mutedText}`}>{log.method}</span>
                          </div>
                          <p className="truncate text-sm">{log.topic}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-mono-tabular block text-xs font-medium">
                            {log.durationMinutes} min
                          </span>
                          <span className={`font-mono-tabular block text-[11px] ${mutedText}`}>
                            {isToday ? (lang === 'bn' ? 'আজ' : 'Today') : log.dateKey}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          aria-label={`Delete ${log.subject}`}
                          className="rounded-lg p-1.5 text-[#6E7483] hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
