import { ClassDef, DAYS_OF_WEEK, PeriodTiming, SubjectDef, TeacherDef, TimetableCell } from '../types';
import { PERIOD_TIMINGS } from '../data/initialData';
import { getCellKey } from './scheduler';

export function exportTimetableToCSV(
  classes: ClassDef[],
  teachers: TeacherDef[],
  subjects: Record<string, SubjectDef>,
  schedule: Record<string, TimetableCell>,
  schoolName: string,
  academicYear: string
) {
  const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));

  const rows: string[][] = [];

  // Title header
  rows.push([`${schoolName} - ACADEMIC TIME TABLE (CLASS 11 & 12)`]);
  rows.push([`Academic Year: ${academicYear}`, `Generated on: ${new Date().toLocaleDateString()}`]);
  rows.push([]);

  // Header row
  rows.push([
    'Class',
    'Standard',
    'Group Code',
    'Medium',
    'Day',
    'Period',
    'Timing',
    'Subject Code',
    'Subject Name',
    'Teacher Name',
    'Is Locked',
  ]);

  classes.forEach((cls) => {
    DAYS_OF_WEEK.forEach((day) => {
      PERIOD_TIMINGS.forEach((timing) => {
        const k = getCellKey(cls.id, day, timing.periodNumber);
        const cell = schedule[k];
        const subj = cell?.subjectId ? subjects[cell.subjectId] : null;
        const teacherName = cell?.teacherId ? teacherMap.get(cell.teacherId) || cell.teacherId : '';

        rows.push([
          cls.id,
          cls.standard,
          cls.groupCode,
          cls.medium,
          day,
          `Period ${timing.periodNumber}`,
          `${timing.startTime} - ${timing.endTime}`,
          cell?.subjectId || '',
          subj?.name || '',
          teacherName,
          cell?.isLocked ? 'YES' : 'NO',
        ]);
      });
    });
  });

  // Convert to CSV string
  const csvContent = rows
    .map((row) =>
      row
        .map((val) => {
          const str = String(val ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${schoolName.replace(/\s+/g, '_')}_HSS_Timetable_${academicYear}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
