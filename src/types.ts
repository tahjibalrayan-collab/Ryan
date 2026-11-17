export type Language = 'en' | 'bn';
export type AppTheme = 'midnight' | 'paper';

export type NavModule = 'methods' | 'timer' | 'journal' | 'library';

export type MethodTradition =
  | 'Korean Focus'
  | 'Japanese Kaizen'
  | 'Chinese Intensive'
  | 'Ivy League Recall';

export interface StudyTip {
  id: string;
  tradition: MethodTradition;
  origin: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  solvesStruggles: string[];
  idealMinutes: number;
}

export interface StudyMethod {
  id: string;
  title: string;
  titleBn: string;
  tradition: MethodTradition;
  origin: string;
  originBn: string;
  subtitle: string;
  subtitleBn: string;
  summary: string;
  summaryBn: string;
  defaultMinutes: number;
  steps: string[];
  stepsBn: string[];
  bestFor: string;
  bestForBn: string;
  coverColor: string;
  spineColor: string;
  textColor: string;
}

export interface SubjectAllocation {
  id: string;
  subject: string;
  minutes: number;
  difficulty: 'conceptual' | 'problem-solving' | 'memorization';
}

export interface RoutineBlock {
  timeSlot: string;
  subject: string;
  method: string;
  methodBn: string;
  tradition: MethodTradition;
  durationMinutes: number;
  objective: string;
  objectiveBn: string;
  techniqueStep: string;
  techniqueStepBn: string;
  breakMinutes: number;
}

export interface GeneratedRoutine {
  id: string;
  createdAt: string;
  title: string;
  titleBn: string;
  diagnosis: string;
  diagnosisBn: string;
  totalMinutes: number;
  dailyPlan: RoutineBlock[];
  matchedTips: StudyTip[];
  rule147Note: string;
  rule147NoteBn: string;
}

export interface StudyLog {
  id: string;
  subject: string;
  topic: string;
  method: string;
  durationMinutes: number;
  completedAt: string;
  dateKey: string;
}

export interface SpacedRepetitionItem {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  day1Date: string;
  day4Date: string;
  day7Date: string;
  stageIndex: 0 | 1 | 2;
  nextReviewDate: string;
  reviewHistory: string[];
}

export type JournalFontOption =
  | 'Scribble'
  | 'Handwritten'
  | 'Typewriter'
  | 'Simple'
  | 'Classic';

export type JournalPaperStyle = 'plain' | 'lined' | 'dotted' | 'grid';

export type DiaryMoodCategory =
  | 'Happy Day'
  | 'Good Day'
  | 'Sad Day'
  | 'Bad Day'
  | 'Rainy Day'
  | 'Best Day of My Life'
  | 'Worst Day of My Life';

export interface JournalSpread {
  id: string;
  leftDate: string;
  leftTime?: string;
  leftContent: string;
  rightDate: string;
  rightTime?: string;
  rightContent: string;
  moodTag?: DiaryMoodCategory | string;
}

export interface JournalBook {
  id: string;
  title: string;
  subtitle: string;
  coverColor: string;
  textColor: string;
  font: JournalFontOption;
  paperStyle: JournalPaperStyle;
  backdropId: string;
  spreads: JournalSpread[];
  updatedAt: string;
}

export type ReadingStatus = 'Want to read' | 'Reading' | 'Finished';

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  topic: string; // Sub-topic / Type inside the genre (e.g., Ottoman Empire, WWII, Islamic War)
  status: ReadingStatus;
  rating: number; // 0 to 5
  coverColor: string;
  spineAccent: string;
  textColor: string;
  coverImage?: string; // Optional uploaded cover photo
  pdfFileId?: string; // IndexedDB PDF reference
  pdfFileName?: string;
  pdfUrl?: string; // Optional external/cloud PDF link for cross-device sync
  currentPage: number;
  totalPages: number;
  progress: number;
  notes: string;
  createdAt: string;
  lastOpenedAt: string;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  nameBn: string;
  type: 'image' | 'solid' | 'gradient';
  value: string;
  category: string;
}
