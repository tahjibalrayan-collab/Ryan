import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Globe, Moon, Play, Sun, Volume2, VolumeX } from 'lucide-react';
import { UI_TEXT } from './data/i18n';
import {
  addDaysToDateKey,
  DEFAULT_GENRES,
  DEFAULT_GENRE_TOPICS,
  formatDateKey,
  INITIAL_JOURNALS,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_SPACED_REPETITION,
  INITIAL_STUDY_LOGS,
  WALLPAPER_PRESETS,
} from './data/seedData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  AppTheme,
  GeneratedRoutine,
  JournalBook,
  Language,
  LibraryBook,
  NavModule,
  SpacedRepetitionItem,
  StudyLog,
} from './types';
import { ambientEngine, AmbientTrackId } from './utils/audioEngine';
import { StudyMethodsModule } from './components/StudyMethodsModule';
import { StudyTimerModule } from './components/StudyTimerModule';
import { PersonalJournalModule } from './components/PersonalJournalModule';
import { LibraryFocusModule } from './components/LibraryFocusModule';

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('methods');
  const [lang, setLang] = useLocalStorage<Language>('pa_language_v1', 'en');
  const [theme, setTheme] = useLocalStorage<AppTheme>('pa_theme_v2', 'paper');

  const t = UI_TEXT[lang];
  const isPaper = theme === 'paper';

  const navItems: Array<{ id: NavModule; label: string }> = [
    { id: 'methods', label: t.navMethods },
    { id: 'timer', label: t.navTimer },
    { id: 'journal', label: t.navJournal },
    { id: 'library', label: t.navLibrary },
  ];

  // Persistent state across all 4 modules
  const [savedRoutines, setSavedRoutines] = useLocalStorage<GeneratedRoutine[]>(
    'pa_saved_routines_v2',
    []
  );
  const [studyLogs, setStudyLogs] = useLocalStorage<StudyLog[]>(
    'pa_study_logs_v2',
    INITIAL_STUDY_LOGS
  );
  const [spacedItems, setSpacedItems] = useLocalStorage<SpacedRepetitionItem[]>(
    'pa_spaced_147_v2',
    INITIAL_SPACED_REPETITION
  );
  const [journals, setJournals] = useLocalStorage<JournalBook[]>(
    'pa_journals_v1',
    INITIAL_JOURNALS
  );
  const [libraryBooks, setLibraryBooks] = useLocalStorage<LibraryBook[]>(
    'pa_library_books_v3',
    INITIAL_LIBRARY_BOOKS
  );
  const [libraryGenres, setLibraryGenres] = useLocalStorage<string[]>(
    'pa_library_genres_v2',
    DEFAULT_GENRES
  );
  const [genreTopics, setGenreTopics] = useLocalStorage<Record<string, string[]>>(
    'pa_library_genre_topics_v1',
    DEFAULT_GENRE_TOPICS
  );

  // Cloud sync state (PC <-> Mobile via /api/archive)
  const [isSyncedOnline, setIsSyncedOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useLocalStorage<string | null>(
    'pa_last_synced_at_v1',
    null
  );

  // Global wallpaper & ambient audio settings
  const [activeWallpaperId, setActiveWallpaperId] = useLocalStorage<string>(
    'pa_wallpaper_id_v1',
    'obsidian-default'
  );
  const [customWallpaper, setCustomWallpaper] = useLocalStorage<string | null>(
    'pa_custom_wallpaper_v1',
    null
  );
  const [backdropDimming, setBackdropDimming] = useLocalStorage<number>(
    'pa_backdrop_dimming_v1',
    0.82
  );

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<AmbientTrackId>('rain-library');
  const [musicVolume, setMusicVolume] = useState(0.45);

  const [preloadedTimerSession, setPreloadedTimerSession] = useState<{
    minutes: number;
    subject?: string;
    topic?: string;
    method?: string;
    reviewItemId?: string;
  } | null>(null);

  useEffect(() => {
    ambientEngine.setVolume(musicVolume);
  }, [musicVolume]);

  // Check cloud archive on initial visit (helpful when opening link on mobile for the first time)
  useEffect(() => {
    let active = true;
    const hasLocalLibrary = window.localStorage.getItem('pa_library_books_v3') !== null;

    fetch('/api/archive')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.ok || !data.archive) return;
        setIsSyncedOnline(true);
        if (data.archive.syncedAt) {
          setLastSyncedAt(data.archive.syncedAt);
        }
        if (!hasLocalLibrary) {
          if (Array.isArray(data.archive.books)) setLibraryBooks(data.archive.books);
          if (Array.isArray(data.archive.genres)) setLibraryGenres(data.archive.genres);
          if (data.archive.genreTopics && typeof data.archive.genreTopics === 'object') {
            setGenreTopics(data.archive.genreTopics);
          }
          if (Array.isArray(data.archive.journals)) setJournals(data.archive.journals);
          if (Array.isArray(data.archive.studyLogs)) setStudyLogs(data.archive.studyLogs);
          if (Array.isArray(data.archive.spacedItems)) setSpacedItems(data.archive.spacedItems);
          if (Array.isArray(data.archive.savedRoutines)) {
            setSavedRoutines(data.archive.savedRoutines);
          }
        }
      })
      .catch(() => {
        // Offline or server unavailable; localStorage remains active
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          books: libraryBooks,
          genres: libraryGenres,
          genreTopics,
          journals,
          studyLogs,
          spacedItems,
          savedRoutines,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSyncedOnline(true);
        if (data?.syncedAt) {
          setLastSyncedAt(data.syncedAt);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [
    libraryBooks,
    libraryGenres,
    genreTopics,
    journals,
    studyLogs,
    spacedItems,
    savedRoutines,
    setLastSyncedAt,
  ]);

  const handlePullFromServer = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/archive');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.ok && data.archive) {
        if (Array.isArray(data.archive.books)) setLibraryBooks(data.archive.books);
        if (Array.isArray(data.archive.genres)) setLibraryGenres(data.archive.genres);
        if (data.archive.genreTopics && typeof data.archive.genreTopics === 'object') {
          setGenreTopics(data.archive.genreTopics);
        }
        if (Array.isArray(data.archive.journals)) setJournals(data.archive.journals);
        if (Array.isArray(data.archive.studyLogs)) setStudyLogs(data.archive.studyLogs);
        if (Array.isArray(data.archive.spacedItems)) setSpacedItems(data.archive.spacedItems);
        if (Array.isArray(data.archive.savedRoutines)) {
          setSavedRoutines(data.archive.savedRoutines);
        }
        setIsSyncedOnline(true);
        if (data.archive.syncedAt) {
          setLastSyncedAt(data.archive.syncedAt);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [
    setLibraryBooks,
    setLibraryGenres,
    setGenreTopics,
    setJournals,
    setStudyLogs,
    setSpacedItems,
    setSavedRoutines,
    setLastSyncedAt,
  ]);

  const handleToggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      ambientEngine.stop();
      setIsMusicPlaying(false);
    } else {
      ambientEngine.start(activeTrackId);
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying, activeTrackId]);

  const handleSelectTrack = useCallback(
    (trackId: AmbientTrackId) => {
      setActiveTrackId(trackId);
      if (isMusicPlaying) {
        ambientEngine.setTrack(trackId);
      } else {
        ambientEngine.start(trackId);
        setIsMusicPlaying(true);
      }
    },
    [isMusicPlaying]
  );

  const handleApplyToTimer = useCallback(
    (opts: {
      minutes: number;
      subject?: string;
      topic?: string;
      method?: string;
      reviewItemId?: string;
    }) => {
      setPreloadedTimerSession(opts);
      setActiveModule('timer');
    },
    []
  );

  const handleClearPreloaded = useCallback(() => {
    setPreloadedTimerSession(null);
  }, []);

  // Strict 1-4-7 Spaced Repetition Transition:
  // stageIndex 0 (Waiting Day 4 Recall) -> stageIndex 1 (Waiting Day 7 Finish)
  // stageIndex 1 (Waiting Day 7 Finish) -> stageIndex 2 (Finished!)
  const handleAdvanceReview = useCallback(
    (itemId: string) => {
      const todayKey = formatDateKey(new Date());
      setSpacedItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          if (item.stageIndex === 0) {
            return {
              ...item,
              stageIndex: 1,
              nextReviewDate: item.day7Date,
              reviewHistory: [...item.reviewHistory, todayKey],
            };
          }
          return {
            ...item,
            stageIndex: 2,
            nextReviewDate: todayKey,
            reviewHistory: [...item.reviewHistory, todayKey],
          };
        })
      );
    },
    [setSpacedItems]
  );

  const handleLogStudySession = useCallback(
    (
      logInput: Omit<StudyLog, 'id' | 'completedAt' | 'dateKey'>,
      reviewItemId?: string
    ) => {
      const now = new Date();
      const todayKey = formatDateKey(now);

      const newLog: StudyLog = {
        ...logInput,
        id: `log-${Date.now()}`,
        completedAt: now.toISOString(),
        dateKey: todayKey,
      };
      setStudyLogs((prev) => [newLog, ...prev]);

      if (reviewItemId) {
        handleAdvanceReview(reviewItemId);
      } else {
        // Day 1 studied -> Schedule Day 4 (+3 days) Recall and Day 7 (+6 days) Finish
        const day4Date = addDaysToDateKey(todayKey, 3);
        const day7Date = addDaysToDateKey(todayKey, 6);
        const newSpacedItem: SpacedRepetitionItem = {
          id: `sr-${Date.now()}`,
          subject: logInput.subject,
          topic: logInput.topic,
          durationMinutes: logInput.durationMinutes,
          day1Date: todayKey,
          day4Date,
          day7Date,
          stageIndex: 0,
          nextReviewDate: day4Date,
          reviewHistory: [todayKey],
        };
        setSpacedItems((prev) => [newSpacedItem, ...prev]);
      }
    },
    [setStudyLogs, setSpacedItems, handleAdvanceReview]
  );

  const handleAddTopicToGenre = useCallback(
    (genre: string, topic: string) => {
      const cleanGenre = genre.trim();
      const cleanTopic = topic.trim();
      if (!cleanGenre || !cleanTopic) return;
      setGenreTopics((prev) => {
        const existing = prev[cleanGenre] || [];
        if (existing.includes(cleanTopic)) return prev;
        return {
          ...prev,
          [cleanGenre]: [...existing, cleanTopic],
        };
      });
    },
    [setGenreTopics]
  );

  const handleBulkAddBooks = useCallback(
    (
      items: LibraryBook[],
      discoveredGenres: string[],
      discoveredTopics: Array<{ genre: string; topic: string }>
    ) => {
      setLibraryBooks((prev) => [...items, ...prev]);
      if (discoveredGenres.length > 0) {
        setLibraryGenres((prev) => {
          const next = [...prev];
          for (const g of discoveredGenres) {
            if (g && !next.includes(g)) next.push(g);
          }
          return next;
        });
      }
      if (discoveredTopics.length > 0) {
        setGenreTopics((prev) => {
          const next = { ...prev };
          for (const { genre, topic } of discoveredTopics) {
            if (!genre || !topic) continue;
            const list = next[genre] || [];
            if (!list.includes(topic)) {
              next[genre] = [...list, topic];
            }
          }
          return next;
        });
      }
    },
    [setLibraryBooks, setLibraryGenres, setGenreTopics]
  );

  const handleRemoveDuplicates = useCallback((): number => {
    const seen = new Set<string>();
    const deduped: LibraryBook[] = [];
    let removedCount = 0;
    for (const b of libraryBooks) {
      const key = `${b.title.trim().toLowerCase()}::${b.author.trim().toLowerCase()}`;
      if (seen.has(key)) {
        removedCount++;
      } else {
        seen.add(key);
        deduped.push(b);
      }
    }
    if (removedCount > 0) {
      setLibraryBooks(deduped);
    }
    return removedCount;
  }, [libraryBooks, setLibraryBooks]);

  const activeWallpaper = useMemo(() => {
    if (activeWallpaperId === 'custom-upload' && customWallpaper) {
      return {
        id: 'custom-upload',
        name: 'Custom Photo',
        nameBn: 'কাস্টম ফটো',
        type: 'image' as const,
        value: customWallpaper,
        category: 'Uploaded',
      };
    }
    return (
      WALLPAPER_PRESETS.find((w) => w.id === activeWallpaperId) ??
      WALLPAPER_PRESETS[0]
    );
  }, [activeWallpaperId, customWallpaper]);

  const dueReviewCount = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    return spacedItems.filter(
      (i) => i.stageIndex < 2 && i.nextReviewDate <= todayKey
    ).length;
  }, [spacedItems]);

  return (
    <div
      className={`relative min-h-screen transition-colors ${
        isPaper
          ? 'paper-archive-bg text-[#211E19]'
          : 'bg-[#111215] text-[#F4F2ED]'
      }`}
    >
      {/* Global Customizable Wallpaper Layer (in Midnight Study mode) */}
      {!isPaper && activeWallpaper.id !== 'obsidian-default' && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          style={
            activeWallpaper.type === 'image'
              ? {
                  backgroundImage: `url(${activeWallpaper.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  background: activeWallpaper.value,
                }
          }
        >
          <div
            className="h-full w-full"
            style={{ backgroundColor: `rgba(14, 15, 19, ${backdropDimming})` }}
          />
        </div>
      )}

      {/* Top Bar Contract: [Brand title] — [4 nav links] — [1 primary action] */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isPaper
            ? 'border-[#C6BEB0] bg-[#DCD6CA]/90'
            : 'border-white/8 bg-[#111215]/90'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => setActiveModule('methods')}
            className={`font-display whitespace-nowrap shrink-0 text-left text-lg font-medium tracking-tight transition-opacity hover:opacity-85 ${
              isPaper ? 'text-[#1F1C18]' : 'text-[#F4F2ED]'
            }`}
          >
            {t.brand}
          </button>

          {/* Zone 2: 4 Single-line Navigation Links */}
          <nav
            aria-label="Primary modules"
            className="hidden items-center gap-7 md:flex"
          >
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`relative whitespace-nowrap shrink-0 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? isPaper
                        ? 'text-[#1F1C18]'
                        : 'text-[#F4F2ED]'
                      : isPaper
                      ? 'text-[#665E52] hover:text-[#1F1C18]'
                      : 'text-[#8D93A1] hover:text-[#F4F2ED]'
                  }`}
                >
                  {item.label}
                  {item.id === 'timer' && dueReviewCount > 0 && (
                    <span
                      className={`font-mono-tabular ml-1.5 text-[11px] ${
                        isPaper ? 'text-[#8D5B16]' : 'text-[#D4A359]'
                      }`}
                    >
                      ({dueReviewCount})
                    </span>
                  )}
                  {isActive && (
                    <span
                      className={`absolute inset-x-0 -bottom-[17px] h-0.5 ${
                        isPaper ? 'bg-[#1D355E]' : 'bg-[#D4A359]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleApplyToTimer({ minutes: 35 })}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                isPaper
                  ? 'bg-[#1D355E] text-white hover:bg-[#152849]'
                  : 'bg-[#D4A359] text-[#111215] hover:bg-[#DFB26D]'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{t.startFocus}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div
          className={`flex items-center justify-around border-t px-2 py-2 md:hidden ${
            isPaper ? 'border-[#C6BEB0]' : 'border-white/6'
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? isPaper
                      ? 'bg-[#1D355E] text-white'
                      : 'bg-[#22252E] text-[#D4A359]'
                    : isPaper
                    ? 'text-[#544D42]'
                    : 'text-[#8D93A1]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Workspace Control Strip (Below Header): Language Switch (EN / বাংলা) & Theme Switch */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6 lg:px-8">
        <p className={`text-xs ${isPaper ? 'text-[#665E52]' : 'text-[#8D93A1]'}`}>
          {t.subtitle}
        </p>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div
            className={`inline-flex items-center gap-1 rounded-lg border p-0.5 ${
              isPaper
                ? 'border-[#BFB7A8] bg-[#E8E3D8]'
                : 'border-white/10 bg-[#181A1F]'
            }`}
          >
            <Globe
              className={`ml-2 h-3.5 w-3.5 ${
                isPaper ? 'text-[#544D42]' : 'text-[#8D93A1]'
              }`}
            />
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                lang === 'en'
                  ? isPaper
                    ? 'bg-[#1D355E] text-white'
                    : 'bg-[#262932] text-[#F4F2ED]'
                  : isPaper
                  ? 'text-[#544D42]'
                  : 'text-[#8D93A1]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                lang === 'bn'
                  ? isPaper
                    ? 'bg-[#1D355E] text-white'
                    : 'bg-[#262932] text-[#F4F2ED]'
                  : isPaper
                  ? 'text-[#544D42]'
                  : 'text-[#8D93A1]'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(isPaper ? 'midnight' : 'paper')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isPaper
                ? 'border-[#BFB7A8] bg-[#E8E3D8] text-[#211E19] hover:bg-[#DDD6C8]'
                : 'border-white/10 bg-[#181A1F] text-[#D1D5DB] hover:border-[#D4A359]/50'
            }`}
          >
            {isPaper ? (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span>{t.midnightStudy}</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-[#D4A359]" />
                <span>{t.classicPaper}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {activeModule === 'methods' && (
          <StudyMethodsModule
            lang={lang}
            theme={theme}
            onApplyToTimer={handleApplyToTimer}
            savedRoutines={savedRoutines}
            onSaveRoutine={(r) => setSavedRoutines((prev) => [r, ...prev])}
            onDeleteRoutine={(id) =>
              setSavedRoutines((prev) => prev.filter((item) => item.id !== id))
            }
          />
        )}

        {activeModule === 'timer' && (
          <StudyTimerModule
            lang={lang}
            theme={theme}
            preloadedSession={preloadedTimerSession}
            onClearPreloaded={handleClearPreloaded}
            studyLogs={studyLogs}
            onLogSession={handleLogStudySession}
            onDeleteLog={(id) =>
              setStudyLogs((prev) => prev.filter((item) => item.id !== id))
            }
            spacedItems={spacedItems}
            onAdvanceReview={handleAdvanceReview}
            onDeleteSpacedItem={(id) =>
              setSpacedItems((prev) => prev.filter((item) => item.id !== id))
            }
          />
        )}

        {activeModule === 'journal' && (
          <PersonalJournalModule
            lang={lang}
            theme={theme}
            journals={journals}
            onUpdateJournal={(updated) =>
              setJournals((prev) =>
                prev.map((j) => (j.id === updated.id ? updated : j))
              )
            }
            onCreateJournal={(book) => setJournals((prev) => [book, ...prev])}
            onRestoreJournals={(restored) => setJournals(restored)}
            onDeleteJournal={(id) =>
              setJournals((prev) => prev.filter((j) => j.id !== id))
            }
            customWallpaper={customWallpaper}
            onUploadCustomWallpaper={setCustomWallpaper}
          />
        )}

        {activeModule === 'library' && (
          <LibraryFocusModule
            lang={lang}
            theme={theme}
            onToggleTheme={() => setTheme(isPaper ? 'midnight' : 'paper')}
            books={libraryBooks}
            genres={libraryGenres}
            genreTopics={genreTopics}
            onAddGenre={(g) =>
              setLibraryGenres((prev) =>
                prev.includes(g) ? prev : [...prev, g]
              )
            }
            onAddTopicToGenre={handleAddTopicToGenre}
            onUpdateBook={(updated) =>
              setLibraryBooks((prev) =>
                prev.map((b) => (b.id === updated.id ? updated : b))
              )
            }
            onAddBook={(book) => setLibraryBooks((prev) => [book, ...prev])}
            onBulkAddBooks={handleBulkAddBooks}
            onRestoreBooks={(restored) => setLibraryBooks(restored)}
            onRemoveDuplicates={handleRemoveDuplicates}
            onDeleteBook={(id) =>
              setLibraryBooks((prev) => prev.filter((b) => b.id !== id))
            }
            onStudyBookInTimer={(book) =>
              handleApplyToTimer({
                minutes: 45,
                subject: book.title,
                topic: book.topic || book.author || 'Reading & Marginalia',
                method: 'Japanese Todai 3-Zone & Machigai',
              })
            }
            isSyncedOnline={isSyncedOnline}
            isSyncing={isSyncing}
            lastSyncedAt={lastSyncedAt}
            onSyncNow={handleSyncNow}
            onPullFromServer={handlePullFromServer}
            isMusicPlaying={isMusicPlaying}
            activeTrackId={activeTrackId}
            musicVolume={musicVolume}
            onToggleMusic={handleToggleMusic}
            onSelectTrack={handleSelectTrack}
            onChangeVolume={setMusicVolume}
            activeWallpaperId={activeWallpaperId}
            onSelectWallpaper={setActiveWallpaperId}
            customWallpaper={customWallpaper}
            onUploadCustomWallpaper={setCustomWallpaper}
            backdropDimming={backdropDimming}
            onChangeBackdropDimming={setBackdropDimming}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer
        className={`relative z-10 border-t backdrop-blur-sm ${
          isPaper
            ? 'border-[#C6BEB0] bg-[#DCD6CA]/80'
            : 'border-white/8 bg-[#111215]/80'
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8 ${
            isPaper ? 'text-[#665E52]' : 'text-[#8D93A1]'
          }`}
        >
          <p>
            <span
              className={`font-display text-sm ${
                isPaper ? 'text-[#1F1C18]' : 'text-[#E5E7EB]'
              }`}
            >
              {t.brand}
            </span>
            <span aria-hidden="true" className="mx-2 opacity-50">
              ·
            </span>
            <span>{t.subtitle}</span>
          </p>

          <button
            type="button"
            onClick={handleToggleMusic}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              isPaper
                ? 'border-[#BFB7A8] bg-[#E8E3D8] text-[#211E19]'
                : 'border-white/10 bg-[#181A1F] text-[#D1D5DB] hover:border-[#D4A359]/50'
            }`}
          >
            {isMusicPlaying ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#D4A359]" />
                <span>
                  {lang === 'bn' ? 'ফোকাস অডিও চলছে' : 'Ambient Audio Playing'}
                </span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 opacity-60" />
                <span>{lang === 'bn' ? 'অডিও বন্ধ' : 'Ambient Audio Off'}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
