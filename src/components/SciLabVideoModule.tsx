import React, { useEffect, useMemo, useState } from 'react';
import {
  Atom,
  BookOpen,
  Calculator,
  Check,
  Columns2,
  Delete,
  FileText,
  FlaskConical,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sigma,
  Timer,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import {
  CHEMICAL_COMPOUNDS,
  CHEMICAL_REACTIONS,
  ChemicalElement,
  CHEMISTRY_CONSTANTS,
  ELEMENT_CATEGORY_LABELS,
  ElementCategory,
  ELEMENTS_118,
} from '../data/elements118';
import {
  FormulaLevel,
  FORMULAS_VAULT,
  FormulaSubject,
  MATH_CATEGORIES,
  PHYSICS_CATEGORIES,
} from '../data/formulasVault';
import { AppTheme, Language, LibraryBook, SavedVideoLink } from '../types';
import { loadPdfObjectUrl } from '../utils/pdfStorage';
import { getThemeTokens } from '../utils/themeStyles';

export interface DockedTimerControls {
  durationMinutes: number;
  secondsLeft: number;
  isRunning: boolean;
  isAlarmRinging: boolean;
  subject: string;
  topic: string;
  onSelectDuration: (mins: number) => void;
  onToggleRun: () => void;
  onResetTimer: () => void;
  onStopAlarm: () => void;
  onChangeSubject: (val: string) => void;
  onChangeTopic: (val: string) => void;
  onQuickDone: () => void;
}

interface SciLabVideoModuleProps {
  lang: Language;
  theme: AppTheme;
  savedVideos: SavedVideoLink[];
  libraryBooks: LibraryBook[];
  dockedTimer: DockedTimerControls;
  onAddVideo: (video: SavedVideoLink) => void;
  onDeleteVideo: (id: string) => void;
  onStudyVideoInTimer: (video: SavedVideoLink) => void;
}

type LabTab = 'split' | 'formulas' | 'calculator' | 'chemistry' | 'video';
type ChemSubTab = 'table' | 'compounds' | 'reactions' | 'molarity';
type SplitRightMode = 'pdf' | 'formulas';

// Safe recursive-descent math expression evaluator (no eval / no Function constructor)
function evaluateScientificExpression(
  expr: string,
  angleMode: 'DEG' | 'RAD',
  ansValue: number
): number {
  const normalized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/ANS/gi, `(${ansValue})`);

  type Token =
    | { type: 'num'; val: number }
    | { type: 'op'; val: string }
    | { type: 'ident'; val: string }
    | { type: 'paren'; val: '(' | ')' };

  const tokens: Token[] = [];
  let i = 0;

  while (i < normalized.length) {
    const ch = normalized[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < normalized.length && /[0-9.]/.test(normalized[i])) {
        numStr += normalized[i++];
      }
      if (
        i < normalized.length &&
        (normalized[i] === 'e' || normalized[i] === 'E') &&
        /[0-9+-]/.test(normalized[i + 1] || '')
      ) {
        numStr += normalized[i++];
        if (normalized[i] === '+' || normalized[i] === '-') {
          numStr += normalized[i++];
        }
        while (i < normalized.length && /[0-9]/.test(normalized[i])) {
          numStr += normalized[i++];
        }
      }
      const parsed = Number(numStr);
      if (Number.isNaN(parsed)) throw new Error('Invalid number');
      tokens.push({ type: 'num', val: parsed });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < normalized.length && /[a-zA-Z0-9]/.test(normalized[i])) {
        ident += normalized[i++];
      }
      const lower = ident.toLowerCase();
      if (lower === 'pi') {
        tokens.push({ type: 'num', val: Math.PI });
      } else if (lower === 'e') {
        tokens.push({ type: 'num', val: Math.E });
      } else {
        tokens.push({ type: 'ident', val: lower });
      }
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', val: ch });
      i++;
      continue;
    }
    if ('+-*/^%!'.includes(ch)) {
      tokens.push({ type: 'op', val: ch });
      i++;
      continue;
    }
    throw new Error(`Unsupported symbol: ${ch}`);
  }

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const toRad = (x: number) => (angleMode === 'DEG' ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (angleMode === 'DEG' ? (x * 180) / Math.PI : x);

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('Domain error');
    let res = 1;
    for (let k = 2; k <= n; k++) res *= k;
    return res;
  };

  function parseExpression(): number {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek()!.val === '+' || peek()!.val === '-')) {
      const op = consume()!.val;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (
      peek()?.type === 'op' &&
      (peek()!.val === '*' || peek()!.val === '/' || peek()!.val === '%')
    ) {
      const op = consume()!.val;
      const right = parsePower();
      if (op === '*') left *= right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left /= right;
      } else {
        left %= right;
      }
    }
    return left;
  }

  function parsePower(): number {
    const base = parseUnary();
    if (peek()?.type === 'op' && peek()!.val === '^') {
      consume();
      const exponent = parsePower();
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parseUnary(): number {
    if (peek()?.type === 'op' && peek()!.val === '-') {
      consume();
      return -parseUnary();
    }
    if (peek()?.type === 'op' && peek()!.val === '+') {
      consume();
      return parseUnary();
    }
    return parsePostfix();
  }

  function parsePostfix(): number {
    let val = parsePrimary();
    while (peek()?.type === 'op' && peek()!.val === '!') {
      consume();
      val = factorial(val);
    }
    return val;
  }

  function parsePrimary(): number {
    const tok = peek();
    if (!tok) throw new Error('Incomplete expression');

    if (tok.type === 'num') {
      consume();
      if (
        peek()?.type === 'paren' &&
        (peek() as { type: 'paren'; val: string }).val === '('
      ) {
        return tok.val * parsePrimary();
      }
      return tok.val;
    }

    if (tok.type === 'paren' && tok.val === '(') {
      consume();
      const val = parseExpression();
      const close = consume();
      if (!close || close.type !== 'paren' || close.val !== ')') {
        throw new Error('Missing )');
      }
      return val;
    }

    if (tok.type === 'ident') {
      const fn = consume()!.val as string;
      const open = consume();
      if (!open || open.type !== 'paren' || open.val !== '(') {
        throw new Error(`Expected ( after ${fn}`);
      }
      const arg = parseExpression();
      const close = consume();
      if (!close || close.type !== 'paren' || close.val !== ')') {
        throw new Error('Missing )');
      }

      switch (fn) {
        case 'sin':
          return Math.sin(toRad(arg));
        case 'cos':
          return Math.cos(toRad(arg));
        case 'tan':
          return Math.tan(toRad(arg));
        case 'asin':
          return fromRad(Math.asin(arg));
        case 'acos':
          return fromRad(Math.acos(arg));
        case 'atan':
          return fromRad(Math.atan(arg));
        case 'sinh':
          return Math.sinh(arg);
        case 'cosh':
          return Math.cosh(arg);
        case 'tanh':
          return Math.tanh(arg);
        case 'log':
          if (arg <= 0) throw new Error('Domain error');
          return Math.log10(arg);
        case 'ln':
          if (arg <= 0) throw new Error('Domain error');
          return Math.log(arg);
        case 'sqrt':
          if (arg < 0) throw new Error('Domain error');
          return Math.sqrt(arg);
        case 'cbrt':
          return Math.cbrt(arg);
        case 'abs':
          return Math.abs(arg);
        case 'exp':
          return Math.exp(arg);
        default:
          throw new Error(`Unknown function: ${fn}`);
      }
    }

    throw new Error('Syntax error');
  }

  const result = parseExpression();
  if (pos < tokens.length) throw new Error('Unexpected trailing token');
  if (!Number.isFinite(result)) throw new Error('Math error');
  return result;
}

function formatCalcResult(val: number): string {
  if (Math.abs(val) < 1e-12) return '0';
  if (Math.abs(val) >= 1e10 || Math.abs(val) < 1e-6) {
    return val.toExponential(6).replace(/\.?0+e/, 'e');
  }
  return Number(val.toPrecision(12)).toString();
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;

      const parts = url.pathname.split('/').filter(Boolean);
      if (
        parts.length >= 2 &&
        ['embed', 'shorts', 'live', 'v'].includes(parts[0]) &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

const CATEGORY_TILE_CLASSES: Record<ElementCategory, { dark: string; light: string }> = {
  nonmetal: {
    dark: 'border-emerald-400/35 bg-emerald-950/35 text-emerald-100',
    light: 'border-emerald-700/25 bg-emerald-50 text-emerald-950',
  },
  'noble-gas': {
    dark: 'border-sky-400/35 bg-sky-950/35 text-sky-100',
    light: 'border-sky-700/25 bg-sky-50 text-sky-950',
  },
  'alkali-metal': {
    dark: 'border-rose-400/35 bg-rose-950/35 text-rose-100',
    light: 'border-rose-700/25 bg-rose-50 text-rose-950',
  },
  'alkaline-earth': {
    dark: 'border-amber-400/35 bg-amber-950/35 text-amber-100',
    light: 'border-amber-700/25 bg-amber-50 text-amber-950',
  },
  metalloid: {
    dark: 'border-teal-400/35 bg-teal-950/35 text-teal-100',
    light: 'border-teal-700/25 bg-teal-50 text-teal-950',
  },
  halogen: {
    dark: 'border-violet-400/35 bg-violet-950/35 text-violet-100',
    light: 'border-violet-700/25 bg-violet-50 text-violet-950',
  },
  'transition-metal': {
    dark: 'border-zinc-500/40 bg-zinc-800/50 text-zinc-100',
    light: 'border-zinc-400/40 bg-zinc-100 text-zinc-900',
  },
  'post-transition': {
    dark: 'border-slate-400/35 bg-slate-800/45 text-slate-100',
    light: 'border-slate-400/40 bg-slate-100 text-slate-900',
  },
  lanthanide: {
    dark: 'border-indigo-400/35 bg-indigo-950/35 text-indigo-100',
    light: 'border-indigo-700/25 bg-indigo-50 text-indigo-950',
  },
  actinide: {
    dark: 'border-fuchsia-400/35 bg-fuchsia-950/35 text-fuchsia-100',
    light: 'border-fuchsia-700/25 bg-fuchsia-50 text-fuchsia-950',
  },
};

export const SciLabVideoModule: React.FC<SciLabVideoModuleProps> = ({
  lang,
  theme,
  savedVideos,
  libraryBooks,
  dockedTimer,
  onAddVideo,
  onDeleteVideo,
  onStudyVideoInTimer,
}) => {
  const tk = getThemeTokens(theme);
  const [activeTab, setActiveTab] = useState<LabTab>('split');

  // --- Scientific Calculator State (shared between full-view and Split-Screen pane!) ---
  const [expression, setExpression] = useState<string>('sin(30) + log(100)');
  const [resultDisplay, setResultDisplay] = useState<string>('2.5');
  const [ansValue, setAnsValue] = useState<number>(2.5);
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);

  // --- Chemistry 118 Elements & Lab State ---
  const [chemSubTab, setChemSubTab] = useState<ChemSubTab>('table');
  const [elementSearch, setElementSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ElementCategory>('all');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(ELEMENTS_118[5]);

  const [massGrams, setMassGrams] = useState('18.015');
  const [molarMass, setMolarMass] = useState('180.156');
  const [volumeLiters, setVolumeLiters] = useState('0.5');
  const [c1, setC1] = useState('2.0');
  const [v1, setV1] = useState('50');
  const [c2, setC2] = useState('0.5');

  // --- YouTube Video Saver & Player State ---
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoSubjectInput, setVideoSubjectInput] = useState('Physics & Chemistry');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    savedVideos[0]?.id ?? null
  );

  // --- Split-Screen PDF Reader & Formula Companion State ---
  const [splitRightMode, setSplitRightMode] = useState<SplitRightMode>('formulas');
  const [selectedPdfBookId, setSelectedPdfBookId] = useState<string>('');
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
  const [splitPdfTitle, setSplitPdfTitle] = useState<string>('No PDF selected yet');
  const [splitPdfPage, setSplitPdfPage] = useState<number>(1);
  const [showSplitCalc, setShowSplitCalc] = useState<boolean>(true);
  const [dockDoneToast, setDockDoneToast] = useState<string | null>(null);

  // --- Math & Physics Formula Vault State ---
  const [formulaSubject, setFormulaSubject] = useState<'All' | FormulaSubject>('All');
  const [formulaCategory, setFormulaCategory] = useState<string>('All');
  const [formulaLevel, setFormulaLevel] = useState<'All' | FormulaLevel>('All');
  const [formulaQuery, setFormulaQuery] = useState('');

  // Load selected Library Book PDF cleanly inside Split Workspace
  useEffect(() => {
    let revokeUrl: string | null = null;
    let active = true;

    async function loadSelectedBookPdf() {
      if (!selectedPdfBookId) return;
      const book = libraryBooks.find((b) => b.id === selectedPdfBookId);
      if (!book) return;
      setSplitPdfTitle(book.title);
      setSplitPdfPage(Math.max(1, book.currentPage || 1));

      if (book.pdfFileId) {
        const blobUrl = await loadPdfObjectUrl(book.pdfFileId);
        if (active && blobUrl) {
          revokeUrl = blobUrl;
          setSplitPdfUrl(blobUrl);
          return;
        }
      }
      if (active) {
        setSplitPdfUrl(book.pdfUrl || null);
      }
    }

    loadSelectedBookPdf();
    return () => {
      active = false;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [selectedPdfBookId, libraryBooks]);

  const handleUploadSplitLocalPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    setSelectedPdfBookId('');
    setSplitPdfUrl(objUrl);
    setSplitPdfTitle(file.name);
    setSplitPdfPage(1);
    setSplitRightMode('pdf');
    e.target.value = '';
  };

  const appendToExpr = (token: string) => {
    setExpression((prev) => (prev === '0' ? token : prev + token));
  };

  const handleEvaluate = () => {
    if (!expression.trim()) return;
    try {
      const val = evaluateScientificExpression(expression, angleMode, ansValue);
      const formatted = formatCalcResult(val);
      setResultDisplay(formatted);
      setAnsValue(val);
      setHistory((prev) => [{ expr: expression, res: formatted }, ...prev].slice(0, 14));
    } catch (err) {
      setResultDisplay(err instanceof Error ? err.message : 'Error');
    }
  };

  const filteredElementIds = useMemo(() => {
    const q = elementSearch.trim().toLowerCase();
    const set = new Set<number>();
    ELEMENTS_118.forEach((el) => {
      const matchesCat = categoryFilter === 'all' || el.category === categoryFilter;
      const matchesQuery =
        !q ||
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.z) === q;
      if (matchesCat && matchesQuery) set.add(el.z);
    });
    return set;
  }, [elementSearch, categoryFilter]);

  const availableFormulaCategories = useMemo(() => {
    if (formulaSubject === 'Mathematics') return [...MATH_CATEGORIES];
    if (formulaSubject === 'Physics') return [...PHYSICS_CATEGORIES];
    return [...MATH_CATEGORIES, ...PHYSICS_CATEGORIES];
  }, [formulaSubject]);

  const filteredFormulas = useMemo(() => {
    const q = formulaQuery.trim().toLowerCase();
    return FORMULAS_VAULT.filter((f) => {
      if (formulaSubject !== 'All' && f.subject !== formulaSubject) return false;
      if (formulaCategory !== 'All' && f.category !== formulaCategory) return false;
      if (formulaLevel !== 'All' && f.level !== formulaLevel) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.variables.toLowerCase().includes(q) ||
        f.note.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [formulaSubject, formulaCategory, formulaLevel, formulaQuery]);

  const molesComputed = useMemo(() => {
    const m = Number(massGrams);
    const mw = Number(molarMass);
    const v = Number(volumeLiters);
    if (!mw || mw <= 0 || Number.isNaN(m)) return { moles: 0, molarity: 0 };
    const moles = m / mw;
    const molarity = v > 0 ? moles / v : 0;
    return { moles, molarity };
  }, [massGrams, molarMass, volumeLiters]);

  const v2Dilution = useMemo(() => {
    const nc1 = Number(c1);
    const nv1 = Number(v1);
    const nc2 = Number(c2);
    if (!nc2 || nc2 <= 0) return 0;
    return (nc1 * nv1) / nc2;
  }, [c1, v1, c2]);

  const currentVideo = useMemo(
    () => savedVideos.find((v) => v.id === activeVideoId) ?? savedVideos[0] ?? null,
    [savedVideos, activeVideoId]
  );

  const handleSaveYouTubeLink = (e: React.FormEvent) => {
    e.preventDefault();
    const vid = extractYouTubeVideoId(videoUrlInput);
    if (!vid) {
      setVideoError(
        lang === 'bn'
          ? 'সঠিক YouTube লিংক দিন (যেমন youtube.com/watch?v=... বা youtu.be/...)'
          : 'Please paste a valid YouTube link (youtube.com/watch?v=... or youtu.be/...).'
      );
      return;
    }
    setVideoError(null);
    const created: SavedVideoLink = {
      id: `yt-${Date.now()}`,
      title: videoTitleInput.trim() || `Study Lecture (${vid})`,
      subject: videoSubjectInput.trim() || 'Study Lecture',
      url: videoUrlInput.trim(),
      videoId: vid,
      addedAt: new Date().toISOString(),
    };
    onAddVideo(created);
    setActiveVideoId(created.id);
    setVideoUrlInput('');
    setVideoTitleInput('');
  };

  const dockMins = String(Math.floor(dockedTimer.secondsLeft / 60)).padStart(2, '0');
  const dockSecs = String(dockedTimer.secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <section
        className={`no-print flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between ${tk.borderSubtle}`}
      >
        <div>
          <p className={`text-xs font-medium ${tk.accentText}`}>
            Archive · Made by Al Tahjib Noor Raiyan
          </p>
          <h1 className={`mt-1 text-3xl font-medium tracking-tight ${tk.headingText}`}>
            {lang === 'bn'
              ? 'স্প্লিট-স্ক্রিন ভিডিও, ফর্মুলা ও সায়েন্স ল্যাব'
              : 'Split-Screen Study Lab, Formulas & Video'}
          </h1>
          <p className={`mt-1 text-sm ${tk.mutedText}`}>
            {lang === 'bn'
              ? 'ইউটিউব ক্লাস, PDF বই, গণিত-পদার্থবিজ্ঞান সূত্র ভান্ডার, ১১৮ মৌল এবং সায়েন্টিফিক ক্যালকুলেটর ও লাইভ ফোকাস টাইমার একসাথে।'
              : 'Watch lectures side-by-side with PDF textbooks, Math & Physics formulas, scientific calculator, 118 elements & docked focus timer.'}
          </p>
        </div>

        {/* Sub-navigation Tabs */}
        <div
          className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 ${tk.subCardSurface}`}
        >
          {(
            [
              {
                id: 'split',
                icon: Columns2,
                en: 'Split Workspace',
                bn: 'স্প্লিট ওয়ার্কস্পেস',
              },
              {
                id: 'formulas',
                icon: Sigma,
                en: 'Math & Physics PDF',
                bn: 'সূত্র ভান্ডার',
              },
              {
                id: 'calculator',
                icon: Calculator,
                en: 'Scientific Calc',
                bn: 'ক্যালকুলেটর',
              },
              {
                id: 'chemistry',
                icon: Atom,
                en: '118 Elements',
                bn: '১১৮ মৌল',
              },
              {
                id: 'video',
                icon: Video,
                en: 'Video Playlist',
                bn: 'ইউটিউব লিস্ট',
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  active ? tk.primaryBtn : tk.mutedText
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? tab.bn : tab.en}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== TAB 0: MULTI-PANE SPLIT-SCREEN WORKSPACE ==================== */}
      {activeTab === 'split' && (
        <div className="space-y-5">
          {/* Quick Split Controls */}
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${tk.cardSurface}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold ${tk.headingText}`}>Right Pane:</span>
              <button
                type="button"
                onClick={() => setSplitRightMode('formulas')}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  splitRightMode === 'formulas' ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                <Sigma className="h-3.5 w-3.5" />
                <span>Math &amp; Physics Formulas</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitRightMode('pdf')}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  splitRightMode === 'pdf' ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>PDF Reader</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSplitCalc((c) => !c)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  showSplitCalc ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>{showSplitCalc ? 'Hide Calculator Pane' : 'Show Calculator Pane'}</span>
              </button>
            </div>
          </div>

          {/* Multi-Pane Split View */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            {/* PANE 1: YouTube Lecture Video Player + Quick Add */}
            <section
              className={`flex flex-col space-y-3 rounded-2xl border p-4 ${
                showSplitCalc ? 'xl:col-span-5' : 'xl:col-span-6'
              } ${tk.cardSurface}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Video className={`h-4 w-4 ${tk.accentText}`} />
                  <h2 className={`text-sm font-semibold ${tk.headingText}`}>
                    Lecture Video Pane
                  </h2>
                </div>
                {savedVideos.length > 0 && (
                  <select
                    value={currentVideo?.id || ''}
                    onChange={(e) => setActiveVideoId(e.target.value)}
                    aria-label="Choose saved YouTube video"
                    className={`max-w-[200px] rounded-lg border px-2.5 py-1 text-xs focus:outline-none ${tk.inputSurface}`}
                  >
                    {savedVideos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {currentVideo ? (
                <div className="space-y-2">
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/15 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0`}
                      title={currentVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-xs font-semibold ${tk.headingText}`}>
                      {currentVideo.title}
                    </p>
                    <span className={`text-[11px] ${tk.mutedText}`}>{currentVideo.subject}</span>
                  </div>
                </div>
              ) : (
                <div className={`flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center ${tk.borderSubtle}`}>
                  <Video className={`h-7 w-7 ${tk.mutedText}`} />
                  <p className={`mt-2 text-xs font-medium ${tk.headingText}`}>
                    Paste any YouTube URL below to start studying
                  </p>
                </div>
              )}

              {/* Quick Inline YouTube URL Loader */}
              <form onSubmit={handleSaveYouTubeLink} className="mt-auto space-y-2 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="Paste YouTube URL (watch, shorts, live, youtu.be)..."
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
                  />
                  <button
                    type="submit"
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${tk.primaryBtn}`}
                  >
                    Load
                  </button>
                </div>
                {videoError && <p className="text-[11px] text-rose-500">{videoError}</p>}
              </form>
            </section>

            {/* PANE 2: PDF Textbook Reader OR Complete Math & Physics Formulas */}
            <section
              className={`flex flex-col space-y-3 rounded-2xl border p-4 ${
                showSplitCalc ? 'xl:col-span-4' : 'xl:col-span-6'
              } ${tk.cardSurface}`}
            >
              {splitRightMode === 'pdf' ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className={`h-4 w-4 ${tk.accentText}`} />
                      <h2 className={`text-sm font-semibold ${tk.headingText}`}>PDF Reader Pane</h2>
                    </div>

                    <label
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${tk.inputSurface}`}
                    >
                      <Upload className="h-3 w-3" />
                      <span>Open Local PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleUploadSplitLocalPdf}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Library PDF Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPdfBookId}
                      onChange={(e) => setSelectedPdfBookId(e.target.value)}
                      aria-label="Pick a book PDF from Library"
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
                    >
                      <option value="">Choose PDF from Library...</option>
                      {libraryBooks
                        .filter((b) => b.pdfFileId || b.pdfUrl)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title} ({b.genre})
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={splitPdfPage}
                      onChange={(e) => setSplitPdfPage(Math.max(1, Number(e.target.value) || 1))}
                      title="Jump to page"
                      aria-label="PDF page number"
                      className={`font-mono-tabular w-16 rounded-lg border px-2 py-1.5 text-center text-xs ${tk.inputSurface}`}
                    />
                  </div>

                  {splitPdfUrl ? (
                    <div className="flex-1 overflow-hidden rounded-xl border border-black/15 bg-white">
                      <iframe
                        src={`${splitPdfUrl}#page=${splitPdfPage}`}
                        title={splitPdfTitle}
                        className="h-[390px] w-full"
                      />
                    </div>
                  ) : (
                    <div className={`flex h-[390px] flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center ${tk.borderSubtle}`}>
                      <FileText className={`h-8 w-8 ${tk.mutedText}`} />
                      <p className={`mt-2 text-xs font-medium ${tk.headingText}`}>
                        Open a PDF beside your lecture
                      </p>
                      <p className={`mt-1 text-[11px] ${tk.mutedText}`}>
                        Choose any Library PDF above, click &ldquo;Open Local PDF&rdquo;, or switch this pane to Math &amp; Physics Formulas.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sigma className={`h-4 w-4 ${tk.accentText}`} />
                      <h2 className={`text-sm font-semibold ${tk.headingText}`}>
                        Math &amp; Physics Formula Pane
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('formulas')}
                      className={`text-[11px] font-medium hover:underline ${tk.accentText}`}
                    >
                      Full Reference →
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className={`pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${tk.mutedText}`} />
                      <input
                        type="text"
                        value={formulaQuery}
                        onChange={(e) => setFormulaQuery(e.target.value)}
                        placeholder="Search formulas (e.g. Carnot, Derivative, Ohm)..."
                        className={`w-full rounded-lg border py-1.5 pl-8 pr-2.5 text-xs focus:outline-none ${tk.inputSurface}`}
                      />
                    </div>
                    <select
                      value={formulaSubject}
                      onChange={(e) => {
                        setFormulaSubject(e.target.value as 'All' | FormulaSubject);
                        setFormulaCategory('All');
                      }}
                      aria-label="Filter subject"
                      className={`rounded-lg border px-2 py-1.5 text-xs ${tk.inputSurface}`}
                    >
                      <option value="All">All</option>
                      <option value="Mathematics">Math</option>
                      <option value="Physics">Physics</option>
                    </select>
                  </div>

                  <div className="max-h-[395px] flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {filteredFormulas.map((f) => (
                      <div key={f.id} className={`rounded-xl border p-3 ${tk.subCardSurface}`}>
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className={`font-semibold ${tk.accentText}`}>
                            {f.subject} · {f.category}
                          </span>
                          <span className={tk.mutedText}>{f.level}</span>
                        </div>
                        <p className={`mt-1 text-xs font-semibold ${tk.headingText}`}>{f.name}</p>
                        <p className={`font-mono-tabular mt-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${tk.inputSurface}`}>
                          {f.formula}
                        </p>
                        <p className={`mt-1 text-[10px] ${tk.mutedText}`}>{f.variables}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* PANE 3: Integrated Scientific Calculator Widget */}
            {showSplitCalc && (
              <section className={`flex flex-col space-y-3 rounded-2xl border p-4 xl:col-span-3 ${tk.cardSurface}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calculator className={`h-4 w-4 ${tk.accentText}`} />
                    <h2 className={`text-sm font-semibold ${tk.headingText}`}>Calculator</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
                    className={`font-mono-tabular rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tk.activeTabBtn}`}
                  >
                    {angleMode}
                  </button>
                </div>

                <div className={`rounded-xl border p-3 ${tk.subCardSurface}`}>
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEvaluate();
                      }
                    }}
                    aria-label="Compact calculator expression"
                    className={`font-mono-tabular w-full bg-transparent text-right text-xs focus:outline-none ${tk.mutedText}`}
                  />
                  <div className={`font-mono-tabular mt-1 truncate text-right text-xl font-bold ${tk.headingText}`}>
                    = {resultDisplay}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { l: 'sin(', v: 'sin(' },
                    { l: 'cos(', v: 'cos(' },
                    { l: 'tan(', v: 'tan(' },
                    { l: 'log(', v: 'log(' },
                    { l: 'ln(', v: 'ln(' },
                    { l: '√(', v: 'sqrt(' },
                    { l: '^', v: '^' },
                    { l: 'π', v: 'pi' },
                    { l: '7', v: '7' },
                    { l: '8', v: '8' },
                    { l: '9', v: '9' },
                    { l: '÷', v: '÷' },
                    { l: '4', v: '4' },
                    { l: '5', v: '5' },
                    { l: '6', v: '6' },
                    { l: '×', v: '×' },
                    { l: '1', v: '1' },
                    { l: '2', v: '2' },
                    { l: '3', v: '3' },
                    { l: '−', v: '−' },
                    { l: '0', v: '0' },
                    { l: '.', v: '.' },
                    { l: '(', v: '(' },
                    { l: '+', v: '+' },
                    { l: ')', v: ')' },
                    { l: 'ANS', v: 'ANS' },
                    { l: 'DEL', v: 'DEL' },
                    { l: '=', v: '=' },
                  ].map((b) => (
                    <button
                      key={b.l}
                      type="button"
                      onClick={() => {
                        if (b.v === 'DEL') {
                          setExpression((p) => p.slice(0, -1));
                        } else if (b.v === '=') {
                          handleEvaluate();
                        } else {
                          appendToExpr(b.v);
                        }
                      }}
                      className={`font-mono-tabular rounded-lg border py-2 text-xs font-semibold ${
                        b.v === '=' ? tk.primaryBtn : tk.subCardSurface
                      }`}
                    >
                      {b.l}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExpression('');
                    setResultDisplay('0');
                  }}
                  className="rounded-lg border border-rose-500/35 bg-rose-500/10 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20"
                >
                  AC (Clear)
                </button>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 1: MATH & PHYSICS COMPLETE FORMULA REFERENCE & PDF ==================== */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          <div className={`no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${tk.cardSurface}`}>
            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'Mathematics', 'Physics'] as const).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setFormulaSubject(sub);
                    setFormulaCategory('All');
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    formulaSubject === sub ? tk.activeTabBtn : tk.inputSurface
                  }`}
                >
                  {sub}
                </button>
              ))}

              <select
                value={formulaCategory}
                onChange={(e) => setFormulaCategory(e.target.value)}
                aria-label="Filter formula topic category"
                className={`rounded-lg border px-3 py-1.5 text-xs ${tk.inputSurface}`}
              >
                <option value="All">All Categories</option>
                {availableFormulaCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={formulaLevel}
                onChange={(e) =>
                  setFormulaLevel(e.target.value as 'All' | FormulaLevel)
                }
                aria-label="Filter education level"
                className={`rounded-lg border px-3 py-1.5 text-xs ${tk.inputSurface}`}
              >
                <option value="All">All Levels (Class 1 → Engineering)</option>
                <option value="Elementary (Class 1–5)">Elementary (Class 1–5)</option>
                <option value="Middle School (Class 6–8)">Middle School (Class 6–8)</option>
                <option value="High School (Class 9–12)">High School (Class 9–12)</option>
                <option value="College & Engineering">College &amp; Engineering</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${tk.mutedText}`} />
                <input
                  type="text"
                  value={formulaQuery}
                  onChange={(e) => setFormulaQuery(e.target.value)}
                  placeholder="Search formula, symbol, law..."
                  className={`rounded-lg border py-1.5 pl-8 pr-3 text-xs focus:outline-none ${tk.inputSurface}`}
                />
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold ${tk.primaryBtn}`}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Save Formula PDF</span>
              </button>
            </div>
          </div>

          <div className="print-only-journal grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredFormulas.map((entry) => (
              <div key={entry.id} className={`break-inside-avoid rounded-2xl border p-5 ${tk.cardSurface}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className={`font-semibold uppercase tracking-wider ${tk.accentText}`}>
                    {entry.subject} · {entry.category}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] ${tk.subCardSurface}`}>
                    {entry.level}
                  </span>
                </div>
                <h3 className={`mt-2 font-display text-lg font-medium ${tk.headingText}`}>
                  {entry.name}
                </h3>
                <div className={`font-mono-tabular mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-bold leading-relaxed ${tk.subCardSurface}`}>
                  {entry.formula}
                </div>
                <p className={`mt-2.5 text-xs ${tk.bodyText}`}>
                  <strong>Variables:</strong> {entry.variables}
                </p>
                <p className={`mt-1 text-xs ${tk.mutedText}`}>{entry.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: FULL SCIENTIFIC CALCULATOR ==================== */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className={`rounded-2xl border p-6 lg:col-span-8 ${tk.cardSurface}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
                  className={`font-mono-tabular rounded-lg border px-3 py-1 text-xs font-semibold ${tk.activeTabBtn}`}
                >
                  {angleMode}
                </button>
                <span className={`font-mono-tabular text-xs ${tk.mutedText}`}>
                  MEM: {formatCalcResult(memoryValue)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { label: 'MC', fn: () => setMemoryValue(0) },
                  { label: 'MR', fn: () => appendToExpr(String(memoryValue)) },
                  { label: 'M+', fn: () => setMemoryValue((m) => m + (Number(resultDisplay) || 0)) },
                  { label: 'M-', fn: () => setMemoryValue((m) => m - (Number(resultDisplay) || 0)) },
                ].map((mBtn) => (
                  <button
                    key={mBtn.label}
                    type="button"
                    onClick={mBtn.fn}
                    className={`font-mono-tabular rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${tk.inputSurface}`}
                  >
                    {mBtn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${tk.subCardSurface}`}>
              <input
                type="text"
                aria-label="Calculator expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleEvaluate();
                  }
                }}
                placeholder="Type math expression e.g. 2*sin(45) + ln(10)"
                className={`font-mono-tabular w-full bg-transparent text-right text-base focus:outline-none ${tk.mutedText}`}
              />
              <div
                className={`font-mono-tabular mt-2 truncate text-right text-3xl font-semibold sm:text-4xl ${tk.headingText}`}
              >
                = {resultDisplay}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-6">
              {[
                { label: 'sin(', val: 'sin(' },
                { label: 'cos(', val: 'cos(' },
                { label: 'tan(', val: 'tan(' },
                { label: 'ln(', val: 'ln(' },
                { label: 'log(', val: 'log(' },
                { label: '√(', val: 'sqrt(' },
                { label: 'sin⁻¹', val: 'asin(' },
                { label: 'cos⁻¹', val: 'acos(' },
                { label: 'tan⁻¹', val: 'atan(' },
                { label: 'eˣ', val: 'exp(' },
                { label: '10ˣ', val: '10^' },
                { label: 'xʸ', val: '^' },
                { label: 'sinh', val: 'sinh(' },
                { label: 'cosh', val: 'cosh(' },
                { label: 'n!', val: '!' },
                { label: 'π', val: 'pi' },
                { label: 'e', val: 'e' },
                { label: 'ANS', val: 'ANS' },
                { label: '(', val: '(' },
                { label: ')', val: ')' },
                { label: '%', val: '%' },
                { label: '1/x', val: '^(-1)' },
                { label: '|x|', val: 'abs(' },
                { label: '³√(', val: 'cbrt(' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => appendToExpr(btn.val)}
                  className={`font-mono-tabular rounded-xl border py-2.5 text-xs font-medium transition-colors hover:opacity-85 ${tk.subCardSurface}`}
                >
                  {btn.label}
                </button>
              ))}

              {[
                '7',
                '8',
                '9',
                '÷',
                'DEL',
                'AC',
                '4',
                '5',
                '6',
                '×',
                'x²',
                'E',
                '1',
                '2',
                '3',
                '−',
                '+',
                '=',
                '0',
                '.',
              ].map((key) => {
                if (key === 'DEL') {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setExpression((prev) => prev.slice(0, -1))}
                      className={`flex items-center justify-center rounded-xl border py-3 text-xs font-semibold ${tk.inputSurface}`}
                    >
                      <Delete className="h-4 w-4" />
                    </button>
                  );
                }
                if (key === 'AC') {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setExpression('');
                        setResultDisplay('0');
                      }}
                      className="rounded-xl border border-rose-500/35 bg-rose-500/15 py-3 text-xs font-bold text-rose-500 hover:bg-rose-500/25"
                    >
                      AC
                    </button>
                  );
                }
                if (key === '=') {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={handleEvaluate}
                      className={`col-span-2 rounded-xl py-3 font-mono-tabular text-base font-bold sm:col-span-1 ${tk.primaryBtn}`}
                    >
                      =
                    </button>
                  );
                }
                const mapped = key === 'x²' ? '^2' : key === 'E' ? 'e' : key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => appendToExpr(mapped)}
                    className={`font-mono-tabular rounded-xl border py-3 text-sm font-semibold transition-colors ${
                      ['÷', '×', '−', '+'].includes(key)
                        ? `${tk.subCardSurface} ${tk.accentText}`
                        : tk.inputSurface
                    }`}
                  >
                    {key === 'E' ? '×10ⁿ (e)' : key}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className={`rounded-2xl border p-6 lg:col-span-4 ${tk.cardSurface}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-semibold ${tk.headingText}`}>
                {lang === 'bn' ? 'হিসাবের ইতিহাস' : 'Calculation History'}
              </h2>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className={`text-xs ${tk.mutedText} hover:underline`}
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className={`mt-6 text-xs leading-relaxed ${tk.mutedText}`}>
                {lang === 'bn'
                  ? 'যেকোনো গাণিতিক হিসাব করলে এখানে সেভ থাকবে। আগের ফলাফল ক্লিক করে আবার ব্যবহার করতে পারবেন।'
                  : 'Evaluate expressions on the left to record a reusable calculation tape.'}
              </p>
            ) : (
              <div className={`mt-4 max-h-96 divide-y overflow-y-auto ${tk.divideSubtle}`}>
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setExpression(item.expr);
                      setResultDisplay(item.res);
                    }}
                    className="w-full py-2.5 text-right transition-opacity hover:opacity-80"
                  >
                    <p className={`font-mono-tabular truncate text-xs ${tk.mutedText}`}>
                      {item.expr}
                    </p>
                    <p className={`font-mono-tabular mt-0.5 text-sm font-semibold ${tk.headingText}`}>
                      = {item.res}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className={`mt-6 border-t pt-4 ${tk.borderSubtle}`}>
              <p className={`text-xs font-medium ${tk.headingText}`}>
                {lang === 'bn' ? 'দ্রুত ধ্রুবক (Quick Insert)' : 'Quick Scientific Constants'}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {[
                  { symbol: 'R', name: 'Gas Constant', num: '8.314' },
                  { symbol: 'Nₐ', name: 'Avogadro', num: '6.02214e23' },
                  { symbol: 'F', name: 'Faraday', num: '96485' },
                  { symbol: 'h', name: 'Planck', num: '6.626e-34' },
                ].map((c) => (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => appendToExpr(c.num)}
                    className={`rounded-lg border px-2.5 py-2 text-left text-[11px] ${tk.subCardSurface}`}
                  >
                    <span className={`font-mono-tabular font-bold ${tk.accentText}`}>
                      {c.symbol} ({c.num})
                    </span>
                    <span className={`block truncate text-[10px] ${tk.mutedText}`}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ==================== TAB 3: ALL 118 ELEMENTS & CHEMISTRY LAB ==================== */}
      {activeTab === 'chemistry' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-1 ${tk.subCardSurface}`}>
              {(
                [
                  { id: 'table', en: 'All 118 Elements', bn: '১১৮ মৌল (পর্যায় সারণি)' },
                  { id: 'compounds', en: 'Compounds & Reagents', bn: 'যৌগ ও রিএজেন্ট' },
                  { id: 'reactions', en: 'Key Reactions', bn: 'রাসায়নিক বিক্রিয়া' },
                  { id: 'molarity', en: 'Molarity & Constants', bn: 'মোলারিটি ও ধ্রুবক' },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setChemSubTab(sub.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    chemSubTab === sub.id ? tk.primaryBtn : tk.mutedText
                  }`}
                >
                  {lang === 'bn' ? sub.bn : sub.en}
                </button>
              ))}
            </div>

            {chemSubTab === 'table' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${tk.mutedText}`}
                  />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Element, symbol, Z..."
                    className={`rounded-lg border py-1.5 pl-8 pr-3 text-xs focus:outline-none ${tk.inputSurface}`}
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as 'all' | ElementCategory)
                  }
                  aria-label="Filter element category"
                  className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
                >
                  <option value="all">All 118 Elements</option>
                  {(Object.keys(ELEMENT_CATEGORY_LABELS) as ElementCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {ELEMENT_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {chemSubTab === 'table' && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className={`overflow-x-auto rounded-2xl border p-4 xl:col-span-9 ${tk.cardSurface}`}>
                <div
                  className="grid min-w-[780px] gap-1"
                  style={{
                    gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
                    gridTemplateRows: 'repeat(9, minmax(52px, auto))',
                  }}
                >
                  {ELEMENTS_118.map((el) => {
                    const isMatch = filteredElementIds.has(el.z);
                    const isSelected = selectedElement.z === el.z;
                    const palette = tk.isDark
                      ? CATEGORY_TILE_CLASSES[el.category].dark
                      : CATEGORY_TILE_CLASSES[el.category].light;

                    return (
                      <button
                        key={el.z}
                        type="button"
                        onClick={() => setSelectedElement(el)}
                        style={{
                          gridRow: el.gridRow,
                          gridColumn: el.gridCol,
                        }}
                        className={`flex flex-col justify-between rounded-md border p-1 text-left transition-all ${palette} ${
                          isSelected
                            ? 'ring-2 ring-current scale-105 z-10'
                            : isMatch
                            ? 'hover:scale-105'
                            : 'opacity-20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] leading-none opacity-80">
                          <span className="font-mono-tabular">{el.z}</span>
                        </div>
                        <div className="font-mono-tabular text-center text-xs font-bold leading-none sm:text-sm">
                          {el.symbol}
                        </div>
                        <div className="truncate text-center text-[8px] leading-none opacity-80">
                          {el.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <aside className={`rounded-2xl border p-5 xl:col-span-3 ${tk.cardSurface}`}>
                <div className="flex items-start justify-between border-b pb-4 border-current/10">
                  <div>
                    <span className={`font-mono-tabular text-xs font-semibold ${tk.accentText}`}>
                      Atomic No. {selectedElement.z}
                    </span>
                    <h2 className={`mt-1 font-display text-2xl font-semibold ${tk.headingText}`}>
                      {selectedElement.name}
                    </h2>
                    <p className={`text-xs ${tk.mutedText}`}>
                      {ELEMENT_CATEGORY_LABELS[selectedElement.category]}
                    </p>
                  </div>
                  <div
                    className={`font-mono-tabular flex h-14 w-14 items-center justify-center rounded-xl border text-2xl font-bold ${tk.subCardSurface}`}
                  >
                    {selectedElement.symbol}
                  </div>
                </div>

                <dl className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className={tk.mutedText}>Atomic Mass</dt>
                    <dd className="font-mono-tabular font-semibold">{selectedElement.mass} u</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className={tk.mutedText}>Period / Group</dt>
                    <dd className="font-mono-tabular font-semibold">
                      P{selectedElement.period} · G{selectedElement.group}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className={tk.mutedText}>Standard Phase</dt>
                    <dd className="font-semibold">{selectedElement.state}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className={tk.mutedText}>Electronegativity</dt>
                    <dd className="font-mono-tabular font-semibold">{selectedElement.eneg}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className={tk.mutedText}>Oxidation States</dt>
                    <dd className="font-mono-tabular font-semibold">{selectedElement.oxidation}</dd>
                  </div>
                  <div className={`border-t pt-2.5 ${tk.borderSubtle}`}>
                    <dt className={`text-[11px] font-medium ${tk.mutedText}`}>
                      Electron Configuration
                    </dt>
                    <dd className="font-mono-tabular mt-1 font-semibold">
                      {selectedElement.config}
                    </dd>
                  </div>
                  <div className={`border-t pt-2.5 ${tk.borderSubtle}`}>
                    <dt className={`text-[11px] font-medium ${tk.mutedText}`}>
                      Primary Lab &amp; Industrial Uses
                    </dt>
                    <dd className="mt-1 leading-relaxed">{selectedElement.uses}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          )}

          {chemSubTab === 'compounds' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {CHEMICAL_COMPOUNDS.map((c) => (
                <div key={c.formula} className={`rounded-2xl border p-5 ${tk.cardSurface}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[11px] font-medium ${tk.accentText}`}>{c.type}</span>
                      <h3 className={`mt-0.5 text-base font-semibold ${tk.headingText}`}>
                        {c.name}
                      </h3>
                    </div>
                    <span className={`font-mono-tabular rounded-lg border px-2.5 py-1 text-xs font-bold ${tk.subCardSurface}`}>
                      {c.formula}
                    </span>
                  </div>
                  <p className={`font-mono-tabular mt-2 text-xs ${tk.mutedText}`}>
                    Molar Mass: {c.molarMass}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed">{c.properties}</p>
                  <p className={`mt-2 text-xs ${tk.mutedText}`}>Uses: {c.uses}</p>
                </div>
              ))}
            </div>
          )}

          {chemSubTab === 'reactions' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {CHEMICAL_REACTIONS.map((rxn) => (
                <div key={rxn.name} className={`rounded-2xl border p-5 ${tk.cardSurface}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-display text-lg font-medium ${tk.headingText}`}>
                      {rxn.name}
                    </h3>
                    <span className={`text-[11px] font-medium ${tk.accentText}`}>
                      {rxn.type}
                    </span>
                  </div>
                  <div
                    className={`font-mono-tabular mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${tk.subCardSurface}`}
                  >
                    {rxn.equation}
                  </div>
                  <p className={`mt-3 text-xs ${tk.mutedText}`}>
                    <strong className={tk.bodyText}>Conditions:</strong> {rxn.conditions}
                  </p>
                  <p className={`mt-1 text-xs ${tk.mutedText}`}>
                    <strong className={tk.bodyText}>Observation:</strong> {rxn.observation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {chemSubTab === 'molarity' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className={`space-y-5 rounded-2xl border p-6 lg:col-span-6 ${tk.cardSurface}`}>
                <div className="flex items-center gap-2">
                  <FlaskConical className={`h-4 w-4 ${tk.accentText}`} />
                  <h3 className={`text-base font-semibold ${tk.headingText}`}>
                    Molarity &amp; Dilution Lab (n = m / M, C₁V₁ = C₂V₂)
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[11px] ${tk.mutedText}`}>Mass (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={massGrams}
                      onChange={(e) => setMassGrams(e.target.value)}
                      className={`font-mono-tabular mt-1 w-full rounded-lg border px-3 py-2 text-xs ${tk.inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] ${tk.mutedText}`}>Molar Mass (g/mol)</label>
                    <input
                      type="number"
                      step="any"
                      value={molarMass}
                      onChange={(e) => setMolarMass(e.target.value)}
                      className={`font-mono-tabular mt-1 w-full rounded-lg border px-3 py-2 text-xs ${tk.inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] ${tk.mutedText}`}>Volume (L)</label>
                    <input
                      type="number"
                      step="any"
                      value={volumeLiters}
                      onChange={(e) => setVolumeLiters(e.target.value)}
                      className={`font-mono-tabular mt-1 w-full rounded-lg border px-3 py-2 text-xs ${tk.inputSurface}`}
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 rounded-xl border p-4 ${tk.subCardSurface}`}>
                  <div>
                    <span className={`block text-[11px] ${tk.mutedText}`}>Moles (n)</span>
                    <span className={`font-mono-tabular text-lg font-semibold ${tk.headingText}`}>
                      {molesComputed.moles.toFixed(4)} mol
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[11px] ${tk.mutedText}`}>Molarity (M)</span>
                    <span className={`font-mono-tabular text-lg font-semibold ${tk.accentText}`}>
                      {molesComputed.molarity.toFixed(4)} mol/L
                    </span>
                  </div>
                </div>

                <div className={`border-t pt-4 ${tk.borderSubtle}`}>
                  <p className="text-xs font-semibold">Dilution (C₁V₁ = C₂V₂)</p>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-[11px] ${tk.mutedText}`}>C₁ (M)</label>
                      <input
                        type="number"
                        step="any"
                        value={c1}
                        onChange={(e) => setC1(e.target.value)}
                        className={`font-mono-tabular mt-1 w-full rounded-lg border px-3 py-2 text-xs ${tk.inputSurface}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] ${tk.mutedText}`}>V₁ (mL)</label>
                      <input
                        type="number"
                        step="any"
                        value={v1}
                        onChange={(e) => setV1(e.target.value)}
                        className={`font-mono-tabular mt-1 w-full rounded-lg border px-3 py-2 text-xs ${tk.inputSurface}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] ${tk.mutedText}`}>Target C₂ (M)</label>
                      <input
                        type="number"
                        step="any"
                        value={c2}
                        onChange={(e) => setC2(e.target.value)}
                        className={`font-mono-tabular mt-1 w-full rounded-lg border px-3 py-2 text-xs ${tk.inputSurface}`}
                      />
                    </div>
                  </div>
                  <p className={`font-mono-tabular mt-3 text-sm font-semibold ${tk.headingText}`}>
                    Required Final Volume V₂ = {v2Dilution.toFixed(2)} mL
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl border p-6 lg:col-span-6 ${tk.cardSurface}`}>
                <h3 className={`text-base font-semibold ${tk.headingText}`}>
                  Fundamental Physical &amp; Chemistry Constants
                </h3>
                <div className={`mt-4 divide-y ${tk.divideSubtle}`}>
                  {CHEMISTRY_CONSTANTS.map((c) => (
                    <div key={c.symbol} className="flex items-center justify-between gap-4 py-2.5 text-xs">
                      <div>
                        <span className={`font-mono-tabular font-bold ${tk.accentText}`}>
                          {c.symbol}
                        </span>{' '}
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <span className="font-mono-tabular shrink-0 font-semibold">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: FULL YOUTUBE PLAYLIST & PLAYER ==================== */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className={`space-y-4 rounded-2xl border p-6 lg:col-span-7 ${tk.cardSurface}`}>
            {currentVideo ? (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/15 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0`}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className={`text-xs font-medium ${tk.accentText}`}>
                      {currentVideo.subject}
                    </span>
                    <h2 className={`font-display text-xl font-medium ${tk.headingText}`}>
                      {currentVideo.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('split')}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium ${tk.inputSurface}`}
                    >
                      Open in Split-Screen
                    </button>
                    <button
                      type="button"
                      onClick={() => onStudyVideoInTimer(currentVideo)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${tk.primaryBtn}`}
                    >
                      {lang === 'bn' ? 'টাইমারে পড়ুন' : 'Focus in Timer'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={`flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center ${tk.borderSubtle}`}>
                <Video className={`h-8 w-8 ${tk.mutedText}`} />
                <p className={`mt-3 text-sm font-medium ${tk.headingText}`}>
                  {lang === 'bn'
                    ? 'ডানপাশে যেকোনো YouTube ক্লাস লিংক পেস্ট করে সেভ করুন'
                    : 'Paste any YouTube study link on the right to watch right here'}
                </p>
                <p className={`mt-1 text-xs ${tk.mutedText}`}>
                  {lang === 'bn'
                    ? 'আপনি লিংক সেভ করে রাখলে সরাসরি এই অ্যাপের ভেতরেই ভিডিও চলবে।'
                    : 'Supports youtube.com/watch, youtu.be, live, and shorts URLs.'}
                </p>
              </div>
            )}
          </section>

          <aside className={`space-y-5 rounded-2xl border p-6 lg:col-span-5 ${tk.cardSurface}`}>
            <form onSubmit={handleSaveYouTubeLink} className="space-y-3">
              <h2 className={`text-sm font-semibold ${tk.headingText}`}>
                {lang === 'bn' ? 'YouTube লিংক সেভ করুন' : 'Save YouTube Study Link'}
              </h2>
              <input
                type="text"
                required
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${tk.inputSurface}`}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={videoTitleInput}
                  onChange={(e) => setVideoTitleInput(e.target.value)}
                  placeholder={lang === 'bn' ? 'ভিডিও শিরোনাম' : 'Lecture Title'}
                  className={`rounded-lg border px-3 py-2 text-xs focus:outline-none ${tk.inputSurface}`}
                />
                <input
                  type="text"
                  value={videoSubjectInput}
                  onChange={(e) => setVideoSubjectInput(e.target.value)}
                  placeholder={lang === 'bn' ? 'বিষয় (Chemistry)' : 'Subject tag'}
                  className={`rounded-lg border px-3 py-2 text-xs focus:outline-none ${tk.inputSurface}`}
                />
              </div>
              {videoError && <p className="text-xs text-rose-500">{videoError}</p>}
              <button
                type="submit"
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold ${tk.primaryBtn}`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'অ্যাপে সেভ ও প্লে করুন' : 'Save & Watch In-App'}</span>
              </button>
            </form>

            <div className={`border-t pt-4 ${tk.borderSubtle}`}>
              <p className={`text-xs font-semibold ${tk.mutedText}`}>
                {lang === 'bn'
                  ? `সেভ করা ভিডিও (${savedVideos.length})`
                  : `Saved Lectures (${savedVideos.length})`}
              </p>

              {savedVideos.length === 0 ? (
                <p className={`mt-3 text-xs ${tk.mutedText}`}>
                  {lang === 'bn' ? 'এখনো কোনো ভিডিও সেভ করা হয়নি।' : 'No saved videos yet.'}
                </p>
              ) : (
                <div className={`mt-2 max-h-72 divide-y overflow-y-auto ${tk.divideSubtle}`}>
                  {savedVideos.map((vid) => {
                    const isPlayingNow = currentVideo?.id === vid.id;
                    return (
                      <div
                        key={vid.id}
                        className="flex items-center justify-between gap-2 py-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveVideoId(vid.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <Play
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isPlayingNow ? tk.accentText : tk.mutedText
                            }`}
                          />
                          <div className="min-w-0">
                            <p
                              className={`truncate text-xs font-semibold ${
                                isPlayingNow ? tk.accentText : tk.headingText
                              }`}
                            >
                              {vid.title}
                            </p>
                            <p className={`truncate text-[11px] ${tk.mutedText}`}>
                              {vid.subject} · {vid.videoId}
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteVideo(vid.id)}
                          aria-label={`Remove ${vid.title}`}
                          className={`rounded-md p-1.5 hover:text-rose-500 ${tk.mutedText}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ==================== DOCKED SYNCED FOCUS TIMER MINI-WIDGET ==================== */}
      <section className={`no-print rounded-2xl border p-4 shadow-sm ${tk.cardSurface}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 ${tk.subCardSurface}`}>
              <Timer className={`h-4 w-4 ${dockedTimer.isRunning ? 'animate-pulse' : ''} ${tk.accentText}`} />
              <span className={`font-mono-tabular text-2xl font-bold tracking-tight ${tk.headingText}`}>
                {dockMins}:{dockSecs}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[25, 35, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => dockedTimer.onSelectDuration(m)}
                  className={`font-mono-tabular rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                    dockedTimer.durationMinutes === m ? tk.activeTabBtn : tk.inputSurface
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="text"
              value={dockedTimer.subject}
              onChange={(e) => dockedTimer.onChangeSubject(e.target.value)}
              placeholder="Subject..."
              aria-label="Docked timer subject"
              className={`min-w-[120px] flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
            />
            <input
              type="text"
              value={dockedTimer.topic}
              onChange={(e) => dockedTimer.onChangeTopic(e.target.value)}
              placeholder="Topic studied..."
              aria-label="Docked timer topic"
              className={`min-w-[160px] flex-[1.5] rounded-lg border px-3 py-1.5 text-xs focus:outline-none ${tk.inputSurface}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={dockedTimer.onToggleRun}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold ${tk.subCardSurface}`}
            >
              {dockedTimer.isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>{dockedTimer.secondsLeft < dockedTimer.durationMinutes * 60 ? 'Resume' : 'Start Focus'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={dockedTimer.onResetTimer}
              aria-label="Reset docked timer"
              className={`rounded-lg border p-1.5 ${tk.inputSurface}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                dockedTimer.onQuickDone();
                setDockDoneToast('Session logged to Focus Timer & 1-4-7 queue!');
                window.setTimeout(() => setDockDoneToast(null), 4000);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold ${tk.primaryBtn}`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Done (Log 1-4-7)</span>
            </button>
          </div>
        </div>
        {dockDoneToast && (
          <p className="mt-2 text-xs font-medium text-emerald-500">{dockDoneToast}</p>
        )}
      </section>
    </div>
  );
};
