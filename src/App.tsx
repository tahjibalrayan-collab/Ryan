import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  Download,
  Globe,
  Image as ImageIcon,
  Moon,
  Music2,
  Play,
  Sun,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { UI_TEXT } from './data/i18n';
import {
  addDaysToDateKey,
  DEFAULT_GENRES,
  DEFAULT_GENRE_TOPICS,
  formatDateKey,
  GLOBAL_STUDY_METHODS,
  INITIAL_JOURNALS,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_SPACED_REPETITION,
  INITIAL_STUDY_LOGS,
  WALLPAPER_PRESETS,
} from './data/seedData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  AppTheme,
  CustomAudioTrack,
  GeneratedRoutine,
  JournalBook,
  Language,
  LibraryBook,
  NavModule,
  SavedVideoLink,
  SpacedRepetitionItem,
  StudyLog,
} from './types';
import { ambientEngine, AmbientTrackId, timerAlarm } from './utils/audioEngine';
import {
  exportFullArchiveBackup,
  restoreArchiveFromFile,
} from './utils/backupRestore';
import {
  deleteAudioBlob,
  loadAudioObjectUrl,
  saveAudioBlob,
} from './utils/pdfStorage';
import { getThemeTokens } from './utils/themeStyles';
import { StudyMethodsModule } from './components/StudyMethodsModule';
import { StudyTimerModule } from './components/StudyTimerModule';
import { PersonalJournalModule } from './components/PersonalJournalModule';
import { LibraryFocusModule } from './components/LibraryFocusModule';
import { SciLabVideoModule } from './components/SciLabVideoModule';
import { EnglishGrammarModule } from './components/EnglishGrammarModule';
import { WallpaperStudioModule } from './components/WallpaperStudioModule';
import { MusicStudioModule } from './components/MusicStudioModule';

interface TimerRuntimeSnapshot {
  durationMinutes: number;
  secondsLeft: number;
  isRunning: boolean;
  targetEndAt: number | null;
  isFinishedAlert: boolean;
  soundEnabled: boolean;
  subject: string;
  topic: string;
  method: string;
  activeReviewItemId?: string;
}

