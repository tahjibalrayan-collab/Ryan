import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  List,
  Minus,
  MoreVertical,
  Plus,
  Printer,
  Scissors,
  Smile,
  Sparkles,
  Star,
  StickyNote,
  Sticker,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import {
  DIARY_MOOD_CATEGORIES,
  formatShortJournalDate,
  WALLPAPER_PRESETS,
} from '../data/seedData';
import {
  AppTheme,
  JournalBook,
  JournalFontOption,
  JournalImageItem,
  JournalPaperStyle,
  JournalSpread,
  JournalStickerItem,
  JournalStickyNote,
  Language,
  WallpaperPreset,
} from '../types';
import { getThemeTokens } from '../utils/themeStyles';

interface PersonalJournalModuleProps {
  lang: Language;
  theme: AppTheme;
  journals: JournalBook[];
  onUpdateJournal: (updated: JournalBook) => void;
  onCreateJournal: (book: JournalBook) => void;
  onRestoreJournals: (books: JournalBook[]) => void;
  onDeleteJournal: (id: string) => void;
  customWallpaper: string | null;
  onUploadCustomWallpaper: (dataUrl: string) => void;
}

const FONT_OPTIONS: Array<{
  id: JournalFontOption;
  label: string;
  className: string;
}> = [
  { id: 'Scribble', label: 'Scribble', className: 'font-journal-scribble text-lg' },
  { id: 'Handwritten', label: 'Handwritten', className: 'font-journal-handwritten text-base' },
  { id: 'Typewriter', label: 'Typewriter', className: 'font-journal-typewriter text-sm' },
  { id: 'Simple', label: 'Simple', className: 'font-journal-simple text-sm' },
  { id: 'Classic', label: 'Classic', className: 'font-journal-classic text-base' },
];

const COVER_SWATCHES = [
  { cover: '#18181B', text: '#FAFAFA', name: 'Monochrome Noir' },
  { cover: '#F4F4F5', text: '#111111', name: 'Monochrome Ivory' },
  { cover: '#DCEAD7', text: '#252B24', name: 'Sage Mint' },
  { cover: '#D9B19F', text: '#2A1E19', name: 'Terracotta Clay' },
  { cover: '#9EAAC2', text: '#19202C', name: 'Slate Indigo' },
  { cover: '#EAE3D2', text: '#2B2620', name: 'Warm Parchment' },
];

const MOOD_TAGS = [...DIARY_MOOD_CATEGORIES];

const PAPER_STYLES: Array<{ id: JournalPaperStyle; label: string }> = [
  { id: 'plain', label: 'Plain Ivory' },
  { id: 'lined', label: 'Lined Pages' },
  { id: 'dotted', label: 'Dot Grid' },
  { id: 'grid', label: 'Graph Grid' },
];

const STICKY_NOTE_PALETTE = [
  { name: 'Lemon Paper', bg: '#FEF08A', text: '#292524' },
  { name: 'Sage Leaf', bg: '#BBF7D0', text: '#14532D' },
  { name: 'Blush Rose', bg: '#FECDD3', text: '#4C0519' },
  { name: 'Sky Mist', bg: '#BAE6FD', text: '#0C4A6E' },
  { name: 'Soft Lilac', bg: '#E9D5FF', text: '#3B0764' },
  { name: 'Charcoal Ink', bg: '#18181B', text: '#FAFAFA' },
];

const STICKER_STORE = [
  { id: 'star', glyph: '✨', label: 'Sparkle' },
  { id: 'pin', glyph: '📌', label: 'Pushpin' },
  { id: 'book', glyph: '📚', label: 'Study Books' },
  { id: 'coffee', glyph: '☕', label: 'Focus Brew' },
  { id: 'flask', glyph: '🧪', label: 'Sci Lab' },
  { id: 'moon', glyph: '🌙', label: 'Midnight' },
  { id: 'ribbon', glyph: '🔖', label: 'Bookmark' },
  { id: 'music', glyph: '🎧', label: 'Deep Audio' },
  { id: 'leaf', glyph: '🌿', label: 'Calm' },
  { id: 'bolt', glyph: '⚡', label: 'Energy' },
  { id: 'target', glyph: '🎯', label: 'Goal' },
  { id: 'pen', glyph: '✒️', label: 'Ink Pen' },
  { id: 'planet', glyph: '🪐', label: 'Cosmos' },
  { id: 'flower', glyph: '🌸', label: 'Blossom' },
  { id: 'check', glyph: '✅', label: 'Done' },
  { id: 'heart', glyph: '🖤', label: 'Mono Heart' },
];

const EMOJI_CATEGORIES = [
  {
    label: 'Mood & Expressions',
    emojis: ['😊', '😌', '🥰', '😔', '😤', '😴', '🤯', '🤔', '🥹', '😎', '🙏', '🖤'],
  },
  {
    label: 'Study & Science',
    emojis: ['📖', '✍️', '📝', '🧠', '🔬', '⚗️', '📐', '💡', '⏱️', '📌', '✅', '🎯'],
  },
  {
    label: 'Atmosphere & Daily',
    emojis: ['☕', '🌧️', '🌙', '☀️', '🌿', '🕯️', '🎧', '✨', '🌸', '🍂', '⭐', '🔖'],
  },
];

type ActivePopover =
  | 'font'
  | 'backdrop'
  | 'contents'
  | 'cover'
  | 'info'
  | 'paper'
  | 'mood'
  | 'emoji'
  | 'stickers'
  | 'sticky'
  | 'more'
  | null;

