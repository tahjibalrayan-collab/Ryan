import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  BookOpen,
  Check,
  Clock,
  CopyMinus,
  Download,
  Image as ImageIcon,
  Layers,
  Moon,
  Music2,
  Pause,
  Play,
  Plus,
  Search,
  Sun,
  Trash2,
  Upload,
  Volume2,
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

interface LibraryFocusModuleProps {
  lang: Language;
  theme: AppTheme;
  onToggleTheme: () => void;
  books: LibraryBook[];
  genres: string[];
  onAddGenre: (genre: string) => void;
  onUpdateBook: (book: LibraryBook) => void;
  onAddBook: (book: LibraryBook) => void;
  onBulkAddBooks: (books: LibraryBook[]) => void;
  onRestoreBooks: (books: LibraryBook[]) => void;
  onRemoveDuplicates: () => number;
  onDeleteBook: (id: string) => void;
  onStudyBookInTimer: (book: LibraryBook) => void;
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
  { cover: '#253B42', spine: '#D4A359' },
  { cover: '#1E2738', spine: '#8DA2CE' },
  { cover: '#2D2A22', spine: '#C5B084' },
  { cover: '#3A2824', spine: '#D99B82' },
  { cover: '#1E352B', spine: '#8FB593' },
];

type SortOption = 'newest' | 'title' | 'author' | 'progress';