const DEFAULT_TIMER_SNAPSHOT: TimerRuntimeSnapshot = {
  durationMinutes: 60,
  secondsLeft: 60 * 60,
  isRunning: false,
  targetEndAt: null,
  isFinishedAlert: false,
  soundEnabled: true,
  subject: 'Chemistry',
  topic: 'Chemical Bonding & Hybridization',
  method: GLOBAL_STUDY_METHODS[0].title,
  activeReviewItemId: undefined,
};

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('library');
  const [lang, setLang] = useLocalStorage<Language>('pa_language_v1', 'en');
  const [theme, setTheme] = useLocalStorage<AppTheme>('pa_theme_v3', 'mono-light');

  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);

  const primaryNavItems: Array<{ id: NavModule; label: string }> = [
    { id: 'methods', label: t.navMethods },
    { id: 'timer', label: t.navTimer },
    { id: 'journal', label: t.navJournal },
    { id: 'library', label: t.navLibrary },
    { id: 'lab', label: t.navLab },
    { id: 'grammar', label: t.navGrammar },
  ];

  // Persistent domain state
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
  const [savedVideos, setSavedVideos] = useLocalStorage<SavedVideoLink[]>(
    'pa_saved_videos_v1',
    []
  );
  const [customAudioTracks, setCustomAudioTracks] = useLocalStorage<CustomAudioTrack[]>(
    'pa_custom_audio_tracks_v1',
    []
  );

  // Cloud sync state (PC <-> Mobile via /api/archive)
  const [isSyncedOnline, setIsSyncedOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useLocalStorage<string | null>(
    'pa_last_synced_at_v1',
    null
  );

  // Wallpaper & ambient audio state
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

  // Global Backup/Restore Toast + File Input
  const [globalBackupToast, setGlobalBackupToast] = useState<string | null>(null);
  const footerRestoreRef = useRef<HTMLInputElement | null>(null);

  // ==================== TRUE BACKGROUND-PERSISTENT TIMER ENGINE ====================
  const [timerRuntime, setTimerRuntime] = useLocalStorage<TimerRuntimeSnapshot>(
    'pa_timer_runtime_v3',
    DEFAULT_TIMER_SNAPSHOT
  );

  const {
    durationMinutes,
    secondsLeft,
    isRunning,
    targetEndAt,
    isFinishedAlert,
    soundEnabled,
    subject: timerSubject,
    topic: timerTopic,
    method: timerMethod,
    activeReviewItemId,
  } = timerRuntime;

  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(timerAlarm.isRinging());
  const [showAlarmConfirmModal, setShowAlarmConfirmModal] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setGlobalBackupToast(msg);
    window.setTimeout(() => setGlobalBackupToast(null), 5000);
  }, []);

  useEffect(() => {
    ambientEngine.setVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    const unsub = timerAlarm.subscribe((ringing) => {
      setIsAlarmRinging(ringing);
    });
    return () => {
      unsub();
    };
  }, []);

  // Re-trigger alarm if page finished while closed or backgrounded
  useEffect(() => {
    if (isFinishedAlert && soundEnabled && !timerAlarm.isRinging()) {
      timerAlarm.startContinuous(0);
      setShowAlarmConfirmModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background-immune Web Worker + timestamp diffing so switching tabs/minimizing never throttles countdown
  useEffect(() => {
    if (!isRunning || targetEndAt === null) return;

    const syncClock = () => {
      const remaining = Math.max(0, Math.ceil((targetEndAt - Date.now()) / 1000));
      if (remaining <= 0) {
        setTimerRuntime((prev) => ({
          ...prev,
          secondsLeft: 0,
          isRunning: false,
          targetEndAt: null,
          isFinishedAlert: true,
        }));
        if (soundEnabled) {
          timerAlarm.startContinuous(0); // Loops continuously until user explicitly picks "Yes"
        }
        setShowAlarmConfirmModal(true);
      } else {
        setTimerRuntime((prev) =>
          prev.secondsLeft === remaining ? prev : { ...prev, secondsLeft: remaining }
        );
      }
    };

    syncClock();

    // Inline Web Worker prevents Chrome/Edge background tab timer throttling
    let worker: Worker | null = null;
    try {
      const workerBlob = new Blob(
        [
          'setInterval(function(){ postMessage("tick"); }, 500);',
        ],
        { type: 'application/javascript' }
      );
      const workerUrl = URL.createObjectURL(workerBlob);
      worker = new Worker(workerUrl);
      worker.onmessage = syncClock;
      URL.revokeObjectURL(workerUrl);
    } catch {
      worker = null;
    }

    const fallbackId = window.setInterval(syncClock, 500);
    const onVisChange = () => {
      if (document.visibilityState === 'visible') {
        syncClock();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      if (worker) worker.terminate();
      window.clearInterval(fallbackId);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [isRunning, targetEndAt, soundEnabled, setTimerRuntime]);

  const handleStopAlarmConfirmYes = useCallback(() => {
    timerAlarm.stop();
    setShowAlarmConfirmModal(false);
    setTimerRuntime((prev) => ({ ...prev, isFinishedAlert: false }));
  }, [setTimerRuntime]);

  const handleStopAlarmDeclineNo = useCallback(() => {
    // Keep alarm ringing! Close modal overlay temporarily while leaving top persistent prompt active
    setShowAlarmConfirmModal(false);
  }, []);

  const handleSelectTimerDuration = useCallback(
    (mins: number) => {
      const clamped = Math.max(1, Math.min(180, mins));
      timerAlarm.stop();
      setShowAlarmConfirmModal(false);
      setTimerRuntime((prev) => ({
        ...prev,
        durationMinutes: clamped,
        secondsLeft: clamped * 60,
        isRunning: false,
        targetEndAt: null,
        isFinishedAlert: false,
      }));
    },
    [setTimerRuntime]
  );

  const handleToggleTimerRun = useCallback(() => {
    timerAlarm.stop();
    setShowAlarmConfirmModal(false);
    setTimerRuntime((prev) => {
      if (prev.isRunning) {
        const rem =
          prev.targetEndAt !== null
            ? Math.max(0, Math.ceil((prev.targetEndAt - Date.now()) / 1000))
            : prev.secondsLeft;
        return {
          ...prev,
          secondsLeft: rem,
          isRunning: false,
          targetEndAt: null,
          isFinishedAlert: false,
        };
      }
      const baseSeconds =
        prev.secondsLeft > 0 ? prev.secondsLeft : prev.durationMinutes * 60;
      return {
        ...prev,
        secondsLeft: baseSeconds,
        targetEndAt: Date.now() + baseSeconds * 1000,
        isRunning: true,
        isFinishedAlert: false,
      };
    });
  }, [setTimerRuntime]);

  const handleResetTimer = useCallback(() => {
    timerAlarm.stop();
    setShowAlarmConfirmModal(false);
    setTimerRuntime((prev) => ({
      ...prev,
      isRunning: false,
      targetEndAt: null,
      isFinishedAlert: false,
      secondsLeft: prev.durationMinutes * 60,
    }));
  }, [setTimerRuntime]);

  const handleCompleteAndClearTimer = useCallback(() => {
    timerAlarm.stop();
    setShowAlarmConfirmModal(false);
    setTimerRuntime((prev) => ({
      ...prev,
      isRunning: false,
      targetEndAt: null,
      isFinishedAlert: false,
      secondsLeft: prev.durationMinutes * 60,
      activeReviewItemId: undefined,
    }));
  }, [setTimerRuntime]);

  const handleApplyToTimer = useCallback(
    (opts: {
      minutes: number;
      subject?: string;
      topic?: string;
      method?: string;
      reviewItemId?: string;
    }) => {
      const mins = Math.max(1, Math.min(180, opts.minutes || 35));
      timerAlarm.stop();
      setShowAlarmConfirmModal(false);
      setTimerRuntime((prev) => ({
        ...prev,
        durationMinutes: mins,
        secondsLeft: mins * 60,
        isRunning: false,
        targetEndAt: null,
        isFinishedAlert: false,
        subject: opts.subject ?? prev.subject,
        topic: opts.topic ?? prev.topic,
        method: opts.method ?? prev.method,
        activeReviewItemId: opts.reviewItemId,
      }));
      setActiveModule('timer');
    },
    [setTimerRuntime]
  );

  // Pull cloud archive on initial visit if local is uninitialized
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
          if (Array.isArray(data.archive.savedVideos)) {
            setSavedVideos(data.archive.savedVideos);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncNow = useCallback(async (): Promise<boolean> => {
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
          savedVideos,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSyncedOnline(true);
        if (data?.syncedAt) {
          setLastSyncedAt(data.syncedAt);
        }
        return true;
      }
      return false;
    } catch {
      return false;
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
    savedVideos,
    setLastSyncedAt,
  ]);

  const handlePullFromServer = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/archive');
      if (!res.ok) return false;
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
        if (Array.isArray(data.archive.savedVideos)) {
          setSavedVideos(data.archive.savedVideos);
        }
        setIsSyncedOnline(true);
        if (data.archive.syncedAt) {
          setLastSyncedAt(data.archive.syncedAt);
        }
        return true;
      }
      return false;
    } catch {
      return false;
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
    setSavedVideos,
    setLastSyncedAt,
  ]);

  // Full Platform Lossless Backup & Restore
  const handleExportFullBackup = useCallback(async (): Promise<string> => {
    const { counts } = await exportFullArchiveBackup({
      libraryBooks,
      libraryGenres,
      genreTopics,
      journals,
      savedRoutines,
      studyLogs,
      spacedItems,
      savedVideos,
      customAudioTracks,
      theme,
      lang,
      activeWallpaperId,
      customWallpaper,
      backdropDimming,
      musicVolume,
      soundEnabled,
    });
    const msg = `Full Archive backed up (${counts.books} books, ${counts.pdfFiles} PDFs, ${counts.journals} journals, ${counts.routines} routines, ${counts.customAudio} audio tracks).`;
    showToast(msg);
    return msg;
  }, [
    libraryBooks,
    libraryGenres,
    genreTopics,
    journals,
    savedRoutines,
    studyLogs,
    spacedItems,
    savedVideos,
    customAudioTracks,
    theme,
    lang,
    activeWallpaperId,
    customWallpaper,
    backdropDimming,
    musicVolume,
    soundEnabled,
    showToast,
  ]);

  const handleRestoreFullFile = useCallback(
    async (file: File) => {
      const result = await restoreArchiveFromFile(file, {
        setLibraryBooks,
        setLibraryGenres,
        setGenreTopics,
        setJournals,
        setSavedRoutines,
        setStudyLogs,
        setSpacedItems,
        setSavedVideos,
        setCustomAudioTracks,
        setTheme,
        setLang,
        setActiveWallpaperId,
        setCustomWallpaper,
        setBackdropDimming,
        setMusicVolume,
        setSoundEnabled: (val) =>
          setTimerRuntime((prev) => ({ ...prev, soundEnabled: val })),
      });
      showToast(result.message);
      return result;
    },
    [
      setLibraryBooks,
      setLibraryGenres,
      setGenreTopics,
      setJournals,
      setSavedRoutines,
      setStudyLogs,
      setSpacedItems,
      setSavedVideos,
      setCustomAudioTracks,
      setTheme,
      setLang,
      setActiveWallpaperId,
      setCustomWallpaper,
      setBackdropDimming,
      setMusicVolume,
      setTimerRuntime,
      showToast,
    ]
  );

  // Persistent BGM engine
  const playTrackById = useCallback(
    async (trackId: AmbientTrackId) => {
      if (trackId.startsWith('custom:')) {
        const audioId = trackId.slice('custom:'.length);
        const url = await loadAudioObjectUrl(audioId);
        const meta = customAudioTracks.find((c) => c.id === audioId);
        if (url) {
          ambientEngine.startCustomObjectUrl(
            trackId,
            url,
            meta?.title || 'Custom Focus Audio'
          );
          setIsMusicPlaying(true);
          return;
        }
      }
      ambientEngine.start(trackId);
      setIsMusicPlaying(true);
    },
    [customAudioTracks]
  );

  const handleToggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      ambientEngine.stop();
      setIsMusicPlaying(false);
    } else {
      playTrackById(activeTrackId);
    }
  }, [isMusicPlaying, activeTrackId, playTrackById]);

  const handleSelectTrack = useCallback(
    (trackId: AmbientTrackId) => {
      setActiveTrackId(trackId);
      playTrackById(trackId);
    },
    [playTrackById]
  );

  const handleUploadCustomAudio = useCallback(
    async (file: File) => {
      const id = `aud-${Date.now()}`;
      await saveAudioBlob(id, file);
      const trackMeta: CustomAudioTrack = {
        id,
        title: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        sizeBytes: file.size,
        addedAt: new Date().toISOString(),
      };
      setCustomAudioTracks((prev) => [trackMeta, ...prev]);
      const trackKey: AmbientTrackId = `custom:${id}`;
      setActiveTrackId(trackKey);
      const url = await loadAudioObjectUrl(id);
      if (url) {
        ambientEngine.startCustomObjectUrl(trackKey, url, trackMeta.title);
        setIsMusicPlaying(true);
      }
    },
    [setCustomAudioTracks]
  );

  const handleDeleteCustomAudio = useCallback(
    async (id: string) => {
      if (activeTrackId === `custom:${id}`) {
        ambientEngine.stop();
        setIsMusicPlaying(false);
        setActiveTrackId('rain-library');
      }
      await deleteAudioBlob(id);
      setCustomAudioTracks((prev) => prev.filter((c) => c.id !== id));
    },
    [activeTrackId, setCustomAudioTracks]
  );

  // Strict 1-4-7 Spaced Repetition
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

  const handleQuickDoneFromDock = useCallback(() => {
    const cleanSubject = timerSubject.trim() || 'General Study';
    const cleanTopic = timerTopic.trim() || 'Split-Screen Focus Session';
    const elapsedSeconds = durationMinutes * 60 - secondsLeft;
    const loggedMinutes =
      elapsedSeconds >= 60 ? Math.round(elapsedSeconds / 60) : durationMinutes;

    handleLogStudySession(
      {
        subject: cleanSubject,
        topic: cleanTopic,
        method: timerMethod,
        durationMinutes: loggedMinutes,
      },
      activeReviewItemId
    );
    handleCompleteAndClearTimer();
  }, [
    timerSubject,
    timerTopic,
    durationMinutes,
    secondsLeft,
    timerMethod,
    activeReviewItemId,
    handleLogStudySession,
    handleCompleteAndClearTimer,
  ]);

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
      WALLPAPER_PRESETS.find((w) => w.id === activeWallpaperId) ?? WALLPAPER_PRESETS[0]
    );
  }, [activeWallpaperId, customWallpaper]);

  const dueReviewCount = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    return spacedItems.filter((i) => i.stageIndex < 2 && i.nextReviewDate <= todayKey).length;
  }, [spacedItems]);

  const liveClockMins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const liveClockSecs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className={`relative min-h-screen transition-colors ${tk.rootBg}`}>
      {/* Global Wallpaper Backdrop (Active behind dark/slate themes) */}
      {tk.isDark && activeWallpaper.id !== 'obsidian-default' && (
        <div
          aria-hidden="true"
          className="no-print pointer-events-none fixed inset-0 z-0"
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
            style={{ backgroundColor: `rgba(11, 11, 13, ${backdropDimming})` }}
          />
        </div>
      )}

      {/* Global Persistent Alarm Looping Banner */}
      {isAlarmRinging && (
        <div className="no-print sticky top-0 z-50 flex flex-wrap items-center justify-center gap-4 bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4 animate-bounce" />
            <span>
              {lang === 'bn'
                ? `সময় শেষ (${timerSubject})! অ্যালার্ম বাজছে — বন্ধ করতে চান?`
                : `Focus Complete (${timerSubject})! Do you want to stop the alarm?`}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStopAlarmConfirmYes}
              className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs font-bold text-rose-700 hover:bg-zinc-100"
            >
              <BellOff className="h-3.5 w-3.5" />
              <span>Yes — Stop Alarm</span>
            </button>
            {!showAlarmConfirmModal && (
              <button
                type="button"
                onClick={() => setShowAlarmConfirmModal(true)}
                className="rounded-md border border-white/40 px-2.5 py-1 text-xs text-white hover:bg-white/10"
              >
                Ask Prompt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Confirmation Modal when Timer Reaches 00:00 */}
      {showAlarmConfirmModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-rose-500/40 bg-[#141417] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20">
                <Bell className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  Focus Timer Complete (00:00)
                </p>
                <h2 className="font-display text-xl font-semibold text-white">
                  {timerSubject}
                </h2>
              </div>
            </div>

            <p className="text-sm font-medium text-zinc-200">
              {lang === 'bn'
                ? 'আপনি কি অ্যালার্মটি বন্ধ করতে চান? (Yes / No)'
                : 'Do you want to stop the alarm? (Yes / No)'}
            </p>
            <p className="text-xs text-zinc-400">
              The alarm will keep ringing continuously until you select &ldquo;Yes&rdquo;.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleStopAlarmDeclineNo}
                className="rounded-xl border border-white/20 px-5 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
              >
                No (Keep Ringing)
              </button>
              <button
                type="button"
                onClick={handleStopAlarmConfirmYes}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                <BellOff className="h-4 w-4" />
                <span>Yes (Stop Alarm)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Contract: [Brand title] — [Primary nav links] — [Start Focus / Live Timer] */}
      <header className={`no-print sticky top-0 z-40 border-b backdrop-blur-md ${tk.headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setActiveModule('library')}
            className={`font-display whitespace-nowrap shrink-0 text-left text-lg font-semibold tracking-tight transition-opacity hover:opacity-80 ${tk.headingText}`}
          >
            {t.brand}
          </button>

          <nav aria-label="Primary modules" className="hidden items-center gap-5 lg:gap-6 md:flex overflow-x-auto">
            {primaryNavItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`relative whitespace-nowrap shrink-0 py-1 text-sm font-medium transition-colors ${
                    isActive ? tk.headingText : `${tk.mutedText} hover:opacity-85`
                  }`}
                >
                  {item.label}
                  {item.id === 'timer' && isRunning && (
                    <span className={`font-mono-tabular ml-1.5 text-[11px] font-semibold ${tk.accentText}`}>
                      ({liveClockMins}:{liveClockSecs})
                    </span>
                  )}
                  {item.id === 'timer' && !isRunning && dueReviewCount > 0 && (
                    <span className={`font-mono-tabular ml-1.5 text-[11px] ${tk.accentText}`}>
                      ({dueReviewCount})
                    </span>
                  )}
                  {isActive && (
                    <span className={`absolute inset-x-0 -bottom-[15px] h-0.5 ${tk.accentBg}`} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setActiveModule('timer')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tk.primaryBtn}`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span className="font-mono-tabular">
                {isRunning ? `${liveClockMins}:${liveClockSecs}` : t.startFocus}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Strip */}
        <div
          className={`flex items-center gap-1 overflow-x-auto border-t px-3 py-2 md:hidden ${tk.borderSubtle}`}
        >
          {primaryNavItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  isActive ? tk.primaryBtn : tk.mutedText
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Secondary Studio Strip */}
      <div className="no-print relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6 lg:px-8">
        <p className={`text-xs font-medium ${tk.mutedText}`}>{t.subtitle}</p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModule('wallpaper')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeModule === 'wallpaper' ? tk.activeTabBtn : tk.inputSurface
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{t.navWallpaper}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('music')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeModule === 'music' ? tk.activeTabBtn : tk.inputSurface
            }`}
          >
            <Music2 className={`h-3.5 w-3.5 ${isMusicPlaying ? 'animate-pulse' : ''}`} />
            <span>
              {t.navMusic}
              {isMusicPlaying ? ' •' : ''}
            </span>
          </button>

          <div className={`inline-flex items-center gap-0.5 rounded-lg border p-0.5 ${tk.subCardSurface}`}>
            <Globe className={`ml-2 h-3.5 w-3.5 ${tk.mutedText}`} />
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                lang === 'en' ? tk.primaryBtn : tk.mutedText
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                lang === 'bn' ? tk.primaryBtn : tk.mutedText
              }`}
            >
              বাংলা
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTheme(tk.isDark ? 'mono-light' : 'mono-dark')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${tk.inputSurface}`}
          >
            {tk.isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'লাইট মোড' : 'Light Mono'}</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mono'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {globalBackupToast && (
        <div className="no-print mx-auto mt-3 max-w-3xl px-4">
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-2.5 text-center text-xs font-medium text-emerald-500">
            {globalBackupToast}
          </div>
        </div>
      )}

      {/* Main Content View */}
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
            durationMinutes={durationMinutes}
            secondsLeft={secondsLeft}
            isRunning={isRunning}
            isAlarmRinging={isAlarmRinging}
            isFinishedAlert={isFinishedAlert}
            soundEnabled={soundEnabled}
            subject={timerSubject}
            topic={timerTopic}
            method={timerMethod}
            activeReviewItemId={activeReviewItemId}
            onSelectDuration={handleSelectTimerDuration}
            onToggleRun={handleToggleTimerRun}
            onResetTimer={handleResetTimer}
            onToggleSound={() =>
              setTimerRuntime((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            onStopAlarm={handleStopAlarmConfirmYes}
            onChangeSubject={(val) =>
              setTimerRuntime((prev) => ({ ...prev, subject: val }))
            }
            onChangeTopic={(val) =>
              setTimerRuntime((prev) => ({ ...prev, topic: val }))
            }
            onChangeMethod={(val) =>
              setTimerRuntime((prev) => ({ ...prev, method: val }))
            }
            onStartReviewSession={(item) =>
              handleApplyToTimer({
                minutes: 25,
                subject: item.subject,
                topic: item.topic,
                reviewItemId: item.id,
              })
            }
            onCompleteAndClearTimer={handleCompleteAndClearTimer}
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
            onNavigateModule={setActiveModule}
            books={libraryBooks}
            genres={libraryGenres}
            genreTopics={genreTopics}
            onAddGenre={(g) =>
              setLibraryGenres((prev) => (prev.includes(g) ? prev : [...prev, g]))
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
            onExportFullBackup={handleExportFullBackup}
            onRestoreFullFile={handleRestoreFullFile}
          />
        )}

        {activeModule === 'lab' && (
          <SciLabVideoModule
            lang={lang}
            theme={theme}
            savedVideos={savedVideos}
            libraryBooks={libraryBooks}
            dockedTimer={{
              durationMinutes,
              secondsLeft,
              isRunning,
              isAlarmRinging,
              subject: timerSubject,
              topic: timerTopic,
              onSelectDuration: handleSelectTimerDuration,
              onToggleRun: handleToggleTimerRun,
              onResetTimer: handleResetTimer,
              onStopAlarm: handleStopAlarmConfirmYes,
              onChangeSubject: (val) =>
                setTimerRuntime((prev) => ({ ...prev, subject: val })),
              onChangeTopic: (val) =>
                setTimerRuntime((prev) => ({ ...prev, topic: val })),
              onQuickDone: handleQuickDoneFromDock,
            }}
            onAddVideo={(vid) => setSavedVideos((prev) => [vid, ...prev])}
            onDeleteVideo={(id) =>
              setSavedVideos((prev) => prev.filter((v) => v.id !== id))
            }
            onStudyVideoInTimer={(vid) =>
              handleApplyToTimer({
                minutes: 45,
                subject: vid.subject,
                topic: vid.title,
              })
            }
          />
        )}

        {activeModule === 'grammar' && (
          <EnglishGrammarModule lang={lang} theme={theme} />
        )}

        {activeModule === 'wallpaper' && (
          <WallpaperStudioModule
            lang={lang}
            theme={theme}
            onSelectTheme={setTheme}
            activeWallpaperId={activeWallpaperId}
            onSelectWallpaper={setActiveWallpaperId}
            customWallpaper={customWallpaper}
            onUploadCustomWallpaper={setCustomWallpaper}
            backdropDimming={backdropDimming}
            onChangeBackdropDimming={setBackdropDimming}
          />
        )}

        {activeModule === 'music' && (
          <MusicStudioModule
            lang={lang}
            theme={theme}
            isMusicPlaying={isMusicPlaying}
            activeTrackId={activeTrackId}
            musicVolume={musicVolume}
            customTracks={customAudioTracks}
            onToggleMusic={handleToggleMusic}
            onSelectTrack={handleSelectTrack}
            onChangeVolume={setMusicVolume}
            onUploadAudioFile={handleUploadCustomAudio}
            onDeleteCustomTrack={handleDeleteCustomAudio}
          />
        )}
      </main>

      {/* Editorial About & Credit Footer + Global Backup / Restore */}
      <footer className={`no-print relative z-10 border-t backdrop-blur-sm ${tk.headerBg}`}>
        <div
          className={`mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs sm:flex-row sm:px-6 lg:px-8 ${tk.mutedText}`}
        >
          <div className="text-center sm:text-left">
            <p className="text-sm">
              <span className={`font-display text-base font-semibold ${tk.headingText}`}>
                Archive
              </span>
              <span aria-hidden="true" className="mx-2 opacity-50">
                ·
              </span>
              <span className={`font-semibold ${tk.accentText}`}>
                Made by Al Tahjib Noor Raiyan
              </span>
            </p>
            <p className="mt-1 text-[11px] opacity-80">
              All-in-One Study &amp; Productivity Platform · Full Backup &amp; Sync Ready
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleExportFullBackup}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${tk.inputSurface}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Full Backup</span>
            </button>

            <button
              type="button"
              onClick={() => footerRestoreRef.current?.click()}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${tk.inputSurface}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Restore Backup</span>
            </button>
            <input
              ref={footerRestoreRef}
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleRestoreFullFile(file);
                e.target.value = '';
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleToggleMusic}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-colors ${tk.inputSurface}`}
            >
              {isMusicPlaying ? (
                <>
                  <Volume2 className={`h-3.5 w-3.5 ${tk.accentText}`} />
                  <span>
                    {lang === 'bn' ? 'ব্যাকগ্রাউন্ড মিউজিক চলছে' : 'Audio Playing'}
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 opacity-60" />
                  <span>{lang === 'bn' ? 'অডিও বন্ধ' : 'Audio Off'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
