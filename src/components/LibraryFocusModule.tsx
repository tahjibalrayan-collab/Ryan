import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  BookOpen,
  Check,
  Clock,
  Cloud,
  CopyMinus,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Moon,
  Music2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Star,
  Sun,
  Trash2,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import { WALLPAPER_PRESETS } from '../data/seedData';
import {
  AppTheme,
  Language,
  LibraryBook,
  ReadingStatus,
  WallpaperPreset,
} from '../types';
import { AMBIENT_TRACKS, AmbientTrackId } from '../utils/audioEngine';
import { deletePdfBlob, loadPdfObjectUrl, savePdfBlob } from '../utils/pdfStorage';

interface LibraryFocusModuleProps {
  lang: Language;
  theme: AppTheme;
  onToggleTheme: () => void;
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
  onSyncNow: () => Promise<void>;
  onPullFromServer: () => Promise<void>;
  isMusicPlaying: boolean;
  activeTrackId: AmbientTrackId;
  musicVolume: number;
  onToggleMusic: () => void;
  onSelectTrack: (id: AmbientTrackId) => void;
  onChangeVolume: (vol: number) => void;
  activeWallpaperId: string;
  onSelectWallpaper: (id: string) => void;
  customWallpaper: string | null;
  onUploadCustomWallpaper: (dataUrl: string) => void;
  backdropDimming: number;
  onChangeBackdropDimming: (val: number) => void;
}

