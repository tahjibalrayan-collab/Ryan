import { Language } from '../types';

export const UI_TEXT: Record<
  Language,
  {
    brand: string;
    subtitle: string;
    navMethods: string;
    navTimer: string;
    navJournal: string;
    navLibrary: string;
    startFocus: string;
    midnightStudy: string;
    classicPaper: string;
    // Study Methods
    methodsTitle: string;
    methodsDesc: string;
    vaultHeading: string;
    tipsBankHeading: string;
    routineBuilderHeading: string;
    routineBuilderDesc: string;
    subjectsAllocLabel: string;
    addSubjectBtn: string;
    strugglesLabel: string;
    customStrugglePlaceholder: string;
    buildRoutineBtn: string;
    savedRoutinesTitle: string;
    applyToTimer: string;
    // Timer & 1-4-7
    timerEyebrow: string;
    timerTitle: string;
    timerDesc: string;
    todayCompleted: string;
    dueTodayLabel: string;
    subjectNameLabel: string;
    topicStudiedLabel: string;
    techniqueLabel: string;
    startTimer: string;
    pauseTimer: string;
    resumeTimer: string;
    doneBtn: string;
    rule147Title: string;
    rule147Subtitle: string;
    dueQueueTab: string;
    day4Tab: string;
    day7Tab: string;
    finishedTab: string;
    reviewNow: string;
    completeDay4: string;
    finishTopic: string;
    dailyCheckoffTitle: string;
    dailyCheckoffSub: string;
    // Journal
    journalEyebrow: string;
    journalTitle: string;
    journalDesc: string;
    newJournalBtn: string;
    writingFontTitle: string;
    writingFontSub: string;
    // Library
    librarySubtitle: string;
    searchLibraryPlaceholder: string;
    allBooks: string;
    wantToRead: string;
    reading: string;
    finished: string;
    addBookBtn: string;
    bulkAddBtn: string;
    backupBtn: string;
    restoreBtn: string;
    removeDuplicatesBtn: string;
    ambientTitle: string;
    ambientDesc: string;
    wallpaperTitle: string;
    wallpaperDesc: string;
    uploadPhoto: string;
  }
