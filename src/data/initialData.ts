import {
  ClassDef,
  ClassSubjectTeacherMapping,
  CombinedClassRule,
  PeriodTiming,
  SubjectDef,
  TeacherDef,
} from '../types';

export const PERIOD_TIMINGS: PeriodTiming[] = [
  {
    periodNumber: 1,
    label: 'I',
    startTime: '09:30',
    endTime: '10:15',
  },
  {
    periodNumber: 2,
    label: 'II',
    startTime: '10:15',
    endTime: '11:00',
    isBreakAfter: true,
    breakLabel: 'Morning Break (இடைவேளை)',
    breakDuration: '11:00 - 11:10',
  },
  {
    periodNumber: 3,
    label: 'III',
    startTime: '11:10',
    endTime: '11:55',
  },
  {
    periodNumber: 4,
    label: 'IV',
    startTime: '11:55',
    endTime: '12:40',
    isBreakAfter: true,
    breakLabel: 'Lunch Break (உணவு இடைவேளை)',
    breakDuration: '12:40 - 01:20',
  },
  {
    periodNumber: 5,
    label: 'V',
    startTime: '01:20',
    endTime: '02:00',
  },
  {
    periodNumber: 6,
    label: 'VI',
    startTime: '02:00',
    endTime: '02:40',
    isBreakAfter: true,
    breakLabel: 'Afternoon Break (இடைவேளை)',
    breakDuration: '02:40 - 02:50',
  },
  {
    periodNumber: 7,
    label: 'VII',
    startTime: '02:50',
    endTime: '03:30',
  },
  {
    periodNumber: 8,
    label: 'VIII',
    startTime: '03:30',
    endTime: '04:10',
  },
];

