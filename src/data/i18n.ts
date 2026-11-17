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
    navLab: string;
    navGrammar: string;
    navWallpaper: string;
    navMusic: string;
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
    brand: 'Archive',
    subtitle: 'Made by Al Tahjib Noor Raiyan',
    navMethods: 'Study Methods',
    navTimer: 'Focus Timer',
    navJournal: 'Journal',
    navLibrary: 'Library',
    navLab: 'Sci-Lab & Video',
    navGrammar: 'Grammar',
    navWallpaper: 'Wallpaper',
    navMusic: 'Music',
    startFocus: 'Start Focus',
    midnightStudy: 'Midnight Study',
    classicPaper: 'Paper Shelf',
    methodsTitle: 'Global Study Vault & Routine Builder',
    methodsDesc:
      'Explore world-wide study frameworks and cognitive systems from Korea, Japan, China, USA, UK, Germany, Italy, Finland, Singapore, and South Asia—with step-by-step instructions and an automated routine builder.',
    vaultHeading: '01. World-Wide Study Frameworks',
    tipsBankHeading: '02. Complete Global Tips & Tricks Bank',
    routineBuilderHeading: '03. Automated Subject & Struggle Routine Builder',
    routineBuilderDesc:
      'Specify exact subjects, exact durations, and personal struggles. The builder creates a clear, structured timetable matched with global protocols and instructions.',
    subjectsAllocLabel: 'Subjects & Exact Study Time (Minutes)',
    addSubjectBtn: 'Add Subject',
    strugglesLabel: 'Select Your Current Study Struggles',
    customStrugglePlaceholder: 'Add any specific struggle (e.g., sleepy after lunch, weak derivations)...',
    buildRoutineBtn: 'Build Personalized Routine',
    savedRoutinesTitle: 'Saved Blueprints',
    applyToTimer: 'Load in Timer',
    timerEyebrow: 'Persistent Focus & 1-4-7 Retention Engine',
    timerTitle: 'Smart Study Timer & 1-4-7 Rule Tracker',
    timerDesc:
      'True background execution keeps ticking across tabs, windows, or minimize. Alarm loops continuously until you select "Yes" to stop.',
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
    dailyCheckoffSub: 'Cleanly organized record of every completed study session.',
    journalEyebrow: 'Personal Volumes',
    journalTitle: 'My Journals',
    journalDesc:
      'Open any journal to write, zoom, flip pages, add emojis, stickers, photos, movable colored sticky notes, or export cleanly to PDF.',
    newJournalBtn: 'New Journal Book',
    writingFontTitle: 'Writing Font',
    writingFontSub: 'Pick a writing font for this book.',
    librarySubtitle: 'Made by Al Tahjib Noor Raiyan',
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
    ambientTitle: 'Background Music & Audio Studio',
    ambientDesc: 'Upload MP3/WAV from your device or play ambient soundscapes continuously across every section.',
    wallpaperTitle: 'Themes & Wallpaper Studio',
    wallpaperDesc: 'Choose Monochrome Black & White, Paper, Midnight, or upload your own wallpaper.',
    uploadPhoto: 'Upload Photo',
  },
  bn: {
    brand: 'Archive',
    subtitle: 'মেড বাই আল তাহজীব নূর রাইয়ান',
    navMethods: 'স্টাডি মেথড',
    navTimer: 'ফোকাস টাইমার',
    navJournal: 'জার্নাল',
    navLibrary: 'লাইব্রেরি',
    navLab: 'সায়েন্স ও ভিডিও ল্যাব',
    navGrammar: 'ইংরেজি ব্যাকরণ',
    navWallpaper: 'থিম ও ওয়ালপেপার',
    navMusic: 'ব্যাকগ্রাউন্ড মিউজিক',
    startFocus: 'ফোকাস শুরু',
    midnightStudy: 'মিডনাইট স্টাডি',
    classicPaper: 'পেপার শেল্ফ',
    methodsTitle: 'গ্লোবাল স্টাডি ভল্ট ও স্মার্ট রুটিন বিল্ডার',
    methodsDesc:
      'কোরিয়া, জাপান, চীন, আমেরিকা, অক্সফোর্ড, জার্মানি, ইতালি, ফিনল্যান্ড, সিঙ্গাপুর ও দক্ষিণ এশিয়ার বিশ্বসেরা স্টাডি পদ্ধতি এবং ধাপে ধাপে নির্দেশিকা এক জায়গায়।',
    vaultHeading: '০১. বিশ্বসেরা স্টাডি ফ্রেমওয়ার্কসমূহ',
    tipsBankHeading: '০২. সম্পূর্ণ গ্লোবাল টিপস অ্যান্ড ট্রিকস ভান্ডার',
    routineBuilderHeading: '০৩. সাবজেক্ট ও সমস্যা অনুযায়ী অটোমেটিক রুটিন বিল্ডার',
    routineBuilderDesc:
      'কোন সাবজেক্ট কত মিনিট পড়বেন এবং আপনার সমস্যাগুলো উল্লেখ করলেই পরিষ্কার টাইমটেবিল ও নির্দেশনাসহ পূর্ণাঙ্গ রুটিন তৈরি হবে।',
    subjectsAllocLabel: 'সাবজেক্ট এবং নির্দিষ্ট পড়ার সময় (মিনিট)',
    addSubjectBtn: 'সাবজেক্ট যোগ করুন',
    strugglesLabel: 'আপনার পড়ার প্রধান সমস্যাগুলো নির্বাচন করুন',
    customStrugglePlaceholder: 'অন্য কোনো নির্দিষ্ট সমস্যা থাকলে লিখুন (যেমন: দুপুরে ঘুম আসে, সূত্র ভুলে যাই)...',
    buildRoutineBtn: 'পার্সোনালাইজড রুটিন তৈরি করুন',
    savedRoutinesTitle: 'সংরক্ষিত রুটিনসমূহ',
    applyToTimer: 'টাইমারে লোড করুন',
    timerEyebrow: 'ব্যাকগ্রাউন্ড ফোকাস ও ১-৪-৭ রিটেনশন ইঞ্জিন',
    timerTitle: 'স্মার্ট স্টাডি টাইমার ও ১-৪-৭ রুল ট্র্যাকার',
    timerDesc:
      'ট্যাব পরিবর্তন বা মিনিমাইজ করলেও টাইমার সঠিকভাবে চলতে থাকবে। সময় শেষ হলে আপনি "Yes" চাপার আগ পর্যন্ত অ্যালার্ম বাজতেই থাকবে।',
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
    dailyCheckoffSub: 'প্রতিদিনের সম্পন্ন পড়াশোনার সাজানো তালিকা।',
    journalEyebrow: 'ব্যক্তিগত ভলিউম',
    journalTitle: 'আমার জার্নাল শেল্ফ',
    journalDesc:
      'বই খুলে জুম, পেজ-ফ্লিপ, ইমোজি, স্টিকার, ছবি, রঙিন স্টিকি নোট যোগ করুন এবং সহজেই PDF হিসেবে সেভ করুন।',
    newJournalBtn: 'নতুন জার্নাল তৈরি',
    writingFontTitle: 'লেখার ফন্ট',
    writingFontSub: 'এই বইটির জন্য একটি ফন্ট বেছে নিন।',
    librarySubtitle: 'মেড বাই আল তাহজীব নূর রাইয়ান',
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
    ambientTitle: 'ব্যাকগ্রাউন্ড মিউজিক ও অডিও স্টুডিও',
    ambientDesc: 'ডিভাইস থেকে আপনার নিজের অডিও আপলোড করুন অথবা অ্যাম্বিয়েন্ট সাউন্ড চালু রাখুন—সব সেকশনে নিরবচ্ছিন্নভাবে বাজবে।',
    wallpaperTitle: 'থিম ও ওয়ালপেপার স্টুডিও',
    wallpaperDesc: 'মনোক্রোম ব্ল্যাক-অ্যান্ড-হোয়াইট, পেপার বা নিজের ছবি ওয়ালপেপার হিসেবে সেট করুন।',
    uploadPhoto: 'ফটো আপলোড',
  },
};
