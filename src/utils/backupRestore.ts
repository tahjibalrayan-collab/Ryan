import {
  AppTheme,
  CustomAudioTrack,
  GeneratedRoutine,
  JournalBook,
  Language,
  LibraryBook,
  SavedVideoLink,
  SpacedRepetitionItem,
  StudyLog,
} from '../types';
import {
  exportAllAudioBlobs,
  exportAllPdfBlobs,
  importAllAudioBlobs,
  importAllPdfBlobs,
} from './pdfStorage';

export interface FullArchiveBackupEnvelope {
  schemaVersion: 2;
  app: 'Archive';
  creator: 'Al Tahjib Noor Raiyan';
  exportedAt: string;
  counts: {
    books: number;
    pdfFiles: number;
    journals: number;
    routines: number;
    studyLogs: number;
    spacedItems: number;
    videos: number;
    customAudio: number;
  };
  data: {
    libraryBooks: LibraryBook[];
    libraryGenres: string[];
    genreTopics: Record<string, string[]>;
    journals: JournalBook[];
    savedRoutines: GeneratedRoutine[];
    studyLogs: StudyLog[];
    spacedItems: SpacedRepetitionItem[];
    savedVideos: SavedVideoLink[];
    customAudioTracks: CustomAudioTrack[];
    pdfBlobs: Record<string, string>;
    audioBlobs: Record<string, string>;
    settings: {
      theme: AppTheme;
      lang: Language;
      activeWallpaperId: string;
      customWallpaper: string | null;
      backdropDimming: number;
      musicVolume: number;
      soundEnabled: boolean;
    };
  };
}

export interface BackupInputState {
  libraryBooks: LibraryBook[];
  libraryGenres: string[];
  genreTopics: Record<string, string[]>;
  journals: JournalBook[];
  savedRoutines: GeneratedRoutine[];
  studyLogs: StudyLog[];
  spacedItems: SpacedRepetitionItem[];
  savedVideos: SavedVideoLink[];
  customAudioTracks: CustomAudioTrack[];
  theme: AppTheme;
  lang: Language;
  activeWallpaperId: string;
  customWallpaper: string | null;
  backdropDimming: number;
  musicVolume: number;
  soundEnabled: boolean;
}

export interface RestoreCallbacks {
  setLibraryBooks: (val: LibraryBook[]) => void;
  setLibraryGenres: (val: string[]) => void;
  setGenreTopics: (val: Record<string, string[]>) => void;
  setJournals: (val: JournalBook[]) => void;
  setSavedRoutines: (val: GeneratedRoutine[]) => void;
  setStudyLogs: (val: StudyLog[]) => void;
  setSpacedItems: (val: SpacedRepetitionItem[]) => void;
  setSavedVideos: (val: SavedVideoLink[]) => void;
  setCustomAudioTracks: (val: CustomAudioTrack[]) => void;
  setTheme: (val: AppTheme) => void;
  setLang: (val: Language) => void;
  setActiveWallpaperId: (val: string) => void;
  setCustomWallpaper: (val: string | null) => void;
  setBackdropDimming: (val: number) => void;
  setMusicVolume: (val: number) => void;
  setSoundEnabled: (val: boolean) => void;
}

export interface RestoreResultSummary {
  ok: boolean;
  message: string;
  details?: string;
}

