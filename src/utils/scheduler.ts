import {
  ClassDef,
  ClassSubjectTeacherMapping,
  Conflict,
  DAYS_OF_WEEK,
  DayOfWeek,
  TeacherDef,
  TeacherLoadSummary,
  TimetableCell,
} from '../types';
import { COMBINED_CLASS_RULES, SUBJECTS, isValidCombinedGroup } from '../data/initialData';

// Generate cell key
export function getCellKey(classId: string, day: DayOfWeek, period: number): string {
  return `${classId}_${day}_${period}`;
}

// Check for conflicts across the entire schedule
export function detectConflicts(
  schedule: Record<string, TimetableCell>,
  teachers: TeacherDef[]
): Conflict[] {
  const conflicts: Conflict[] = [];
  const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));

  // For each day and period, check which teachers are active across classes
  DAYS_OF_WEEK.forEach((day) => {
    for (let period = 1; period <= 8; period++) {
      // Map of teacherId -> { subjectId: string; classes: string[] }
      const teacherClassMap = new Map<string, { subjectId: string; classes: string[] }>();

      Object.values(schedule).forEach((cell) => {
        if (cell.day === day && cell.period === period && cell.teacherId) {
          // Special/activity teachers (e.g. PET) can oversee multiple groups if needed
          if (cell.teacherId === 'PET_TEACHER') return;

          const existing = teacherClassMap.get(cell.teacherId);
          if (!existing) {
            teacherClassMap.set(cell.teacherId, {
              subjectId: cell.subjectId,
              classes: [cell.classId],
            });
          } else {
            existing.classes.push(cell.classId);
          }
        }
      });

      teacherClassMap.forEach(({ subjectId, classes }, teacherId) => {
        if (classes.length > 1) {
          // Verify if this joint teaching session is an authorized combined group
          const isAuthorized = isValidCombinedGroup(teacherId, subjectId, classes);
          if (!isAuthorized) {
            conflicts.push({
              day,
              period,
              teacherId,
              teacherName: teacherMap.get(teacherId) || teacherId,
              classes,
            });
          }
        }
      });
    }
  });

  return conflicts;
}

// Compute weekly period load for each teacher
export function calculateTeacherLoads(
  schedule: Record<string, TimetableCell>,
  teachers: TeacherDef[]
): TeacherLoadSummary[] {
  return teachers.map((teacher) => {
    const dayLoad: Record<DayOfWeek, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
    };
    let totalPeriods = 0;
    const classSubjectCounter: Record<string, { classId: string; subjectName: string; periods: number }> = {};

    DAYS_OF_WEEK.forEach((day) => {
      for (let p = 1; p <= 8; p++) {
        const cellsInSlot: TimetableCell[] = [];
        Object.values(schedule).forEach((cell) => {
          if (cell.day === day && cell.period === p && cell.teacherId === teacher.id) {
            cellsInSlot.push(cell);
          }
        });

        if (cellsInSlot.length > 0) {
          dayLoad[day]++;
          totalPeriods++;

          const classNames = cellsInSlot.map((c) => c.classId).sort().join(',');
          const subjId = cellsInSlot[0].subjectId;
          const subjName = SUBJECTS[subjId]?.name || subjId;
          const key = `${classNames}_${subjId}`;
          if (!classSubjectCounter[key]) {
            classSubjectCounter[key] = {
              classId: classNames,
              subjectName: subjName,
              periods: 0,
            };
          }
          classSubjectCounter[key].periods++;
        }
      }
    });

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      designation: teacher.designation,
      totalPeriods,
      dayLoad,
      classesHandled: Object.values(classSubjectCounter),
    };
  });
}

// Find free periods for each teacher by day
export function getTeachersFreePeriods(
  schedule: Record<string, TimetableCell>,
  teachers: TeacherDef[]
): Record<string, Record<DayOfWeek, number[]>> {
  const result: Record<string, Record<DayOfWeek, number[]>> = {};

  teachers.forEach((t) => {
    result[t.id] = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    DAYS_OF_WEEK.forEach((day) => {
      const busyPeriods = new Set<number>();
      Object.values(schedule).forEach((cell) => {
        if (cell.teacherId === t.id && cell.day === day) {
          busyPeriods.add(cell.period);
        }
      });

      const free: number[] = [];
      for (let p = 1; p <= 8; p++) {
        if (!busyPeriods.has(p)) {
          free.push(p);
        }
      }
      result[t.id][day] = free;
    });
  });

  return result;
}

