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

// Strict 1-4-7 Rule:
// stageIndex 0: Day 1 Studied -> Reminder on Day 4 (+3 days) for Recall
// stageIndex 1: Day 4 Recalled -> Reminder on Day 7 (+3 days) to Finish
// stageIndex 2: Day 7 Finished -> Topic Completed!
export interface SpacedRepetitionItem {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  day1Date: string; // YYYY-MM-DD
  day4Date: string; // YYYY-MM-DD
  day7Date: string; // YYYY-MM-DD
  stageIndex: 0 | 1 | 2; // 0 = Waiting Day 4 Recall, 1 = Waiting Day 7 Finish, 2 = Finished
  nextReviewDate: string; // YYYY-MM-DD
  reviewHistory: string[];
}

export type JournalFontOption =
  | 'Scribble'
  | 'Handwritten'
  | 'Typewriter'
  | 'Simple'
  | 'Classic';

export type JournalPaperStyle = 'plain' | 'lined' | 'dotted' | 'grid';

export interface JournalSpread {
  id: string;
  leftDate: string;
  leftContent: string;
  rightDate: string;
  rightContent: string;
  moodTag?: string;
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
  status: ReadingStatus;
  coverColor: string;
  spineAccent: string;
  textColor: string;
  progress: number;
  totalPages: number;
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
