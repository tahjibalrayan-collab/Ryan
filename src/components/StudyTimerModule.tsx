import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
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
import { timerAlarm } from '../utils/audioEngine';
import { getThemeTokens } from '../utils/themeStyles';

interface StudyTimerModuleProps {
  lang: Language;
  theme: AppTheme;
  // Background-persistent timer state managed by App.tsx
  durationMinutes: number;
  secondsLeft: number;
  isRunning: boolean;
  isAlarmRinging: boolean;
  isFinishedAlert: boolean;
  soundEnabled: boolean;
  subject: string;
  topic: string;
  method: string;
  activeReviewItemId?: string;
  onSelectDuration: (mins: number) => void;
  onToggleRun: () => void;
  onResetTimer: () => void;
  onToggleSound: () => void;
  onStopAlarm: () => void;
  onChangeSubject: (val: string) => void;
  onChangeTopic: (val: string) => void;
  onChangeMethod: (val: string) => void;
  onStartReviewSession: (item: SpacedRepetitionItem) => void;
  onCompleteAndClearTimer: () => void;
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
  durationMinutes,
  secondsLeft,
  isRunning,
  isAlarmRinging,
  isFinishedAlert,
  soundEnabled,
  subject,
  topic,
  method,
  activeReviewItemId,
  onSelectDuration,
  onToggleRun,
  onResetTimer,
  onToggleSound,
  onStopAlarm,
  onChangeSubject,
  onChangeTopic,
  onChangeMethod,
  onStartReviewSession,
  onCompleteAndClearTimer,
  studyLogs,
  onLogSession,
  onDeleteLog,
  spacedItems,
  onAdvanceReview,
  onDeleteSpacedItem,
}) => {
  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);

  const [customMinutesInput, setCustomMinutesInput] = useState<string>(
    String(durationMinutes)
  );
  const [reviewFilter, setReviewFilter] = useState<'due' | 'day4' | 'day7' | 'finished'>('due');
  const [logFilter, setLogFilter] = useState<'today' | 'all'>('today');
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  useEffect(() => {
    setCustomMinutesInput(String(durationMinutes));
  }, [durationMinutes]);

  const todayKey = formatDateKey(new Date());

  const handleCustomMinutesBlur = () => {
    const parsed = parseInt(customMinutesInput, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 180) {
      onSelectDuration(parsed);
    } else {
      setCustomMinutesInput(String(durationMinutes));
    }
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

    onCompleteAndClearTimer();

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

  const visibleLogs = logFilter === 'today' ? todaysLogs : studyLogs;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${tk.borderSubtle}`}
      >
        <div>
          <p className={`text-xs font-medium ${tk.accentText}`}>{t.timerEyebrow}</p>
          <h1 className={`mt-1.5 text-3xl font-medium tracking-tight ${tk.headingText}`}>
            {t.timerTitle}
          </h1>
          <p className={`mt-1.5 text-sm ${tk.mutedText}`}>{t.timerDesc}</p>
        </div>

        <div className={`flex items-center gap-6 text-xs ${tk.mutedText}`}>
          <div>
            <span className="block">{t.todayCompleted}</span>
            <span className={`font-mono-tabular text-base font-medium ${tk.headingText}`}>
              {todaysLogs.length} · {totalMinutesToday}m
            </span>
          </div>
          <div className={`h-8 w-px border-l ${tk.borderSubtle}`} />
          <div>
            <span className="block">{t.dueTodayLabel}</span>
            <span
              className={`font-mono-tabular text-base font-medium ${
                dueItems.length > 0 ? tk.accentText : 'text-emerald-500'
              }`}
            >
              {dueItems.length} {lang === 'bn' ? 'টি টপিক' : 'topics'}
            </span>
          </div>
        </div>
      </section>

      {completionBanner && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-500">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{completionBanner}</span>
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
          className={`flex flex-col justify-between rounded-2xl border p-6 lg:col-span-5 lg:p-8 ${tk.cardSurface}`}
        >
          <div className="space-y-6">
            {/* Presets + Sound & Loud Alarm Test */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className={`inline-flex items-center gap-1 rounded-xl border p-1 ${tk.subCardSurface}`}>
                {PRESET_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onSelectDuration(mins)}
                    className={`font-mono-tabular whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      durationMinutes === mins ? tk.primaryBtn : tk.mutedText
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="custom-mins" className={`text-xs ${tk.mutedText}`}>
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
                  className={`font-mono-tabular w-14 rounded-lg border px-2 py-1.5 text-center text-xs focus:outline-none ${tk.inputSurface}`}
                />
                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-label="Toggle timer sound"
                  title={soundEnabled ? 'Alarm Sound Enabled' : 'Alarm Sound Muted'}
                  className={`rounded-lg border p-2 transition-colors ${tk.inputSurface}`}
                >
                  {soundEnabled ? (
                    <Volume2 className={`h-4 w-4 ${tk.accentText}`} />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => timerAlarm.testLoudBeep()}
                  title="Test loud alarm sound"
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${tk.inputSurface}`}
                >
                  {lang === 'bn' ? 'টেস্ট বিপ' : 'Test Sound'}
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
                  stroke={tk.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth="7"
                />
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  fill="none"
                  stroke={isFinishedAlert ? '#10B981' : tk.ringAccent}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-[stroke-dashoffset] duration-300 ease-linear"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-[11px] font-medium ${tk.mutedText}`}>
                  {isAlarmRinging
                    ? lang === 'bn'
                      ? 'অ্যালার্ম বাজছে (৬০ সে.)!'
                      : 'Loud Alarm Ringing!'
                    : isFinishedAlert
                    ? lang === 'bn'
                      ? 'সময় শেষ!'
                      : 'Session Complete'
                    : isRunning
                    ? lang === 'bn'
                      ? 'ব্যাকগ্রাউন্ডে চলছে'
                      : 'Active (Persistent)'
                    : activeReviewItemId
                    ? lang === 'bn'
                      ? '১-৪-৭ রিকল মোড'
                      : '1-4-7 Recall Mode'
                    : lang === 'bn'
                    ? 'প্রস্তুত'
                    : 'Ready'}
                </span>
                <div className={`font-mono-tabular mt-1 text-5xl font-medium tracking-tight ${tk.headingText}`}>
                  {minsDisplay}:{secsDisplay}
                </div>
                <span className={`mt-2 max-w-[170px] truncate text-xs ${tk.mutedText}`}>
                  {subject || 'Subject'}
                </span>
              </div>
            </div>

            {(isAlarmRinging || isFinishedAlert) && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/45 bg-amber-500/15 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <Bell className="h-4 w-4 text-amber-500 animate-bounce" />
                  <span>
                    {isAlarmRinging
                      ? lang === 'bn'
                        ? 'সময় শেষ! "Yes" চাপার আগ পর্যন্ত অ্যালার্ম বাজতেই থাকবে।'
                        : 'Time up! Alarm loops continuously until you select "Yes".'
                      : lang === 'bn'
                      ? 'সময় সম্পন্ন! Done ক্লিক করে ১-৪-৭ সেভ করুন।'
                      : 'Completed! Click Done to lock in Day 1 / 1-4-7.'}
                  </span>
                </div>
                {isAlarmRinging && (
                  <button
                    type="button"
                    onClick={onStopAlarm}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <BellOff className="h-3.5 w-3.5" />
                    <span>{lang === 'bn' ? 'হ্যাঁ, বন্ধ করুন' : 'Yes, Stop Alarm'}</span>
                  </button>
                )}
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
                  onChange={(e) => onChangeSubject(e.target.value)}
                  placeholder="e.g., Chemistry"
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none ${tk.inputSurface}`}
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
                  onChange={(e) => onChangeTopic(e.target.value)}
                  placeholder="e.g., Chemical Bonding"
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none ${tk.inputSurface}`}
                />
              </div>

              <div>
                <label htmlFor="timer-method" className="block text-xs font-medium">
                  {t.techniqueLabel}
                </label>
                <select
                  id="timer-method"
                  value={method}
                  onChange={(e) => onChangeMethod(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none ${tk.inputSurface}`}
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

          <div className={`mt-6 flex items-center gap-3 border-t pt-5 ${tk.borderSubtle}`}>
            <button
              type="button"
              onClick={onToggleRun}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${tk.subCardSurface}`}
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
              onClick={onResetTimer}
              aria-label="Reset timer"
              className={`rounded-lg border p-2.5 transition-colors ${tk.inputSurface}`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDone}
              className={`flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${tk.primaryBtn}`}
            >
              <Check className="h-4 w-4" />
              <span>{t.doneBtn}</span>
            </button>
          </div>
        </section>

        {/* Right Column: Strict 1-4-7 Spaced Repetition + Clean Organized Checkoff Log */}
        <div className="space-y-8 lg:col-span-7">
          <section className={`rounded-2xl border p-6 ${tk.cardSurface}`}>
            <div
              className={`flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${tk.borderSubtle}`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className={`h-4 w-4 ${tk.accentText}`} />
                <div>
                  <h2 className={`text-base font-medium ${tk.headingText}`}>
                    {t.rule147Title}
                  </h2>
                  <p className={`text-xs ${tk.mutedText}`}>{t.rule147Subtitle}</p>
                </div>
              </div>

              <div className={`inline-flex flex-wrap items-center gap-1 rounded-lg border p-1 ${tk.subCardSurface}`}>
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
                      reviewFilter === tab.id ? tk.primaryBtn : tk.mutedText
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
                <p className={`mt-1 text-xs ${tk.mutedText}`}>
                  {lang === 'bn'
                    ? 'নতুন কোনো সাবজেক্ট ও টপিক পড়ে Done চাপলে ১-৪-৭ সাইকেল শুরু হবে।'
                    : 'Study a topic and press Done to begin its Day 1 → Day 4 → Day 7 cycle.'}
                </p>
              </div>
            ) : (
              <div className={`mt-4 divide-y ${tk.divideSubtle}`}>
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
                          <span className={`font-semibold ${tk.headingText}`}>
                            {item.subject}
                          </span>
                          <span aria-hidden="true" className={tk.mutedText}>
                            ·
                          </span>
                          <span className={`font-mono-tabular ${tk.mutedText}`}>
                            {item.durationMinutes}m
                          </span>
                          <span aria-hidden="true" className={tk.mutedText}>
                            ·
                          </span>
                          <span
                            className={`font-mono-tabular ${
                              isFinished
                                ? 'text-emerald-500'
                                : isDue
                                ? tk.accentText
                                : tk.mutedText
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

                        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${tk.mutedText}`}>
                          <span className="text-emerald-500">
                            {lang === 'bn' ? `দিন ১ (${item.day1Date}) ✓` : `Day 1 (${item.day1Date}) ✓`}
                          </span>
                          <span aria-hidden="true">→</span>
                          <span
                            className={
                              item.stageIndex >= 1
                                ? 'text-emerald-500'
                                : item.stageIndex === 0 && isDue
                                ? `font-semibold ${tk.accentText}`
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
                                ? `font-semibold ${tk.accentText}`
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
                              onClick={() => onStartReviewSession(item)}
                              className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${tk.inputSurface}`}
                            >
                              {t.reviewNow}
                            </button>
                            <button
                              type="button"
                              onClick={() => onAdvanceReview(item.id)}
                              className="whitespace-nowrap rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-500 hover:bg-emerald-500/25"
                            >
                              {item.stageIndex === 0 ? t.completeDay4 : t.finishTopic}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteSpacedItem(item.id)}
                          aria-label={`Remove ${item.topic}`}
                          className={`rounded-lg p-1.5 hover:text-rose-500 ${tk.mutedText}`}
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

          {/* Clean Tabular Daily Subject Checkoff Log */}
          <section className={`rounded-2xl border p-6 ${tk.cardSurface}`}>
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${tk.borderSubtle}`}
            >
              <div>
                <h2 className={`text-base font-medium ${tk.headingText}`}>
                  {t.dailyCheckoffTitle}
                </h2>
                <p className={`text-xs ${tk.mutedText}`}>{t.dailyCheckoffSub}</p>
              </div>
              <div className={`inline-flex items-center gap-1 rounded-lg border p-0.5 ${tk.subCardSurface}`}>
                <button
                  type="button"
                  onClick={() => setLogFilter('today')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                    logFilter === 'today' ? tk.primaryBtn : tk.mutedText
                  }`}
                >
                  {lang === 'bn' ? `আজ (${todaysLogs.length})` : `Today (${todaysLogs.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilter('all')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                    logFilter === 'all' ? tk.primaryBtn : tk.mutedText
                  }`}
                >
                  {lang === 'bn' ? `সব (${studyLogs.length})` : `All History (${studyLogs.length})`}
                </button>
              </div>
            </div>

            {visibleLogs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium">
                  {lang === 'bn' ? 'আজ কোনো সেশন সেভ হয়নি' : 'No sessions logged for this filter yet'}
                </p>
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${tk.borderSubtle} ${tk.mutedText}`}>
                      <th className="py-2 pr-3 font-medium">Subject</th>
                      <th className="py-2 pr-3 font-medium">Topic</th>
                      <th className="py-2 pr-3 font-medium">Method</th>
                      <th className="py-2 pr-3 text-right font-medium">Time</th>
                      <th className="py-2 text-right font-medium">Date</th>
                      <th className="py-2 pl-2 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tk.divideSubtle}`}>
                    {visibleLogs.slice(0, 15).map((log) => {
                      const isToday = log.dateKey === todayKey;
                      return (
                        <tr key={log.id}>
                          <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <CheckCircle2
                                className={`h-3.5 w-3.5 ${
                                  isToday ? 'text-emerald-500' : tk.mutedText
                                }`}
                              />
                              <span className={tk.headingText}>{log.subject}</span>
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 max-w-[180px] truncate">{log.topic}</td>
                          <td className={`py-2.5 pr-3 max-w-[140px] truncate ${tk.mutedText}`}>
                            {log.method}
                          </td>
                          <td className="font-mono-tabular py-2.5 pr-3 text-right font-medium whitespace-nowrap">
                            {log.durationMinutes}m
                          </td>
                          <td className={`font-mono-tabular py-2.5 text-right whitespace-nowrap ${tk.mutedText}`}>
                            {isToday ? (lang === 'bn' ? 'আজ' : 'Today') : log.dateKey}
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteLog(log.id)}
                              aria-label={`Delete ${log.subject}`}
                              className={`rounded p-1 hover:text-rose-500 ${tk.mutedText}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