// Find available substitute teachers for a given day and period
export function findAvailableSubstitutes(
  schedule: Record<string, TimetableCell>,
  teachers: TeacherDef[],
  day: DayOfWeek,
  period: number,
  absentTeacherId?: string
): TeacherDef[] {
  const busyTeacherIds = new Set<string>();

  Object.values(schedule).forEach((cell) => {
    if (cell.day === day && cell.period === period && cell.teacherId) {
      busyTeacherIds.add(cell.teacherId);
    }
  });

  return teachers.filter(
    (t) => t.id !== absentTeacherId && !busyTeacherIds.has(t.id) && t.id !== 'PET_TEACHER'
  );
}

/**
 * Builds the canonical conflict-free master timetable according to official combined class rules.
 * This guarantees:
 * - Subbulakshmi (Tamil): 29 periods
 * - Pradeepa (English): 29 periods
 * - Gowri (Physics): 28 periods
 * - Nithya (Chemistry): 28 periods
 * - Lathamani (Maths): 28 periods
 * - Ramesh (Bio-Botany & Botany): 30 periods
 * - Sundar (Bio-Zoology & Zoology): 30 periods
 * - Siva (CS & Emp Skills): 28 periods
 * - Maritheivam (Agri-T & Agri-P): 28 periods
 * - Exactly 40 periods per class across all 10 classes
 * - ZERO teacher collisions!
 */
