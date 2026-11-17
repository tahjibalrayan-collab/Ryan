import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Info,
  List,
  Minus,
  MoreVertical,
  Plus,
  Smile,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import { formatShortJournalDate, WALLPAPER_PRESETS } from '../data/seedData';
import {
  AppTheme,
  JournalBook,
  JournalFontOption,
  JournalPaperStyle,
  JournalSpread,
  Language,
  WallpaperPreset,
} from '../types';

interface PersonalJournalModuleProps {
  lang: Language;
  theme: AppTheme;
  journals: JournalBook[];
  onUpdateJournal: (updated: JournalBook) => void;
  onCreateJournal: (book: JournalBook) => void;
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
  { cover: '#DCEAD7', text: '#252B24', name: 'Sage Mint' },
  { cover: '#D9B19F', text: '#2A1E19', name: 'Terracotta Clay' },
  { cover: '#9EAAC2', text: '#19202C', name: 'Slate Indigo' },
  { cover: '#EAE3D2', text: '#2B2620', name: 'Warm Parchment' },
  { cover: '#2B2E36', text: '#F4F2ED', name: 'Obsidian Linen' },
];

const MOOD_TAGS = ['Grounded', 'Focused', 'Curious', 'Serene', 'Reflective', 'Energized'];

const PAPER_STYLES: Array<{ id: JournalPaperStyle; label: string }> = [
  { id: 'plain', label: 'Plain Ivory' },
  { id: 'lined', label: 'Lined Pages' },
  { id: 'dotted', label: 'Dot Grid' },
  { id: 'grid', label: 'Graph Grid' },
];

type ActivePopover = 'font' | 'backdrop' | 'contents' | 'cover' | 'info' | 'paper' | 'mood' | 'more' | null;