export const PersonalJournalModule: React.FC<PersonalJournalModuleProps> = ({
  lang,
  theme,
  journals,
  onUpdateJournal,
  onCreateJournal,
  onRestoreJournals,
  onDeleteJournal,
  customWallpaper,
  onUploadCustomWallpaper,
}) => {
  const t = UI_TEXT[lang];
  const tk = getThemeTokens(theme);

  const [openBookId, setOpenBookId] = useState<string | null>(null);
  const [spreadIndex, setSpreadIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDeletePageConfirm, setShowDeletePageConfirm] = useState(false);
  const [pageTurnKey, setPageTurnKey] = useState(0);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [moodFilter, setMoodFilter] = useState<string>('All');
  const [flipDirection, setFlipDirection] = useState<1 | -1>(1);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [stickyColorIdx, setStickyColorIdx] = useState(0);

  const diaryRestoreRef = useRef<HTMLInputElement | null>(null);
  const spreadContainerRef = useRef<HTMLDivElement | null>(null);
  const pagePhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Dragging state for sticky notes, stickers, and photos
  const [dragState, setDragState] = useState<{
    kind: 'sticky' | 'sticker' | 'image';
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // New journal form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCoverIdx, setNewCoverIdx] = useState(0);

  const openBook = useMemo(
    () => journals.find((b) => b.id === openBookId) ?? null,
    [journals, openBookId]
  );

  const allBackdrops: WallpaperPreset[] = useMemo(() => {
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

  const handleOpenBook = (book: JournalBook, targetSpreadIdx = 0) => {
    setOpenBookId(book.id);
    setSpreadIndex(targetSpreadIdx);
    setZoom(1);
    setActivePopover(null);
  };

  const handleExportDiary = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), journals }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive-diary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreDiary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.journals)
          ? parsed.journals
          : [];
        if (list.length > 0) {
          onRestoreJournals(list);
        }
      } catch {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const swatch = COVER_SWATCHES[newCoverIdx];
    const now = new Date();
    const todayStr = formatShortJournalDate(now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const created: JournalBook = {
      id: `journal-${Date.now()}`,
      title: newTitle.trim().toUpperCase(),
      subtitle: newSubtitle.trim() || 'Archive Journal · Al Tahjib Noor Raiyan',
      coverColor: swatch.cover,
      textColor: swatch.text,
      font: 'Scribble',
      paperStyle: 'plain',
      backdropId: 'obsidian-default',
      updatedAt: now.toISOString(),
      spreads: [
        {
          id: `spread-${Date.now()}`,
          leftDate: todayStr,
          leftTime: timeStr,
          leftContent: '',
          rightDate: todayStr,
          rightTime: timeStr,
          rightContent: '',
          moodTag: 'Good Day',
        },
      ],
    };
    onCreateJournal(created);
    setNewTitle('');
    setNewSubtitle('');
    setShowNewModal(false);
    handleOpenBook(created);
  };

  const handleUploadPhotoBackdrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !openBook) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCustomWallpaper(reader.result);
        onUpdateJournal({
          ...openBook,
          backdropId: 'custom-upload',
          updatedAt: new Date().toISOString(),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const matchingMoodEntries = useMemo(() => {
    if (moodFilter === 'All') return [];
    const results: Array<{ book: JournalBook; spreadIdx: number; spread: JournalSpread }> = [];
    journals.forEach((book) => {
      book.spreads.forEach((sp, idx) => {
        if (sp.moodTag === moodFilter) {
          results.push({ book, spreadIdx: idx, spread: sp });
        }
      });
    });
    return results;
  }, [journals, moodFilter]);

  // ==================== SHELF VIEW ====================
  if (!openBook) {
    return (
      <div className="space-y-8">
        <section
          className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${tk.borderSubtle}`}
        >
          <div>
            <p className={`text-xs font-medium ${tk.accentText}`}>
              {t.journalEyebrow} · Made by Al Tahjib Noor Raiyan
            </p>
            <h1 className={`mt-1.5 text-3xl font-medium tracking-tight ${tk.headingText}`}>
              {t.journalTitle}
            </h1>
            <p className={`mt-1.5 text-sm ${tk.mutedText}`}>{t.journalDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportDiary}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'ডায়েরি ব্যাকআপ' : 'Backup Diary'}</span>
            </button>
            <button
              type="button"
              onClick={() => diaryRestoreRef.current?.click()}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'ডায়েরি রিস্টোর' : 'Restore'}</span>
            </button>
            <input
              ref={diaryRestoreRef}
              type="file"
              accept="application/json"
              onChange={handleRestoreDiary}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${tk.primaryBtn}`}
            >
              <Plus className="h-4 w-4" />
              <span>{t.newJournalBtn}</span>
            </button>
          </div>
        </section>

        {/* Mood Categories */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMoodFilter('All')}
              className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                moodFilter === 'All' ? tk.activeTabBtn : tk.inputSurface
              }`}
            >
              {lang === 'bn' ? 'সব ডায়েরি বই' : 'All Diaries'}
            </button>
            {DIARY_MOOD_CATEGORIES.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setMoodFilter(mood)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  moodFilter === mood ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          {moodFilter !== 'All' && (
            <div className={`rounded-2xl border p-4 ${tk.cardSurface}`}>
              <p className={`text-xs font-semibold ${tk.accentText}`}>
                {moodFilter} ({matchingMoodEntries.length}{' '}
                {lang === 'bn' ? 'টি পাতা' : 'entries'})
              </p>
              {matchingMoodEntries.length === 0 ? (
                <p className={`mt-2 text-xs ${tk.mutedText}`}>
                  {lang === 'bn'
                    ? 'এই মুডের কোনো ডায়েরি এন্ট্রি এখনো নেই। বই খুলে মুড ট্যাগ সেট করুন।'
                    : 'No pages tagged with this day mood yet. Open any diary book and set the page mood.'}
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingMoodEntries.map(({ book, spreadIdx, spread }) => (
                    <button
                      key={`${book.id}-${spread.id}`}
                      type="button"
                      onClick={() => handleOpenBook(book, spreadIdx)}
                      className={`rounded-xl border p-3 text-left transition-colors ${tk.subCardSurface}`}
                    >
                      <div className="flex items-center justify-between text-[11px] opacity-75">
                        <span className="font-mono-tabular">
                          {spread.leftDate} {spread.leftTime ? `· ${spread.leftTime}` : ''}
                        </span>
                        <span>Page {spreadIdx + 1}</span>
                      </div>
                      <p className="mt-1 truncate text-xs font-semibold">{book.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs opacity-75">
                        {spread.leftContent || spread.rightContent || 'Open entry...'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bookshelf Display */}
        <section className={`rounded-2xl border px-6 py-10 sm:px-10 ${tk.cardSurface}`}>
          <div className="grid grid-cols-1 gap-8 pb-6 sm:grid-cols-2 lg:grid-cols-4">
            {journals.map((book) => (
              <div key={book.id} className="group flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleOpenBook(book)}
                  className="relative flex h-72 w-52 flex-col items-center justify-center rounded-r-xl rounded-l-sm border border-black/15 px-6 text-center shadow-[0_20px_38px_-14px_rgba(0,0,0,0.75)] transition-all duration-200 group-hover:-translate-y-2"
                  style={{
                    backgroundColor: book.coverColor,
                    color: book.textColor,
                  }}
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-3 rounded-l-sm bg-black/15" />
                  <div className="pointer-events-none absolute inset-y-0 left-3 w-px bg-white/25" />

                  <span className="font-mono-tabular text-[10px] font-semibold tracking-[0.14em] uppercase opacity-75">
                    {book.font}
                  </span>
                  <h3 className="mt-3 text-xs font-bold leading-relaxed tracking-[0.12em] uppercase">
                    {book.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[11px] opacity-70">{book.subtitle}</p>
                </button>

                <div className="mt-4 text-center">
                  <p className={`text-xs font-medium ${tk.headingText}`}>
                    {book.spreads.length} {book.spreads.length === 1 ? 'spread' : 'spreads'}
                  </p>
                  <p className={`text-[11px] ${tk.mutedText}`}>
                    Edited {new Date(book.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Bind New Book */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className={`flex h-72 w-52 flex-col items-center justify-center rounded-r-xl rounded-l-sm border border-dashed px-6 text-center transition-colors ${tk.subCardSurface} hover:opacity-85`}
              >
                <Plus className="h-6 w-6" />
                <span className="mt-3 text-xs font-medium">
                  {lang === 'bn' ? 'নতুন জার্নাল তৈরি' : 'Bind New Journal'}
                </span>
                <span className={`mt-1 text-[11px] ${tk.mutedText}`}>
                  {lang === 'bn' ? 'কাস্টম কভার ও ফন্ট' : 'Custom cover, stickers & PDF'}
                </span>
              </button>
            </div>
          </div>

          <div className={`${tk.shelfLedge} h-4 w-full rounded-md border-t border-white/10`} />
        </section>

        {/* Create Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <form
              onSubmit={handleCreateBook}
              className="w-full max-w-md space-y-5 rounded-2xl border border-white/15 bg-[#161618] p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">Create New Journal</h2>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label htmlFor="new-j-title" className="block text-xs font-medium text-zinc-300">
                  Cover Title
                </label>
                <input
                  id="new-j-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., RAIYAN DAILY CLARITY"
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-j-sub" className="block text-xs font-medium text-zinc-300">
                  Subtitle
                </label>
                <input
                  id="new-j-sub"
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Reflections · Al Tahjib Noor Raiyan"
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-zinc-300">Cover Binding</span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {COVER_SWATCHES.map((s, idx) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setNewCoverIdx(idx)}
                      title={s.name}
                      className={`h-9 w-9 rounded-lg border-2 transition-transform ${
                        newCoverIdx === idx ? 'scale-110 border-white' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: s.cover }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                Place on Shelf &amp; Open
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==================== OPEN BOOK SPREAD WORKSPACE ====================
  const currentSpread: JournalSpread =
    openBook.spreads[spreadIndex] ?? openBook.spreads[0];

  const backdropPreset =
    allBackdrops.find((b) => b.id === openBook.backdropId) ?? WALLPAPER_PRESETS[0];

  const fontMeta = FONT_OPTIONS.find((f) => f.id === openBook.font) ?? FONT_OPTIONS[0];
  const fontClass =
    openBook.font === 'Scribble'
      ? 'font-journal-scribble text-[19px] leading-[1.55]'
      : openBook.font === 'Handwritten'
      ? 'font-journal-handwritten text-[17px] leading-[1.6]'
      : openBook.font === 'Typewriter'
      ? 'font-journal-typewriter text-[14px] leading-[1.75]'
      : openBook.font === 'Simple'
      ? 'font-journal-simple text-[14px] leading-[1.7]'
      : 'font-journal-classic text-[17px] leading-[1.65]';

  const paperClass =
    openBook.paperStyle === 'lined'
      ? 'paper-lined'
      : openBook.paperStyle === 'dotted'
      ? 'paper-dotted'
      : openBook.paperStyle === 'grid'
      ? 'paper-grid'
      : '';

  const updateCurrentSpread = (patch: Partial<JournalSpread>) => {
    const nextSpreads = openBook.spreads.map((sp, i) =>
      i === spreadIndex ? { ...sp, ...patch } : sp
    );
    onUpdateJournal({
      ...openBook,
      spreads: nextSpreads,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateSpreadField = (
    field:
      | 'leftContent'
      | 'rightContent'
      | 'leftDate'
      | 'rightDate'
      | 'leftTime'
      | 'rightTime'
      | 'moodTag',
    value: string
  ) => {
    updateCurrentSpread({ [field]: value });
  };

  const handleInsertEmoji = (emoji: string) => {
    if (activeSide === 'left') {
      updateSpreadField('leftContent', `${currentSpread.leftContent}${emoji}`);
    } else {
      updateSpreadField('rightContent', `${currentSpread.rightContent}${emoji}`);
    }
  };

  const handlePlaceSticker = (item: (typeof STICKER_STORE)[number]) => {
    const existing = currentSpread.stickers || [];
    const nextSticker: JournalStickerItem = {
      id: `stk-${Date.now()}`,
      stickerId: item.id,
      label: item.label,
      glyph: item.glyph,
      x: 18 + (existing.length % 4) * 14,
      y: 22 + (existing.length % 3) * 16,
      scale: 1,
    };
    updateCurrentSpread({ stickers: [...existing, nextSticker] });
  };

  const handlePlaceStickyNote = () => {
    const palette = STICKY_NOTE_PALETTE[stickyColorIdx] ?? STICKY_NOTE_PALETTE[0];
    const existing = currentSpread.stickyNotes || [];
    const nextNote: JournalStickyNote = {
      id: `note-${Date.now()}`,
      text: 'Reminder note...',
      color: palette.bg,
      textColor: palette.text,
      x: 54 + (existing.length % 2) * 10,
      y: 18 + (existing.length % 3) * 16,
    };
    updateCurrentSpread({ stickyNotes: [...existing, nextNote] });
    setActivePopover(null);
  };

  const handleUploadPagePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const existing = currentSpread.images || [];
        const nextImg: JournalImageItem = {
          id: `jimg-${Date.now()}`,
          dataUrl: reader.result,
          caption: file.name.replace(/\.[^.]+$/, ''),
          x: 12 + (existing.length % 3) * 15,
          y: 35,
          widthPx: 145,
        };
        updateCurrentSpread({ images: [...existing, nextImg] });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePointerMoveOnSpread = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || !spreadContainerRef.current) return;
    const rect = spreadContainerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragState.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - dragState.startY) / rect.height) * 100;
    const nextX = Math.max(2, Math.min(82, dragState.origX + dxPct));
    const nextY = Math.max(2, Math.min(80, dragState.origY + dyPct));

    if (dragState.kind === 'sticky') {
      updateCurrentSpread({
        stickyNotes: (currentSpread.stickyNotes || []).map((n) =>
          n.id === dragState.id ? { ...n, x: nextX, y: nextY } : n
        ),
      });
    } else if (dragState.kind === 'sticker') {
      updateCurrentSpread({
        stickers: (currentSpread.stickers || []).map((s) =>
          s.id === dragState.id ? { ...s, x: nextX, y: nextY } : s
        ),
      });
    } else if (dragState.kind === 'image') {
      updateCurrentSpread({
        images: (currentSpread.images || []).map((im) =>
          im.id === dragState.id ? { ...im, x: nextX, y: nextY } : im
        ),
      });
    }
  };

  const handleAddSpread = () => {
    const now = new Date();
    const todayStr = formatShortJournalDate(now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSpread: JournalSpread = {
      id: `spread-${Date.now()}`,
      leftDate: todayStr,
      leftTime: timeStr,
      leftContent: '',
      rightDate: todayStr,
      rightTime: timeStr,
      rightContent: '',
      moodTag: 'Good Day',
    };
    const nextSpreads = [...openBook.spreads, newSpread];
    onUpdateJournal({
      ...openBook,
      spreads: nextSpreads,
      updatedAt: new Date().toISOString(),
    });
    setFlipDirection(1);
    setPageTurnKey((k) => k + 1);
    setSpreadIndex(nextSpreads.length - 1);
  };

  const handleDeleteCurrentSpread = () => {
    if (!openBook) return;
    const now = new Date();
    const todayStr = formatShortJournalDate(now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (openBook.spreads.length <= 1) {
      const freshSpread: JournalSpread = {
        id: `spread-${Date.now()}`,
        leftDate: todayStr,
        leftTime: timeStr,
        leftContent: '',
        rightDate: todayStr,
        rightTime: timeStr,
        rightContent: '',
        moodTag: 'Good Day',
      };
      onUpdateJournal({
        ...openBook,
        spreads: [freshSpread],
        updatedAt: now.toISOString(),
      });
      setSpreadIndex(0);
    } else {
      const nextSpreads = openBook.spreads.filter((_, i) => i !== spreadIndex);
      onUpdateJournal({
        ...openBook,
        spreads: nextSpreads,
        updatedAt: now.toISOString(),
      });
      setFlipDirection(-1);
      setPageTurnKey((k) => k + 1);
      setSpreadIndex((prev) => Math.max(0, Math.min(prev, nextSpreads.length - 1)));
    }
    setShowDeletePageConfirm(false);
  };

  const handlePrevSpread = () => {
    if (spreadIndex > 0) {
      setFlipDirection(-1);
      setPageTurnKey((k) => k + 1);
      setSpreadIndex(spreadIndex - 1);
    }
  };

  const handleNextSpread = () => {
    setFlipDirection(1);
    setPageTurnKey((k) => k + 1);
    if (spreadIndex < openBook.spreads.length - 1) {
      setSpreadIndex(spreadIndex + 1);
    } else {
      handleAddSpread();
    }
  };

  const totalWords = openBook.spreads.reduce((acc, sp) => {
    const words = `${sp.leftContent} ${sp.rightContent}`
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return acc + words;
  }, 0);

  const togglePopover = (pop: ActivePopover) => {
    setActivePopover((prev) => (prev === pop ? null : pop));
  };

  return (
    <div
      className="relative flex min-h-[740px] flex-col justify-between overflow-hidden rounded-2xl border border-white/15 p-4 sm:p-6"
      style={
        backdropPreset.type === 'image'
          ? {
              backgroundImage: `linear-gradient(rgba(16,16,20,0.45), rgba(16,16,20,0.55)), url(${backdropPreset.value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {
              background: backdropPreset.value,
            }
      }
      onPointerMove={handlePointerMoveOnSpread}
      onPointerUp={() => setDragState(null)}
    >
      {/* Top Bar */}
      <div className="no-print relative z-30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenBookId(null)}
            title="Back to My Journals shelf"
            aria-label="Back to My Journals shelf"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#18181B]/90 text-white shadow-lg backdrop-blur-md hover:bg-[#27272A]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="hidden sm:block rounded-xl border border-white/10 bg-[#18181B]/80 px-3 py-1.5 text-white backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-wider uppercase">{openBook.title}</p>
            <p className="text-[10px] text-zinc-400">Al Tahjib Noor Raiyan · Archive</p>
          </div>
        </div>

        {/* Top-Right Studio Toolbar */}
        <div className="relative flex flex-wrap items-center gap-1 rounded-2xl border border-white/15 bg-[#18181B]/92 px-2 py-1.5 text-zinc-200 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => togglePopover('info')}
            title="Journal Info"
            className={`rounded-xl p-2 ${activePopover === 'info' ? 'bg-white/15 text-white' : 'hover:bg-white/10'}`}
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('contents')}
            title="Page Spreads & Index"
            className={`rounded-xl p-2 ${activePopover === 'contents' ? 'bg-white/15 text-white' : 'hover:bg-white/10'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('cover')}
            title="Customize Cover"
            className={`rounded-xl p-2 ${activePopover === 'cover' ? 'bg-white/15 text-white' : 'hover:bg-white/10'}`}
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('backdrop')}
            title="Backdrop Photo"
            className={`rounded-xl p-2 ${activePopover === 'backdrop' ? 'bg-white/15 text-white' : 'hover:bg-white/10'}`}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => pagePhotoInputRef.current?.click()}
            title="Insert Photo onto Page"
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium hover:bg-white/10"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Add Photo</span>
          </button>
          <input
            ref={pagePhotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadPagePhoto}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => setShowDeletePageConfirm(true)}
            title="Tear / Delete Current Page Spread"
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/35 bg-rose-500/15 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/25"
          >
            <Scissors className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete Page</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPdfPreview(true)}
            title="Export to PDF"
            className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={() => togglePopover('more')}
            title="More Options"
            className={`rounded-xl p-2 ${activePopover === 'more' ? 'bg-white/15 text-white' : 'hover:bg-white/10'}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Popovers */}
          {activePopover === 'info' && (
            <div className="absolute right-0 top-13 z-40 w-72 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-xs shadow-2xl">
              <p className="font-semibold text-white">{openBook.title}</p>
              <p className="mt-1 text-zinc-400">{openBook.subtitle}</p>
              <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Owner</span>
                  <span className="text-white">Al Tahjib Noor Raiyan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Writing Font</span>
                  <span className="text-white">{fontMeta.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Spreads</span>
                  <span className="font-mono-tabular text-white">{openBook.spreads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Words</span>
                  <span className="font-mono-tabular text-white">{totalWords}</span>
                </div>
              </div>
            </div>
          )}

          {activePopover === 'contents' && (
            <div className="absolute right-0 top-13 z-40 w-72 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-xs shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Page Spreads</span>
                <button
                  type="button"
                  onClick={handleAddSpread}
                  className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/25"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Spread</span>
                </button>
              </div>
              <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto">
                {openBook.spreads.map((sp, i) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setSpreadIndex(i);
                      setActivePopover(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                      i === spreadIndex ? 'bg-white/15 text-white' : 'text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">
                      Spread {i + 1} · {sp.leftDate}
                    </span>
                    {sp.moodTag && <span className="text-[10px] text-zinc-400">{sp.moodTag}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePopover === 'cover' && (
            <div className="absolute right-0 top-13 z-40 w-72 space-y-3 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-xs shadow-2xl">
              <p className="font-semibold text-white">Customize Book Cover</p>
              <input
                type="text"
                value={openBook.title}
                onChange={(e) =>
                  onUpdateJournal({
                    ...openBook,
                    title: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full rounded-lg border border-white/15 bg-[#0B0B0D] px-3 py-2 text-xs text-white focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {COVER_SWATCHES.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    title={s.name}
                    onClick={() =>
                      onUpdateJournal({
                        ...openBook,
                        coverColor: s.cover,
                        textColor: s.text,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className={`h-7 w-7 rounded-lg border-2 ${
                      openBook.coverColor === s.cover ? 'border-white' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: s.cover }}
                  />
                ))}
              </div>
            </div>
          )}

          {activePopover === 'backdrop' && (
            <div className="absolute right-0 top-13 z-40 w-80 space-y-3 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-xs shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Journal Backdrop</p>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/25">
                  <Upload className="h-3 w-3" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhotoBackdrop}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {allBackdrops.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onUpdateJournal({
                        ...openBook,
                        backdropId: preset.id,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className={`overflow-hidden rounded-xl border text-left ${
                      openBook.backdropId === preset.id
                        ? 'border-white ring-1 ring-white'
                        : 'border-white/10 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div
                      className="h-12 w-full"
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
                    <p className="truncate bg-[#0B0B0D] px-2 py-1 text-[11px] text-white">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePopover === 'more' && (
            <div className="absolute right-0 top-13 z-40 w-56 space-y-1 rounded-2xl border border-white/15 bg-[#18181B]/95 p-2 text-xs shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  handleAddSpread();
                  setActivePopover(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Spread</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = openBook.id;
                  setOpenBookId(null);
                  onDeleteJournal(idToDelete);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-400 hover:bg-rose-500/15"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete This Journal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Zoomable Two-Page Spread with Realistic Physical 3D Page-Turn Leaf */}
      <div className="no-print book-perspective relative z-10 my-6 flex flex-1 items-center justify-center overflow-auto py-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${openBook.id}-${currentSpread.id}-${pageTurnKey}`}
            initial={{
              opacity: 0.7,
              rotateY: flipDirection * 14,
              scale: zoom * 0.985,
            }}
            animate={{
              opacity: 1,
              rotateY: 0,
              scale: zoom,
            }}
            exit={{
              opacity: 0.4,
              rotateY: flipDirection * -18,
              scale: zoom * 0.985,
            }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            ref={spreadContainerRef}
            className="relative grid w-full max-w-[820px] origin-center grid-cols-1 overflow-visible rounded-2xl bg-[#FAF8F2] text-[#1C1917] shadow-[0_34px_70px_-16px_rgba(0,0,0,0.8)] md:grid-cols-2"
          >
            {/* Physical 3D Turning Page Leaf Overlay anchored at the spine */}
            {pageTurnKey > 0 && (
              <motion.div
                key={`leaf-${pageTurnKey}`}
                aria-hidden="true"
                initial={{
                  rotateY: flipDirection === 1 ? 0 : -180,
                  opacity: 0.92,
                }}
                animate={{
                  rotateY: flipDirection === 1 ? -180 : 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.55, ease: [0.25, 0.8, 0.25, 1] }}
                style={{
                  transformOrigin: 'left center',
                  backfaceVisibility: 'hidden',
                  background:
                    'linear-gradient(90deg, #E8E2D4 0%, #FAF8F2 22%, #EFECE3 100%)',
                }}
                className="pointer-events-none absolute inset-y-0 right-0 z-40 hidden w-1/2 rounded-r-2xl border-l border-black/15 shadow-2xl md:block"
              />
            )}
            {/* Left Page */}
            <div
              className={`journal-spine-left relative flex min-h-[400px] flex-col rounded-t-2xl border-b border-black/10 p-6 sm:min-h-[470px] sm:p-8 md:rounded-l-2xl md:rounded-tr-none md:border-b-0 md:border-r md:border-black/10 ${paperClass}`}
            >
              <div className="flex items-center justify-between gap-2 text-[#57534E]">
                <button
                  type="button"
                  onClick={() => togglePopover('mood')}
                  className="text-[11px] font-semibold tracking-wide hover:underline"
                >
                  {currentSpread.moodTag || 'Good Day'}
                </button>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    aria-label="Left page time"
                    value={currentSpread.leftTime || ''}
                    placeholder="Time"
                    onChange={(e) => updateSpreadField('leftTime', e.target.value)}
                    className="font-journal-scribble w-16 bg-transparent text-right text-xs text-[#57534E] focus:outline-none"
                  />
                  <input
                    type="text"
                    aria-label="Left page date"
                    value={currentSpread.leftDate}
                    onChange={(e) => updateSpreadField('leftDate', e.target.value)}
                    className="font-journal-scribble w-20 bg-transparent text-right text-sm text-[#44403C] focus:outline-none"
                  />
                </div>
              </div>

              <textarea
                value={currentSpread.leftContent}
                onFocus={() => setActiveSide('left')}
                onChange={(e) => updateSpreadField('leftContent', e.target.value)}
                placeholder="Write freely on the left page..."
                aria-label="Left journal page"
                className={`mt-4 w-full flex-1 resize-none bg-transparent text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none ${fontClass}`}
              />
            </div>

            {/* Right Page */}
            <div
              className={`journal-spine-right relative flex min-h-[400px] flex-col rounded-b-2xl p-6 sm:min-h-[470px] sm:p-8 md:rounded-r-2xl md:rounded-bl-none ${paperClass}`}
            >
              <div className="flex items-center justify-between gap-2 text-[#57534E]">
                <span className="text-[10px] tracking-wider uppercase opacity-60">
                  Al Tahjib Noor Raiyan
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    aria-label="Right page time"
                    value={currentSpread.rightTime || ''}
                    placeholder="Time"
                    onChange={(e) => updateSpreadField('rightTime', e.target.value)}
                    className="font-journal-scribble w-16 bg-transparent text-right text-xs text-[#57534E] focus:outline-none"
                  />
                  <input
                    type="text"
                    aria-label="Right page date"
                    value={currentSpread.rightDate}
                    onChange={(e) => updateSpreadField('rightDate', e.target.value)}
                    className="font-journal-scribble w-20 bg-transparent text-right text-sm text-[#44403C] focus:outline-none"
                  />
                </div>
              </div>

              <textarea
                value={currentSpread.rightContent}
                onFocus={() => setActiveSide('right')}
                onChange={(e) => updateSpreadField('rightContent', e.target.value)}
                placeholder="Continue your thoughts, study reflections, or takeaways here..."
                aria-label="Right journal page"
                className={`mt-4 w-full flex-1 resize-none bg-transparent text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none ${fontClass}`}
              />
              {/* Bottom-Right Tactile Corner Curl Page-Flip Trigger */}
              <button
                type="button"
                onClick={handleNextSpread}
                title="Flip to next page"
                aria-label="Flip page forward"
                className="group/curl absolute bottom-0 right-0 flex h-9 w-9 items-end justify-end rounded-br-2xl overflow-hidden"
              >
                <span
                  className="block h-7 w-7 transition-all duration-200 group-hover/curl:h-9 group-hover/curl:w-9"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 48%, rgba(0,0,0,0.12) 50%, #E7E2D6 56%)',
                    boxShadow: '-2px -2px 6px rgba(0,0,0,0.1)',
                  }}
                />
              </button>
            </div>

            {/* Floating Layer 1: Uploaded Device Photos */}
            {(currentSpread.images || []).map((img) => (
              <div
                key={img.id}
                style={{ left: `${img.x}%`, top: `${img.y}%`, width: `${img.widthPx}px` }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDragState({
                    kind: 'image',
                    id: img.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: img.x,
                    origY: img.y,
                  });
                }}
                className="group absolute z-20 cursor-grab rounded-lg bg-white p-1.5 shadow-xl active:cursor-grabbing border border-black/15"
              >
                <img
                  src={img.dataUrl}
                  alt={img.caption || 'Journal attachment'}
                  className="pointer-events-none h-auto w-full rounded object-cover"
                />
                <div className="mt-1 flex items-center justify-between gap-1 px-0.5 text-[10px] text-zinc-600">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurrentSpread({
                        images: (currentSpread.images || []).map((im) =>
                          im.id === img.id
                            ? { ...im, widthPx: Math.max(90, im.widthPx - 20) }
                            : im
                        ),
                      });
                    }}
                    className="rounded px-1 hover:bg-zinc-200"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurrentSpread({
                        images: (currentSpread.images || []).map((im) =>
                          im.id === img.id
                            ? { ...im, widthPx: Math.min(260, im.widthPx + 20) }
                            : im
                        ),
                      });
                    }}
                    className="rounded px-1 hover:bg-zinc-200"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurrentSpread({
                        images: (currentSpread.images || []).filter((im) => im.id !== img.id),
                      });
                    }}
                    className="rounded px-1 text-rose-600 hover:bg-rose-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* Floating Layer 2: Draggable & Resizable Stickers */}
            {(currentSpread.stickers || []).map((stk) => (
              <div
                key={stk.id}
                style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDragState({
                    kind: 'sticker',
                    id: stk.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: stk.x,
                    origY: stk.y,
                  });
                }}
                className="group absolute z-20 cursor-grab select-none active:cursor-grabbing"
              >
                <div
                  className="drop-shadow-md transition-transform"
                  style={{ fontSize: `${Math.round(30 * stk.scale)}px`, lineHeight: 1 }}
                >
                  {stk.glyph}
                </div>
                <div className="mt-0.5 hidden items-center justify-center gap-1 rounded-full bg-black/80 px-1.5 py-0.5 text-[10px] text-white group-hover:flex">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurrentSpread({
                        stickers: (currentSpread.stickers || []).map((s) =>
                          s.id === stk.id
                            ? { ...s, scale: Math.max(0.6, Number((s.scale - 0.15).toFixed(2))) }
                            : s
                        ),
                      });
                    }}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurrentSpread({
                        stickers: (currentSpread.stickers || []).map((s) =>
                          s.id === stk.id
                            ? { ...s, scale: Math.min(2.0, Number((s.scale + 0.15).toFixed(2))) }
                            : s
                        ),
                      });
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCurrentSpread({
                        stickers: (currentSpread.stickers || []).filter((s) => s.id !== stk.id),
                      });
                    }}
                    className="text-rose-400"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* Floating Layer 3: Movable Colored Sticky Notes */}
            {(currentSpread.stickyNotes || []).map((note) => (
              <div
                key={note.id}
                style={{
                  left: `${note.x}%`,
                  top: `${note.y}%`,
                  backgroundColor: note.color,
                  color: note.textColor,
                }}
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
                  e.stopPropagation();
                  setDragState({
                    kind: 'sticky',
                    id: note.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: note.x,
                    origY: note.y,
                  });
                }}
                className="absolute z-30 w-44 cursor-grab rounded-lg border border-black/15 p-2.5 shadow-lg active:cursor-grabbing"
              >
                <div className="mb-1 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {STICKY_NOTE_PALETTE.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() =>
                          updateCurrentSpread({
                            stickyNotes: (currentSpread.stickyNotes || []).map((n) =>
                              n.id === note.id
                                ? { ...n, color: pal.bg, textColor: pal.text }
                                : n
                            ),
                          })
                        }
                        title={pal.name}
                        className="h-3 w-3 rounded-full border border-black/25"
                        style={{ backgroundColor: pal.bg }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentSpread({
                        stickyNotes: (currentSpread.stickyNotes || []).filter(
                          (n) => n.id !== note.id
                        ),
                      })
                    }
                    className="text-xs font-bold opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={note.text}
                  onChange={(e) =>
                    updateCurrentSpread({
                      stickyNotes: (currentSpread.stickyNotes || []).map((n) =>
                        n.id === note.id ? { ...n, text: e.target.value } : n
                      ),
                    })
                  }
                  className="font-journal-handwritten w-full resize-none bg-transparent text-xs leading-snug focus:outline-none"
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Dock Floating Popovers */}
        {activePopover === 'font' && (
          <div className="absolute bottom-2 right-2 z-40 w-72 rounded-2xl border border-white/15 bg-[#18181B]/95 p-5 text-center shadow-2xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white">{t.writingFontTitle}</h3>
            <p className="mt-1 text-xs text-zinc-400">{t.writingFontSub}</p>
            <div className="mt-4 space-y-2.5">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onUpdateJournal({
                      ...openBook,
                      font: opt.id,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`flex h-11 w-full items-center justify-center rounded-xl border bg-[#242429] text-white transition-all ${
                    openBook.font === opt.id
                      ? 'border-white ring-1 ring-white'
                      : 'border-white/10 hover:border-white/35'
                  } ${opt.className}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePopover === 'paper' && (
          <div className="absolute bottom-2 right-2 z-40 w-64 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 shadow-2xl">
            <h3 className="text-xs font-semibold text-white">Paper Ruling</h3>
            <div className="mt-3 space-y-2">
              {PAPER_STYLES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    onUpdateJournal({
                      ...openBook,
                      paperStyle: p.id,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs ${
                    openBook.paperStyle === p.id
                      ? 'border-white bg-white/15 text-white'
                      : 'border-white/10 bg-[#242429] text-zinc-300'
                  }`}
                >
                  <span>{p.label}</span>
                  {openBook.paperStyle === p.id && <span className="text-[10px]">Active</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePopover === 'mood' && (
          <div className="absolute bottom-2 right-2 z-40 w-72 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 shadow-2xl">
            <h3 className="text-xs font-semibold text-white">Day Mood Category</h3>
            <div className="mt-3 grid grid-cols-1 gap-1.5">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    updateSpreadField('moodTag', tag);
                    setActivePopover(null);
                  }}
                  className={`rounded-xl border px-3 py-2 text-left text-xs ${
                    currentSpread.moodTag === tag
                      ? 'border-white bg-white/15 text-white'
                      : 'border-white/10 bg-[#242429] text-zinc-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePopover === 'emoji' && (
          <div className="absolute bottom-2 right-2 z-40 w-80 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold">
                Insert Emoji ({activeSide === 'left' ? 'Left Page' : 'Right Page'})
              </h3>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    {cat.label}
                  </p>
                  <div className="mt-1.5 grid grid-cols-6 gap-1.5">
                    {cat.emojis.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handleInsertEmoji(em)}
                        className="rounded-lg bg-white/10 py-1.5 text-lg hover:bg-white/20"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePopover === 'stickers' && (
          <div className="absolute bottom-2 right-2 z-40 w-80 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold">Sticker Store (Click to Place &amp; Drag)</h3>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {STICKER_STORE.map((stk) => (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() => handlePlaceSticker(stk)}
                  className="flex flex-col items-center rounded-xl border border-white/10 bg-[#242429] p-2 hover:border-white/40"
                >
                  <span className="text-2xl">{stk.glyph}</span>
                  <span className="mt-1 truncate text-[10px] text-zinc-300">{stk.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePopover === 'sticky' && (
          <div className="absolute bottom-2 right-2 z-40 w-72 rounded-2xl border border-white/15 bg-[#18181B]/95 p-4 text-white shadow-2xl">
            <h3 className="text-xs font-semibold">Sticky Notes Color Store</h3>
            <p className="mt-1 text-[11px] text-zinc-400">
              Pick a sticky color and place onto the page:
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {STICKY_NOTE_PALETTE.map((pal, idx) => (
                <button
                  key={pal.name}
                  type="button"
                  onClick={() => setStickyColorIdx(idx)}
                  className={`rounded-lg border px-2 py-2 text-[10px] font-semibold ${
                    stickyColorIdx === idx ? 'border-white ring-1 ring-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: pal.bg, color: pal.text }}
                >
                  {pal.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handlePlaceStickyNote}
              className="mt-4 w-full rounded-xl bg-white py-2 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              + Place Movable Sticky Note
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Row: Zoom (60%-180%) | Page Flip (< >) | Creative Dock */}
      <div className="no-print relative z-20 flex flex-wrap items-center justify-between gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center overflow-hidden rounded-xl border border-white/15 bg-[#18181B]/92 text-white shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
            aria-label="Zoom out"
            className="border-r border-white/10 p-2.5 hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="Reset zoom to 100%"
            className="font-mono-tabular px-2.5 text-xs"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
            aria-label="Zoom in"
            className="border-l border-white/10 p-2.5 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* 3D Page Turn Controls */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-[#18181B]/92 px-2.5 py-1.5 text-white shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={handlePrevSpread}
            disabled={spreadIndex === 0}
            aria-label="Previous spread"
            className="rounded-xl p-2 hover:bg-white/10 disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono-tabular px-2 text-xs text-zinc-300">
            {spreadIndex + 1} / {openBook.spreads.length}
          </span>
          <button
            type="button"
            onClick={handleNextSpread}
            aria-label="Next or new spread"
            className="rounded-xl p-2 hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Creative Bottom-Right Dock */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-[#18181B]/92 px-2 py-1.5 text-zinc-200 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => togglePopover('font')}
            title="Writing Font"
            className={`rounded-xl px-2.5 py-2 text-sm font-semibold ${
              activePopover === 'font' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
            }`}
          >
            Aa
          </button>
          <button
            type="button"
            onClick={() => togglePopover('emoji')}
            title="Emoji Picker"
            className={`rounded-xl p-2 ${
              activePopover === 'emoji' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
            }`}
          >
            <Smile className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('stickers')}
            title="Sticker Store"
            className={`rounded-xl p-2 ${
              activePopover === 'stickers' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
            }`}
          >
            <Sticker className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('sticky')}
            title="Movable Sticky Notes"
            className={`rounded-xl p-2 ${
              activePopover === 'sticky' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
            }`}
          >
            <StickyNote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('mood')}
            title="Day Mood"
            className={`rounded-xl p-2 ${
              activePopover === 'mood' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
            }`}
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('paper')}
            title="Paper Style"
            className={`rounded-xl p-2 ${
              activePopover === 'paper' ? 'bg-white/15 text-white' : 'hover:bg-white/10'
            }`}
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleAddSpread}
            title="Add New Page Spread"
            className="rounded-xl p-2 hover:bg-white/10"
          >
            <BookOpen className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Export to PDF Preview & Print Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4 backdrop-blur-sm">
          <div className="no-print mx-auto flex w-full max-w-4xl items-center justify-between rounded-t-2xl border border-white/15 bg-[#18181B] px-5 py-3 text-white">
            <div>
              <h3 className="font-display text-base font-medium">
                PDF Export Preview — {openBook.title}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Archive · Made by Al Tahjib Noor Raiyan ({openBook.spreads.length} spreads)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                className="rounded-lg border border-white/15 p-1.5 text-zinc-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="print-only-journal mx-auto w-full max-w-4xl flex-1 space-y-8 overflow-y-auto rounded-b-2xl bg-white p-8 text-black shadow-2xl">
            <div className="border-b border-black/15 pb-4">
              <h1 className="font-display text-2xl font-bold">{openBook.title}</h1>
              <p className="mt-1 text-xs text-zinc-600">
                {openBook.subtitle} · Personal Journal of Al Tahjib Noor Raiyan
              </p>
            </div>

            {openBook.spreads.map((sp, i) => (
              <div key={sp.id} className="space-y-4 border-b border-black/10 pb-6 break-inside-avoid">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-semibold">Spread {i + 1}</span>
                  <span>
                    {sp.moodTag || 'Journal Entry'} · {sp.leftDate}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-[#FAF8F4] p-4">
                    <p className="mb-2 text-[11px] text-zinc-500">
                      {sp.leftDate} {sp.leftTime ? `· ${sp.leftTime}` : ''}
                    </p>
                    <p className={`whitespace-pre-wrap text-sm ${fontClass}`}>
                      {sp.leftContent || '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-[#FAF8F4] p-4">
                    <p className="mb-2 text-[11px] text-zinc-500">
                      {sp.rightDate} {sp.rightTime ? `· ${sp.rightTime}` : ''}
                    </p>
                    <p className={`whitespace-pre-wrap text-sm ${fontClass}`}>
                      {sp.rightContent || '—'}
                    </p>
                  </div>
                </div>
                {(sp.stickyNotes?.length || sp.stickers?.length) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sp.stickers?.map((stk) => (
                      <span key={stk.id} className="text-base">
                        {stk.glyph}
                      </span>
                    ))}
                    {sp.stickyNotes?.map((note) => (
                      <span
                        key={note.id}
                        className="rounded border border-black/15 px-2.5 py-1 text-xs"
                        style={{ backgroundColor: note.color, color: note.textColor }}
                      >
                        {note.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete / Tear Page Confirmation Modal */}
      {showDeletePageConfirm && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/15 bg-[#161618] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Scissors className="h-5 w-5" />
              <h3 className="font-display text-lg font-medium text-white">
                {openBook.spreads.length <= 1
                  ? 'Clear This Page Spread?'
                  : `Delete Page Spread ${spreadIndex + 1}?`}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              {openBook.spreads.length <= 1
                ? 'This is the only page spread in this journal. Confirming will tear out and replace it with a clean blank spread.'
                : `This will permanently tear out and remove Spread ${spreadIndex + 1} (${currentSpread.leftDate}), along with any sticky notes or photos on it.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeletePageConfirm(false)}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentSpread}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Yes, Delete Page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
