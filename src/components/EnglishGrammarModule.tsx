import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  ENGLISH_GRAMMAR_ENCYCLOPEDIA,
  GRAMMAR_SECTIONS,
  GrammarSectionId,
  GrammarTopic,
} from '../data/englishGrammar';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppTheme, Language } from '../types';
import { getThemeTokens } from '../utils/themeStyles';

interface EnglishGrammarModuleProps {
  lang: Language;
  theme: AppTheme;
}

export const EnglishGrammarModule: React.FC<EnglishGrammarModuleProps> = ({
  lang,
  theme,
}) => {
  const tk = getThemeTokens(theme);

  const [sectionFilter, setSectionFilter] = useState<'all' | GrammarSectionId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage<string[]>(
    'pa_grammar_bookmarks_v1',
    []
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    ENGLISH_GRAMMAR_ENCYCLOPEDIA[0].id
  );
  const [expandedAll, setExpandedAll] = useState<boolean>(false);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ENGLISH_GRAMMAR_ENCYCLOPEDIA.filter((topic) => {
      if (showBookmarksOnly && !bookmarkedIds.includes(topic.id)) return false;
      if (sectionFilter !== 'all' && topic.section !== sectionFilter) return false;
      if (!q) return true;
      const inTitle = topic.title.toLowerCase().includes(q);
      const inDef = topic.definition.toLowerCase().includes(q);
      const inSubtypes = topic.subtypes.some(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.definition.toLowerCase().includes(q) ||
          s.examples.some((ex) => ex.toLowerCase().includes(q))
      );
      const inRules = topic.goldenRules.some((r) => r.toLowerCase().includes(q));
      return inTitle || inDef || inSubtypes || inRules;
    });
  }, [sectionFilter, searchQuery, showBookmarksOnly, bookmarkedIds]);

  const activeTopic: GrammarTopic | null = useMemo(
    () =>
      filteredTopics.find((t) => t.id === selectedTopicId) ??
      filteredTopics[0] ??
      null,
    [filteredTopics, selectedTopicId]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section
        className={`flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between ${tk.borderSubtle}`}
      >
        <div>
          <p className={`text-xs font-medium ${tk.accentText}`}>
            Archive · Made by Al Tahjib Noor Raiyan
          </p>
          <h1 className={`mt-1.5 text-3xl font-medium tracking-tight ${tk.headingText}`}>
            {lang === 'bn'
              ? 'ইংরেজি গ্রামার এনসাইক্লোপিডিয়া'
              : 'English Grammar Encyclopedia'}
          </h1>
          <p className={`mt-1.5 text-sm ${tk.mutedText}`}>
            {lang === 'bn'
              ? 'সকল Parts of Speech, Verbals (Gerund/Participle/Infinitive), Tenses, Clauses, Voice, Narration, Transformation এবং Punctuation-এর পূর্ণাঙ্গ গাইড।'
              : 'Complete categorized guide with definitions, rules, structures, and examples across every grammatical topic.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBookmarksOnly((b) => !b)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showBookmarksOnly ? tk.activeTabBtn : tk.inputSurface
            }`}
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span>Saved ({bookmarkedIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandedAll((e) => !e)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              expandedAll ? tk.activeTabBtn : tk.inputSurface
            }`}
          >
            {expandedAll ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Single Reader View</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Expand All Chapters</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Instant Search + Category Index */}
      <section className="space-y-4">
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.mutedText}`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'যেকোনো গ্রামার টপিক খুঁজুন (যেমন: Gerund, Noun, Passive Voice, Tense, Semicolon)...'
                : 'Instant search grammar rules, classifications, or examples (e.g. Gerund, Pronoun, Conditional, Voice, Comma)...'
            }
            className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm focus:outline-none ${tk.inputSurface}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {GRAMMAR_SECTIONS.map((sec) => {
            const active = sectionFilter === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSectionFilter(sec.id)}
                className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? tk.activeTabBtn : tk.inputSurface
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </section>

      {filteredTopics.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center ${tk.cardSurface}`}>
          <BookOpenText className={`mx-auto h-8 w-8 ${tk.mutedText}`} />
          <p className={`mt-3 text-sm font-medium ${tk.headingText}`}>
            No grammar topics match your current search or bookmark filter.
          </p>
        </div>
      ) : expandedAll ? (
        <div className="space-y-6">
          {filteredTopics.map((topic) => (
            <GrammarTopicCard
              key={topic.id}
              topic={topic}
              theme={theme}
              isBookmarked={bookmarkedIds.includes(topic.id)}
              onToggleBookmark={() => toggleBookmark(topic.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Index Sidebar */}
          <aside className={`rounded-2xl border p-4 lg:col-span-4 ${tk.cardSurface}`}>
            <p className={`px-2 text-xs font-semibold uppercase tracking-wider ${tk.mutedText}`}>
              Grammar Index ({filteredTopics.length})
            </p>
            <div className="mt-3 space-y-1.5">
              {filteredTopics.map((topic) => {
                const isSelected = activeTopic?.id === topic.id;
                const isSaved = bookmarkedIds.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                      isSelected ? tk.activeTabBtn : tk.subCardSurface
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider opacity-75">
                        {topic.sectionLabel}
                      </p>
                      <p className="truncate text-xs font-semibold">{topic.title}</p>
                    </div>
                    {isSaved && <BookMarked className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Detailed Encyclopedia Reader */}
          <div className="lg:col-span-8">
            {activeTopic && (
              <GrammarTopicCard
                topic={activeTopic}
                theme={theme}
                isBookmarked={bookmarkedIds.includes(activeTopic.id)}
                onToggleBookmark={() => toggleBookmark(activeTopic.id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GrammarTopicCard: React.FC<{
  topic: GrammarTopic;
  theme: AppTheme;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}> = ({ topic, theme, isBookmarked, onToggleBookmark }) => {
  const tk = getThemeTokens(theme);

  return (
    <article className={`space-y-6 rounded-2xl border p-6 sm:p-7 ${tk.cardSurface}`}>
      {/* Card Header */}
      <div className={`flex flex-wrap items-start justify-between gap-3 border-b pb-5 ${tk.borderSubtle}`}>
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wider ${tk.accentText}`}>
            {topic.sectionLabel}
          </span>
          <h2 className={`mt-1 font-display text-2xl font-medium ${tk.headingText}`}>
            {topic.title}
          </h2>
          <p className={`mt-2 text-sm leading-relaxed ${tk.bodyText}`}>{topic.definition}</p>
        </div>

        <button
          type="button"
          onClick={onToggleBookmark}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            isBookmarked ? tk.activeTabBtn : tk.inputSurface
          }`}
        >
          <BookMarked className="h-3.5 w-3.5" />
          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Formula / Structural Syntax */}
      {topic.structureFormula && (
        <div className={`rounded-xl border px-4 py-3 ${tk.subCardSurface}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${tk.mutedText}`}>
            Structural Formula &amp; Pattern
          </p>
          <p className={`font-mono-tabular mt-1 text-xs font-semibold sm:text-sm ${tk.headingText}`}>
            {topic.structureFormula}
          </p>
        </div>
      )}

      {/* Classifications / Subtypes */}
      <div className="space-y-3">
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${tk.mutedText}`}>
          Classifications, Forms &amp; Examples
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {topic.subtypes.map((sub) => (
            <div key={sub.name} className={`rounded-xl border p-4 ${tk.subCardSurface}`}>
              <h4 className={`text-sm font-semibold ${tk.headingText}`}>{sub.name}</h4>
              <p className={`mt-1 text-xs leading-relaxed ${tk.mutedText}`}>{sub.definition}</p>
              <div className={`mt-2.5 border-t pt-2 ${tk.borderSubtle}`}>
                {sub.examples.map((ex, i) => (
                  <p key={i} className={`text-xs italic leading-relaxed ${tk.bodyText}`}>
                    &ldquo;{ex}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Golden Rules */}
      <div className={`space-y-2.5 border-t pt-5 ${tk.borderSubtle}`}>
        <h3 className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${tk.accentText}`}>
          <Sparkles className="h-3.5 w-3.5" />
          <span>High-Yield Rules &amp; Exam Precision</span>
        </h3>
        <ul className="space-y-2">
          {topic.goldenRules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Common Mistake vs Right */}
      {topic.commonMistake && (
        <div className={`grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 ${tk.subCardSurface}`}>
          <div className="flex items-start gap-2 text-xs">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <span className="font-semibold text-rose-500">Avoid:</span>{' '}
              <span className="line-through opacity-80">{topic.commonMistake.wrong}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div>
              <span className="font-semibold text-emerald-500">Correct:</span>{' '}
              <span className="font-medium">{topic.commonMistake.right}</span>
              <p className={`mt-1 text-[11px] ${tk.mutedText}`}>{topic.commonMistake.why}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