export const SUBJECTS: Record<string, SubjectDef> = {
  // Languages
  TAMIL: {
    id: 'TAMIL',
    name: 'Tamil',
    shortName: 'TAM',
    category: 'Language',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    textColor: 'text-emerald-700',
  },
  ENGLISH: {
    id: 'ENGLISH',
    name: 'English',
    shortName: 'ENG',
    category: 'Language',
    color: 'border-blue-500 bg-blue-50 text-blue-800',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    textColor: 'text-blue-700',
  },

  // Main Subjects (Core)
  MATHS: {
    id: 'MATHS',
    name: 'Mathematics',
    shortName: 'MAT',
    category: 'Core',
    color: 'border-indigo-500 bg-indigo-50 text-indigo-800',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    textColor: 'text-indigo-700',
  },
  PHYSICS: {
    id: 'PHYSICS',
    name: 'Physics',
    shortName: 'PHY',
    category: 'Core',
    color: 'border-violet-500 bg-violet-50 text-violet-800',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    textColor: 'text-violet-700',
  },
  CHEMISTRY: {
    id: 'CHEMISTRY',
    name: 'Chemistry',
    shortName: 'CHE',
    category: 'Core',
    color: 'border-amber-500 bg-amber-50 text-amber-800',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    textColor: 'text-amber-700',
  },

  // Biology Split: Bio-Botany (Ramesh) & Bio-Zoology (Sundar)
  BIO_BOT: {
    id: 'BIO_BOT',
    name: 'Bio-Botany',
    shortName: 'BIO-BOT',
    category: 'Core',
    color: 'border-teal-500 bg-teal-50 text-teal-800',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    textColor: 'text-teal-700',
  },
  BIO_ZOO: {
    id: 'BIO_ZOO',
    name: 'Bio-Zoology',
    shortName: 'BIO-ZOO',
    category: 'Core',
    color: 'border-lime-500 bg-lime-50 text-lime-800',
    badgeBg: 'bg-lime-100 text-lime-800 border-lime-300',
    textColor: 'text-lime-700',
  },
  BIOLOGY: {
    id: 'BIOLOGY',
    name: 'Biology',
    shortName: 'BIO',
    category: 'Core',
    color: 'border-teal-600 bg-teal-50 text-teal-800',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    textColor: 'text-teal-700',
  },

  // Pure Science: Botany (Ramesh) & Zoology (Sundar)
  BOTANY: {
    id: 'BOTANY',
    name: 'Botany',
    shortName: 'BOT',
    category: 'Core',
    color: 'border-green-600 bg-green-50 text-green-800',
    badgeBg: 'bg-green-100 text-green-800 border-green-300',
    textColor: 'text-green-700',
  },
  ZOOLOGY: {
    id: 'ZOOLOGY',
    name: 'Zoology',
    shortName: 'ZOO',
    category: 'Core',
    color: 'border-lime-600 bg-lime-50 text-lime-800',
    badgeBg: 'bg-lime-100 text-lime-800 border-lime-300',
    textColor: 'text-lime-700',
  },

  // Computer Science (Siva)
  CS: {
    id: 'CS',
    name: 'Computer Science',
    shortName: 'CS',
    category: 'Core',
    color: 'border-cyan-500 bg-cyan-50 text-cyan-800',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    textColor: 'text-cyan-700',
  },

  // Practicals (Science Group)
  PHY_PRAC: {
    id: 'PHY_PRAC',
    name: 'Physics Practical',
    shortName: 'PHY-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-purple-600 bg-purple-50 text-purple-900',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    textColor: 'text-purple-800',
  },
  CHE_PRAC: {
    id: 'CHE_PRAC',
    name: 'Chemistry Practical',
    shortName: 'CHE-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-orange-500 bg-orange-50 text-orange-900',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    textColor: 'text-orange-800',
  },
  CS_PRAC: {
    id: 'CS_PRAC',
    name: 'CS Practical',
    shortName: 'CS-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-sky-600 bg-sky-50 text-sky-900',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    textColor: 'text-sky-800',
  },
  BIO_BOT_PRAC: {
    id: 'BIO_BOT_PRAC',
    name: 'Bio-Bot Practical',
    shortName: 'B-BOT-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-teal-700 bg-teal-50 text-teal-900',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    textColor: 'text-teal-800',
  },
  BIO_ZOO_PRAC: {
    id: 'BIO_ZOO_PRAC',
    name: 'Bio-Zoo Practical',
    shortName: 'B-ZOO-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-lime-700 bg-lime-50 text-lime-900',
    badgeBg: 'bg-lime-100 text-lime-900 border-lime-300',
    textColor: 'text-lime-800',
  },
  BOT_PRAC: {
    id: 'BOT_PRAC',
    name: 'Botany Practical',
    shortName: 'BOT-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-green-700 bg-green-50 text-green-900',
    badgeBg: 'bg-green-100 text-green-900 border-green-300',
    textColor: 'text-green-800',
  },
  ZOO_PRAC: {
    id: 'ZOO_PRAC',
    name: 'Zoology Practical',
    shortName: 'ZOO-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-lime-700 bg-lime-50 text-lime-900',
    badgeBg: 'bg-lime-100 text-lime-900 border-lime-300',
    textColor: 'text-lime-800',
  },
  BIO_PRAC: {
    id: 'BIO_PRAC',
    name: 'Biology Practical',
    shortName: 'BIO-P',
    category: 'Practical',
    isPractical: true,
    color: 'border-emerald-600 bg-emerald-50 text-emerald-900',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    textColor: 'text-emerald-800',
  },

  // Vocational Subjects & Practicals
  AGRI_T: {
    id: 'AGRI_T',
    name: 'Agri-Theory',
    shortName: 'AGRI-T',
    category: 'Vocational',
    color: 'border-amber-600 bg-amber-50 text-amber-900',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    textColor: 'text-amber-800',
  },
  AGRI_P: {
    id: 'AGRI_P',
    name: 'Agri-Pract',
    shortName: 'AGRI-P',
    category: 'Vocational',
    isPractical: true,
    color: 'border-yellow-600 bg-yellow-50 text-yellow-900',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    textColor: 'text-yellow-800',
  },
  EMP_SKILLS: {
    id: 'EMP_SKILLS',
    name: 'Emp.Skills',
    shortName: 'EMP-SK',
    category: 'Vocational',
    isPractical: true,
    color: 'border-rose-500 bg-rose-50 text-rose-800',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    textColor: 'text-rose-700',
  },

  // Activities
  PET: {
    id: 'PET',
    name: 'Physical Education (PT)',
    shortName: 'PT',
    category: 'Activity',
    color: 'border-slate-500 bg-slate-50 text-slate-800',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    textColor: 'text-slate-700',
  },
  CCA: {
    id: 'CCA',
    name: 'CCA / Library / ECA',
    shortName: 'CCA',
    category: 'Activity',
    color: 'border-stone-500 bg-stone-50 text-stone-800',
    badgeBg: 'bg-stone-100 text-stone-800 border-stone-300',
    textColor: 'text-stone-700',
  },
};