export const LibraryFocusModule: React.FC<LibraryFocusModuleProps> = ({
  lang,
  theme,
  onToggleTheme,
  books,
  genres,
  onAddGenre,
  onUpdateBook,
  onAddBook,
  onBulkAddBooks,
  onRestoreBooks,
  onRemoveDuplicates,
  onDeleteBook,
  onStudyBookInTimer,
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
  const [statusFilter, setStatusFilter] = useState<'All' | ReadingStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id ?? '');

  // Modals & Popovers
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddGenreInput, setShowAddGenreInput] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Add book form
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState(genres[0] || 'Self-Help');
  const [newStatus, setNewStatus] = useState<ReadingStatus>('Want to read');
  const [newPages, setNewPages] = useState('250');
  const [newBindingIdx, setNewBindingIdx] = useState(0);

  // Bulk add form
  const [bulkText, setBulkText] = useState('');
  const restoreInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => setStatusToast(null), 4000);
  };

  // Counts
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

  const filteredBooks = useMemo(() => {
    const list = books.filter((b) => {
      const matchesGenre = genreFilter === 'All' || b.genre === genreFilter;
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.notes.toLowerCase().includes(q);
      return matchesGenre && matchesStatus && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'progress') return b.progress - a.progress;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [books, genreFilter, statusFilter, searchQuery, sortBy]);

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? filteredBooks[0] ?? null,
    [books, selectedBookId, filteredBooks]
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

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const binding = BOOK_BINDINGS[newBindingIdx];
    const progress =
      newStatus === 'Finished' ? 100 : newStatus === 'Reading' ? 20 : 0;
    const nowIso = new Date().toISOString();

    const created: LibraryBook = {
      id: `lib-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Unknown Author',
      genre: newGenre,
      status: newStatus,
      coverColor: binding.cover,
      spineAccent: binding.spine,
      textColor: '#FAF7F2',
      progress,
      totalPages: Math.max(10, parseInt(newPages, 10) || 250),
      notes: '',
      createdAt: nowIso,
      lastOpenedAt: nowIso,
    };

    onAddBook(created);
    setSelectedBookId(created.id);
    setNewTitle('');
    setNewAuthor('');
    setShowAddBookModal(false);
    showToast(
      lang === 'bn'
        ? `"${created.title}" শেল্ফে যোগ করা হয়েছে।`
        : `"${created.title}" shelved.`
    );
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const nowIso = new Date().toISOString();
    const newItems: LibraryBook[] = lines.map((line, idx) => {
      const [rawTitle, rawAuthor, rawGenre] = line.split('|').map((s) => s.trim());
      const binding = BOOK_BINDINGS[(books.length + idx) % BOOK_BINDINGS.length];
      return {
        id: `lib-bulk-${Date.now()}-${idx}`,
        title: rawTitle || line,
        author: rawAuthor || 'Personal Library',
        genre: rawGenre && genres.includes(rawGenre) ? rawGenre : 'Non-Fiction',
        status: 'Want to read',
        coverColor: binding.cover,
        spineAccent: binding.spine,
        textColor: '#FAF7F2',
        progress: 0,
        totalPages: 240,
        notes: '',
        createdAt: nowIso,
        lastOpenedAt: nowIso,
      };
    });

    onBulkAddBooks(newItems);
    setBulkText('');
    setShowBulkModal(false);
    showToast(
      lang === 'bn'
        ? `${newItems.length}টি বই শেল্ফে যোগ হয়েছে।`
        : `${newItems.length} books added to shelf.`
    );
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
    showToast(lang === 'bn' ? 'লাইব্রেরি ব্যাকআপ ডাউনলোড হয়েছে।' : 'Library backup exported.');
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
          : `Removed ${removed} duplicate volume(s).`
        : lang === 'bn'
        ? 'কোনো ডুপ্লিকেট বই পাওয়া যায়নি।'
        : 'No duplicate titles found.'
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

  const activeTrack = AMBIENT_TRACKS.find((tItem) => tItem.id === activeTrackId) ?? AMBIENT_TRACKS[0];

  const cardSurface = isPaper
    ? 'border-[#C6BEB0] bg-[#EFECE5] text-[#211E19]'
    : 'border-white/8 bg-[#16181D] text-[#F4F2ED]';
  const inputSurface = isPaper
    ? 'border-[#C6BEB0] bg-white text-[#211E19] placeholder:text-[#888072]'
    : 'border-white/10 bg-[#111215] text-[#F4F2ED] placeholder:text-[#5F6573]';
  const mutedText = isPaper ? 'text-[#665E52]' : 'text-[#9CA3AF]';
  const headingText = isPaper ? 'text-[#1F1C18]' : 'text-[#F4F2ED]';
  const accentText = isPaper ? 'text-[#8D5B16]' : 'text-[#D4A359]';
  const activeBtnClass = isPaper
    ? 'bg-[#1D355E] text-white border-[#1D355E]'
    : 'bg-[#D4A359] text-[#111215] border-[#D4A359]';

  return (
    <div className="space-y-10">
      {/* Centered Editorial Masthead (Faithful to User Screenshot + Upgraded) */}
      <section className="flex flex-col items-center text-center">
        <h1 className={`font-display text-4xl font-medium tracking-tight sm:text-5xl ${headingText}`}>
          {t.brand}
        </h1>
        <p className={`mt-1.5 font-display text-base italic ${mutedText}`}>
          {t.librarySubtitle}
        </p>

        {/* Sub-bar: Local Storage active + Theme Toggle (Midnight Study / Paper Shelf) */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className={mutedText}>
            {lang === 'bn'
              ? 'লোকাল স্টোরেজ সক্রিয় · আপনার সব বই ব্রাউজারে সংরক্ষিত'
              : 'Local archive active · Saved privately in your browser'}
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isPaper
                ? 'border-[#BFB7A8] bg-[#E8E3D8] text-[#211E19] hover:bg-[#DDD6C8]'
                : 'border-white/12 bg-[#1B1D24] text-[#E5E7EB] hover:border-[#D4A359]/50'
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

        {/* Monospace Stats Line */}
        <div className={`font-mono-tabular mt-5 text-xs ${mutedText}`}>
          {stats.total} {lang === 'bn' ? 'টি বই' : 'volumes'} · {stats.reading}{' '}
          {lang === 'bn' ? 'পড়ছি' : 'reading'} · {stats.toRead}{' '}
          {lang === 'bn' ? 'পড়তে চাই' : 'to read'} · {stats.finished}{' '}
          {lang === 'bn' ? 'শেষ হয়েছে' : 'finished'}
        </div>

        {/* Centered Full-Width Search Input */}
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

        {/* Genre Filter Buttons */}
        <div className="mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setGenreFilter('All')}
            className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              genreFilter === 'All'
                ? activeBtnClass
                : isPaper
                ? 'border-[#C6BEB0] bg-[#E8E3D8] text-[#453F36] hover:bg-[#DDD6C8]'
                : 'border-white/10 bg-[#181A20] text-[#B5BAC6] hover:border-white/25'
            }`}
          >
            {lang === 'bn' ? 'সব' : 'All'}
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
                    ? 'border-[#C6BEB0] bg-[#E8E3D8] text-[#453F36] hover:bg-[#DDD6C8]'
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
                className={`w-28 rounded-lg border px-2.5 py-1 text-xs focus:outline-none ${inputSurface}`}
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
                  ? 'border-[#ABA292] text-[#544D42] hover:border-[#203864]'
                  : 'border-white/20 text-[#9CA3AF] hover:border-white/40 hover:text-white'
              }`}
            >
              + {lang === 'bn' ? 'জনরা' : 'Genre'}
            </button>
          )}
        </div>

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
                    ? 'border-[#C6BEB0] bg-[#E8E3D8] text-[#453F36] hover:bg-[#DDD6C8]'
                    : 'border-white/10 bg-[#181A20] text-[#B5BAC6] hover:border-white/25'
                }`}
              >
                {st.id === 'Finished' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
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

      {/* Realistic Spine Bookshelf Cabinet (Modeled on Screenshot + Upgraded) */}
      <section className="space-y-4">
        <div
          className={`relative overflow-hidden rounded-2xl border shadow-[inset_0_16px_42px_rgba(0,0,0,0.45)] ${
            isPaper
              ? 'border-[#B9B0A0] bg-gradient-to-b from-[#BCB3A3] via-[#CEC7B9] to-[#BEB5A5]'
              : 'border-white/10 bg-gradient-to-b from-[#101116] via-[#171920] to-[#121318]'
          }`}
        >
          <div className="min-h-[260px] px-6 pt-10 pb-0">
            {filteredBooks.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center text-center">
                <p className={`text-sm font-medium ${headingText}`}>
                  {lang === 'bn'
                    ? 'এই শেল্ফে কোনো বই নেই'
                    : 'No books match your shelf filter'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setGenreFilter('All');
                    setStatusFilter('All');
                    setSearchQuery('');
                  }}
                  className={`mt-2 text-xs underline ${accentText}`}
                >
                  {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset shelf filters'}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3 px-2">
                {filteredBooks.map((book) => {
                  const isSelected = selectedBook?.id === book.id;
                  // Slight natural height variation for realistic bookshelf silhouette
                  const heightClass =
                    book.title.length > 22
                      ? 'h-56'
                      : book.title.length > 14
                      ? 'h-52'
                      : 'h-48';
                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => setSelectedBookId(book.id)}
                      title={`${book.title} — ${book.author}`}
                      className={`group relative flex ${heightClass} w-12 shrink-0 flex-col items-center justify-between rounded-t-sm border-x border-t py-3 transition-all duration-200 sm:w-14 ${
                        isSelected
                          ? '-translate-y-3 border-[#D4A359] shadow-[0_14px_24px_rgba(0,0,0,0.65)] ring-1 ring-[#D4A359]'
                          : 'border-white/15 hover:-translate-y-2 shadow-[4px_0_12px_rgba(0,0,0,0.45)]'
                      }`}
                      style={{
                        backgroundColor: book.coverColor,
                        color: book.textColor,
                        backgroundImage:
                          'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 24%, rgba(0,0,0,0.28) 92%)',
                      }}
                    >
                      {/* Top Spine Band */}
                      <span
                        className="h-1 w-8 rounded-full opacity-80"
                        style={{ backgroundColor: book.spineAccent }}
                      />

                      {/* Vertical Spine Title */}
                      <span className="book-spine-text my-2 max-h-36 overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-medium tracking-wide">
                        {book.title}
                      </span>

                      {/* Bottom Progress Band */}
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="h-1 w-7 rounded-full opacity-75"
                          style={{ backgroundColor: book.spineAccent }}
                        />
                        <span className="font-mono-tabular text-[9px] opacity-80">
                          {book.progress}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Realistic Wooden Shelf Ledge */}
          <div className={`${isPaper ? 'shelf-ledge-light' : 'shelf-ledge'} h-5 w-full`} />
        </div>

        {/* Bottom Library Action Toolbar (Faithful to Screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddBookModal(true)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                isPaper
                  ? 'bg-[#1D355E] text-white hover:bg-[#16294A]'
                  : 'bg-[#D4A359] text-[#111215] hover:bg-[#DFB26D]'
              }`}
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
            <span className={`text-xs ${mutedText}`}>
              {lang === 'bn' ? 'সাজান' : 'Sort'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort library books"
              className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${inputSurface}`}
            >
              <option value="newest">{lang === 'bn' ? 'নতুন আগে' : 'Newest'}</option>
              <option value="title">{lang === 'bn' ? 'শিরোনাম (A-Z)' : 'Title A–Z'}</option>
              <option value="author">{lang === 'bn' ? 'লেখক' : 'Author'}</option>
              <option value="progress">{lang === 'bn' ? 'অগ্রগতি' : 'Progress'}</option>
            </select>
          </div>
        </div>

        {/* Selected Book Inspector & Marginalia */}
        {selectedBook && (
          <div className={`grid grid-cols-1 gap-6 rounded-2xl border p-6 lg:grid-cols-12 ${cardSurface}`}>
            <div className="flex gap-5 lg:col-span-5">
              {/* Mini Book Front Cover Preview */}
              <div
                className="relative hidden h-44 w-32 shrink-0 flex-col justify-between rounded-r-lg rounded-l-sm p-3 shadow-xl sm:flex"
                style={{
                  backgroundColor: selectedBook.coverColor,
                  color: selectedBook.textColor,
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-2 rounded-l-sm"
                  style={{ backgroundColor: selectedBook.spineAccent }}
                />
                <div className="pl-1.5">
                  <span className="text-[9px] uppercase tracking-wider opacity-75">
                    {selectedBook.genre}
                  </span>
                  <p className="mt-1.5 line-clamp-3 font-display text-xs font-medium leading-snug">
                    {selectedBook.title}
                  </p>
                </div>
                <p className="pl-1.5 text-[10px] opacity-80">{selectedBook.author}</p>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`flex items-center gap-2 text-xs ${mutedText}`}>
                      <span>{selectedBook.genre}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{selectedBook.totalPages}p</span>
                    </div>
                    <h3 className={`mt-1 font-display text-xl font-medium ${headingText}`}>
                      {selectedBook.title}
                    </h3>
                    <p className={`text-xs ${mutedText}`}>{selectedBook.author}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteBook(selectedBook.id)}
                    aria-label={`Delete ${selectedBook.title}`}
                    className="rounded-lg p-1.5 text-[#717786] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Status Switcher */}
                <div className="flex flex-wrap gap-1.5">
                  {(['Want to read', 'Reading', 'Finished'] as ReadingStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        onUpdateBook({
                          ...selectedBook,
                          status: st,
                          progress: st === 'Finished' ? 100 : st === 'Want to read' ? 0 : Math.max(10, selectedBook.progress),
                          lastOpenedAt: new Date().toISOString(),
                        })
                      }
                      className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        selectedBook.status === st ? activeBtnClass : inputSurface
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Progress Range */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={mutedText}>
                      {lang === 'bn' ? 'পড়ার অগ্রগতি' : 'Reading Progress'}
                    </span>
                    <span className={`font-mono-tabular font-medium ${accentText}`}>
                      {selectedBook.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedBook.progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateBook({
                        ...selectedBook,
                        progress: val,
                        status: val === 100 ? 'Finished' : val > 0 ? 'Reading' : 'Want to read',
                        lastOpenedAt: new Date().toISOString(),
                      });
                    }}
                    className="w-full accent-[#D4A359]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onStudyBookInTimer(selectedBook)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${inputSurface}`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {lang === 'bn'
                      ? '৪৫ মিনিটের টাইমারে পড়ুন'
                      : 'Open 45m Reading Session in Timer'}
                  </span>
                </button>
              </div>
            </div>

            <div
              className={`border-t pt-4 lg:col-span-7 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 ${
                isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
              }`}
            >
              <label htmlFor="library-notes" className={`block text-xs font-medium ${mutedText}`}>
                {lang === 'bn' ? 'বইয়ের নোট ও মূল সারাংশ' : 'Marginalia & Key Takeaways'}
              </label>
              <textarea
                id="library-notes"
                rows={6}
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
                    ? 'অধ্যায়ের মূল কথা, গুরুত্বপূর্ণ কোট বা পৃষ্ঠা নম্বর লিখে রাখুন...'
                    : 'Capture chapter outlines, key theorems, or page references...'
                }
                className={`mt-2.5 w-full resize-none rounded-xl border p-4 text-sm leading-relaxed focus:outline-none ${inputSurface}`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Ambient Focus Music Player & Wallpaper Studio */}
      <section
        className={`grid grid-cols-1 gap-8 border-t pt-10 lg:grid-cols-12 ${
          isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
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
                isMusicPlaying
                  ? 'bg-[#D4A359] text-[#111215] hover:bg-[#DFB26D]'
                  : isPaper
                  ? 'bg-[#1D355E] text-white'
                  : 'bg-[#262932] text-[#F4F2ED]'
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
                ? 'divide-[#C6BEB0] border-[#C6BEB0] bg-white/70'
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
                        ? 'bg-[#E3DDD0]'
                        : 'bg-[#1C1F27]'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? accentText : headingText
                      }`}
                    >
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

        {/* Workspace Wallpaper & Photo Studio */}
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
                      ? 'border-[#C6BEB0]'
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
                  <div className={isPaper ? 'bg-white px-2.5 py-2' : 'bg-[#111215] px-2.5 py-2'}>
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
              isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={mutedText}>
                {lang === 'bn' ? 'ব্যাকগ্রাউন্ড ডার্কনেস' : 'Backdrop Contrast Scrim'}
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
            className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#181A1F] p-6 text-[#F4F2ED] shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">
                {lang === 'bn' ? 'নতুন বই শেল্ফে রাখুন' : 'Shelve New Book'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="text-xs text-[#8D93A1] hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

            <div>
              <label htmlFor="lib-title" className="block text-xs font-medium text-[#B5BAC6]">
                {lang === 'bn' ? 'বইয়ের নাম' : 'Title'}
              </label>
              <input
                id="lib-title"
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., The Science of Self-Talk"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3.5 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lib-author" className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'লেখক' : 'Author'}
                </label>
                <input
                  id="lib-author"
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ian Tuhovsky"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3.5 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="lib-pages" className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'মোট পৃষ্ঠা' : 'Pages'}
                </label>
                <input
                  id="lib-pages"
                  type="number"
                  min={10}
                  value={newPages}
                  onChange={(e) => setNewPages(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3.5 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lib-genre" className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'জনরা' : 'Genre'}
                </label>
                <select
                  id="lib-genre"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lib-status" className="block text-xs font-medium text-[#B5BAC6]">
                  {lang === 'bn' ? 'অবস্থা' : 'Status'}
                </label>
                <select
                  id="lib-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReadingStatus)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3 py-2 text-sm text-white focus:border-[#D4A359] focus:outline-none"
                >
                  <option value="Want to read">{t.wantToRead}</option>
                  <option value="Reading">{t.reading}</option>
                  <option value="Finished">{t.finished}</option>
                </select>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-[#B5BAC6]">
                {lang === 'bn' ? 'মলাটের রঙ' : 'Spine Binding'}
              </span>
              <div className="mt-2 flex items-center gap-3">
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
              {lang === 'bn' ? 'শেল্ফে যোগ করুন' : 'Add to Shelf'}
            </button>
          </form>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleBulkSubmit}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#181A1F] p-6 text-[#F4F2ED] shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-medium">
                {lang === 'bn' ? 'একসাথে একাধিক বই যোগ করুন' : 'Bulk Add Books'}
              </h2>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-xs text-[#8D93A1] hover:text-white"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              {lang === 'bn'
                ? 'প্রতি লাইনে একটি বই লিখুন (ফরম্যাট: বইয়ের নাম | লেখক | জনরা):'
                : 'Enter one book per line using format: Title | Author | Genre'}
            </p>
            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Atomic Habits | James Clear | Self-Help\nClean Code | Robert C. Martin | CSE\nSapiens | Yuval Noah Harari | History`}
              className="w-full rounded-xl border border-white/10 bg-[#111215] p-3.5 font-mono text-xs text-white focus:border-[#D4A359] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-[#D4A359] px-4 py-2.5 text-sm font-semibold text-[#111215] hover:bg-[#DFB26D]"
            >
              {lang === 'bn' ? 'সবগুলো শেল্ফে রাখুন' : 'Shelve All Books'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