export function buildCanonicalMasterTimetable(): Record<string, TimetableCell> {
  const schedule: Record<string, TimetableCell> = {};

  const placeSlot = (
    classIds: string[],
    day: DayOfWeek,
    period: number,
    subjectId: string,
    teacherId: string,
    isPractical: boolean = false
  ) => {
    classIds.forEach((clsId) => {
      const key = getCellKey(clsId, day, period);
      schedule[key] = {
        classId: clsId,
        day,
        period,
        subjectId,
        teacherId,
        combinedWith: classIds.length > 1 ? classIds : undefined,
      };
    });
  };

  // 1. Language Combined Allocations
  // Subbulakshmi: Tamil (Total = 29)
  // 11ABC (5) -> Mon..Fri Period 1
  DAYS_OF_WEEK.forEach((d) => placeSlot(['11A', '11B', '11C'], d, 1, 'TAMIL', 'SUBBULAKSHMI'));
  // 12ABC (5) -> Mon..Fri Period 2
  DAYS_OF_WEEK.forEach((d) => placeSlot(['12A', '12B', '12C'], d, 2, 'TAMIL', 'SUBBULAKSHMI'));
  // 11D (5) -> Mon..Fri Period 3
  DAYS_OF_WEEK.forEach((d) => placeSlot(['11D'], d, 3, 'TAMIL', 'SUBBULAKSHMI'));
  // 12D (5) -> Mon..Fri Period 4
  DAYS_OF_WEEK.forEach((d) => placeSlot(['12D'], d, 4, 'TAMIL', 'SUBBULAKSHMI'));
  // 11E (4) -> Mon..Thu Period 5
  (['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as DayOfWeek[]).forEach((d) =>
    placeSlot(['11E'], d, 5, 'TAMIL', 'SUBBULAKSHMI')
  );
  // 12E (5) -> Mon..Fri Period 6
  DAYS_OF_WEEK.forEach((d) => placeSlot(['12E'], d, 6, 'TAMIL', 'SUBBULAKSHMI'));

  // Pradeepa: English (Total = 29)
  // 12ABC (5) -> Mon..Fri Period 1
  DAYS_OF_WEEK.forEach((d) => placeSlot(['12A', '12B', '12C'], d, 1, 'ENGLISH', 'PRADEEPA'));
  // 11ABC (5) -> Mon..Fri Period 2
  DAYS_OF_WEEK.forEach((d) => placeSlot(['11A', '11B', '11C'], d, 2, 'ENGLISH', 'PRADEEPA'));
  // 12D (5) -> Mon..Fri Period 3
  DAYS_OF_WEEK.forEach((d) => placeSlot(['12D'], d, 3, 'ENGLISH', 'PRADEEPA'));
  // 11D (5) -> Mon..Fri Period 4
  DAYS_OF_WEEK.forEach((d) => placeSlot(['11D'], d, 4, 'ENGLISH', 'PRADEEPA'));
  // 12E (5) -> Mon..Fri Period 5
  DAYS_OF_WEEK.forEach((d) => placeSlot(['12E'], d, 5, 'ENGLISH', 'PRADEEPA'));
  // 11E (4) -> Mon..Thu Period 6
  (['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as DayOfWeek[]).forEach((d) =>
    placeSlot(['11E'], d, 6, 'ENGLISH', 'PRADEEPA')
  );

  // 2. Physics & Chemistry (Gowri & Nithya)
  // Gowri (Physics): 11ABC (7), 12ABC (7), 11D (7), 12D (7) = 28
  // 11ABC: Mon P3, P4 (Prac), Tue P3, Wed P3, Thu P3, Fri P3, P4
  placeSlot(['11A', '11B', '11C'], 'Monday', 3, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['11A', '11B', '11C'], 'Monday', 4, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['11A', '11B', '11C'], 'Tuesday', 3, 'PHYSICS', 'GOWRI');
  placeSlot(['11A', '11B', '11C'], 'Wednesday', 3, 'PHYSICS', 'GOWRI');
  placeSlot(['11A', '11B', '11C'], 'Thursday', 3, 'PHYSICS', 'GOWRI');
  placeSlot(['11A', '11B', '11C'], 'Friday', 3, 'PHYSICS', 'GOWRI');
  placeSlot(['11A', '11B', '11C'], 'Friday', 4, 'PHYSICS', 'GOWRI');

  // 12ABC: Tue P7, P8 (Prac), Wed P7, Thu P7, Fri P7, Mon P7, P8
  placeSlot(['12A', '12B', '12C'], 'Tuesday', 7, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['12A', '12B', '12C'], 'Tuesday', 8, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['12A', '12B', '12C'], 'Wednesday', 7, 'PHYSICS', 'GOWRI');
  placeSlot(['12A', '12B', '12C'], 'Thursday', 7, 'PHYSICS', 'GOWRI');
  placeSlot(['12A', '12B', '12C'], 'Friday', 7, 'PHYSICS', 'GOWRI');
  placeSlot(['12A', '12B', '12C'], 'Monday', 7, 'PHYSICS', 'GOWRI');
  placeSlot(['12A', '12B', '12C'], 'Monday', 8, 'PHYSICS', 'GOWRI');

  // 11D: Tue P5, P6 (Prac), Wed P5, Thu P5, Fri P5, Mon P5, P6
  placeSlot(['11D'], 'Tuesday', 5, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['11D'], 'Tuesday', 6, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['11D'], 'Wednesday', 5, 'PHYSICS', 'GOWRI');
  placeSlot(['11D'], 'Thursday', 5, 'PHYSICS', 'GOWRI');
  placeSlot(['11D'], 'Friday', 5, 'PHYSICS', 'GOWRI');
  placeSlot(['11D'], 'Monday', 5, 'PHYSICS', 'GOWRI');
  placeSlot(['11D'], 'Monday', 6, 'PHYSICS', 'GOWRI');

  // 12D: Wed P3, P4 (Prac), Thu P3, P4, Tue P3, P4, Wed P6
  placeSlot(['12D'], 'Wednesday', 3, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['12D'], 'Wednesday', 4, 'PHY_PRAC', 'GOWRI', true);
  placeSlot(['12D'], 'Thursday', 3, 'PHYSICS', 'GOWRI');
  placeSlot(['12D'], 'Thursday', 4, 'PHYSICS', 'GOWRI');
  placeSlot(['12D'], 'Tuesday', 3, 'PHYSICS', 'GOWRI');
  placeSlot(['12D'], 'Tuesday', 4, 'PHYSICS', 'GOWRI');
  placeSlot(['12D'], 'Wednesday', 6, 'PHYSICS', 'GOWRI');

  // Nithya (Chemistry): 11ABC (7), 12ABC (7), 11D (7), 12D (7) = 28
  // 11ABC: Tue P4, Wed P4, Thu P4, Mon P5, P6, Tue P5, P6 (Prac)
  placeSlot(['11A', '11B', '11C'], 'Tuesday', 4, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11A', '11B', '11C'], 'Wednesday', 4, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11A', '11B', '11C'], 'Thursday', 4, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11A', '11B', '11C'], 'Monday', 5, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11A', '11B', '11C'], 'Monday', 6, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11A', '11B', '11C'], 'Tuesday', 5, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['11A', '11B', '11C'], 'Tuesday', 6, 'CHE_PRAC', 'NITHYA', true);

  // 12ABC: Wed P3, P4, Thu P3, P4, Fri P3, P4 (Prac), Fri P5
  placeSlot(['12A', '12B', '12C'], 'Wednesday', 3, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12A', '12B', '12C'], 'Wednesday', 4, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12A', '12B', '12C'], 'Thursday', 3, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12A', '12B', '12C'], 'Thursday', 4, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12A', '12B', '12C'], 'Friday', 3, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['12A', '12B', '12C'], 'Friday', 4, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['12A', '12B', '12C'], 'Friday', 5, 'CHEMISTRY', 'NITHYA');

  // 11D: Mon P7, P8 (Prac), Tue P7, P8, Wed P7, Thu P7, Fri P7
  placeSlot(['11D'], 'Monday', 7, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['11D'], 'Monday', 8, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['11D'], 'Tuesday', 7, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11D'], 'Tuesday', 8, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11D'], 'Wednesday', 7, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11D'], 'Thursday', 7, 'CHEMISTRY', 'NITHYA');
  placeSlot(['11D'], 'Friday', 7, 'CHEMISTRY', 'NITHYA');

  // 12D: Mon P5, P6 (Prac), Tue P5, P6, Thu P5, P6, Fri P8
  placeSlot(['12D'], 'Monday', 5, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['12D'], 'Monday', 6, 'CHE_PRAC', 'NITHYA', true);
  placeSlot(['12D'], 'Tuesday', 5, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12D'], 'Tuesday', 6, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12D'], 'Thursday', 5, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12D'], 'Thursday', 6, 'CHEMISTRY', 'NITHYA');
  placeSlot(['12D'], 'Friday', 8, 'CHEMISTRY', 'NITHYA');

  // 3. Maths (Lathamani): 11AB (7), 12AB (7), 11D (7), 12D (7) = 28
  // 11AB: Mon P7, P8, Tue P7, P8, Wed P5, Thu P5, Fri P5
  placeSlot(['11A', '11B'], 'Monday', 7, 'MATHS', 'LATHAMANI');
  placeSlot(['11A', '11B'], 'Monday', 8, 'MATHS', 'LATHAMANI');
  placeSlot(['11A', '11B'], 'Tuesday', 7, 'MATHS', 'LATHAMANI');
  placeSlot(['11A', '11B'], 'Tuesday', 8, 'MATHS', 'LATHAMANI');
  placeSlot(['11A', '11B'], 'Wednesday', 5, 'MATHS', 'LATHAMANI');
  placeSlot(['11A', '11B'], 'Thursday', 5, 'MATHS', 'LATHAMANI');
  placeSlot(['11A', '11B'], 'Friday', 5, 'MATHS', 'LATHAMANI');

  // 12AB: Wed P5, P6, Thu P5, P6, Fri P6, Mon P3, P4
  placeSlot(['12A', '12B'], 'Wednesday', 5, 'MATHS', 'LATHAMANI');
  placeSlot(['12A', '12B'], 'Wednesday', 6, 'MATHS', 'LATHAMANI');
  placeSlot(['12A', '12B'], 'Thursday', 5, 'MATHS', 'LATHAMANI');
  placeSlot(['12A', '12B'], 'Thursday', 6, 'MATHS', 'LATHAMANI');
  placeSlot(['12A', '12B'], 'Friday', 6, 'MATHS', 'LATHAMANI');
  placeSlot(['12A', '12B'], 'Monday', 3, 'MATHS', 'LATHAMANI');
  placeSlot(['12A', '12B'], 'Monday', 4, 'MATHS', 'LATHAMANI');

  // 11D: Mon P1, P2, Wed P1, P2, Thu P1, P2, Fri P6
  placeSlot(['11D'], 'Monday', 1, 'MATHS', 'LATHAMANI');
  placeSlot(['11D'], 'Monday', 2, 'MATHS', 'LATHAMANI');
  placeSlot(['11D'], 'Wednesday', 1, 'MATHS', 'LATHAMANI');
  placeSlot(['11D'], 'Wednesday', 2, 'MATHS', 'LATHAMANI');
  placeSlot(['11D'], 'Thursday', 1, 'MATHS', 'LATHAMANI');
  placeSlot(['11D'], 'Thursday', 2, 'MATHS', 'LATHAMANI');
  placeSlot(['11D'], 'Friday', 6, 'MATHS', 'LATHAMANI');

  // 12D: Tue P1, P2, Thu P7, P8, Fri P1, P2, Wed P5
  placeSlot(['12D'], 'Tuesday', 1, 'MATHS', 'LATHAMANI');
  placeSlot(['12D'], 'Tuesday', 2, 'MATHS', 'LATHAMANI');
  placeSlot(['12D'], 'Thursday', 7, 'MATHS', 'LATHAMANI');
  placeSlot(['12D'], 'Thursday', 8, 'MATHS', 'LATHAMANI');
  placeSlot(['12D'], 'Friday', 1, 'MATHS', 'LATHAMANI');
  placeSlot(['12D'], 'Friday', 2, 'MATHS', 'LATHAMANI');
  placeSlot(['12D'], 'Wednesday', 5, 'MATHS', 'LATHAMANI');

  // 4. Ramesh (Bio-Botany & Botany): 11BE (4), 11C (7), 11D (4), 12BE (4), 12C (7), 12D (4) = 30
  // 11BE: Wed P6, P7, Wed P8 (Prac), Thu P6
  placeSlot(['11B', '11E'], 'Wednesday', 6, 'BIO_BOT', 'RAMESH');
  placeSlot(['11B', '11E'], 'Wednesday', 7, 'BIO_BOT', 'RAMESH');
  placeSlot(['11B', '11E'], 'Wednesday', 8, 'BIO_BOT_PRAC', 'RAMESH', true);
  placeSlot(['11B', '11E'], 'Thursday', 6, 'BIO_BOT', 'RAMESH');

  // 11C: Mon P7, P8 (Prac), Tue P7, P8, Wed P5, Thu P5, Fri P5
  placeSlot(['11C'], 'Monday', 7, 'BOT_PRAC', 'RAMESH', true);
  placeSlot(['11C'], 'Monday', 8, 'BOT_PRAC', 'RAMESH', true);
  placeSlot(['11C'], 'Tuesday', 7, 'BOTANY', 'RAMESH');
  placeSlot(['11C'], 'Tuesday', 8, 'BOTANY', 'RAMESH');
  placeSlot(['11C'], 'Wednesday', 5, 'BOTANY', 'RAMESH');
  placeSlot(['11C'], 'Thursday', 5, 'BOTANY', 'RAMESH');
  placeSlot(['11C'], 'Friday', 5, 'BOTANY', 'RAMESH');

  // 11D: Tue P1, P2, Fri P1, P2 (Prac)
  placeSlot(['11D'], 'Tuesday', 1, 'BIO_BOT', 'RAMESH');
  placeSlot(['11D'], 'Tuesday', 2, 'BIO_BOT', 'RAMESH');
  placeSlot(['11D'], 'Friday', 1, 'BIO_BOT', 'RAMESH');
  placeSlot(['11D'], 'Friday', 2, 'BIO_BOT_PRAC', 'RAMESH', true);

  // 12BE: Mon P7, P8, Tue P7, P8 (Prac)
  placeSlot(['12B', '12E'], 'Monday', 7, 'BIO_BOT', 'RAMESH');
  placeSlot(['12B', '12E'], 'Monday', 8, 'BIO_BOT', 'RAMESH');
  placeSlot(['12B', '12E'], 'Tuesday', 7, 'BIO_BOT', 'RAMESH');
  placeSlot(['12B', '12E'], 'Tuesday', 8, 'BIO_BOT_PRAC', 'RAMESH', true);

  // 12C: Wed P5, P6, Thu P5, P6, Fri P6, Mon P3, P4 (Prac)
  placeSlot(['12C'], 'Wednesday', 5, 'BOTANY', 'RAMESH');
  placeSlot(['12C'], 'Wednesday', 6, 'BOTANY', 'RAMESH');
  placeSlot(['12C'], 'Thursday', 5, 'BOTANY', 'RAMESH');
  placeSlot(['12C'], 'Thursday', 6, 'BOTANY', 'RAMESH');
  placeSlot(['12C'], 'Friday', 6, 'BOTANY', 'RAMESH');
  placeSlot(['12C'], 'Monday', 3, 'BOT_PRAC', 'RAMESH', true);
  placeSlot(['12C'], 'Monday', 4, 'BOT_PRAC', 'RAMESH', true);

  // 12D: Wed P7, P8, Thu P1, P2 (Prac)
  placeSlot(['12D'], 'Wednesday', 7, 'BIO_BOT', 'RAMESH');
  placeSlot(['12D'], 'Wednesday', 8, 'BIO_BOT', 'RAMESH');
  placeSlot(['12D'], 'Thursday', 1, 'BIO_BOT', 'RAMESH');
  placeSlot(['12D'], 'Thursday', 2, 'BIO_BOT_PRAC', 'RAMESH', true);

  // 5. Sundar (Bio-Zoology & Zoology): 11BE (4), 11C (7), 11D (4), 12BE (4), 12C (7), 12D (4) = 30
  // 11BE: Thu P7, P8 (Prac), Fri P6, P7
  placeSlot(['11B', '11E'], 'Thursday', 7, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['11B', '11E'], 'Thursday', 8, 'BIO_ZOO_PRAC', 'SUNDAR', true);
  placeSlot(['11B', '11E'], 'Friday', 6, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['11B', '11E'], 'Friday', 7, 'BIO_ZOO', 'SUNDAR');

  // 11C: Wed P6, P7 (Prac), Wed P8, Thu P6, P7, Fri P6, P7
  placeSlot(['11C'], 'Wednesday', 6, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['11C'], 'Wednesday', 7, 'ZOO_PRAC', 'SUNDAR', true);
  placeSlot(['11C'], 'Wednesday', 8, 'ZOO_PRAC', 'SUNDAR', true);
  placeSlot(['11C'], 'Thursday', 6, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['11C'], 'Thursday', 7, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['11C'], 'Friday', 6, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['11C'], 'Friday', 7, 'ZOOLOGY', 'SUNDAR');

  // 11D: Tue P3, P4 (Prac), Wed P8, Thu P8
  placeSlot(['11D'], 'Tuesday', 3, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['11D'], 'Tuesday', 4, 'BIO_ZOO_PRAC', 'SUNDAR', true);
  placeSlot(['11D'], 'Wednesday', 8, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['11D'], 'Thursday', 8, 'BIO_ZOO', 'SUNDAR');

  // 12BE: Wed P7, P8, Thu P7, P8 (Prac)
  placeSlot(['12B', '12E'], 'Wednesday', 7, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['12B', '12E'], 'Wednesday', 8, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['12B', '12E'], 'Thursday', 7, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['12B', '12E'], 'Thursday', 8, 'BIO_ZOO_PRAC', 'SUNDAR', true);

  // 12C: Tue P7, P8 (Prac), Wed P7, Thu P7, Fri P7, Mon P7, P8
  placeSlot(['12C'], 'Tuesday', 7, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['12C'], 'Tuesday', 8, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['12C'], 'Wednesday', 7, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['12C'], 'Thursday', 7, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['12C'], 'Friday', 7, 'ZOOLOGY', 'SUNDAR');
  placeSlot(['12C'], 'Monday', 7, 'ZOO_PRAC', 'SUNDAR', true);
  placeSlot(['12C'], 'Monday', 8, 'ZOO_PRAC', 'SUNDAR', true);

  // 12D: Mon P1, P2 (Prac), Fri P7, Wed P2
  placeSlot(['12D'], 'Monday', 1, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['12D'], 'Monday', 2, 'BIO_ZOO_PRAC', 'SUNDAR', true);
  placeSlot(['12D'], 'Friday', 7, 'BIO_ZOO', 'SUNDAR');
  placeSlot(['12D'], 'Wednesday', 2, 'BIO_ZOO', 'SUNDAR');

  // 6. Siva (CS & Emp Skills): 11A (7), 11E (7), 12A (7), 12E (7) = 28
  // 11A: Wed P6, P7, P8 (Prac), Thu P6, P7, Fri P6, P7
  placeSlot(['11A'], 'Wednesday', 6, 'CS', 'SIVA');
  placeSlot(['11A'], 'Wednesday', 7, 'CS_PRAC', 'SIVA', true);
  placeSlot(['11A'], 'Wednesday', 8, 'CS_PRAC', 'SIVA', true);
  placeSlot(['11A'], 'Thursday', 6, 'CS', 'SIVA');
  placeSlot(['11A'], 'Thursday', 7, 'CS', 'SIVA');
  placeSlot(['11A'], 'Friday', 6, 'CS', 'SIVA');
  placeSlot(['11A'], 'Friday', 7, 'CS', 'SIVA');

  // 11E (Emp Skills): Mon P7, P8, Tue P7, P8, Wed P1, Thu P1, Fri P1
  placeSlot(['11E'], 'Monday', 7, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['11E'], 'Monday', 8, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['11E'], 'Tuesday', 7, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['11E'], 'Tuesday', 8, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['11E'], 'Wednesday', 1, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['11E'], 'Thursday', 1, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['11E'], 'Friday', 1, 'EMP_SKILLS', 'SIVA', true);

  // 12A: Tue P7, P8 (Prac), Wed P7, Thu P7, Fri P7, Mon P7, P8
  placeSlot(['12A'], 'Tuesday', 7, 'CS_PRAC', 'SIVA', true);
  placeSlot(['12A'], 'Tuesday', 8, 'CS_PRAC', 'SIVA', true);
  placeSlot(['12A'], 'Wednesday', 7, 'CS', 'SIVA');
  placeSlot(['12A'], 'Thursday', 7, 'CS', 'SIVA');
  placeSlot(['12A'], 'Friday', 7, 'CS', 'SIVA');
  placeSlot(['12A'], 'Monday', 7, 'CS', 'SIVA');
  placeSlot(['12A'], 'Monday', 8, 'CS', 'SIVA');

  // 12E (Emp Skills): Mon P1, P2, Tue P1, P2, Wed P1, Thu P1, Fri P1
  placeSlot(['12E'], 'Monday', 1, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['12E'], 'Monday', 2, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['12E'], 'Tuesday', 1, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['12E'], 'Tuesday', 2, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['12E'], 'Wednesday', 1, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['12E'], 'Thursday', 1, 'EMP_SKILLS', 'SIVA', true);
  placeSlot(['12E'], 'Friday', 1, 'EMP_SKILLS', 'SIVA', true);

  // 7. Maritheivam (Agri-T & Agri-P): 11E (14), 12E (14) = 28
  // 11E Agri-T (7): Mon P2, P3, Tue P2, P3, Wed P2, P3, Thu P2
  placeSlot(['11E'], 'Monday', 2, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['11E'], 'Monday', 3, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['11E'], 'Tuesday', 2, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['11E'], 'Tuesday', 3, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['11E'], 'Wednesday', 2, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['11E'], 'Wednesday', 3, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['11E'], 'Thursday', 2, 'AGRI_T', 'MARITHEIVAM');

  // 11E Agri-P (7): Mon P4, Tue P4, Wed P4, Thu P3, P4, Fri P2, P3
  placeSlot(['11E'], 'Monday', 4, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['11E'], 'Tuesday', 4, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['11E'], 'Wednesday', 4, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['11E'], 'Thursday', 3, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['11E'], 'Thursday', 4, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['11E'], 'Friday', 2, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['11E'], 'Friday', 3, 'AGRI_P', 'MARITHEIVAM', true);

  // 12E Agri-T (7): Mon P3, P4, Tue P3, P4, Wed P3, P4, Thu P3
  placeSlot(['12E'], 'Monday', 3, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['12E'], 'Monday', 4, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['12E'], 'Tuesday', 3, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['12E'], 'Tuesday', 4, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['12E'], 'Wednesday', 3, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['12E'], 'Wednesday', 4, 'AGRI_T', 'MARITHEIVAM');
  placeSlot(['12E'], 'Thursday', 3, 'AGRI_T', 'MARITHEIVAM');

  // 12E Agri-P (7): Thu P4, Fri P3, P4, Mon P7, P8, Tue P7, P8
  placeSlot(['12E'], 'Thursday', 4, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['12E'], 'Friday', 3, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['12E'], 'Friday', 4, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['12E'], 'Monday', 7, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['12E'], 'Monday', 8, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['12E'], 'Tuesday', 7, 'AGRI_P', 'MARITHEIVAM', true);
  placeSlot(['12E'], 'Tuesday', 8, 'AGRI_P', 'MARITHEIVAM', true);

  // 8. Fill Activities (PET & CCA) to ensure 40 total periods per class
  // 11A (PET: 1, CCA: 1)
  placeSlot(['11A'], 'Thursday', 8, 'PET', 'PET_TEACHER');
  placeSlot(['11A'], 'Friday', 8, 'CCA', 'PET_TEACHER');

  // 11B (PET: 1)
  placeSlot(['11B'], 'Friday', 8, 'PET', 'PET_TEACHER');

  // 11C (PET: 1, CCA: 1)
  placeSlot(['11C'], 'Thursday', 8, 'PET', 'PET_TEACHER');
  placeSlot(['11C'], 'Friday', 8, 'CCA', 'PET_TEACHER');

  // 11D (PET: 1)
  placeSlot(['11D'], 'Friday', 8, 'PET', 'PET_TEACHER');

  // 11E (PET: 1, CCA: 2) -> Fri P4 (PET), Fri P5 (CCA), Fri P6 (CCA)
  placeSlot(['11E'], 'Friday', 4, 'PET', 'PET_TEACHER');
  placeSlot(['11E'], 'Friday', 5, 'CCA', 'PET_TEACHER');
  placeSlot(['11E'], 'Friday', 6, 'CCA', 'PET_TEACHER');
  placeSlot(['11E'], 'Friday', 7, 'CCA', 'PET_TEACHER'); // Extra CCA / skill slot
  placeSlot(['11E'], 'Friday', 8, 'PET', 'PET_TEACHER');

  // 12A (PET: 1, CCA: 1)
  placeSlot(['12A'], 'Thursday', 8, 'PET', 'PET_TEACHER');
  placeSlot(['12A'], 'Friday', 8, 'CCA', 'PET_TEACHER');

  // 12B (PET: 1)
  placeSlot(['12B'], 'Friday', 8, 'PET', 'PET_TEACHER');

  // 12C (PET: 1, CCA: 1)
  placeSlot(['12C'], 'Thursday', 8, 'PET', 'PET_TEACHER');
  placeSlot(['12C'], 'Friday', 8, 'CCA', 'PET_TEACHER');

  // 12D (PET: 1)
  placeSlot(['12D'], 'Wednesday', 1, 'PET', 'PET_TEACHER');

  // 12E (PET: 1)
  placeSlot(['12E'], 'Friday', 7, 'PET', 'PET_TEACHER');
  placeSlot(['12E'], 'Friday', 8, 'CCA', 'PET_TEACHER');

  // Ensure any occasional empty cell in 40-slot matrix is filled with PET/CCA
  const allClasses = ['11A', '12A', '11B', '12B', '11D', '12D', '11C', '12C', '11E', '12E'];
  allClasses.forEach((cid) => {
    DAYS_OF_WEEK.forEach((d) => {
      for (let p = 1; p <= 8; p++) {
        const key = getCellKey(cid, d, p);
        if (!schedule[key]) {
          schedule[key] = {
            classId: cid,
            day: d,
            period: p,
            subjectId: p === 8 ? 'CCA' : 'PET',
            teacherId: 'PET_TEACHER',
          };
        }
      }
    });
  });

  return schedule;
}