export const INITIAL_TEACHERS: TeacherDef[] = [
  {
    id: 'SUBBULAKSHMI',
    code: 'T-1',
    name: 'SUBBULAKSHMI',
    designation: 'PG Teacher',
    specialization: 'Tamil',
    color: '#059669',
    assignedClasses: ['11A', '11B', '11C', '11D', '11E', '12A', '12B', '12C', '12D', '12E'],
  },
  {
    id: 'PRADEEPA',
    code: 'T-2',
    name: 'PRADEEPA',
    designation: 'PG Teacher',
    specialization: 'English',
    color: '#3b82f6',
    assignedClasses: ['11A', '11B', '11C', '11D', '11E', '12A', '12B', '12C', '12D', '12E'],
  },
  {
    id: 'GOWRI',
    code: 'T-3',
    name: 'GOWRI',
    designation: 'PG Teacher',
    specialization: 'Physics',
    color: '#8b5cf6',
    assignedClasses: ['11A', '11B', '11C', '11D', '12A', '12B', '12C', '12D'],
  },
  {
    id: 'NITHYA',
    code: 'T-4',
    name: 'NITHYA',
    designation: 'PG Teacher',
    specialization: 'Chemistry',
    color: '#f59e0b',
    assignedClasses: ['11A', '11B', '11C', '11D', '12A', '12B', '12C', '12D'],
  },
  {
    id: 'LATHAMANI',
    code: 'T-5',
    name: 'LATHAMANI',
    designation: 'PG Teacher',
    specialization: 'Mathematics',
    color: '#6366f1',
    assignedClasses: ['11A', '11B', '11D', '12A', '12B', '12D'],
  },
  {
    id: 'RAMESH',
    code: 'T-6',
    name: 'RAMESH',
    designation: 'PG Teacher',
    specialization: 'Bio-Botany & Botany',
    color: '#10b981',
    assignedClasses: ['11B', '11C', '11D', '11E', '12B', '12C', '12D', '12E'],
  },
  {
    id: 'SUNDAR',
    code: 'T-7',
    name: 'SUNDAR',
    designation: 'PG Teacher',
    specialization: 'Bio-Zoology & Zoology',
    color: '#84cc16',
    assignedClasses: ['11B', '11C', '11D', '11E', '12B', '12C', '12D', '12E'],
  },
  {
    id: 'SIVA',
    code: 'T-8',
    name: 'SIVA',
    designation: 'PG Teacher',
    specialization: 'Computer Science & Emp-Skills',
    color: '#06b6d4',
    assignedClasses: ['11A', '11E', '12A', '12E'],
  },
  {
    id: 'MARITHEIVAM',
    code: 'T-9',
    name: 'MARITHEIVAM',
    designation: 'Vocational Agri Teacher',
    specialization: 'Agri-Theory & Agri-Pract',
    color: '#d97706',
    assignedClasses: ['11E', '12E'],
  },
  {
    id: 'PET_TEACHER',
    code: 'T-10',
    name: 'PET / CCA STAFF',
    designation: 'Special Teacher',
    specialization: 'Physical Education & CCA',
    color: '#64748b',
    assignedClasses: ['11A', '11B', '11C', '11D', '11E', '12A', '12B', '12C', '12D', '12E'],
  },
];