export const PersonalJournalModule: React.FC<PersonalJournalModuleProps> = ({
  lang,
  theme,
  journals,
  onUpdateJournal,
  onCreateJournal,
  onDeleteJournal,
  customWallpaper,
  onUploadCustomWallpaper,
}) => {
  const t = UI_TEXT[lang];
  const isPaper = theme === 'paper';
  const [openBookId, setOpenBookId] = useState<string | null>(null);
  const [spreadIndex, setSpreadIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [activePopover, setActivePopover] = useState<ActivePopover>('font');
  const [showNewModal, setShowNewModal] = useState(false);

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

  const handleOpenBook = (book: JournalBook) => {
    setOpenBookId(book.id);
    setSpreadIndex(0);
    setZoom(1);
    setActivePopover(null);
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const swatch = COVER_SWATCHES[newCoverIdx];
    const todayStr = formatShortJournalDate(new Date());
    const created: JournalBook = {
      id: `journal-${Date.now()}`,
      title: newTitle.trim().toUpperCase(),
      subtitle: newSubtitle.trim() || 'Personal reflections & entries',
      coverColor: swatch.cover,
      textColor: swatch.text,
      font: 'Scribble',
      paperStyle: 'plain',
      backdropId: 'plum-dusk',
      updatedAt: new Date().toISOString(),
      spreads: [
        {
          id: `spread-${Date.now()}`,
          leftDate: todayStr,
          leftContent: '',
          rightDate: todayStr,
          rightContent: '',
          moodTag: 'Grounded',
        },
      ],
    };
    onCreateJournal(created);
    setNewTitle('');
    setNewSubtitle('');
    setShowNewModal(false);
    handleOpenBook(created);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Shelf View (Screenshot 1 inspired)
  if (!openBook) {
    return (
      <div className="space-y-8">
        <section
          className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${
            isPaper ? 'border-[#C6BEB0]' : 'border-white/8'
          }`}
        >
          <div>
            <p className={`text-xs font-medium ${isPaper ? 'text-[#8D5B16]' : 'text-[#D4A359]'}`}>
              {t.journalEyebrow}
            </p>
            <h1
              className={`mt-1.5 text-3xl font-medium tracking-tight ${
                isPaper ? 'text-[#1F1C18]' : 'text-[#F4F2ED]'
              }`}
            >
              {t.journalTitle}
            </h1>
            <p className={`mt-1.5 text-sm ${isPaper ? 'text-[#665E52]' : 'text-[#9CA3AF]'}`}>
              {t.journalDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-[#D4A359] px-4 py-2.5 text-xs font-semibold text-[#111215] transition-colors hover:bg-[#DFB26D]"
          >
            <Plus className="h-4 w-4" />
            <span>{t.newJournalBtn}</span>
          </button>
        </section>

        {/* Bookshelf Grid */}
        <section
          className={`rounded-2xl border px-6 py-10 sm:px-10 ${
            isPaper ? 'border-[#C6BEB0] bg-[#E8E3D8]' : 'border-white/8 bg-[#18191D]'
          }`}
        >
          <div className="grid grid-cols-1 gap-8 pb-6 sm:grid-cols-2 lg:grid-cols-4">
            {journals.map((book) => (
              <div key={book.id} className="group flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleOpenBook(book)}
                  className="relative flex h-72 w-52 flex-col items-center justify-center rounded-r-xl rounded-l-sm px-6 text-center shadow-[0_20px_38px_-14px_rgba(0,0,0,0.85)] transition-all duration-200 group-hover:-translate-y-2 group-hover:shadow-[0_28px_46px_-14px_rgba(0,0,0,0.95)]"
                  style={{
                    backgroundColor: book.coverColor,
                    color: book.textColor,
                  }}
                >
                  {/* Hardcover Spine Crease */}
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
                  <p className="text-xs font-medium text-[#E5E7EB]">
                    {book.spreads.length} {book.spreads.length === 1 ? 'spread' : 'spreads'}
                  </p>
                  <p className="text-[11px] text-[#7D8494]">
                    Edited {new Date(book.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Empty Add-Book Slot */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="flex h-72 w-52 flex-col items-center justify-center rounded-r-xl rounded-l-sm border border-dashed border-white/15 bg-white/[0.02] px-6 text-center text-[#8D93A1] transition-colors hover:border-[#D4A359]/60 hover:bg-white/[0.04] hover:text-[#F4F2ED]"
              >
                <Plus className="h-6 w-6" />
                <span className="mt-3 text-xs font-medium">Bind New Journal</span>
                <span className="mt-1 text-[11px] text-[#6E7483]">
                  Custom cover &amp; typography
                </span>
              </button>
            </div>
          </div>

          <div className="shelf-ledge h-4 w-full rounded-md border-t border-white/10" />
        </section>

        {/* New Journal Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <form
              onSubmit={handleCreateBook}
              className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#181A1F] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-medium text-[#F4F2ED]">
                  Create New Journal
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="text-xs text-[#8D93A1] hover:text-[#F4F2ED]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label htmlFor="new-j-title" className="block text-xs font-medium text-[#B5BAC6]">
                  Cover Title
                </label>
                <input
                  id="new-j-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., MORNING CLARITY & STUDY LOG"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3.5 py-2.5 text-sm text-[#F4F2ED] focus:border-[#D4A359] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-j-sub" className="block text-xs font-medium text-[#B5BAC6]">
                  Subtitle
                </label>
                <input
                  id="new-j-sub"
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Optional quiet subtitle"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111215] px-3.5 py-2.5 text-sm text-[#F4F2ED] focus:border-[#D4A359] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-[#B5BAC6]">Cover Binding</span>
                <div className="mt-2 flex items-center gap-3">
                  {COVER_SWATCHES.map((s, idx) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setNewCoverIdx(idx)}
                      title={s.name}
                      className={`h-9 w-9 rounded-lg border-2 transition-transform ${
                        newCoverIdx === idx ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: s.cover }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#D4A359] px-4 py-2.5 text-sm font-semibold text-[#111215] hover:bg-[#DFB26D]"
              >
                Place on Shelf &amp; Open
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Open Book Spread View (Screenshot 2 inspired)
  const currentSpread: JournalSpread =
    openBook.spreads[spreadIndex] ?? openBook.spreads[0];

  const backdropPreset =
    allBackdrops.find((b) => b.id === openBook.backdropId) ?? WALLPAPER_PRESETS[1];

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

  const updateSpreadField = (
    field: 'leftContent' | 'rightContent' | 'leftDate' | 'rightDate' | 'moodTag',
    value: string
  ) => {
    const nextSpreads = openBook.spreads.map((sp, i) =>
      i === spreadIndex ? { ...sp, [field]: value } : sp
    );
    onUpdateJournal({
      ...openBook,
      spreads: nextSpreads,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSpread = () => {
    const todayStr = formatShortJournalDate(new Date());
    const newSpread: JournalSpread = {
      id: `spread-${Date.now()}`,
      leftDate: todayStr,
      leftContent: '',
      rightDate: todayStr,
      rightContent: '',
      moodTag: 'Reflective',
    };
    const nextSpreads = [...openBook.spreads, newSpread];
    onUpdateJournal({
      ...openBook,
      spreads: nextSpreads,
      updatedAt: new Date().toISOString(),
    });
    setSpreadIndex(nextSpreads.length - 1);
  };

  const handlePrevSpread = () => {
    if (spreadIndex > 0) setSpreadIndex(spreadIndex - 1);
  };

  const handleNextSpread = () => {
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
      className="relative flex min-h-[700px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-4 sm:p-6"
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
    >
      {/* Top Bar: Back Button + Floating Dark Toolbar (Screenshot 2 faithful) */}
      <div className="relative z-20 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpenBookId(null)}
          title="Back to My Journals shelf"
          aria-label="Back to My Journals shelf"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#202124]/90 text-[#E5E7EB] shadow-lg backdrop-blur-md transition-colors hover:bg-[#2C2E33]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Top-right floating toolbar */}
        <div className="relative flex items-center gap-1 rounded-2xl border border-white/10 bg-[#202124]/90 px-2 py-1.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => togglePopover('info')}
            title="Journal Info"
            aria-label="Journal Info"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'info' ? 'bg-white/15 text-white' : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('contents')}
            title="Page Spreads & Contents"
            aria-label="Page Spreads & Contents"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'contents' ? 'bg-white/15 text-white' : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('cover')}
            title="Customize Cover & Title"
            aria-label="Customize Cover & Title"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'cover' ? 'bg-white/15 text-white' : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('backdrop')}
            title="Background Personalization"
            aria-label="Background Personalization"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'backdrop' ? 'bg-white/15 text-white' : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('mood')}
            title="Spread Mood Tag"
            aria-label="Spread Mood Tag"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'mood' ? 'bg-white/15 text-white' : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('more')}
            title="More Options"
            aria-label="More Options"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'more' ? 'bg-white/15 text-white' : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Top-right Popover Panels */}
          {activePopover === 'info' && (
            <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl border border-white/10 bg-[#202124]/95 p-4 text-xs text-[#D1D5DB] shadow-2xl backdrop-blur-md">
              <p className="font-semibold text-white">{openBook.title}</p>
              <p className="mt-1 text-[#9CA3AF]">{openBook.subtitle}</p>
              <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Writing Font</span>
                  <span className="text-white">{fontMeta.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Spreads</span>
                  <span className="font-mono-tabular text-white">{openBook.spreads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Total Words</span>
                  <span className="font-mono-tabular text-white">{totalWords}</span>
                </div>
              </div>
            </div>
          )}

          {activePopover === 'contents' && (
            <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl border border-white/10 bg-[#202124]/95 p-4 text-xs shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Page Spreads</span>
                <button
                  type="button"
                  onClick={handleAddSpread}
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/20"
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
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                      i === spreadIndex
                        ? 'bg-white/15 text-white'
                        : 'text-[#B5BAC6] hover:bg-white/8'
                    }`}
                  >
                    <span className="truncate">
                      Spread {i + 1} · {sp.leftDate}
                    </span>
                    {sp.moodTag && (
                      <span className="text-[10px] text-[#D4A359]">{sp.moodTag}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePopover === 'cover' && (
            <div className="absolute right-0 top-14 z-30 w-72 space-y-3 rounded-2xl border border-white/10 bg-[#202124]/95 p-4 text-xs shadow-2xl backdrop-blur-md">
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
                className="w-full rounded-lg border border-white/15 bg-[#151619] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
              />
              <div className="flex items-center gap-2.5 pt-1">
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
                      openBook.coverColor === s.cover ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: s.cover }}
                  />
                ))}
              </div>
            </div>
          )}

          {activePopover === 'backdrop' && (
            <div className="absolute right-0 top-14 z-30 w-80 space-y-3 rounded-2xl border border-white/10 bg-[#202124]/95 p-4 text-xs shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Journal Backdrop</p>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/20">
                  <Upload className="h-3 w-3" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {allBackdrops.map((preset) => {
                  const selected = openBook.backdropId === preset.id;
                  return (
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
                      className={`overflow-hidden rounded-xl border text-left transition-all ${
                        selected ? 'border-white ring-1 ring-white' : 'border-white/10 opacity-85 hover:opacity-100'
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
                      <p className="truncate bg-[#16171A] px-2 py-1 text-[11px] text-[#E5E7EB]">
                        {preset.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activePopover === 'more' && (
            <div className="absolute right-0 top-14 z-30 w-56 space-y-1 rounded-2xl border border-white/10 bg-[#202124]/95 p-2 text-xs shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  handleAddSpread();
                  setActivePopover(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[#E5E7EB] hover:bg-white/10"
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
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-300 hover:bg-red-500/15"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete This Journal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Realistic Two-Page Open Book Spread */}
      <div className="relative z-10 my-8 flex flex-1 items-center justify-center">
        <div
          className="grid w-full max-w-[780px] grid-cols-1 overflow-hidden rounded-2xl bg-[#FAF8F2] text-[#2A2622] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.75)] transition-transform duration-200 md:grid-cols-2"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          {/* Left Page */}
          <div
            className={`journal-spine-left relative flex min-h-[380px] flex-col border-b border-black/10 p-6 sm:min-h-[440px] sm:p-8 md:border-b-0 md:border-r md:border-black/10 ${paperClass}`}
          >
            <div className="flex items-center justify-between text-[#6A6258]">
              <span className="text-[11px] font-medium tracking-wide opacity-75">
                {currentSpread.moodTag || 'Journal'}
              </span>
              <input
                type="text"
                aria-label="Left page date"
                value={currentSpread.leftDate}
                onChange={(e) => updateSpreadField('leftDate', e.target.value)}
                className="font-journal-scribble w-24 bg-transparent text-right text-sm text-[#575047] focus:outline-none"
              />
            </div>

            <textarea
              value={currentSpread.leftContent}
              onChange={(e) => updateSpreadField('leftContent', e.target.value)}
              placeholder="Write freely on the left page..."
              aria-label="Left journal page"
              className={`mt-4 w-full flex-1 resize-none bg-transparent text-[#2B2621] placeholder:text-[#A39B8F] focus:outline-none ${fontClass}`}
            />
          </div>

          {/* Right Page */}
          <div
            className={`journal-spine-right relative flex min-h-[380px] flex-col p-6 sm:min-h-[440px] sm:p-8 ${paperClass}`}
          >
            <div className="flex items-center justify-end text-[#6A6258]">
              <input
                type="text"
                aria-label="Right page date"
                value={currentSpread.rightDate}
                onChange={(e) => updateSpreadField('rightDate', e.target.value)}
                className="font-journal-scribble w-24 bg-transparent text-right text-sm text-[#575047] focus:outline-none"
              />
            </div>

            <textarea
              value={currentSpread.rightContent}
              onChange={(e) => updateSpreadField('rightContent', e.target.value)}
              placeholder="Continue your thoughts, study reflections, or takeaways here..."
              aria-label="Right journal page"
              className={`mt-4 w-full flex-1 resize-none bg-transparent text-[#2B2621] placeholder:text-[#A39B8F] focus:outline-none ${fontClass}`}
            />
          </div>
        </div>

        {/* Floating Writing Font Popover (Matching Screenshot 2 right side) */}
        {activePopover === 'font' && (
          <div className="absolute bottom-2 right-2 z-30 w-72 rounded-2xl border border-white/10 bg-[#202124]/95 p-5 text-center shadow-2xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white">{t.writingFontTitle}</h3>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              {t.writingFontSub}
            </p>

            <div className="mt-4 space-y-2.5">
              {FONT_OPTIONS.map((opt) => {
                const isSelected = openBook.font === opt.id;
                return (
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
                    className={`flex h-12 w-full items-center justify-center rounded-xl border bg-[#26272B] text-[#F4F2ED] transition-all ${
                      isSelected
                        ? 'border-white ring-1 ring-white/80'
                        : 'border-white/10 hover:border-white/35'
                    } ${opt.className}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Paper Style Popover */}
        {activePopover === 'paper' && (
          <div className="absolute bottom-2 right-2 z-30 w-64 rounded-2xl border border-white/10 bg-[#202124]/95 p-4 shadow-2xl backdrop-blur-md">
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
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
                    openBook.paperStyle === p.id
                      ? 'border-white bg-[#2C2E33] text-white'
                      : 'border-white/10 bg-[#26272B] text-[#B5BAC6] hover:border-white/30'
                  }`}
                >
                  <span>{p.label}</span>
                  {openBook.paperStyle === p.id && <span className="text-[10px]">Active</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mood Stamp Popover */}
        {activePopover === 'mood' && (
          <div className="absolute bottom-2 right-2 z-30 w-64 rounded-2xl border border-white/10 bg-[#202124]/95 p-4 shadow-2xl backdrop-blur-md">
            <h3 className="text-xs font-semibold text-white">Page Mood</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    updateSpreadField('moodTag', tag);
                    setActivePopover(null);
                  }}
                  className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                    currentSpread.moodTag === tag
                      ? 'border-white bg-[#2C2E33] text-white'
                      : 'border-white/10 bg-[#26272B] text-[#B5BAC6] hover:border-white/30'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Row: Zoom (+/-) | Page Turn (< >) | Customization Dock (Aa, Mood, Paper) */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4">
        {/* Bottom-left Zoom */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#202124]/90 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.15, Number((z + 0.05).toFixed(2))))}
            aria-label="Zoom in"
            className="border-b border-white/10 p-2.5 text-[#E5E7EB] hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.05).toFixed(2))))}
            aria-label="Zoom out"
            className="p-2.5 text-[#E5E7EB] hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom-center Page Turn */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#202124]/90 px-2 py-1.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={handlePrevSpread}
            disabled={spreadIndex === 0}
            aria-label="Previous spread"
            className="rounded-xl p-2 text-[#E5E7EB] transition-colors hover:bg-white/10 disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono-tabular px-2 text-xs text-[#B5BAC6]">
            {spreadIndex + 1} / {openBook.spreads.length}
          </span>
          <button
            type="button"
            onClick={handleNextSpread}
            aria-label="Next or new spread"
            title={
              spreadIndex === openBook.spreads.length - 1
                ? 'Add next spread'
                : 'Next spread'
            }
            className="rounded-xl p-2 text-[#E5E7EB] transition-colors hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom-right Dock */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#202124]/90 px-2 py-1.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => togglePopover('font')}
            title="Writing Font"
            aria-label="Writing Font"
            className={`rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors ${
              activePopover === 'font'
                ? 'bg-white/15 text-white'
                : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            Aa
          </button>
          <button
            type="button"
            onClick={() => togglePopover('mood')}
            title="Spread Mood"
            aria-label="Spread Mood"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'mood'
                ? 'bg-white/15 text-white'
                : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <Smile className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => togglePopover('paper')}
            title="Paper Ruling"
            aria-label="Paper Ruling"
            className={`rounded-xl p-2 transition-colors ${
              activePopover === 'paper'
                ? 'bg-white/15 text-white'
                : 'text-[#D1D5DB] hover:bg-white/10'
            }`}
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleAddSpread}
            title="Add New Page Spread"
            aria-label="Add New Page Spread"
            className="rounded-xl p-2 text-[#D1D5DB] transition-colors hover:bg-white/10"
          >
            <BookOpen className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