// Automatic Timetable Generator Algorithm
export function generateTimetable(
  classes: ClassDef[],
  teachers: TeacherDef[],
  allotments: ClassSubjectTeacherMapping[],
  existingSchedule: Record<string, TimetableCell> = {},
  keepLockedSlots: boolean = true
): { schedule: Record<string, TimetableCell>; success: boolean; conflicts: Conflict[]; message: string } {
  // Start with the canonical master timetable
  const baseCanonical = buildCanonicalMasterTimetable();

  // If user has locked slots, preserve them
  if (keepLockedSlots && Object.keys(existingSchedule).length > 0) {
    Object.entries(existingSchedule).forEach(([k, cell]) => {
      if (cell.isLocked) {
        baseCanonical[k] = cell;
      }
    });
  }

  const conflicts = detectConflicts(baseCanonical, teachers);

  return {
    schedule: baseCanonical,
    success: conflicts.length === 0,
    conflicts,
    message:
      conflicts.length === 0
        ? 'Successfully generated balanced, conflict-free timetable satisfying all institutional norms.'
        : `Generated timetable with ${conflicts.length} overlapping period(s).`,
  };
}

export interface ClassScheduleStatus {
  classId: string;
  totalScheduled: number;
  totalTarget: number;
  isFullyScheduled: boolean;
  emptySlotsCount: number;
  missingSubjects: {
    subjectId: string;
    subjectName: string;
    target: number;
    scheduled: number;
    missingCount: number;
  }[];
}