// Official Combined Class Rules according to institutional norms
export const COMBINED_CLASS_RULES: CombinedClassRule[] = [
  // Subbulakshmi: Tamil (Total = 29)
  { id: 'TAM_11ABC', teacherId: 'SUBBULAKSHMI', subjectId: 'TAMIL', classes: ['11A', '11B', '11C'], periodsPerWeek: 5, label: '11A,B,C' },
  { id: 'TAM_12ABC', teacherId: 'SUBBULAKSHMI', subjectId: 'TAMIL', classes: ['12A', '12B', '12C'], periodsPerWeek: 5, label: '12A,B,C' },
  { id: 'TAM_11D', teacherId: 'SUBBULAKSHMI', subjectId: 'TAMIL', classes: ['11D'], periodsPerWeek: 5, label: '11D' },
  { id: 'TAM_12D', teacherId: 'SUBBULAKSHMI', subjectId: 'TAMIL', classes: ['12D'], periodsPerWeek: 5, label: '12D' },
  { id: 'TAM_11E', teacherId: 'SUBBULAKSHMI', subjectId: 'TAMIL', classes: ['11E'], periodsPerWeek: 4, label: '11E' },
  { id: 'TAM_12E', teacherId: 'SUBBULAKSHMI', subjectId: 'TAMIL', classes: ['12E'], periodsPerWeek: 5, label: '12E' },

  // Pradeepa: English (Total = 29)
  { id: 'ENG_11ABC', teacherId: 'PRADEEPA', subjectId: 'ENGLISH', classes: ['11A', '11B', '11C'], periodsPerWeek: 5, label: '11A,B,C' },
  { id: 'ENG_12ABC', teacherId: 'PRADEEPA', subjectId: 'ENGLISH', classes: ['12A', '12B', '12C'], periodsPerWeek: 5, label: '12A,B,C' },
  { id: 'ENG_11D', teacherId: 'PRADEEPA', subjectId: 'ENGLISH', classes: ['11D'], periodsPerWeek: 5, label: '11D' },
  { id: 'ENG_12D', teacherId: 'PRADEEPA', subjectId: 'ENGLISH', classes: ['12D'], periodsPerWeek: 5, label: '12D' },
  { id: 'ENG_11E', teacherId: 'PRADEEPA', subjectId: 'ENGLISH', classes: ['11E'], periodsPerWeek: 4, label: '11E' },
  { id: 'ENG_12E', teacherId: 'PRADEEPA', subjectId: 'ENGLISH', classes: ['12E'], periodsPerWeek: 5, label: '12E' },

  // Gowri: Physics (Total = 28)
  { id: 'PHY_11ABC', teacherId: 'GOWRI', subjectId: 'PHYSICS', classes: ['11A', '11B', '11C'], periodsPerWeek: 7, label: '11ABC' },
  { id: 'PHY_12ABC', teacherId: 'GOWRI', subjectId: 'PHYSICS', classes: ['12A', '12B', '12C'], periodsPerWeek: 7, label: '12ABC' },
  { id: 'PHY_11D', teacherId: 'GOWRI', subjectId: 'PHYSICS', classes: ['11D'], periodsPerWeek: 7, label: '11D' },
  { id: 'PHY_12D', teacherId: 'GOWRI', subjectId: 'PHYSICS', classes: ['12D'], periodsPerWeek: 7, label: '12D' },

  // Nithya: Chemistry (Total = 28)
  { id: 'CHE_11ABC', teacherId: 'NITHYA', subjectId: 'CHEMISTRY', classes: ['11A', '11B', '11C'], periodsPerWeek: 7, label: '11ABC' },
  { id: 'CHE_12ABC', teacherId: 'NITHYA', subjectId: 'CHEMISTRY', classes: ['12A', '12B', '12C'], periodsPerWeek: 7, label: '12ABC' },
  { id: 'CHE_11D', teacherId: 'NITHYA', subjectId: 'CHEMISTRY', classes: ['11D'], periodsPerWeek: 7, label: '11D' },
  { id: 'CHE_12D', teacherId: 'NITHYA', subjectId: 'CHEMISTRY', classes: ['12D'], periodsPerWeek: 7, label: '12D' },

  // Lathamani: Maths (Total = 28)
  { id: 'MAT_11AB', teacherId: 'LATHAMANI', subjectId: 'MATHS', classes: ['11A', '11B'], periodsPerWeek: 7, label: '11AB' },
  { id: 'MAT_12AB', teacherId: 'LATHAMANI', subjectId: 'MATHS', classes: ['12A', '12B'], periodsPerWeek: 7, label: '12AB' },
  { id: 'MAT_11D', teacherId: 'LATHAMANI', subjectId: 'MATHS', classes: ['11D'], periodsPerWeek: 7, label: '11D' },
  { id: 'MAT_12D', teacherId: 'LATHAMANI', subjectId: 'MATHS', classes: ['12D'], periodsPerWeek: 7, label: '12D' },

  // Ramesh: Bio-Botany & Botany (Total = 30)
  { id: 'BOT_11BE', teacherId: 'RAMESH', subjectId: 'BIO_BOT', classes: ['11B', '11E'], periodsPerWeek: 4, label: '11BE' },
  { id: 'BOT_11C', teacherId: 'RAMESH', subjectId: 'BOTANY', classes: ['11C'], periodsPerWeek: 7, label: '11C' },
  { id: 'BOT_11D', teacherId: 'RAMESH', subjectId: 'BIO_BOT', classes: ['11D'], periodsPerWeek: 4, label: '11D' },
  { id: 'BOT_12BE', teacherId: 'RAMESH', subjectId: 'BIO_BOT', classes: ['12B', '12E'], periodsPerWeek: 4, label: '12BE' },
  { id: 'BOT_12C', teacherId: 'RAMESH', subjectId: 'BOTANY', classes: ['12C'], periodsPerWeek: 7, label: '12C' },
  { id: 'BOT_12D', teacherId: 'RAMESH', subjectId: 'BIO_BOT', classes: ['12D'], periodsPerWeek: 4, label: '12D' },

  // Sundar: Bio-Zoology & Zoology (Total = 30)
  { id: 'ZOO_11BE', teacherId: 'SUNDAR', subjectId: 'BIO_ZOO', classes: ['11B', '11E'], periodsPerWeek: 4, label: '11BE' },
  { id: 'ZOO_11C', teacherId: 'SUNDAR', subjectId: 'ZOOLOGY', classes: ['11C'], periodsPerWeek: 7, label: '11C' },
  { id: 'ZOO_11D', teacherId: 'SUNDAR', subjectId: 'BIO_ZOO', classes: ['11D'], periodsPerWeek: 4, label: '11D' },
  { id: 'ZOO_12BE', teacherId: 'SUNDAR', subjectId: 'BIO_ZOO', classes: ['12B', '12E'], periodsPerWeek: 4, label: '12BE' },
  { id: 'ZOO_12C', teacherId: 'SUNDAR', subjectId: 'ZOOLOGY', classes: ['12C'], periodsPerWeek: 7, label: '12C' },
  { id: 'ZOO_12D', teacherId: 'SUNDAR', subjectId: 'BIO_ZOO', classes: ['12D'], periodsPerWeek: 4, label: '12D' },

  // Siva: CS & Emp Skills (Total = 28)
  { id: 'CS_11A', teacherId: 'SIVA', subjectId: 'CS', classes: ['11A'], periodsPerWeek: 7, label: '11A CS' },
  { id: 'EMP_11E', teacherId: 'SIVA', subjectId: 'EMP_SKILLS', classes: ['11E'], periodsPerWeek: 7, label: '11E Emp-Skills' },
  { id: 'CS_12A', teacherId: 'SIVA', subjectId: 'CS', classes: ['12A'], periodsPerWeek: 7, label: '12A CS' },
  { id: 'EMP_12E', teacherId: 'SIVA', subjectId: 'EMP_SKILLS', classes: ['12E'], periodsPerWeek: 7, label: '12E Emp-Skills' },

  // Maritheivam: Agri-T & Agri-P (Total = 28)
  { id: 'AGRI_11E', teacherId: 'MARITHEIVAM', subjectId: 'AGRI_T', classes: ['11E'], periodsPerWeek: 7, label: '11E Agri-T' },
  { id: 'AGRIP_11E', teacherId: 'MARITHEIVAM', subjectId: 'AGRI_P', classes: ['11E'], periodsPerWeek: 7, label: '11E Agri-P' },
  { id: 'AGRI_12E', teacherId: 'MARITHEIVAM', subjectId: 'AGRI_T', classes: ['12E'], periodsPerWeek: 7, label: '12E Agri-T' },
  { id: 'AGRIP_12E', teacherId: 'MARITHEIVAM', subjectId: 'AGRI_P', classes: ['12E'], periodsPerWeek: 7, label: '12E Agri-P' },
];