> = {
  en: {
    brand: 'Personal Archive',
    subtitle: 'Made by Al Tahjib Nur Raiyan',
    navMethods: 'Study Methods',
    navTimer: 'Focus Timer',
    navJournal: 'Journal',
    navLibrary: 'Library',
    startFocus: 'Start Focus',
    midnightStudy: 'Midnight Study',
    classicPaper: 'Paper Shelf',
    methodsTitle: 'Global Study Vault & Routine Builder',
    methodsDesc:
      'Explore proven study tips and disciplines from Korea, Japan, China, and Ivy League scholars—then specify your exact subject hours and struggles to automatically assemble a tailored routine.',
    vaultHeading: '01. World-Class Study Frameworks',
    tipsBankHeading: '02. Complete Global Tips & Tricks Bank',
    routineBuilderHeading: '03. Automated Subject & Struggle Routine Builder',
    routineBuilderDesc:
      'Assign exact study durations per subject and select your current struggles. The builder automatically pairs the strongest Korean, Japanese, Chinese, and Ivy League techniques for each block.',
    subjectsAllocLabel: 'Subjects & Exact Study Time (Minutes)',
    addSubjectBtn: 'Add Subject',
    strugglesLabel: 'Select Your Current Study Struggles',
    customStrugglePlaceholder: 'Add any specific struggle (e.g., sleepy after lunch, weak derivations)...',
    buildRoutineBtn: 'Build Personalized Routine',
    savedRoutinesTitle: 'Saved Blueprints',
    applyToTimer: 'Load in Timer',
    timerEyebrow: 'Focus & 1-4-7 Retention Engine',
    timerTitle: 'Smart Study Timer & 1-4-7 Rule Tracker',
    timerDesc:
      'Study a subject & topic on Day 1 and click Done. You will automatically be reminded on Day 4 to recall it, and on Day 7 to finish and master it.',
    todayCompleted: 'Today Completed',
    dueTodayLabel: '1-4-7 Due Today',
    subjectNameLabel: 'Subject Name',
    topicStudiedLabel: 'Specific Topic Studied',
    techniqueLabel: 'Study Method Applied',
    startTimer: 'Start Timer',
    pauseTimer: 'Pause',
    resumeTimer: 'Resume',
    doneBtn: 'Done',
    rule147Title: '1-4-7 Spaced Repetition Tracker',
    rule147Subtitle: 'Day 1 Learn → Day 4 Recall → Day 7 Finish & Complete',
    dueQueueTab: 'Due Today',
    day4Tab: 'Day 4 Recall',
    day7Tab: 'Day 7 Finish',
    finishedTab: 'Finished',
    reviewNow: 'Recall Now',
    completeDay4: 'Done Day 4 → Schedule Day 7',
    finishTopic: 'Finish Day 7',
    dailyCheckoffTitle: 'Daily Subject Checkoff Log',
    dailyCheckoffSub: 'Completed study sessions verified with a checkmark.',
    journalEyebrow: 'Personal Volumes',
    journalTitle: 'My Journals',
    journalDesc:
      'Click any bound notebook on the shelf to open its spreads, customize writing fonts, and personalize your backdrop.',
    newJournalBtn: 'New Journal Book',
    writingFontTitle: 'Writing Font',
    writingFontSub: 'Pick a writing font for this book.',
    librarySubtitle: 'Made by Al Tahjib Nur Raiyan',
    searchLibraryPlaceholder: 'Search by title, author, genre, or topic...',
    allBooks: 'All Books',
    wantToRead: 'Want to read',
    reading: 'Reading',
    finished: 'Finished',
    addBookBtn: 'Add book',
    bulkAddBtn: 'Bulk add',
    backupBtn: 'Backup',
    restoreBtn: 'Restore',
    removeDuplicatesBtn: 'Remove duplicates',
    ambientTitle: 'Ambient Focus Music Player',
    ambientDesc: 'Plays continuously across all Personal Archive modules.',
    wallpaperTitle: 'Workspace Wallpaper & Photo Studio',
    wallpaperDesc: 'Personalize the ambient backdrop behind Personal Archive.',
    uploadPhoto: 'Upload Photo',
  },
  bn: {
    brand: 'Personal Archive',
    subtitle: 'মেড বাই আল তাহজিব নূর রাইয়ান',
    navMethods: 'স্টাডি মেথড',
    navTimer: 'ফোকাস টাইমার',
    navJournal: 'জার্নাল',
    navLibrary: 'লাইব্রেরি',
    startFocus: 'ফোকাস শুরু',
    midnightStudy: 'মিডনাইট স্টাডি',
    classicPaper: 'পেপার শেল্ফ',
    methodsTitle: 'গ্লোবাল স্টাডি ভল্ট ও স্মার্ট রুটিন বিল্ডার',
    methodsDesc:
      'কোরিয়ান, জাপানিজ, চাইনিজ এবং আইভি লিগ শিক্ষার্থীদের সেরা পড়ার কৌশল ও টিপস এক জায়গায়। আপনার প্রতিটি বিষয়ের নির্দিষ্ট সময় ও সমস্যা উল্লেখ করলেই অটোমেটিক পারফেক্ট রুটিন তৈরি হবে।',
    vaultHeading: '০১. বিশ্বসেরা স্টাডি ফ্রেমওয়ার্কসমূহ',
    tipsBankHeading: '০২. সম্পূর্ণ গ্লোবাল টিপস অ্যান্ড ট্রিকস ভান্ডার',
    routineBuilderHeading: '০৩. সাবজেক্ট ও সমস্যা অনুযায়ী অটোমেটিক রুটিন বিল্ডার',
    routineBuilderDesc:
      'কোন সাবজেক্ট কত মিনিট পড়বেন তা ঠিক করুন এবং আপনার পড়ার সমস্যাগুলো নির্বাচন করুন। সিস্টেমটি সেরা কোরিয়ান, জাপানিজ, চাইনিজ ও অক্সফোর্ড কৌশল মিলিয়ে রুটিন বানিয়ে দেবে।',
    subjectsAllocLabel: 'সাবজেক্ট এবং নির্দিষ্ট পড়ার সময় (মিনিট)',
    addSubjectBtn: 'সাবজেক্ট যোগ করুন',
    strugglesLabel: 'আপনার পড়ার প্রধান সমস্যাগুলো নির্বাচন করুন',
    customStrugglePlaceholder: 'অন্য কোনো নির্দিষ্ট সমস্যা থাকলে লিখুন (যেমন: দুপুরে ঘুম আসে, সূত্র ভুলে যাই)...',
    buildRoutineBtn: 'পার্সোনালাইজড রুটিন তৈরি করুন',
    savedRoutinesTitle: 'সংরক্ষিত রুটিনসমূহ',
    applyToTimer: 'টাইমারে লোড করুন',
    timerEyebrow: 'ফোকাস ও ১-৪-৭ রিটেনশন ইঞ্জিন',
    timerTitle: 'স্মার্ট স্টাডি টাইমার ও ১-৪-৭ রুল ট্র্যাকার',
    timerDesc:
      '১ম দিনে একটি সাবজেক্ট ও টপিক পড়ে Done চাপুন। ৪র্থ দিনে টপিকটি রিকল করার রিমাইন্ডার পাবেন এবং ৭ম দিনে রিভিশন দিয়ে টপিকটি চূড়ান্তভাবে শেষ করবেন।',
    todayCompleted: 'আজকের সম্পন্ন সেশন',
    dueTodayLabel: 'আজকের ১-৪-৭ রিমাইন্ডার',
    subjectNameLabel: 'সাবজেক্টের নাম',
    topicStudiedLabel: 'নির্দিষ্ট টপিক',
    techniqueLabel: 'ব্যবহৃত স্টাডি মেথড',
    startTimer: 'টাইমার শুরু',
    pauseTimer: 'বিরতি',
    resumeTimer: 'চালু করুন',
    doneBtn: 'সম্পন্ন (Done)',
    rule147Title: '১-৪-৭ স্পেসড রিপিটেশন ট্র্যাকার',
    rule147Subtitle: 'দিন ১ পড়া → দিন ৪ রিকল → দিন ৭ ফিনিশ (টপিক সম্পন্ন)',
    dueQueueTab: 'আজকের রিমাইন্ডার',
    day4Tab: '৪র্থ দিন (রিকল)',
    day7Tab: '৭ম দিন (ফিনিশ)',
    finishedTab: 'সম্পন্ন টপিক',
    reviewNow: 'এখনই রিকল করুন',
    completeDay4: '৪র্থ দিন শেষ → ৭ম দিন সেট',
    finishTopic: '৭ম দিন ফিনিশ করুন',
    dailyCheckoffTitle: 'দৈনিক সাবজেক্ট চেক-অফ লগ',
    dailyCheckoffSub: 'আজকে পড়া সম্পন্ন হওয়া সাবজেক্ট ও টপিকের তালিকা।',
    journalEyebrow: 'ব্যক্তিগত ভলিউম',
    journalTitle: 'আমার জার্নাল শেল্ফ',
    journalDesc:
      'যেকোনো নোটবুকের কভারে ক্লিক করে পাতা খুলুন, লেখার ফন্ট পরিবর্তন করুন এবং ব্যাকগ্রাউন্ড সাজান।',
    newJournalBtn: 'নতুন জার্নাল তৈরি',
    writingFontTitle: 'লেখার ফন্ট',
    writingFontSub: 'এই বইটির জন্য একটি ফন্ট বেছে নিন।',
    librarySubtitle: 'মেড বাই আল তাহজিব নূর রাইয়ান',
    searchLibraryPlaceholder: 'বইয়ের নাম, লেখক, জনরা বা টপিক দিয়ে খুঁজুন...',
    allBooks: 'সব বই',
    wantToRead: 'পড়তে চাই',
    reading: 'পড়ছি',
    finished: 'পড়া শেষ',
    addBookBtn: 'বই যোগ করুন',
    bulkAddBtn: 'একসাথে যোগ',
    backupBtn: 'ব্যাকআপ',
    restoreBtn: 'রিস্টোর',
    removeDuplicatesBtn: 'ডুপ্লিকেট সরান',
    ambientTitle: 'অ্যাম্বিয়েন্ট ফোকাস মিউজিক প্লেয়ার',
    ambientDesc: 'পুরো অ্যাপ জুড়ে নিরবচ্ছিন্নভাবে ব্যাকগ্রাউন্ডে বাজতে থাকবে।',
    wallpaperTitle: 'ওয়ার্কস্পেস ওয়ালপেপার ও ফটো স্টুডিও',
    wallpaperDesc: 'আপনার পছন্দমতো ব্যাকগ্রাউন্ড ছবি বা থিম সেট করুন।',
    uploadPhoto: 'ফটো আপলোড',
  },
};