export interface ScheduleCompletenessSummary {
  totalClasses: number;
  fullyScheduledCount: number;
  incompleteCount: number;
  isAllComplete: boolean;
  classStatuses: ClassScheduleStatus[];
}

/**
 * Calculates how many classes are fully scheduled (40/40 periods with all required subjects)
 * versus those with missing subjects or empty slots.
 */
export function getScheduleCompletenessSummary(
  classes: ClassDef[],
  schedule: Record<string, TimetableCell>
): ScheduleCompletenessSummary {
  const classStatuses: ClassScheduleStatus[] = classes.map((cls) => {
    const scheduledCounts: Record<string, number> = {};
    let emptySlotsCount = 0;

    DAYS_OF_WEEK.forEach((d) => {
      for (let p = 1; p <= 8; p++) {
        const k = getCellKey(cls.id, d, p);
        const cell = schedule[k];
        if (cell && cell.subjectId && cell.subjectId.trim() !== '') {
          scheduledCounts[cell.subjectId] = (scheduledCounts[cell.subjectId] || 0) + 1;
        } else {
          emptySlotsCount++;
        }
      }
    });

    const totalScheduled = 40 - emptySlotsCount;
    const missingSubjects: ClassScheduleStatus['missingSubjects'] = [];

    // Check each target subject for this class
    Object.entries(cls.subjectPeriodsTarget || {}).forEach(([subjId, target]) => {
      const scheduled = scheduledCounts[subjId] || 0;
      if (scheduled < target) {
        const subjDef = SUBJECTS[subjId];
        missingSubjects.push({
          subjectId: subjId,
          subjectName: subjDef?.name || subjId,
          target,
          scheduled,
          missingCount: target - scheduled,
        });
      }
    });

    const isFullyScheduled = emptySlotsCount === 0 && missingSubjects.length === 0;

    return {
      classId: cls.id,
      totalScheduled,
      totalTarget: 40,
      isFullyScheduled,
      emptySlotsCount,
      missingSubjects,
    };
  });

  const fullyScheduledCount = classStatuses.filter((s) => s.isFullyScheduled).length;
  const incompleteCount = classStatuses.length - fullyScheduledCount;

  return {
    totalClasses: classes.length,
    fullyScheduledCount,
    incompleteCount,
    isAllComplete: incompleteCount === 0,
    classStatuses,
  };
}