// Helper to determine if a set of classes simultaneously attending a slot is an authorized combined group
export function isValidCombinedGroup(
  teacherId: string,
  subjectId: string,
  classIds: string[]
): boolean {
  if (classIds.length <= 1) return true;
  const sorted = [...classIds].sort().join(',');

  return COMBINED_CLASS_RULES.some((rule) => {
    if (rule.teacherId !== teacherId) return false;
    const ruleSorted = [...rule.classes].sort().join(',');
    return ruleSorted === sorted;
  });
}

export const INITIAL_CLASSES: ClassDef[] = [
  // 11A - Group 2502 (Tamil Medium) -> Total 40 periods
  {
    id: '11A',
    name: '11th Standard - Section A',
    standard: '11',
    section: 'A',
    groupCode: '2502',
    groupName: 'Maths, Physics, Chemistry, Computer Science',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'MATHS', 'PHYSICS', 'CHEMISTRY', 'CS', 'PHY_PRAC', 'CHE_PRAC', 'CS_PRAC', 'PET', 'CCA'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      MATHS: 7,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      CS: 5,
      CS_PRAC: 2,
      PET: 1,
      CCA: 1,
    },
  },
  // 12A - Group 2502 (Tamil Medium) -> Total 40 periods
  {
    id: '12A',
    name: '12th Standard - Section A',
    standard: '12',
    section: 'A',
    groupCode: '2502',
    groupName: 'Maths, Physics, Chemistry, Computer Science',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'MATHS', 'PHYSICS', 'CHEMISTRY', 'CS', 'PHY_PRAC', 'CHE_PRAC', 'CS_PRAC', 'PET', 'CCA'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      MATHS: 7,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      CS: 5,
      CS_PRAC: 2,
      PET: 1,
      CCA: 1,
    },
  },

  // 11B - Group 2503 (Tamil Medium) -> Total 40 periods
  {
    id: '11B',
    name: '11th Standard - Section B',
    standard: '11',
    section: 'B',
    groupCode: '2503',
    groupName: 'Maths, Physics, Chemistry, Bio-Botany, Bio-Zoology',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'MATHS', 'PHYSICS', 'CHEMISTRY', 'BIO_BOT', 'BIO_ZOO', 'PHY_PRAC', 'CHE_PRAC', 'BIO_BOT_PRAC', 'BIO_ZOO_PRAC', 'PET'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      MATHS: 7,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      BIO_BOT: 3,
      BIO_BOT_PRAC: 1,
      BIO_ZOO: 3,
      BIO_ZOO_PRAC: 1,
      PET: 1,
    },
  },
  // 12B - Group 2503 (Tamil Medium) -> Total 40 periods
  {
    id: '12B',
    name: '12th Standard - Section B',
    standard: '12',
    section: 'B',
    groupCode: '2503',
    groupName: 'Maths, Physics, Chemistry, Bio-Botany, Bio-Zoology',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'MATHS', 'PHYSICS', 'CHEMISTRY', 'BIO_BOT', 'BIO_ZOO', 'PHY_PRAC', 'CHE_PRAC', 'BIO_BOT_PRAC', 'BIO_ZOO_PRAC', 'PET'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      MATHS: 7,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      BIO_BOT: 3,
      BIO_BOT_PRAC: 1,
      BIO_ZOO: 3,
      BIO_ZOO_PRAC: 1,
      PET: 1,
    },
  },

  // 11D - Group 2503 (English Medium) -> Total 40 periods
  {
    id: '11D',
    name: '11th Standard - Section D',
    standard: '11',
    section: 'D',
    groupCode: '2503',
    groupName: 'Maths, Physics, Chemistry, Bio-Botany, Bio-Zoology (English Medium)',
    medium: 'English',
    subjectIds: ['TAMIL', 'ENGLISH', 'MATHS', 'PHYSICS', 'CHEMISTRY', 'BIO_BOT', 'BIO_ZOO', 'PHY_PRAC', 'CHE_PRAC', 'BIO_BOT_PRAC', 'BIO_ZOO_PRAC', 'PET'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      MATHS: 7,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      BIO_BOT: 3,
      BIO_BOT_PRAC: 1,
      BIO_ZOO: 3,
      BIO_ZOO_PRAC: 1,
      PET: 1,
    },
  },
  // 12D - Group 2503 (English Medium) -> Total 40 periods
  {
    id: '12D',
    name: '12th Standard - Section D',
    standard: '12',
    section: 'D',
    groupCode: '2503',
    groupName: 'Maths, Physics, Chemistry, Bio-Botany, Bio-Zoology (English Medium)',
    medium: 'English',
    subjectIds: ['TAMIL', 'ENGLISH', 'MATHS', 'PHYSICS', 'CHEMISTRY', 'BIO_BOT', 'BIO_ZOO', 'PHY_PRAC', 'CHE_PRAC', 'BIO_BOT_PRAC', 'BIO_ZOO_PRAC', 'PET'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      MATHS: 7,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      BIO_BOT: 3,
      BIO_BOT_PRAC: 1,
      BIO_ZOO: 3,
      BIO_ZOO_PRAC: 1,
      PET: 1,
    },
  },

  // 11C - Group 2608 (Pure Science - Tamil Medium) -> Total 40 periods
  {
    id: '11C',
    name: '11th Standard - Section C',
    standard: '11',
    section: 'C',
    groupCode: '2608',
    groupName: 'Physics, Chemistry, Botany, Zoology (Pure Science)',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BOTANY', 'ZOOLOGY', 'PHY_PRAC', 'CHE_PRAC', 'BOT_PRAC', 'ZOO_PRAC', 'PET', 'CCA'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      BOTANY: 5,
      BOT_PRAC: 2,
      ZOOLOGY: 5,
      ZOO_PRAC: 2,
      PET: 1,
      CCA: 1,
    },
  },
  // 12C - Group 2608 (Pure Science - Tamil Medium) -> Total 40 periods
  {
    id: '12C',
    name: '12th Standard - Section C',
    standard: '12',
    section: 'C',
    groupCode: '2608',
    groupName: 'Physics, Chemistry, Botany, Zoology (Pure Science)',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BOTANY', 'ZOOLOGY', 'PHY_PRAC', 'CHE_PRAC', 'BOT_PRAC', 'ZOO_PRAC', 'PET', 'CCA'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      PHYSICS: 5,
      PHY_PRAC: 2,
      CHEMISTRY: 5,
      CHE_PRAC: 2,
      BOTANY: 5,
      BOT_PRAC: 2,
      ZOOLOGY: 5,
      ZOO_PRAC: 2,
      PET: 1,
      CCA: 1,
    },
  },

  // 11E - Group 2981 (Vocational Agri - Tamil Medium) -> Total 40 periods
  {
    id: '11E',
    name: '11th Standard - Section E',
    standard: '11',
    section: 'E',
    groupCode: '2981',
    groupName: 'Vocational Agriculture (Bio-Botany, Bio-Zoology, Agri-T, Agri-P, Emp.Skills)',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'BIO_BOT', 'BIO_ZOO', 'AGRI_T', 'AGRI_P', 'EMP_SKILLS', 'BIO_BOT_PRAC', 'BIO_ZOO_PRAC', 'PET', 'CCA'],
    subjectPeriodsTarget: {
      TAMIL: 4,
      ENGLISH: 4,
      BIO_BOT: 3,
      BIO_BOT_PRAC: 1,
      BIO_ZOO: 3,
      BIO_ZOO_PRAC: 1,
      AGRI_T: 7,
      AGRI_P: 7,
      EMP_SKILLS: 7,
      PET: 1,
      CCA: 2,
    },
  },
  // 12E - Group 2981 (Vocational Agri - Tamil Medium) -> Total 40 periods
  {
    id: '12E',
    name: '12th Standard - Section E',
    standard: '12',
    section: 'E',
    groupCode: '2981',
    groupName: 'Vocational Agriculture (Bio-Botany, Bio-Zoology, Agri-T, Agri-P, Emp.Skills)',
    medium: 'Tamil',
    subjectIds: ['TAMIL', 'ENGLISH', 'BIO_BOT', 'BIO_ZOO', 'AGRI_T', 'AGRI_P', 'EMP_SKILLS', 'BIO_BOT_PRAC', 'BIO_ZOO_PRAC', 'PET'],
    subjectPeriodsTarget: {
      TAMIL: 5,
      ENGLISH: 5,
      BIO_BOT: 3,
      BIO_BOT_PRAC: 1,
      BIO_ZOO: 3,
      BIO_ZOO_PRAC: 1,
      AGRI_T: 7,
      AGRI_P: 7,
      EMP_SKILLS: 7,
      PET: 1,
    },
  },
];

