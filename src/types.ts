export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export interface PeriodTiming {
  periodNumber: number; // 1 to 8
  label: string; // "I", "II", etc.
  startTime: string; // "09:30"
  endTime: string; // "10:15"
  isBreakAfter?: boolean;
  breakLabel?: string; // "Morning Interval", "Lunch Break"
  breakDuration?: string; // "11:00 - 11:10"
}

export type SubjectCategory = 'Language' | 'Core' | 'Vocational' | 'Practical' | 'Activity';

export interface SubjectDef {
  id: string;
  name: string;
  shortName: string;
  category: SubjectCategory;
  isPractical?: boolean;
  color: string;
  badgeBg: string;
  textColor: string;
}

export interface ClassDef {
  id: string; // "11A", "12A", etc.
  name: string; // "Class 11 - Section A"
  standard: '11' | '12';
  section: string;
  groupCode: '2502' | '2503' | '2608' | '2981';
  groupName: string;
  medium: 'Tamil' | 'English';
  subjectIds: string[]; // List of subjects offered in this class
  subjectPeriodsTarget: Record<string, number>; // subjectId -> target weekly periods (sum = 40)
}

export interface TeacherDef {
  id: string; // "SIVA", "RAMESH", etc.
  code: string; // "T-1", "T-2", etc.
  name: string;
  designation: 'PG Teacher' | 'Vocational Agri Teacher' | 'Special Teacher';
  specialization: string; // "Physics", "Chemistry", "Tamil", "English", "Agri", etc.
  color: string;
  assignedClasses?: string[];
}

// Subject assignment: for a given class and subject, which teacher handles it
export interface ClassSubjectTeacherMapping {
  classId: string;
  subjectId: string;
  teacherId: string;
}

export interface TimetableCell {
  classId: string;
  day: DayOfWeek;
  period: number; // 1 to 8
  subjectId: string;
  teacherId: string;
  isLocked?: boolean; // if user locked it from auto-shuffling
  combinedWith?: string[]; // list of classes attending this period jointly (e.g. ['11A', '11B', '11C'])
}

export interface CombinedClassRule {
  id: string;
  teacherId: string;
  subjectId: string;
  classes: string[]; // classes that attend jointly
  periodsPerWeek: number;
  label: string; // e.g. "11A,B,C"
}

export interface Conflict {
  day: DayOfWeek;
  period: number;
  teacherId: string;
  teacherName: string;
  classes: string[];
}

export interface TeacherLoadSummary {
  teacherId: string;
  teacherName: string;
  designation: string;
  totalPeriods: number;
  dayLoad: Record<DayOfWeek, number>;
  classesHandled: { classId: string; subjectName: string; periods: number }[];
}

export interface TimetableState {
  schoolName: string;
  academicYear: string;
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  teacherAllotments: ClassSubjectTeacherMapping[];
  schedule: Record<string, TimetableCell>; // key: `${classId}_${day}_${period}`
}
