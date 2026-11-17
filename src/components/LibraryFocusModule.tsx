import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpDown,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  CopyMinus,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Minus,
  Music2,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import {
  AppTheme,
  FavoritePageBookmark,
  Language,
  LibraryBook,
  NavModule,
  ReadingStatus,
} from '../types';
import { deletePdfBlob, loadPdfObjectUrl, savePdfBlob } from '../utils/pdfStorage';
import { getThemeTokens } from '../utils/themeStyles';

interface LibraryFocusModuleProps {
  lang: Language;
  theme: AppTheme;
  onNavigateModule: (mod: NavModule) => void;
  books: LibraryBook[];
  genres: string[];
  genreTopics: Record<string, string[]>;
  onAddGenre: (genre: string) => void;
  onAddTopicToGenre: (genre: string, topic: string) => void;
  onUpdateBook: (book: LibraryBook) => void;
  onAddBook: (book: LibraryBook) => void;
  onBulkAddBooks: (
    books: LibraryBook[],
    discoveredGenres: string[],
    discoveredTopics: Array<{ genre: string; topic: string }>
  ) => void;
  onRestoreBooks: (books: LibraryBook[]) => void;
  onRemoveDuplicates: () => number;
  onDeleteBook: (id: string) => void;
  onStudyBookInTimer: (book: LibraryBook) => void;
  isSyncedOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  onSyncNow: () => Promise<boolean>;
  onPullFromServer: () => Promise<boolean>;
  onExportFullBackup: () => Promise<string>;
  onRestoreFullFile: (file: File) => Promise<{ ok: boolean; message: string }>;
}

const BOOK_BINDINGS = [
  { cover: '#18181B', spine: '#FAFAFA' },
  { cover: '#27272A', spine: '#D4D4D8' },
  { cover: '#1D355E', spine: '#E2E8F0' },
  { cover: '#2E5339', spine: '#D4B483' },
  { cover: '#6B1D3B', spine: '#E2C08D' },
  { cover: '#4B3869', spine: '#E0C3FC' },
  { cover: '#7A3E26', spine: '#F3D2B3' },
];

type SortOption = 'newest' | 'title' | 'author' | 'rating' | 'progress';

function parseBulkLines(
  raw: string,
  existingCount: number
): {
  parsedBooks: LibraryBook[];
  discoveredGenres: string[];
  discoveredTopics: Array<{ genre: string; topic: string }>;
} {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const nowIso = new Date().toISOString();
  const genresSet = new Set<string>();
  const topicsList: Array<{ genre: string; topic: string }> = [];

  const parsedBooks: LibraryBook[] = lines.map((line, idx) => {
    const cleaned = line.replace(/^\d+[.)]\s*/, '').trim();

    let title = cleaned;
    let author = '';
    let genre = 'Non-Fiction';
    let topic = 'General';

    if (cleaned.includes('|')) {
      const parts = cleaned.split('|').map((p) => p.trim());
      title = parts[0] || cleaned;
      author = parts[1] || '';
      genre = parts[2] || 'Non-Fiction';
      topic = parts[3] || 'General';
    } else if (cleaned.includes('—') || cleaned.includes('–')) {
      const emParts = cleaned.split(/[—–]/);
      title = (emParts[0] || '').trim();
      const rest = emParts.slice(1).join('—').trim();
      const dashParts = rest.split(/\s+-\s+/).map((p) => p.trim());
      author = dashParts[0] || '';
      genre = dashParts[1] || 'Fiction';
      topic = dashParts.slice(2).join(' - ') || 'General';
    } else if (cleaned.includes(' - ')) {
      const dashParts = cleaned.split(/\s+-\s+/).map((p) => p.trim());
      title = dashParts[0] || cleaned;
      author = dashParts[1] || '';
      genre = dashParts[2] || 'Fiction';
      topic = dashParts.slice(3).join(' - ') || 'General';
    }

    genresSet.add(genre);
    if (topic && topic !== 'General') {
      topicsList.push({ genre, topic });
    }

    const binding = BOOK_BINDINGS[(existingCount + idx) % BOOK_BINDINGS.length];
    return {
      id: `lib-bulk-${Date.now()}-${idx}`,
      title,
      author,
      genre,
      topic,
      status: 'Want to read',
      rating: 0,
      coverColor: binding.cover,
      spineAccent: binding.spine,
      textColor: '#FAF7F2',
      currentPage: 1,
      totalPages: 300,
      progress: 0,
      notes: '',
      favoritePages: [],
      createdAt: nowIso,
      lastOpenedAt: nowIso,
    };
  });

  return {
    parsedBooks,
    discoveredGenres: Array.from(genresSet),
    discoveredTopics: topicsList,
  };
}