// Helper to generate initial teacher allotments
export function getInitialTeacherAllotments(): ClassSubjectTeacherMapping[] {
  const allotments: ClassSubjectTeacherMapping[] = [];

  INITIAL_CLASSES.forEach((cls) => {
    cls.subjectIds.forEach((subjId) => {
      let teacherId = 'PET_TEACHER';

      if (subjId === 'TAMIL') {
        teacherId = 'SUBBULAKSHMI';
      } else if (subjId === 'ENGLISH') {
        teacherId = 'PRADEEPA';
      } else if (subjId === 'MATHS') {
        teacherId = 'LATHAMANI';
      } else if (subjId === 'PHYSICS' || subjId === 'PHY_PRAC') {
        teacherId = 'GOWRI';
      } else if (subjId === 'CHEMISTRY' || subjId === 'CHE_PRAC') {
        teacherId = 'NITHYA';
      } else if (subjId === 'BOTANY' || subjId === 'BOT_PRAC' || subjId === 'BIO_BOT' || subjId === 'BIO_BOT_PRAC') {
        teacherId = 'RAMESH';
      } else if (subjId === 'ZOOLOGY' || subjId === 'ZOO_PRAC' || subjId === 'BIO_ZOO' || subjId === 'BIO_ZOO_PRAC') {
        teacherId = 'SUNDAR';
      } else if (subjId === 'CS' || subjId === 'CS_PRAC') {
        teacherId = 'SIVA';
      } else if (subjId === 'EMP_SKILLS') {
        teacherId = 'SIVA';
      } else if (subjId === 'AGRI_T' || subjId === 'AGRI_P') {
        teacherId = 'MARITHEIVAM';
      } else if (subjId === 'BIOLOGY' || subjId === 'BIO_PRAC') {
        teacherId = 'RAMESH';
      } else {
        teacherId = 'PET_TEACHER';
      }

      allotments.push({
        classId: cls.id,
        subjectId: subjId,
        teacherId: teacherId,
      });
    });
  });

  return allotments;
}