export async function exportFullArchiveBackup(
  state: BackupInputState
): Promise<{ fileName: string; counts: FullArchiveBackupEnvelope['counts'] }> {
  const [pdfBlobs, audioBlobs] = await Promise.all([
    exportAllPdfBlobs(),
    exportAllAudioBlobs(),
  ]);

  const counts: FullArchiveBackupEnvelope['counts'] = {
    books: state.libraryBooks.length,
    pdfFiles: Object.keys(pdfBlobs).length,
    journals: state.journals.length,
    routines: state.savedRoutines.length,
    studyLogs: state.studyLogs.length,
    spacedItems: state.spacedItems.length,
    videos: state.savedVideos.length,
    customAudio: state.customAudioTracks.length,
  };

  const envelope: FullArchiveBackupEnvelope = {
    schemaVersion: 2,
    app: 'Archive',
    creator: 'Al Tahjib Noor Raiyan',
    exportedAt: new Date().toISOString(),
    counts,
    data: {
      libraryBooks: state.libraryBooks,
      libraryGenres: state.libraryGenres,
      genreTopics: state.genreTopics,
      journals: state.journals,
      savedRoutines: state.savedRoutines,
      studyLogs: state.studyLogs,
      spacedItems: state.spacedItems,
      savedVideos: state.savedVideos,
      customAudioTracks: state.customAudioTracks,
      pdfBlobs,
      audioBlobs,
      settings: {
        theme: state.theme,
        lang: state.lang,
        activeWallpaperId: state.activeWallpaperId,
        customWallpaper: state.customWallpaper,
        backdropDimming: state.backdropDimming,
        musicVolume: state.musicVolume,
        soundEnabled: state.soundEnabled,
      },
    },
  };

  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const fileName = `archive-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { fileName, counts };
}

export async function restoreArchiveFromFile(
  file: File,
  callbacks: RestoreCallbacks
): Promise<RestoreResultSummary> {
  try {
    const rawText = await file.text();
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, message: 'Invalid backup file format.' };
    }

    // Case 1: Full Archive Backup v2
    if (parsed.schemaVersion === 2 && parsed.data && typeof parsed.data === 'object') {
      const d = parsed.data;
      let restoredPdfs = 0;
      let restoredAudios = 0;

      if (d.pdfBlobs && typeof d.pdfBlobs === 'object') {
        restoredPdfs = await importAllPdfBlobs(d.pdfBlobs);
      }
      if (d.audioBlobs && typeof d.audioBlobs === 'object') {
        restoredAudios = await importAllAudioBlobs(d.audioBlobs);
      }

      if (Array.isArray(d.libraryBooks)) callbacks.setLibraryBooks(d.libraryBooks);
      if (Array.isArray(d.libraryGenres)) callbacks.setLibraryGenres(d.libraryGenres);
      if (d.genreTopics && typeof d.genreTopics === 'object') {
        callbacks.setGenreTopics(d.genreTopics);
      }
      if (Array.isArray(d.journals)) callbacks.setJournals(d.journals);
      if (Array.isArray(d.savedRoutines)) callbacks.setSavedRoutines(d.savedRoutines);
      if (Array.isArray(d.studyLogs)) callbacks.setStudyLogs(d.studyLogs);
      if (Array.isArray(d.spacedItems)) callbacks.setSpacedItems(d.spacedItems);
      if (Array.isArray(d.savedVideos)) callbacks.setSavedVideos(d.savedVideos);
      if (Array.isArray(d.customAudioTracks)) {
        callbacks.setCustomAudioTracks(d.customAudioTracks);
      }

      if (d.settings && typeof d.settings === 'object') {
        if (d.settings.theme) callbacks.setTheme(d.settings.theme);
        if (d.settings.lang) callbacks.setLang(d.settings.lang);
        if (d.settings.activeWallpaperId) {
          callbacks.setActiveWallpaperId(d.settings.activeWallpaperId);
        }
        if ('customWallpaper' in d.settings) {
          callbacks.setCustomWallpaper(d.settings.customWallpaper ?? null);
        }
        if (typeof d.settings.backdropDimming === 'number') {
          callbacks.setBackdropDimming(d.settings.backdropDimming);
        }
        if (typeof d.settings.musicVolume === 'number') {
          callbacks.setMusicVolume(d.settings.musicVolume);
        }
        if (typeof d.settings.soundEnabled === 'boolean') {
          callbacks.setSoundEnabled(d.settings.soundEnabled);
        }
      }

      const booksCount = Array.isArray(d.libraryBooks) ? d.libraryBooks.length : 0;
      const journalsCount = Array.isArray(d.journals) ? d.journals.length : 0;
      const routinesCount = Array.isArray(d.savedRoutines) ? d.savedRoutines.length : 0;

      return {
        ok: true,
        message: `Full Archive restored cleanly (${booksCount} books, ${restoredPdfs} PDFs, ${journalsCount} journals, ${routinesCount} routines, ${restoredAudios} audio tracks).`,
      };
    }

    // Case 2: Legacy Library-only or Array backup
    if (Array.isArray(parsed)) {
      callbacks.setLibraryBooks(parsed);
      return {
        ok: true,
        message: `Restored ${parsed.length} library books from legacy backup.`,
      };
    }

    if (Array.isArray(parsed.books)) {
      callbacks.setLibraryBooks(parsed.books);
      return {
        ok: true,
        message: `Restored ${parsed.books.length} library books.`,
      };
    }

    // Case 3: Legacy Diary-only backup
    if (Array.isArray(parsed.journals)) {
      callbacks.setJournals(parsed.journals);
      return {
        ok: true,
        message: `Restored ${parsed.journals.length} journal books.`,
      };
    }

    return {
      ok: false,
      message: 'Unrecognized backup structure. Please choose a valid Archive JSON file.',
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to parse backup file.',
    };
  }
}