const BOOK_BINDINGS = [
  { cover: '#6B1D3B', spine: '#E2C08D' },
  { cover: '#1D4E5F', spine: '#F2C572' },
  { cover: '#2B4C7E', spine: '#C5D8F0' },
  { cover: '#2E5339', spine: '#D4B483' },
  { cover: '#7A3E26', spine: '#F3D2B3' },
  { cover: '#4B3869', spine: '#E0C3FC' },
  { cover: '#2D2A22', spine: '#D4A359' },
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
    // Remove optional leading list numbering like "1. " or "12) "
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
      // Format: Title — Author - Genre - Topic
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
      currentPage: 0,
      totalPages: 300,
      progress: 0,
      notes: '',
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
  onToggleTheme,
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
  isMusicPlaying,
  activeTrackId,
  musicVolume,
  onToggleMusic,
  onSelectTrack,
  onChangeVolume,
  activeWallpaperId,
  onSelectWallpaper,
  customWallpaper,
  onUploadCustomWallpaper,
  backdropDimming,
  onChangeBackdropDimming,
}) => {
  const t = UI_TEXT[lang];
  const isPaper = theme === 'paper';

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

  // PDF Reader modal state
  const [activePdfModal, setActivePdfModal] = useState<{
    title: string;
    url: string;
    isBlob: boolean;
  } | null>(null);

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

  // All topics inside the currently selected genre (combining defaults + books)
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

  const bulkPreview = useMemo(
    () => (bulkText.trim() ? parseBulkLines(bulkText, books.length).parsedBooks.length : 0),
    [bulkText, books.length]
  );

  const allWallpapers: WallpaperPreset[] = useMemo(() => {
    const list = [...WALLPAPER_PRESETS];
    if (customWallpaper) {
      list.push({
        id: 'custom-upload',
        name: 'Custom Photo',
        nameBn: 'কাস্টম ফটো',
        type: 'image',
        value: customWallpaper,
        category: 'Uploaded',
      });
    }
    return list;
  }, [customWallpaper]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const binding = BOOK_BINDINGS[newBindingIdx];
    const total = Math.max(1, parseInt(newPages, 10) || 300);
    const current = newStatus === 'Finished' ? total : 0;
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
        : `${parsedBooks.length} books shelved with genres & topics.`
    );
  };

  const handleOpenBookPdf = async (book: LibraryBook) => {
    if (book.pdfFileId) {
      const blobUrl = await loadPdfObjectUrl(book.pdfFileId);
      if (blobUrl) {
        setActivePdfModal({ title: book.title, url: blobUrl, isBlob: true });
        return;
      }
    }
    if (book.pdfUrl) {
      setActivePdfModal({ title: book.title, url: book.pdfUrl, isBlob: false });
      return;
    }
    showToast(
      lang === 'bn'
        ? 'এই বইয়ে কোনো পিডিএফ যুক্ত নেই। নিচ থেকে পিডিএফ যোগ করুন।'
        : 'No PDF attached yet. Attach a PDF file or link in the book details below.'
    );
  };

  const handleClosePdfModal = () => {
    if (activePdfModal?.isBlob) {
      URL.revokeObjectURL(activePdfModal.url);
    }
    setActivePdfModal(null);
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

  const handleBackup = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), books }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-archive-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'bn' ? 'ব্যাকআপ ডাউনলোড হয়েছে।' : 'Library backup downloaded.');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const restoredList: LibraryBook[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.books)
          ? parsed.books
          : [];
        if (restoredList.length > 0) {
          onRestoreBooks(restoredList);
          showToast(
            lang === 'bn'
              ? `${restoredList.length}টি বই রিস্টোর করা হয়েছে।`
              : `Restored ${restoredList.length} books.`
          );
        }
      } catch {
        showToast(lang === 'bn' ? 'ভুল ব্যাকআপ ফাইল।' : 'Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCustomWallpaper(reader.result);
        onSelectWallpaper('custom-upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const activeTrack =
    AMBIENT_TRACKS.find((tItem) => tItem.id === activeTrackId) ?? AMBIENT_TRACKS[0];

  const cardSurface = isPaper
    ? 'border-[#D5CFC2] bg-white text-[#1E1B18] shadow-sm'
    : 'border-white/8 bg-[#16181D] text-[#F4F2ED]';
  const inputSurface = isPaper
    ? 'border-[#CFC8BA] bg-white text-[#1E1B18] placeholder:text-[#888072]'
    : 'border-white/10 bg-[#111215] text-[#F4F2ED] placeholder:text-[#5F6573]';
  const mutedText = isPaper ? 'text-[#665E52]' : 'text-[#9CA3AF]';
  const headingText = isPaper ? 'text-[#1E1B18]' : 'text-[#F4F2ED]';
  const accentText = isPaper ? 'text-[#8D5B16]' : 'text-[#D4A359]';
  const activeBtnClass = isPaper
    ? 'bg-[#1D355E] text-white border-[#1D355E]'
    : 'bg-[#D4A359] text-[#111215] border-[#D4A359]';

  return (
    <div className="space-y-10">
      {/* Centered Masthead with Prominent Creator Name */}
      <section className="flex flex-col items-center text-center">
        <h1 className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${headingText}`}>
          {t.brand}
        </h1>
        <p className={`mt-2 font-display text-lg font-medium italic sm:text-xl ${accentText}`}>
          Made by Alta Hajib Nur Raiyan
        </p>

        {/* Sync & Theme Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${inputSurface}`}
          >
            <Cloud className={`h-3.5 w-3.5 ${isSyncedOnline ? 'text-emerald-500' : mutedText}`} />
            <span>
              {isSyncing
                ? lang === 'bn'
                  ? 'সিঙ্ক হচ্ছে...'
                  : 'Syncing...'
                : lang === 'bn'
                ? 'ক্লাউড সিঙ্ক করুন (PC ↔ Mobile)'
                : 'Sync to Cloud (PC ↔ Mobile)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onPullFromServer}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${inputSurface}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{lang === 'bn' ? 'ক্লাউড থেকে লোড' : 'Load from Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 font-medium transition-colors ${inputSurface}`}
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

        {lastSyncedAt && (
          <p className={`mt-1.5 text-[11px] ${mutedText}`}>
            {lang === 'bn' ? 'সর্বশেষ সিঙ্ক:' : 'Last synced:'}{' '}
            {new Date(lastSyncedAt).toLocaleTimeString()}
          </p>
        )}

        {/* Stats */}
        <div className={`font-mono-tabular mt-4 text-xs ${mutedText}`}>
          {stats.total} {lang === 'bn' ? 'টি বই' : 'volumes'} · {stats.reading}{' '}
          {lang === 'bn' ? 'পড়ছি' : 'reading'} · {stats.toRead}{' '}
          {lang === 'bn' ? 'পড়তে চাই' : 'to read'} · {stats.finished}{' '}
          {lang === 'bn' ? 'শেষ' : 'finished'}
        </div>

        {/* Search */}
        <div className="relative mt-4 w-full max-w-xl">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchLibraryPlaceholder}
            className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm shadow-sm focus:outline-none ${inputSurface}`}
          />
        </div>

        {/* Genre Filter Row */}
        <div className="mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setGenreFilter('All')}
            className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              genreFilter === 'All'
                ? activeBtnClass
                : isPaper
                ? 'border-[#CFC8BA] bg-white text-[#453F36] hover:bg-[#F3F0EA]'
                : 'border-white/10 bg-[#181A20] text-[#B5BAC6] hover:border-white/25'
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
                  active
                    ? activeBtnClass
                    : isPaper
                    ? 'border-[#CFC8BA] bg-white text-[#453F36] hover:bg-[#F3F0EA]'
                    : 'border-white/10 bg-[#181A20] text-[#B5BAC6] hover:border-white/25'
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
                className={`w-32 rounded-lg border px-2.5 py-1 text-xs focus:outline-none ${inputSurface}`}
              />
              <button
                type="submit"
                className="rounded-lg bg-[#D4A359] px-2.5 py-1 text-xs font-semibold text-[#111215]"
              >
                +
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddGenreInput(true)}
              className={`whitespace-nowrap rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${
                isPaper
                  ? 'border-[#ABA292] text-[#544D42] hover:border-[#1D355E]'
                  : 'border-white/20 text-[#9CA3AF] hover:border-white/40 hover:text-white'
              }`}
            >
              + {lang === 'bn' ? 'জনরা' : 'Genre'}
            </button>
          )}
        </div>

        {/* Sub-Topics / Types inside Selected Genre (e.g., History -> Islamic War, Ottoman Empire, WWII) */}
        {genreFilter !== 'All' && (
          <div
            className={`mt-3 flex max-w-4xl flex-wrap items-center justify-center gap-2 rounded-xl border px-4 py-2.5 ${
              isPaper
                ? 'border-[#D5CFC2] bg-[#F5F2EB]'
                : 'border-white/10 bg-[#15171D]'
            }`}
          >
            <span className={`text-[11px] font-semibold ${accentText}`}>
              {genreFilter} {lang === 'bn' ? 'টপিক/টাইপ:' : 'Topics / Types:'}
            </span>

            <button
              type="button"
              onClick={() => setTopicFilter('All')}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                topicFilter === 'All' ? activeBtnClass : inputSurface
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
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active ? activeBtnClass : inputSurface
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
                  className={`w-36 rounded-md border px-2 py-1 text-[11px] focus:outline-none ${inputSurface}`}
                />
                <button
                  type="submit"
                  className="rounded-md bg-[#D4A359] px-2 py-1 text-[11px] font-semibold text-[#111215]"
                >
                  +
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTopicInput(true)}
                className={`rounded-md border border-dashed px-2.5 py-1 text-[11px] font-medium ${
                  isPaper
                    ? 'border-[#ABA292] text-[#544D42]'
                    : 'border-white/20 text-[#9CA3AF]'
                }`}
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
                  active
                    ? activeBtnClass
                    : isPaper
                    ? 'border-[#CFC8BA] bg-white text-[#453F36] hover:bg-[#F3F0EA]'
                    : 'border-white/10 bg-[#181A20] text-[#B5BAC6] hover:border-white/25'
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
        <div className="mx-auto max-w-xl rounded-xl border border-[#D4A359]/40 bg-[#D4A359]/15 px-4 py-2.5 text-center text-xs font-medium">
          {statusToast}
        </div>
      )}

      {/* Realistic Spine Bookshelf + Hover Info Card */}
      <section className="space-y-4">
        <div
          className={`relative overflow-visible rounded-2xl border shadow-[inset_0_16px_42px_rgba(0,0,0,0.35)] ${
            isPaper
              ? 'border-[#C9C1B2] bg-gradient-to-b from-[#DFD8CA] via-[#EAE4D7] to-[#D7CFC0]'
              : 'border-white/10 bg-gradient-to-b from-[#101116] via-[#171920] to-[#121318]'
          }`}
        >
          <div className="min-h-[250px] px-6 pt-12 pb-0">
            {filteredBooks.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <p className={`text-sm font-medium ${headingText}`}>
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
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${activeBtnClass}`}
                  >
                    + {t.addBookBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className={`rounded-lg border px-3.5 py-2 text-xs font-medium ${inputSurface}`}
                  >
                    {t.bulkAddBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3 px-2">
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
                      className="relative"
                      onMouseEnter={() => setHoveredBookId(book.id)}
                      onMouseLeave={() => setHoveredBookId(null)}
                    >
                      {/* Hover Preview Card (Shows Author, Genre, Topic, Rating, Pages on Hover) */}
                      {isHovered && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 w-56 -translate-x-1/2 rounded-xl border border-white/15 bg-[#1C1E24]/95 p-3 text-left text-xs text-[#F4F2ED] shadow-2xl backdrop-blur-md">
                          <p className="font-display font-semibold leading-snug">{book.title}</p>
                          <p className="mt-0.5 text-[11px] text-[#B5BAC6]">
                            {book.author || (lang === 'bn' ? 'অজানা লেখক' : 'Author not set')}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-[#D4A359]">
                            <span>{book.genre}</span>
                            <span>·</span>
                            <span>{book.topic}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5 text-[10px] text-[#9CA3AF]">
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
                        className={`group relative flex ${heightClass} w-12 shrink-0 flex-col items-center justify-between rounded-t-sm border-x border-t py-3 transition-all duration-200 sm:w-14 ${
                          isSelected
                            ? '-translate-y-3 border-[#D4A359] shadow-[0_14px_24px_rgba(0,0,0,0.55)] ring-2 ring-[#D4A359]'
                            : 'border-white/20 hover:-translate-y-2 shadow-[4px_0_12px_rgba(0,0,0,0.35)]'
                        }`}
                        style={{
                          backgroundColor: book.coverColor,
                          color: book.textColor,
                          backgroundImage:
                            'linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 24%, rgba(0,0,0,0.28) 92%)',
                        }}
                      >
                        <span
                          className="h-1 w-8 rounded-full opacity-85"
                          style={{ backgroundColor: book.spineAccent }}
                        />
                        <span className="book-spine-text my-2 max-h-36 overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-medium tracking-wide">
                          {book.title}
                        </span>
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="h-1 w-7 rounded-full opacity-80"
                            style={{ backgroundColor: book.spineAccent }}
                          />
                          <span className="font-mono-tabular text-[9px] opacity-85">
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

          <div className={`${isPaper ? 'shelf-ledge-light' : 'shelf-ledge'} h-5 w-full rounded-b-2xl`} />
        </div>

        {/* Bottom Library Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddBookModal(true)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${activeBtnClass}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.addBookBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${inputSurface}`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t.bulkAddBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleBackup}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${inputSurface}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.backupBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${inputSurface}`}
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
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${inputSurface}`}
            >
              <CopyMinus className="h-3.5 w-3.5" />
              <span>{t.removeDuplicatesBtn}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className={`h-3.5 w-3.5 ${mutedText}`} />
            <span className={`text-xs ${mutedText}`}>{lang === 'bn' ? 'সাজান' : 'Sort'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort books"
              className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${inputSurface}`}
            >
              <option value="newest">{lang === 'bn' ? 'নতুন আগে' : 'Newest'}</option>
              <option value="title">{lang === 'bn' ? 'শিরোনাম (A-Z)' : 'Title A–Z'}</option>
              <option value="author">{lang === 'bn' ? 'লেখক' : 'Author'}</option>
              <option value="rating">{lang === 'bn' ? 'রেটিং' : 'Highest Rated'}</option>
              <option value="progress">{lang === 'bn' ? 'অগ্রগতি' : 'Progress'}</option>
            </select>
          </div>
        </div>

        {/* Selected Book Full Editor & PDF Reader Inspector */}
        {selectedBook && (
          <div className={`grid grid-cols-1 gap-6 rounded-2xl border p-6 lg:grid-cols-12 ${cardSurface}`}>
            <div className="flex flex-col gap-5 sm:flex-row lg:col-span-6">
              {/* Cover Visual + Upload Cover Photo */}
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
                      className="absolute inset-y-0 left-0 w-2.5 rounded-l-sm"
                      style={{ backgroundColor: selectedBook.spineAccent }}
                    />
                  )}
                  <div className="pl-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-85">
                      {selectedBook.genre}
                    </span>
                    <p className="mt-1.5 line-clamp-4 font-display text-sm font-medium leading-snug">
                      {selectedBook.title}
                    </p>
                  </div>
                  <p className="pl-1.5 text-[10px] opacity-90">
                    {selectedBook.author || (lang === 'bn' ? 'লেখক যোগ করুন' : 'No author yet')}
                  </p>
                </div>

                <label
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium ${inputSurface}`}
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

              {/* Editable Title, Author, Genre, Topic, Rating, Pages */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={selectedBook.title}
                    onChange={(e) =>
                      onUpdateBook({
                        ...selectedBook,
                        title: e.target.value,
                        lastOpenedAt: new Date().toISOString(),
                      })
                    }
                    aria-label="Edit book title"
                    className={`w-full rounded-lg border px-2.5 py-1 font-display text-lg font-medium focus:outline-none ${inputSurface}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBook.pdfFileId) {
                        deletePdfBlob(selectedBook.pdfFileId).catch(() => {});
                      }
                      onDeleteBook(selectedBook.id);
                    }}
                    title={lang === 'bn' ? 'বইটি ডিলিট করুন' : 'Delete Book'}
                    aria-label={`Delete ${selectedBook.title}`}
                    className="rounded-lg p-2 text-[#717786] hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Editable Author */}
                <div>
                  <label className={`block text-[11px] font-medium ${mutedText}`}>
                    {lang === 'bn' ? 'লেখকের নাম (যেকোনো সময় এডিট করুন)' : 'Author Name'}
                  </label>
                  <input
                    type="text"
                    value={selectedBook.author}
                    placeholder={lang === 'bn' ? 'লেখকের নাম লিখুন...' : 'Add or edit author...'}
                    onChange={(e) =>
                      onUpdateBook({
                        ...selectedBook,
                        author: e.target.value,
                        lastOpenedAt: new Date().toISOString(),
                      })
                    }
                    className={`mt-1 w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${inputSurface}`}
                  />
                </div>

                {/* Genre & Topic Editors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-medium ${mutedText}`}>
                      {lang === 'bn' ? 'জনরা' : 'Genre'}
                    </label>
                    <select
                      value={selectedBook.genre}
                      onChange={(e) =>
                        onUpdateBook({
                          ...selectedBook,
                          genre: e.target.value,
                          lastOpenedAt: new Date().toISOString(),
                        })
                      }
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none ${inputSurface}`}
                    >
                      {genres.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium ${mutedText}`}>
                      {lang === 'bn' ? 'টপিক / টাইপ' : 'Topic / Type'}
                    </label>
                    <input
                      type="text"
                      value={selectedBook.topic}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateBook({
                          ...selectedBook,
                          topic: val,
                          lastOpenedAt: new Date().toISOString(),
                        });
                      }}
                      onBlur={() => {
                        if (selectedBook.topic.trim()) {
                          onAddTopicToGenre(selectedBook.genre, selectedBook.topic.trim());
                        }
                      }}
                      placeholder="e.g., Ottoman Empire"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none ${inputSurface}`}
                    />
                  </div>
                </div>

                {/* Status + Star Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {(['Want to read', 'Reading', 'Finished'] as ReadingStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          const total = Math.max(1, selectedBook.totalPages);
                          const current =
                            st === 'Finished'
                              ? total
                              : st === 'Want to read'
                              ? 0
                              : Math.max(1, selectedBook.currentPage);
                          onUpdateBook({
                            ...selectedBook,
                            status: st,
                            currentPage: current,
                            progress: Math.round((current / total) * 100),
                            lastOpenedAt: new Date().toISOString(),
                          });
                        }}
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          selectedBook.status === st ? activeBtnClass : inputSurface
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Interactive 5-Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          onUpdateBook({
                            ...selectedBook,
                            rating: selectedBook.rating === star ? 0 : star,
                            lastOpenedAt: new Date().toISOString(),
                          })
                        }
                        aria-label={`Rate ${star} stars`}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            star <= selectedBook.rating
                              ? 'fill-[#D4A359] text-[#D4A359]'
                              : mutedText
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exact Current Page / Total Pages */}
                <div className="grid grid-cols-3 items-center gap-2 pt-1">
                  <div>
                    <label className={`block text-[10px] ${mutedText}`}>
                      {lang === 'bn' ? 'পড়া হয়েছে (পৃষ্ঠা)' : 'Current Page'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={selectedBook.totalPages}
                      value={selectedBook.currentPage}
                      onChange={(e) => {
                        const total = Math.max(1, selectedBook.totalPages);
                        const cur = Math.max(0, Math.min(total, Number(e.target.value) || 0));
                        const pct = Math.round((cur / total) * 100);
                        onUpdateBook({
                          ...selectedBook,
                          currentPage: cur,
                          progress: pct,
                          status:
                            pct === 100 ? 'Finished' : cur > 0 ? 'Reading' : 'Want to read',
                          lastOpenedAt: new Date().toISOString(),
                        });
                      }}
                      className={`font-mono-tabular mt-0.5 w-full rounded-lg border px-2 py-1 text-xs focus:outline-none ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] ${mutedText}`}>
                      {lang === 'bn' ? 'মোট পৃষ্ঠা' : 'Total Pages'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={selectedBook.totalPages}
                      onChange={(e) => {
                        const total = Math.max(1, Number(e.target.value) || 1);
                        const cur = Math.min(total, selectedBook.currentPage);
                        onUpdateBook({
                          ...selectedBook,
                          totalPages: total,
                          currentPage: cur,
                          progress: Math.round((cur / total) * 100),
                          lastOpenedAt: new Date().toISOString(),
                        });
                      }}
                      className={`font-mono-tabular mt-0.5 w-full rounded-lg border px-2 py-1 text-xs focus:outline-none ${inputSurface}`}
                    />
                  </div>
                  <div className="pt-4 text-right">
                    <span className={`font-mono-tabular text-xs font-semibold ${accentText}`}>
                      {selectedBook.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Half: PDF Attachment/Reader + Marginalia Notes */}
            <div
              className={`space-y-4 border-t pt-4 lg:col-span-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 ${
                isPaper ? 'border-[#D5CFC2]' : 'border-white/8'
              }`}
            >
              {/* PDF Controls */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${
                  isPaper ? 'border-[#D5CFC2] bg-[#F7F5F0]' : 'border-white/8 bg-[#121419]'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${headingText}`}>
                    {lang === 'bn' ? 'পিডিএফ বই / ফাইল' : 'PDF Document'}
                  </p>
                  <p className={`truncate text-[11px] ${mutedText}`}>
                    {selectedBook.pdfFileName ||
                      selectedBook.pdfUrl ||
                      (lang === 'bn'
                        ? 'কোনো পিডিএফ যুক্ত করা হয়নি'
                        : 'No local PDF or link attached')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(selectedBook.pdfFileId || selectedBook.pdfUrl) && (
                    <button
                      type="button"
                      onClick={() => handleOpenBookPdf(selectedBook)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${activeBtnClass}`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{lang === 'bn' ? 'পিডিএফ খুলুন' : 'Open PDF'}</span>
                    </button>
                  )}

                  <label
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${inputSurface}`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{lang === 'bn' ? 'পিডিএফ ফাইল' : 'Attach PDF'}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleAttachPdfToBook(selectedBook, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cloud PDF Link for Cross-Device Mobile Access */}
              <div className="flex items-center gap-2">
                <LinkIcon className={`h-3.5 w-3.5 shrink-0 ${mutedText}`} />
                <input
                  type="url"
                  value={selectedBook.pdfUrl || ''}
                  onChange={(e) =>
                    onUpdateBook({
                      ...selectedBook,
                      pdfUrl: e.target.value,
                      lastOpenedAt: new Date().toISOString(),
                    })
                  }
                  placeholder={
                    lang === 'bn'
                      ? 'মোবাইল ও পিসিতে একসাথে পেতে ক্লাউড পিডিএফ লিংক (Drive/URL) দিন...'
                      : 'Optional cloud PDF URL (Google Drive / web link for PC & Mobile sync)...'
                  }
                  className={`w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${inputSurface}`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="library-notes" className={`text-xs font-medium ${mutedText}`}>
                    {lang === 'bn' ? 'বইয়ের নোট ও সারাংশ' : 'Reading Notes & Marginalia'}
                  </label>
                  <button
                    type="button"
                    onClick={() => onStudyBookInTimer(selectedBook)}
                    className={`inline-flex items-center gap-1 text-xs font-medium ${accentText} hover:underline`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{lang === 'bn' ? 'টাইমারে পড়ুন' : 'Read in Timer'}</span>
                  </button>
                </div>
                <textarea
                  id="library-notes"
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
                      ? 'গুরুত্বপূর্ণ অধ্যায়, উদ্ধৃতি বা সারাংশ লিখুন...'
                      : 'Capture key quotes, chapters, or takeaways...'
                  }
                  className={`mt-1.5 w-full resize-none rounded-xl border p-3 text-sm leading-relaxed focus:outline-none ${inputSurface}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Serial Book Catalog Cards Below Shelf (Shows filtered Want to Read / Reading / Finished books cleanly) */}
        {filteredBooks.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className={`text-sm font-semibold ${headingText}`}>
              {lang === 'bn'
                ? `বইয়ের তালিকা (${filteredBooks.length})`
                : `Shelved Catalog (${filteredBooks.length})`}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook?.id === book.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => setSelectedBookId(book.id)}
                    className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? isPaper
                          ? 'border-[#1D355E] bg-[#F5F3EE] ring-1 ring-[#1D355E]'
                          : 'border-[#D4A359] bg-[#1E2129]'
                        : `${cardSurface} hover:border-[#D4A359]/50`
                    }`}
                  >
                    {/* Mini Cover */}
                    <div
                      className="relative h-16 w-12 shrink-0 overflow-hidden rounded-r-md rounded-l-xs shadow"
                      style={
                        book.coverImage
                          ? {
                              backgroundImage: `url(${book.coverImage})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : { backgroundColor: book.coverColor }
                      }
                    >
                      {!book.coverImage && (
                        <span
                          className="absolute inset-y-0 left-0 w-1.5"
                          style={{ backgroundColor: book.spineAccent }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-display text-sm font-semibold ${headingText}`}>
                        {book.title}
                      </p>
                      <p className={`truncate text-xs ${mutedText}`}>
                        {book.author || (lang === 'bn' ? 'লেখক যোগ করুন (ক্লিক)' : 'Click to add author')}
                      </p>
                      <div className={`mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] ${mutedText}`}>
                        <span className={accentText}>{book.genre}</span>
                        <span>·</span>
                        <span className="truncate">{book.topic}</span>
                      </div>
                      <div className={`mt-1.5 flex items-center justify-between text-[11px] ${mutedText}`}>
                        <span className="text-[#D4A359]">
                          {'★'.repeat(book.rating)}
                          {'☆'.repeat(5 - book.rating)}
                        </span>
                        <span className="font-mono-tabular">
                          {book.currentPage}/{book.totalPages}p · {book.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Ambient Focus Music Player & Wallpaper Studio */}
      <section
        className={`grid grid-cols-1 gap-8 border-t pt-10 lg:grid-cols-12 ${
          isPaper ? 'border-[#D5CFC2]' : 'border-white/8'
        }`}
      >
        <div className={`space-y-5 rounded-2xl border p-6 lg:col-span-6 ${cardSurface}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Music2 className={`h-4 w-4 ${accentText}`} />
              <div>
                <h2 className={`text-base font-medium ${headingText}`}>{t.ambientTitle}</h2>
                <p className={`text-xs ${mutedText}`}>{t.ambientDesc}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleMusic}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                isMusicPlaying ? activeBtnClass : inputSurface
              }`}
            >
              {isMusicPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'বিরতি' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? 'চালু করুন' : 'Play Focus Audio'}</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`divide-y rounded-xl border ${
              isPaper
                ? 'divide-[#D5CFC2] border-[#D5CFC2] bg-[#FAF9F6]'
                : 'divide-white/8 border-white/8 bg-[#111215]'
            }`}
          >
            {AMBIENT_TRACKS.map((track) => {
              const isSelected = activeTrackId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onSelectTrack(track.id)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? isPaper
                        ? 'bg-[#EFECE4]'
                        : 'bg-[#1C1F27]'
                      : 'hover:bg-black/[0.03]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? accentText : headingText}`}>
                      {track.title}
                    </p>
                    <p className={`truncate text-xs ${mutedText}`}>{track.subtitle}</p>
                  </div>
                  <span className={`font-mono-tabular shrink-0 text-[11px] ${mutedText}`}>
                    {isSelected && isMusicPlaying
                      ? lang === 'bn'
                        ? 'চলছে'
                        : 'Playing'
                      : track.durationLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <Volume2 className={`h-4 w-4 shrink-0 ${mutedText}`} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              aria-label="Ambient volume"
              value={musicVolume}
              onChange={(e) => onChangeVolume(Number(e.target.value))}
              className="w-full accent-[#D4A359]"
            />
            <span className={`font-mono-tabular w-12 text-right text-xs ${mutedText}`}>
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
          <p className={`text-xs ${mutedText}`}>
            {lang === 'bn' ? 'বর্তমান ট্র্যাক:' : 'Active channel:'}{' '}
            <span className={headingText}>{activeTrack.title}</span>
          </p>
        </div>

        <div className={`space-y-5 rounded-2xl border p-6 lg:col-span-6 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ImageIcon className={`h-4 w-4 ${accentText}`} />
              <div>
                <h2 className={`text-base font-medium ${headingText}`}>{t.wallpaperTitle}</h2>
                <p className={`text-xs ${mutedText}`}>{t.wallpaperDesc}</p>
              </div>
            </div>

            <label
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${inputSurface}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t.uploadPhoto}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {allWallpapers.map((preset) => {
              const selected = activeWallpaperId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectWallpaper(preset.id)}
                  className={`group overflow-hidden rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-[#D4A359] ring-1 ring-[#D4A359]/60'
                      : isPaper
                      ? 'border-[#D5CFC2]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div
                    className="h-20 w-full transition-transform duration-300 group-hover:scale-105"
                    style={
                      preset.type === 'image'
                        ? {
                            backgroundImage: `url(${preset.value})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : { background: preset.value }
                    }
                  />
                  <div className={isPaper ? 'bg-[#FAF9F6] px-2.5 py-2' : 'bg-[#111215] px-2.5 py-2'}>
                    <p className={`truncate text-xs font-medium ${headingText}`}>
                      {lang === 'bn' ? preset.nameBn : preset.name}
                    </p>
                    <p className={`text-[10px] ${mutedText}`}>{preset.category}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className={`space-y-2 border-t pt-4 ${
              isPaper ? 'border-[#D5CFC2]' : 'border-white/8'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={mutedText}>
                {lang === 'bn' ? 'ব্যাকগ্রাউন্ড ডার্কনেস (মিডনাইট মোড)' : 'Midnight Scrim Opacity'}
              </span>
              <span className="font-mono-tabular">{Math.round(backdropDimming * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.35}
              max={0.95}
              step={0.05}
              aria-label="Backdrop darkness"
              value={backdropDimming}
              onChange={(e) => onChangeBackdropDimming(Number(e.target.value))}
              className="w-full accent-[#D4A359]"
            />
          </div>
        </div>
      </section>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateBook}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-[#181A1F] p-6 text-[#F4F2ED] shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">
                {lang === 'bn' ? 'নতুন বই শেল্ফে রাখুন' : 'Add Book to Shelf'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="text-xs text-[#8D93A1] hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'বইয়ের নাম *' : 'Book Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., History of the Ottomans"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'লেখক (খালি রাখতে পারেন)' : 'Author (optional, editable later)'}
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'জনরা' : 'Genre'}
                </label>
                <select
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'টপিক / টাইপ (যেমন: Ottoman Empire)' : 'Topic / Type (e.g., WWII, Islamic War)'}
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g., Ottoman Empire, World War II"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'অবস্থা' : 'Status'}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReadingStatus)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-2.5 py-2 text-xs text-white focus:border-[#D4A359] focus:outline-none"
                >
                  <option value="Want to read">{t.wantToRead}</option>
                  <option value="Reading">{t.reading}</option>
                  <option value="Finished">{t.finished}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'মোট পৃষ্ঠা' : 'Total Pages'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={newPages}
                  onChange={(e) => setNewPages(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-2.5 py-2 text-xs text-white focus:border-[#D4A359] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#B5BAC6]">
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
                          s <= newRating ? 'fill-[#D4A359] text-[#D4A359]' : 'text-[#5F6573]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cover Image + PDF Upload / Link */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#111215] px-3 py-2.5 text-xs text-[#D1D5DB] hover:border-[#D4A359]">
                <ImageIcon className="h-4 w-4 text-[#D4A359]" />
                <span>{newCoverImage ? 'Cover Photo Ready ✓' : 'Upload Cover Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverImageUpload(e)}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#111215] px-3 py-2.5 text-xs text-[#D1D5DB] hover:border-[#D4A359]">
                <FileText className="h-4 w-4 text-[#D4A359]" />
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
              <label className="block text-xs font-medium text-[#B5BAC6]">
                {lang === 'bn' ? 'ক্লাউড পিডিএফ লিংক (ঐচ্ছিক)' : 'Cloud PDF Link (optional, syncs to mobile)'}
              </label>
              <input
                type="url"
                value={newPdfUrl}
                onChange={(e) => setNewPdfUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-xs text-white focus:border-[#D4A359] focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-[#B5BAC6]">
                {lang === 'bn' ? 'স্পাইনের রঙ' : 'Spine Color'}
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
              className="w-full rounded-lg bg-[#D4A359] px-4 py-2.5 text-sm font-semibold text-[#111215] hover:bg-[#DFB26D]"
            >
              {lang === 'bn' ? 'শেল্ফে যোগ করুন' : 'Shelve Book'}
            </button>
          </form>
        </div>
      )}

      {/* Smart Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleBulkSubmit}
            className="w-full max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-[#181A1F] p-6 text-[#F4F2ED] shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">
                {lang === 'bn' ? 'স্মার্ট বাল্ক অ্যাড (সব একসাথে)' : 'Smart Bulk Add Books'}
              </h2>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-xs text-[#8D93A1] hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-[#9CA3AF]">
              {lang === 'bn'
                ? 'আপনার ফরম্যাটেই পেস্ট করুন (যেমন: 1. The Puppet Show — M. W. Craven - Crime Thriller - Serial Killer Investigation & Suspense) অথবা Title | Author | Genre | Topic ফরম্যাটে দিন:'
                : 'Paste lines in either "Title — Author - Genre - Topic" (numbered or plain) or "Title | Author | Genre | Topic". New genres & topics are organized automatically:'}
            </p>
            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Amazonia — James Rollins - Action Thriller / Adventure - Amazon Rainforest Mystery & Survival\n1. The Puppet Show — M. W. Craven - Crime Thriller - Serial Killer Investigation & Suspense\n2. The House Where I Died Once — Keigo Higashino - Psychological Mystery - Trauma, Memory & House Secrets`}
              className="w-full rounded-xl border border-white/10 bg-[#111215] p-3.5 font-mono text-xs text-white focus:border-[#D4A359] focus:outline-none"
            />
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>
                {lang === 'bn'
                  ? `শনাক্তকৃত বই: ${bulkPreview}টি`
                  : `Detected ${bulkPreview} book(s) ready to shelve`}
              </span>
              <button
                type="submit"
                disabled={bulkPreview === 0}
                className="rounded-lg bg-[#D4A359] px-5 py-2 font-semibold text-[#111215] hover:bg-[#DFB26D] disabled:opacity-50"
              >
                {lang === 'bn' ? 'সবগুলো যোগ করুন' : 'Shelve All Books'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Built-In In-App PDF Viewer Modal */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-t-2xl border border-white/10 bg-[#181A1F] px-5 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-[#D4A359]" />
              <h3 className="font-display text-base font-medium">{activePdfModal.title}</h3>
            </div>
            <button
              type="button"
              onClick={handleClosePdfModal}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'বন্ধ করুন' : 'Close Reader'}</span>
            </button>
          </div>
          <div className="mx-auto w-full max-w-5xl flex-1 overflow-hidden rounded-b-2xl border-x border-b border-white/10 bg-white">
            <iframe
              src={activePdfModal.url}
              title={activePdfModal.title}
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