export const LibraryFocusModule: React.FC<LibraryFocusModuleProps> = ({
  lang,
  theme,
  onNavigateModule,
  books,
  genres,
  genreTopics,
  onAddGenre,
  onAddTopicToGenre,
  onUpdateBook,
  onAddBook,
  onBulkAddBooks,
  onRestoreBooks,
  onRemoveDuplicates,
  onDeleteBook,
  onStudyBookInTimer,
  isSyncedOnline,
  isSyncing,
  lastSyncedAt,
  onSyncNow,
  onPullFromServer,
  onExportFullBackup,
  onRestoreFullFile,
}) => {
  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);

  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ReadingStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id ?? '');
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  // Modals & Inputs
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddGenreInput, setShowAddGenreInput] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [showAddTopicInput, setShowAddTopicInput] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Interactive Book & PDF Reader Modal State (with 3D flip, Zoom & Favorite Pages)
  const [readerState, setReaderState] = useState<{
    bookId: string;
    pdfUrl: string | null;
    isBlob: boolean;
    page: number;
    zoomPercent: number;
    flipDir: 1 | -1;
  } | null>(null);
  const [favLabelInput, setFavLabelInput] = useState('');

  // Add book form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState(genres[0] || 'History');
  const [newTopic, setNewTopic] = useState('');
  const [newStatus, setNewStatus] = useState<ReadingStatus>('Want to read');
  const [newPages, setNewPages] = useState('300');
  const [newRating, setNewRating] = useState(0);
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<string | undefined>(undefined);
  const [newBindingIdx, setNewBindingIdx] = useState(0);

  // Bulk add state
  const [bulkText, setBulkText] = useState('');
  const restoreInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => setStatusToast(null), 4500);
  };

  useEffect(() => {
    setTopicFilter('All');
  }, [genreFilter]);

  const stats = useMemo(() => {
    const reading = books.filter((b) => b.status === 'Reading').length;
    const toRead = books.filter((b) => b.status === 'Want to read').length;
    const finished = books.filter((b) => b.status === 'Finished').length;
    return { total: books.length, reading, toRead, finished };
  }, [books]);

  const genreCounts = useMemo(() => {
    const map: Record<string, number> = {};
    books.forEach((b) => {
      map[b.genre] = (map[b.genre] || 0) + 1;
    });
    return map;
  }, [books]);

  const topicsInSelectedGenre = useMemo(() => {
    if (genreFilter === 'All') return [];
    const set = new Set<string>(genreTopics[genreFilter] || []);
    books
      .filter((b) => b.genre === genreFilter && b.topic.trim())
      .forEach((b) => set.add(b.topic.trim()));
    return Array.from(set);
  }, [genreFilter, genreTopics, books]);

  const topicCountsInGenre = useMemo(() => {
    const map: Record<string, number> = {};
    books
      .filter((b) => genreFilter === 'All' || b.genre === genreFilter)
      .forEach((b) => {
        if (b.topic) map[b.topic] = (map[b.topic] || 0) + 1;
      });
    return map;
  }, [books, genreFilter]);

  const filteredBooks = useMemo(() => {
    const list = books.filter((b) => {
      const matchesGenre = genreFilter === 'All' || b.genre === genreFilter;
      const matchesTopic = topicFilter === 'All' || b.topic === topicFilter;
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.topic.toLowerCase().includes(q) ||
        b.notes.toLowerCase().includes(q);
      return matchesGenre && matchesTopic && matchesStatus && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'progress') return b.progress - a.progress;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [books, genreFilter, topicFilter, statusFilter, searchQuery, sortBy]);

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? filteredBooks[0] ?? null,
    [books, selectedBookId, filteredBooks]
  );

  const readerBook = useMemo(
    () => (readerState ? books.find((b) => b.id === readerState.bookId) ?? null : null),
    [books, readerState]
  );

  const bulkPreview = useMemo(
    () => (bulkText.trim() ? parseBulkLines(bulkText, books.length).parsedBooks.length : 0),
    [bulkText, books.length]
  );

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const binding = BOOK_BINDINGS[newBindingIdx];
    const total = Math.max(1, parseInt(newPages, 10) || 300);
    const current = newStatus === 'Finished' ? total : 1;
    const progress = newStatus === 'Finished' ? 100 : 0;
    const nowIso = new Date().toISOString();
    const bookId = `lib-${Date.now()}`;

    let pdfFileId: string | undefined;
    let pdfFileName: string | undefined;
    if (newPdfFile) {
      pdfFileId = `pdf-${bookId}`;
      pdfFileName = newPdfFile.name;
      await savePdfBlob(pdfFileId, newPdfFile);
    }

    const cleanTopic = newTopic.trim() || 'General';
    if (cleanTopic !== 'General') {
      onAddTopicToGenre(newGenre, cleanTopic);
    }

    const created: LibraryBook = {
      id: bookId,
      title: newTitle.trim(),
      author: newAuthor.trim(),
      genre: newGenre,
      topic: cleanTopic,
      status: newStatus,
      rating: newRating,
      coverColor: binding.cover,
      spineAccent: binding.spine,
      textColor: '#FAF7F2',
      coverImage: newCoverImage,
      pdfFileId,
      pdfFileName,
      pdfUrl: newPdfUrl.trim() || undefined,
      currentPage: current,
      totalPages: total,
      progress,
      notes: '',
      favoritePages: [],
      createdAt: nowIso,
      lastOpenedAt: nowIso,
    };

    onAddBook(created);
    setSelectedBookId(created.id);
    setNewTitle('');
    setNewAuthor('');
    setNewTopic('');
    setNewRating(0);
    setNewPdfUrl('');
    setNewPdfFile(null);
    setNewCoverImage(undefined);
    setShowAddBookModal(false);
    showToast(
      lang === 'bn' ? `"${created.title}" শেল্ফে যোগ হয়েছে।` : `"${created.title}" added to shelf.`
    );
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { parsedBooks, discoveredGenres, discoveredTopics } = parseBulkLines(
      bulkText,
      books.length
    );
    if (parsedBooks.length === 0) return;

    onBulkAddBooks(parsedBooks, discoveredGenres, discoveredTopics);
    setSelectedBookId(parsedBooks[0].id);
    setBulkText('');
    setShowBulkModal(false);
    showToast(
      lang === 'bn'
        ? `${parsedBooks.length}টি বই সফলভাবে যোগ হয়েছে।`
        : `${parsedBooks.length} books shelved cleanly.`
    );
  };

  const handleOpenBookReader = async (book: LibraryBook) => {
    let url: string | null = null;
    let isBlob = false;
    if (book.pdfFileId) {
      const blobUrl = await loadPdfObjectUrl(book.pdfFileId);
      if (blobUrl) {
        url = blobUrl;
        isBlob = true;
      }
    }
    if (!url && book.pdfUrl) {
      url = book.pdfUrl;
      isBlob = false;
    }

    setReaderState({
      bookId: book.id,
      pdfUrl: url,
      isBlob,
      page: Math.max(1, book.currentPage || 1),
      zoomPercent: 100,
      flipDir: 1,
    });
  };

  const handleCloseReader = () => {
    if (readerState?.isBlob && readerState.pdfUrl) {
      URL.revokeObjectURL(readerState.pdfUrl);
    }
    setReaderState(null);
  };

  const handleReaderPageChange = (newPage: number) => {
    if (!readerState || !readerBook) return;
    const clamped = Math.max(1, Math.min(readerBook.totalPages || 9999, newPage));
    const dir: 1 | -1 = clamped >= readerState.page ? 1 : -1;
    setReaderState({ ...readerState, page: clamped, flipDir: dir });

    const progress = readerBook.totalPages
      ? Math.round((clamped / readerBook.totalPages) * 100)
      : 0;
    onUpdateBook({
      ...readerBook,
      currentPage: clamped,
      progress,
      lastOpenedAt: new Date().toISOString(),
    });
  };

  const handleToggleFavoritePage = () => {
    if (!readerBook || !readerState) return;
    const list = readerBook.favoritePages || [];
    const exists = list.some((f) => f.page === readerState.page);
    const updatedFavs: FavoritePageBookmark[] = exists
      ? list.filter((f) => f.page !== readerState.page)
      : [
          ...list,
          {
            page: readerState.page,
            label: favLabelInput.trim() || `Page ${readerState.page}`,
            savedAt: new Date().toISOString(),
          },
        ].sort((a, b) => a.page - b.page);

    setFavLabelInput('');
    onUpdateBook({
      ...readerBook,
      favoritePages: updatedFavs,
      lastOpenedAt: new Date().toISOString(),
    });
  };

  const handleAttachPdfToBook = async (
    book: LibraryBook,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const pdfId = book.pdfFileId || `pdf-${book.id}`;
    await savePdfBlob(pdfId, file);
    onUpdateBook({
      ...book,
      pdfFileId: pdfId,
      pdfFileName: file.name,
      lastOpenedAt: new Date().toISOString(),
    });
    showToast(
      lang === 'bn' ? `"${file.name}" সংযুক্ত হয়েছে।` : `Attached "${file.name}".`
    );
  };

  const handleCoverImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetBook?: LibraryBook
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (targetBook) {
          onUpdateBook({
            ...targetBook,
            coverImage: reader.result,
            lastOpenedAt: new Date().toISOString(),
          });
        } else {
          setNewCoverImage(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackup = async () => {
    const summaryMsg = await onExportFullBackup();
    showToast(summaryMsg);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await onRestoreFullFile(file);
    showToast(res.message);
    e.target.value = '';
  };

  const handleRemoveDuplicatesClick = () => {
    const removed = onRemoveDuplicates();
    showToast(
      removed > 0
        ? lang === 'bn'
          ? `${removed}টি ডুপ্লিকেট বই সরানো হয়েছে।`
          : `Removed ${removed} duplicate book(s).`
        : lang === 'bn'
        ? 'কোনো ডুপ্লিকেট পাওয়া যায়নি।'
        : 'No duplicates found.'
    );
  };

  const handleAddGenreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newGenreName.trim();
    if (!cleaned) return;
    onAddGenre(cleaned);
    setGenreFilter(cleaned);
    setNewGenreName('');
    setShowAddGenreInput(false);
  };

  const handleAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTopicName.trim();
    if (!cleaned || genreFilter === 'All') return;
    onAddTopicToGenre(genreFilter, cleaned);
    setTopicFilter(cleaned);
    setNewTopicName('');
    setShowAddTopicInput(false);
  };

  return (
    <div className="space-y-10">
      {/* Centered Clean Archival Masthead: Big "Archive" + Centered Smaller "Made by Altaf Jibon Raiyn" */}
      <section className="flex flex-col items-center text-center">
        <h1 className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${tk.headingText}`}>
          Archive
        </h1>
        <p className={`mt-1.5 font-display text-sm font-normal tracking-wide sm:text-base ${tk.mutedText}`}>
          {t.subtitle}
        </p>

        {/* Cloud Sync + Quick Links to Music & Wallpaper Studios */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={async () => {
              const ok = await onSyncNow();
              showToast(
                ok
                  ? lang === 'bn'
                    ? 'ক্লাউড সিঙ্ক সম্পন্ন হয়েছে!'
                    : 'Synced to Cloud! Open this URL on Mobile to sync.'
                  : lang === 'bn'
                  ? 'ক্লাউড সিঙ্ক ব্যর্থ।'
                  : 'Cloud sync unavailable (saved locally).'
              );
            }}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${tk.inputSurface}`}
          >
            <Cloud className={`h-3.5 w-3.5 ${isSyncedOnline ? 'text-emerald-500' : tk.mutedText}`} />
            <span>
              {isSyncing
                ? lang === 'bn'
                  ? 'সিঙ্ক হচ্ছে...'
                  : 'Syncing...'
                : lang === 'bn'
                ? 'ক্লাউড সিঙ্ক (PC ↔ Mobile)'
                : 'Sync to Cloud (PC ↔ Mobile)'}
            </span>
          </button>

          <button
            type="button"
            onClick={async () => {
              const ok = await onPullFromServer();
              showToast(
                ok
                  ? lang === 'bn'
                    ? 'ক্লাউড থেকে লোড হয়েছে!'
                    : 'Archive loaded from Cloud!'
                  : lang === 'bn'
                  ? 'ক্লাউডে কোনো ব্যাকআপ পাওয়া যায়নি।'
                  : 'No cloud backup found yet — click Sync to Cloud first.'
              );
            }}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${tk.inputSurface}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? 'ক্লাউড থেকে লোড' : 'Load from Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('wallpaper')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${tk.inputSurface}`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>{t.navWallpaper}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('music')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${tk.inputSurface}`}
          >
            <Music2 className="h-3.5 w-3.5" />
            <span>{t.navMusic}</span>
          </button>
        </div>

        {lastSyncedAt && (
          <p className={`mt-1.5 text-[11px] ${tk.mutedText}`}>
            {lang === 'bn' ? 'সর্বশেষ সিঙ্ক:' : 'Last synced:'}{' '}
            {new Date(lastSyncedAt).toLocaleTimeString()}
          </p>
        )}

        {/* Stats */}
        <div className={`font-mono-tabular mt-4 text-xs ${tk.mutedText}`}>
          {stats.total} {lang === 'bn' ? 'টি বই' : 'volumes'} · {stats.reading}{' '}
          {lang === 'bn' ? 'পড়ছি' : 'reading'} · {stats.toRead}{' '}
          {lang === 'bn' ? 'পড়তে চাই' : 'to read'} · {stats.finished}{' '}
          {lang === 'bn' ? 'শেষ' : 'finished'}
        </div>

        {/* Search */}
        <div className="relative mt-4 w-full max-w-xl">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.mutedText}`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchLibraryPlaceholder}
            className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm shadow-sm focus:outline-none ${tk.inputSurface}`}
          />
        </div>

        {/* Genre Filter Row */}
        <div className="mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setGenreFilter('All')}
            className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              genreFilter === 'All' ? tk.activeTabBtn : tk.inputSurface
            }`}
          >
            {lang === 'bn' ? 'সব জনরা' : 'All'}
          </button>

          {genres.map((g) => {
            const count = genreCounts[g] || 0;
            const active = genreFilter === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGenreFilter(g)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                {g}
                {count > 0 && (
                  <span className="font-mono-tabular ml-1.5 opacity-75">{count}</span>
                )}
              </button>
            );
          })}

          {showAddGenreInput ? (
            <form onSubmit={handleAddGenreSubmit} className="inline-flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                placeholder={lang === 'bn' ? 'নতুন জনরা...' : 'New genre...'}
                className={`w-32 rounded-lg border px-2.5 py-1 text-xs focus:outline-none ${tk.inputSurface}`}
              />
              <button
                type="submit"
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${tk.primaryBtn}`}
              >
                +
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddGenreInput(true)}
              className={`whitespace-nowrap rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium ${tk.inputSurface}`}
            >
              + {lang === 'bn' ? 'জনরা' : 'Genre'}
            </button>
          )}
        </div>

        {/* Sub-Topics / Types inside Selected Genre */}
        {genreFilter !== 'All' && (
          <div
            className={`mt-3 flex max-w-4xl flex-wrap items-center justify-center gap-2 rounded-xl border px-4 py-2.5 ${tk.subCardSurface}`}
          >
            <span className={`text-[11px] font-semibold ${tk.accentText}`}>
              {genreFilter} {lang === 'bn' ? 'টপিক/টাইপ:' : 'Topics / Types:'}
            </span>

            <button
              type="button"
              onClick={() => setTopicFilter('All')}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                topicFilter === 'All' ? tk.activeTabBtn : tk.inputSurface
              }`}
            >
              {lang === 'bn' ? 'সব টপিক' : 'All Topics'}
            </button>

            {topicsInSelectedGenre.map((topicName) => {
              const tCount = topicCountsInGenre[topicName] || 0;
              const active = topicFilter === topicName;
              return (
                <button
                  key={topicName}
                  type="button"
                  onClick={() => setTopicFilter(topicName)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                    active ? tk.activeTabBtn : tk.inputSurface
                  }`}
                >
                  {topicName}
                  {tCount > 0 && (
                    <span className="font-mono-tabular ml-1 opacity-75">({tCount})</span>
                  )}
                </button>
              );
            })}

            {showAddTopicInput ? (
              <form onSubmit={handleAddTopicSubmit} className="inline-flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder={lang === 'bn' ? 'নতুন টপিক...' : 'e.g., Ottoman Empire'}
                  className={`w-36 rounded-md border px-2 py-1 text-[11px] focus:outline-none ${tk.inputSurface}`}
                />
                <button
                  type="submit"
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${tk.primaryBtn}`}
                >
                  +
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTopicInput(true)}
                className={`rounded-md border border-dashed px-2.5 py-1 text-[11px] font-medium ${tk.inputSurface}`}
              >
                + {lang === 'bn' ? 'টপিক / টাইপ' : 'Topic / Type'}
              </button>
            )}
          </div>
        )}

        {/* Reading Status Filter Row */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {(
            [
              { id: 'All', label: t.allBooks },
              { id: 'Want to read', label: t.wantToRead },
              { id: 'Reading', label: t.reading },
              { id: 'Finished', label: t.finished },
            ] as const
          ).map((st) => {
            const active = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                {st.id === 'Finished' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                {st.id === 'Reading' && <BookOpen className="h-3.5 w-3.5" />}
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {statusToast && (
        <div className="mx-auto max-w-xl rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-2.5 text-center text-xs font-medium text-emerald-500">
          {statusToast}
        </div>
      )}

      {/* ==================== SINGLE-LINE NON-WRAPPING BOOKSHELF ==================== */}
      <section className="space-y-4">
        <div className={`relative rounded-2xl border shadow-inner ${tk.cardSurface}`}>
          <div className="min-h-[250px] px-4 pt-14 pb-0">
            {filteredBooks.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <p className={`text-sm font-medium ${tk.headingText}`}>
                  {books.length === 0
                    ? lang === 'bn'
                      ? 'আপনার বইয়ের শেল্ফ এখন খালি — নিজের বই যোগ করুন'
                      : 'Your bookshelf is clean and ready — add your own books'
                    : lang === 'bn'
                    ? 'এই ফিল্টারে কোনো বই নেই'
                    : 'No books match your current filter'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBookModal(true)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${tk.primaryBtn}`}
                  >
                    + {t.addBookBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className={`rounded-lg border px-3.5 py-2 text-xs font-medium ${tk.inputSurface}`}
                  >
                    {t.bulkAddBtn}
                  </button>
                </div>
              </div>
            ) : (
              /* CRITICAL: flex-nowrap + overflow-x-auto keeps all spines side-by-side on ONE straight line! */
              <div className="flex flex-nowrap items-end gap-1 overflow-x-auto px-2 pb-0">
                {filteredBooks.map((book) => {
                  const isSelected = selectedBook?.id === book.id;
                  const isHovered = hoveredBookId === book.id;
                  const heightClass =
                    book.title.length > 22
                      ? 'h-56'
                      : book.title.length > 14
                      ? 'h-52'
                      : 'h-48';
                  return (
                    <div
                      key={book.id}
                      className="relative shrink-0"
                      onMouseEnter={() => setHoveredBookId(book.id)}
                      onMouseLeave={() => setHoveredBookId(null)}
                    >
                      {isHovered && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-52 -translate-x-1/2 rounded-xl border border-white/15 bg-[#111113]/95 p-3 text-left text-xs text-white shadow-2xl backdrop-blur-md">
                          <p className="font-display font-semibold leading-snug">{book.title}</p>
                          <p className="mt-0.5 text-[11px] text-zinc-400">
                            {book.author || (lang === 'bn' ? 'অজানা লেখক' : 'Author not set')}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] text-zinc-300">
                            <span>{book.genre}</span>
                            <span>·</span>
                            <span>{book.topic}</span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-1 text-[10px] text-zinc-400">
                            <span>
                              {'★'.repeat(book.rating)}
                              {'☆'.repeat(5 - book.rating)}
                            </span>
                            <span className="font-mono-tabular">
                              {book.currentPage}/{book.totalPages}p
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedBookId(book.id)}
                        className={`group relative flex ${heightClass} w-9 shrink-0 flex-col items-center justify-between rounded-t-sm border-x border-t py-2.5 transition-all duration-200 sm:w-10 ${
                          isSelected
                            ? '-translate-y-2.5 ring-2 ring-current shadow-xl z-10'
                            : 'border-white/20 hover:-translate-y-1.5 shadow-md'
                        }`}
                        style={{
                          backgroundColor: book.coverColor,
                          color: book.textColor,
                          backgroundImage:
                            'linear-gradient(90deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 24%, rgba(0,0,0,0.28) 92%)',
                        }}
                      >
                        <span
                          className="h-1 w-6 rounded-full opacity-85"
                          style={{ backgroundColor: book.spineAccent }}
                        />
                        <span className="book-spine-text my-1.5 max-h-36 overflow-hidden text-ellipsis whitespace-nowrap font-display text-[10px] font-medium tracking-wide">
                          {book.title}
                        </span>
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className="h-0.5 w-5 rounded-full opacity-80"
                            style={{ backgroundColor: book.spineAccent }}
                          />
                          <span className="font-mono-tabular text-[8px] opacity-85">
                            {book.progress}%
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`${tk.shelfLedge} h-4 w-full rounded-b-2xl`} />
        </div>

        {/* Bottom Library Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddBookModal(true)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${tk.primaryBtn}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.addBookBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t.bulkAddBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleBackup}
              title="Download full lossless backup (Books, PDFs, Journals, Images, Routines & Audio)"
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'সম্পূর্ণ ব্যাকআপ' : 'Full Backup'}</span>
            </button>

            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              title="Restore full Archive JSON backup"
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t.restoreBtn}</span>
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept="application/json"
              onChange={handleRestoreFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleRemoveDuplicatesClick}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
            >
              <CopyMinus className="h-3.5 w-3.5" />
              <span>{t.removeDuplicatesBtn}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className={`h-3.5 w-3.5 ${tk.mutedText}`} />
            <span className={`text-xs ${tk.mutedText}`}>{lang === 'bn' ? 'সাজান' : 'Sort'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort books"
              className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
            >
              <option value="newest">{lang === 'bn' ? 'নতুন আগে' : 'Newest'}</option>
              <option value="title">{lang === 'bn' ? 'শিরোনাম (A-Z)' : 'Title A–Z'}</option>
              <option value="author">{lang === 'bn' ? 'লেখক' : 'Author'}</option>
              <option value="rating">{lang === 'bn' ? 'রেটিং' : 'Highest Rated'}</option>
              <option value="progress">{lang === 'bn' ? 'অগ্রগতি' : 'Progress'}</option>
            </select>
          </div>
        </div>

        {/* Selected Book Inspector */}
        {selectedBook && (
          <div className={`grid grid-cols-1 gap-6 rounded-2xl border p-6 lg:grid-cols-12 ${tk.cardSurface}`}>
            <div className="flex flex-col gap-5 sm:flex-row lg:col-span-6">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className="relative flex h-52 w-36 flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm p-3.5 shadow-xl"
                  style={
                    selectedBook.coverImage
                      ? {
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${selectedBook.coverImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          color: '#FFFFFF',
                        }
                      : {
                          backgroundColor: selectedBook.coverColor,
                          color: selectedBook.textColor,
                        }
                  }
                >
                  {!selectedBook.coverImage && (
                    <div
                      className="absolute inset-y-0 left-0 w-2 rounded-l-sm"
                      style={{ backgroundColor: selectedBook.spineAccent }}
                    />
                  )}
                  <div className="pl-1">
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-85">
                      {selectedBook.genre}
                    </span>
                    <h3 className="mt-1.5 font-display text-sm font-medium leading-snug line-clamp-4">
                      {selectedBook.title}
                    </h3>
                  </div>
                  <div className="pl-1">
                    <p className="truncate text-[10px] opacity-85">{selectedBook.topic}</p>
                    <p className="truncate text-[11px] font-medium opacity-95">
                      {selectedBook.author}
                    </p>
                  </div>
                </div>

                <label
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium ${tk.inputSurface}`}
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>{lang === 'bn' ? 'কভার ছবি' : 'Cover Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCoverImageUpload(e, selectedBook)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-1 flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={selectedBook.title}
                      onChange={(e) =>
                        onUpdateBook({ ...selectedBook, title: e.target.value })
                      }
                      aria-label="Book Title"
                      className={`font-display rounded-lg border px-2.5 py-1 text-base font-medium focus:outline-none ${tk.inputSurface}`}
                    />
                    <input
                      type="text"
                      value={selectedBook.author}
                      placeholder={lang === 'bn' ? 'লেখকের নাম লিখুন...' : 'Add author name...'}
                      onChange={(e) =>
                        onUpdateBook({ ...selectedBook, author: e.target.value })
                      }
                      aria-label="Book Author"
                      className={`rounded-lg border px-2.5 py-1 text-xs focus:outline-none ${tk.inputSurface}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={selectedBook.genre}
                      onChange={(e) =>
                        onUpdateBook({ ...selectedBook, genre: e.target.value })
                      }
                      className={`rounded-lg border px-2 py-1 text-xs focus:outline-none ${tk.inputSurface}`}
                    >
                      {genres.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={selectedBook.topic}
                      placeholder={lang === 'bn' ? 'টপিক লিখুন...' : 'Topic / Type...'}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateBook({ ...selectedBook, topic: val });
                        if (val.trim()) onAddTopicToGenre(selectedBook.genre, val.trim());
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs focus:outline-none ${tk.inputSurface}`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            onUpdateBook({
                              ...selectedBook,
                              rating: selectedBook.rating === star ? 0 : star,
                            })
                          }
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= selectedBook.rating
                                ? 'fill-amber-400 text-amber-400'
                                : tk.mutedText
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <select
                      value={selectedBook.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value as ReadingStatus;
                        onUpdateBook({
                          ...selectedBook,
                          status: nextStatus,
                          progress:
                            nextStatus === 'Finished' ? 100 : selectedBook.progress,
                          currentPage:
                            nextStatus === 'Finished'
                              ? selectedBook.totalPages
                              : selectedBook.currentPage,
                        });
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium focus:outline-none ${tk.inputSurface}`}
                    >
                      <option value="Want to read">{t.wantToRead}</option>
                      <option value="Reading">{t.reading}</option>
                      <option value="Finished">{t.finished}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className={`flex items-center justify-between text-xs ${tk.mutedText}`}>
                      <span>{lang === 'bn' ? 'পড়ার অগ্রগতি' : 'Reading Progress'}</span>
                      <span className="font-mono-tabular">
                        {selectedBook.currentPage} / {selectedBook.totalPages}p ({selectedBook.progress}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={selectedBook.totalPages}
                      aria-label="Current page"
                      value={Math.max(1, selectedBook.currentPage)}
                      onChange={(e) => {
                        const cur = Number(e.target.value);
                        const pct = Math.round((cur / selectedBook.totalPages) * 100);
                        onUpdateBook({
                          ...selectedBook,
                          currentPage: cur,
                          progress: pct,
                          status: pct >= 100 ? 'Finished' : cur > 1 ? 'Reading' : selectedBook.status,
                          lastOpenedAt: new Date().toISOString(),
                        });
                      }}
                      className="w-full accent-current"
                    />
                  </div>
                </div>

                {/* Actions including Upgraded Reader Launch */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenBookReader(selectedBook)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold ${tk.primaryBtn}`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {selectedBook.pdfFileId || selectedBook.pdfUrl
                        ? lang === 'bn'
                          ? 'রিডার ও PDF খুলুন'
                          : 'Open Reader & PDF'
                        : lang === 'bn'
                        ? 'বুক রিডার খুলুন'
                        : 'Open Book Reader'}
                    </span>
                  </button>

                  <label
                    className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium ${tk.inputSurface}`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {selectedBook.pdfFileName
                        ? lang === 'bn'
                          ? 'PDF বদলান'
                          : 'Replace PDF'
                        : lang === 'bn'
                        ? 'PDF সংযুক্ত'
                        : 'Attach PDF'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleAttachPdfToBook(selectedBook, e)}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => onStudyBookInTimer(selectedBook)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium ${tk.inputSurface}`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{lang === 'bn' ? 'টাইমারে পড়ুন' : 'Focus Timer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (selectedBook.pdfFileId) {
                        await deletePdfBlob(selectedBook.pdfFileId);
                      }
                      onDeleteBook(selectedBook.id);
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 ${tk.inputSurface}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Cloud PDF URL + Favorite Pages Summary + Study Marginalia */}
            <div
              className={`flex flex-col justify-between space-y-3 border-t pt-4 lg:col-span-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 ${tk.borderSubtle}`}
            >
              <div>
                <label className={`flex items-center gap-1.5 text-xs font-medium ${tk.mutedText}`}>
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>
                    {lang === 'bn'
                      ? 'ক্লাউড PDF লিংক (মোবাইলে দেখার জন্য)'
                      : 'Cloud PDF URL (syncs cleanly to Mobile via Cloud Sync)'}
                  </span>
                </label>
                <input
                  type="url"
                  value={selectedBook.pdfUrl || ''}
                  onChange={(e) =>
                    onUpdateBook({ ...selectedBook, pdfUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/... or direct PDF link"
                  className={`mt-1 w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
                />
                {selectedBook.pdfFileName && (
                  <p className={`mt-1 text-[11px] text-emerald-500`}>
                    ✓ Local PDF attached: {selectedBook.pdfFileName}
                  </p>
                )}
              </div>

              {/* Favorite Pages Quick Bar */}
              {(selectedBook.favoritePages?.length || 0) > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[11px] font-medium ${tk.accentText}`}>
                    ★ Favorite Pages:
                  </span>
                  {selectedBook.favoritePages!.map((fav) => (
                    <button
                      key={fav.page}
                      type="button"
                      onClick={async () => {
                        await handleOpenBookReader(selectedBook);
                        setReaderState((prev) =>
                          prev ? { ...prev, page: fav.page } : prev
                        );
                      }}
                      className={`font-mono-tabular rounded-md border px-2 py-0.5 text-[11px] ${tk.subCardSurface}`}
                    >
                      p.{fav.page} {fav.label !== `Page ${fav.page}` ? `(${fav.label})` : ''}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1">
                <div className={`flex items-center justify-between text-xs ${tk.mutedText}`}>
                  <span className="font-medium">
                    {lang === 'bn' ? 'অধ্যয়নের নোট ও সারাংশ' : 'Notes, Takeaways & Marginalia'}
                  </span>
                  <span>{lang === 'bn' ? 'অটো-সেভড' : 'Auto-saved'}</span>
                </div>
                <textarea
                  rows={4}
                  value={selectedBook.notes}
                  onChange={(e) =>
                    onUpdateBook({
                      ...selectedBook,
                      notes: e.target.value,
                      lastOpenedAt: new Date().toISOString(),
                    })
                  }
                  placeholder={
                    lang === 'bn'
                      ? 'এই বইয়ের গুরুত্বপূর্ণ তথ্য ও উদ্ধৃতি এখানে লিখে রাখুন...'
                      : 'Capture core quotes, takeaways, and exam derivations from this volume...'
                  }
                  className={`mt-1.5 w-full resize-none rounded-xl border p-3 text-xs leading-relaxed focus:outline-none ${tk.inputSurface}`}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==================== ADD BOOK MODAL ==================== */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateBook}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-white/15 bg-[#161618] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">
                {lang === 'bn' ? 'নতুন বই শেল্ফে রাখুন' : 'Add Book to Shelf'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'বইয়ের নাম *' : 'Book Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., History of the Ottomans"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'লেখক (ঐচ্ছিক)' : 'Author (optional)'}
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'জনরা' : 'Genre'}
                </label>
                <select
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'টপিক / টাইপ' : 'Topic / Type (e.g., WWII, Islamic War)'}
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g., Ottoman Empire, WWII"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'অবস্থা' : 'Status'}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReadingStatus)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Want to read">{t.wantToRead}</option>
                  <option value="Reading">{t.reading}</option>
                  <option value="Finished">{t.finished}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'মোট পৃষ্ঠা' : 'Total Pages'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={newPages}
                  onChange={(e) => setNewPages(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-2.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {lang === 'bn' ? 'রেটিং' : 'Rating'}
                </label>
                <div className="mt-2 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(newRating === s ? 0 : s)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 bg-[#0B0B0D] px-3 py-2.5 text-xs text-zinc-200 hover:border-white">
                <ImageIcon className="h-4 w-4" />
                <span>{newCoverImage ? 'Cover Photo Ready ✓' : 'Upload Cover Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverImageUpload(e)}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 bg-[#0B0B0D] px-3 py-2.5 text-xs text-zinc-200 hover:border-white">
                <FileText className="h-4 w-4" />
                <span className="truncate">{newPdfFile ? newPdfFile.name : 'Attach Local PDF'}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewPdfFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                {lang === 'bn' ? 'ক্লাউড PDF লিংক (মোবাইল সিঙ্কের জন্য)' : 'Cloud PDF Link (optional, syncs to Mobile)'}
              </label>
              <input
                type="url"
                value={newPdfUrl}
                onChange={(e) => setNewPdfUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-zinc-300">
                {lang === 'bn' ? 'স্পাইনের রঙ' : 'Spine Binding Color'}
              </span>
              <div className="mt-2 flex items-center gap-2.5">
                {BOOK_BINDINGS.map((b, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewBindingIdx(i)}
                    className={`relative h-8 w-8 overflow-hidden rounded-md border-2 ${
                      newBindingIdx === i ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: b.cover }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-1.5"
                      style={{ backgroundColor: b.spine }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
            >
              {lang === 'bn' ? 'শেল্ফে যোগ করুন' : 'Shelve Book'}
            </button>
          </form>
        </div>
      )}

      {/* ==================== BULK ADD MODAL ==================== */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleBulkSubmit}
            className="w-full max-w-2xl space-y-4 rounded-2xl border border-white/15 bg-[#161618] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">
                {lang === 'bn' ? 'স্মার্ট বাল্ক অ্যাড (সব একসাথে)' : 'Smart Bulk Add Books'}
              </h2>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              {lang === 'bn'
                ? 'Title — Author - Genre - Topic অথবা Title | Author | Genre | Topic ফরম্যাটে পেস্ট করুন:'
                : 'Paste lines in either "Title — Author - Genre - Topic" or "Title | Author | Genre | Topic". Genres & topics organize automatically:'}
            </p>
            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Amazonia — James Rollins - Action Thriller - Amazon Mystery\n1. The Puppet Show — M. W. Craven - Crime Thriller - Investigation`}
              className="w-full rounded-xl border border-white/15 bg-[#0B0B0D] p-3.5 font-mono text-xs text-white focus:outline-none"
            />
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                {lang === 'bn'
                  ? `শনাক্তকৃত বই: ${bulkPreview}টি`
                  : `Detected ${bulkPreview} book(s) ready to shelve`}
              </span>
              <button
                type="submit"
                disabled={bulkPreview === 0}
                className="rounded-lg bg-white px-5 py-2 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {lang === 'bn' ? 'সবগুলো যোগ করুন' : 'Shelve All Books'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== UPGRADED IN-APP READER MODAL (3D FLIP + ZOOM + FAVORITE PAGES) ==================== */}
      {readerState && readerBook && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-3 backdrop-blur-md sm:p-5">
          {/* Reader Top Controls */}
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-white/15 bg-[#161618] px-4 py-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <BookOpen className="h-4 w-4 shrink-0 text-white" />
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-medium sm:text-base">
                  {readerBook.title}
                </h3>
                <p className="font-mono-tabular text-[11px] text-zinc-400">
                  Page {readerState.page} of {readerBook.totalPages}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Page Flip Navigation */}
              <div className="flex items-center rounded-lg border border-white/15 bg-[#0B0B0D]">
                <button
                  type="button"
                  onClick={() => handleReaderPageChange(readerState.page - 1)}
                  disabled={readerState.page <= 1}
                  className="p-1.5 hover:bg-white/10 disabled:opacity-35"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={readerBook.totalPages}
                  value={readerState.page}
                  onChange={(e) => handleReaderPageChange(Number(e.target.value) || 1)}
                  aria-label="Jump to page number"
                  className="font-mono-tabular w-12 bg-transparent text-center text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleReaderPageChange(readerState.page + 1)}
                  disabled={readerState.page >= readerBook.totalPages}
                  className="p-1.5 hover:bg-white/10 disabled:opacity-35"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Zoom Controls (50% - 250%) */}
              <div className="flex items-center rounded-lg border border-white/15 bg-[#0B0B0D]">
                <button
                  type="button"
                  onClick={() =>
                    setReaderState((s) =>
                      s ? { ...s, zoomPercent: Math.max(50, s.zoomPercent - 15) } : s
                    )
                  }
                  className="p-1.5 hover:bg-white/10"
                  aria-label="Zoom out"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono-tabular px-2 text-xs">{readerState.zoomPercent}%</span>
                <button
                  type="button"
                  onClick={() =>
                    setReaderState((s) =>
                      s ? { ...s, zoomPercent: Math.min(250, s.zoomPercent + 15) } : s
                    )
                  }
                  className="p-1.5 hover:bg-white/10"
                  aria-label="Zoom in"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Favorite Current Page */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={favLabelInput}
                  onChange={(e) => setFavLabelInput(e.target.value)}
                  placeholder="Bookmark label..."
                  className="hidden sm:block w-32 rounded-lg border border-white/15 bg-[#0B0B0D] px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleToggleFavoritePage}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    readerBook.favoritePages?.some((f) => f.page === readerState.page)
                      ? 'bg-amber-400 text-black'
                      : 'border border-white/15 bg-[#0B0B0D] text-white hover:bg-white/10'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>
                    {readerBook.favoritePages?.some((f) => f.page === readerState.page)
                      ? 'Favorited'
                      : 'Favorite Page'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseReader}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Reader Body: Sidebar Favorite Pages + 3D Flipping PDF / Study Canvas */}
          <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-b-2xl border-x border-b border-white/15 bg-[#121215]">
            {/* Favorite Pages Bookmarks Drawer */}
            <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#141418] p-4 text-white md:flex">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span>Favorite Pages ({readerBook.favoritePages?.length || 0})</span>
              </p>
              <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto">
                {(!readerBook.favoritePages || readerBook.favoritePages.length === 0) ? (
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    Click &ldquo;Favorite Page&rdquo; above to pin key pages or exam formulas.
                  </p>
                ) : (
                  readerBook.favoritePages.map((fav) => (
                    <div
                      key={fav.page}
                      className={`flex items-center justify-between gap-1 rounded-lg border px-2.5 py-2 text-xs ${
                        readerState.page === fav.page
                          ? 'border-white bg-white/15 text-white'
                          : 'border-white/10 bg-[#0B0B0D] text-zinc-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleReaderPageChange(fav.page)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="font-mono-tabular font-semibold text-amber-400">
                          p.{fav.page}
                        </span>
                        <span className="block truncate text-[11px]">{fav.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateBook({
                            ...readerBook,
                            favoritePages: (readerBook.favoritePages || []).filter(
                              (f) => f.page !== fav.page
                            ),
                          })
                        }
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* 3D Animated Page Surface */}
            <div className="book-perspective flex-1 overflow-auto bg-[#0D0D10] p-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${readerBook.id}-p${readerState.page}`}
                  initial={{ opacity: 0, rotateY: readerState.flipDir * 14 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: readerState.flipDir * -14 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    transform: `scale(${readerState.zoomPercent / 100})`,
                    transformOrigin: 'top center',
                    transformStyle: 'preserve-3d',
                  }}
                  className="mx-auto h-full min-h-[540px] w-full max-w-4xl overflow-hidden rounded-xl bg-white text-black shadow-2xl"
                >
                  {readerState.pdfUrl ? (
                    <iframe
                      src={`${readerState.pdfUrl}#page=${readerState.page}&zoom=${readerState.zoomPercent}`}
                      title={readerBook.title}
                      className="h-full min-h-[600px] w-full"
                    />
                  ) : (
                    <div className="flex h-full min-h-[540px] flex-col justify-between p-8 sm:p-12">
                      <div className="flex items-center justify-between border-b border-black/10 pb-3 text-xs text-zinc-500">
                        <span>{readerBook.title}</span>
                        <span className="font-mono-tabular">
                          Page {readerState.page} / {readerBook.totalPages}
                        </span>
                      </div>
                      <div className="my-6 flex-1 space-y-4">
                        <h4 className="font-display text-xl font-medium">
                          Reading Companion · {readerBook.genre} ({readerBook.topic})
                        </h4>
                        <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                          {readerBook.notes ||
                            'Attach a local PDF or paste a Cloud PDF URL in the book details to view full pages here. Use the notes panel or bookmark Favorite Pages anytime.'}
                        </p>
                      </div>
                      <div className="border-t border-black/10 pt-3 text-center text-[11px] text-zinc-400">
                        Archive Reader · Made by Al Tahjib Noor Raiyan
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
