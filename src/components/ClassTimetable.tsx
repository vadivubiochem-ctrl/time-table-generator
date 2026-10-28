import React, { useState } from 'react';
import {
  ClassDef,
  Conflict,
  DAYS_OF_WEEK,
  DayOfWeek,
  PeriodTiming,
  SubjectDef,
  TeacherDef,
  TimetableCell,
} from '../types';
import { PERIOD_TIMINGS } from '../data/initialData';
import { getCellKey, ScheduleCompletenessSummary } from '../utils/scheduler';
import {
  BookOpen,
  Calendar,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Layers,
} from 'lucide-react';
import {
  downloadClassTimetablePDF,
  downloadAllClassesPDFBooklet,
} from '../utils/pdfGenerator';

interface ClassTimetableProps {
  completeness?: ScheduleCompletenessSummary;
  onAutoGenerate?: () => void;
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  schedule: Record<string, TimetableCell>;
  conflicts: Conflict[];
  schoolName: string;
  academicYear: string;
  onCellClick: (cell: TimetableCell) => void;
  onPrint: () => void;
}

export const ClassTimetable: React.FC<ClassTimetableProps> = ({
  completeness,
  onAutoGenerate,
  classes,
  teachers,
  subjects,
  schedule,
  conflicts,
  schoolName,
  academicYear,
  onCellClick,
  onPrint,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('11A');
  const [formatMode, setFormatMode] = useState<'standard' | 'withTeacherCode' | 'subjectOnly'>('standard');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentClassStatus = completeness?.classStatuses.find((s) => s.classId === currentClass.id);
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Conflicts affecting this specific class
  const classConflicts = conflicts.filter((c) => c.classes.includes(currentClass.id));

  // Class navigator
  const currentIndex = classes.findIndex((c) => c.id === currentClass.id);
  const handlePrevClass = () => {
    const prevIdx = (currentIndex - 1 + classes.length) % classes.length;
    setSelectedClassId(classes[prevIdx].id);
  };
  const handleNextClass = () => {
    const nextIdx = (currentIndex + 1) % classes.length;
    setSelectedClassId(classes[nextIdx].id);
  };

  // Calculate subject counts for this class
  const scheduledCounts: Record<string, number> = {};
  DAYS_OF_WEEK.forEach((d) => {
    for (let p = 1; p <= 8; p++) {
      const k = getCellKey(currentClass.id, d, p);
      const cell = schedule[k];
      if (cell?.subjectId) {
        scheduledCounts[cell.subjectId] = (scheduledCounts[cell.subjectId] || 0) + 1;
      }
    }
  });

  const handleDownloadSinglePDF = () => {
    downloadClassTimetablePDF(currentClass, teachers, subjects, schedule, schoolName, academicYear);
  };

  const handleDownloadAllPDF = () => {
    downloadAllClassesPDFBooklet(classes, teachers, subjects, schedule, schoolName, academicYear);
  };

  return (
    <div className="space-y-5">
      {/* Schedule Completeness Summary Header Bar */}
      {completeness && (
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
          completeness.isAllComplete
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-2.5">
            {completeness.isAllComplete ? (
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>
                  {completeness.isAllComplete
                    ? 'All 10 Classes Fully Scheduled'
                    : `${completeness.incompleteCount} Class(es) With Incomplete Schedules`}
                </span>
                <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                  completeness.isAllComplete
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {completeness.fullyScheduledCount} of {completeness.totalClasses} Fully Scheduled
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {completeness.isAllComplete
                  ? 'Every class has 40/40 weekly periods allotted and satisfies 100% of subject curriculum targets.'
                  : `Classes with missing subjects or empty slots: ${completeness.classStatuses
                      .filter((s) => !s.isFullyScheduled)
                      .map((s) => s.classId)
                      .join(', ')}. Click any class below to inspect remaining requirements.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {!completeness.isAllComplete && onAutoGenerate && (
              <button
                onClick={onAutoGenerate}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                Auto-Fill Missing
              </button>
            )}
          </div>
        </div>
      )}

      {/* Class Incomplete Specific Alert (if current class is incomplete) */}
      {currentClassStatus && !currentClassStatus.isFullyScheduled && (
        <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">
                Class {currentClass.id} Has Missing Subjects:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {currentClassStatus.missingSubjects.map((m) => (
                  <span
                    key={m.subjectId}
                    className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded font-bold text-amber-900 text-[11px]"
                  >
                    {m.subjectName}: {m.scheduled}/{m.target} ({m.missingCount} missing)
                  </span>
                ))}
                {currentClassStatus.emptySlotsCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 rounded font-bold text-rose-900 text-[11px]">
                    {currentClassStatus.emptySlotsCount} Empty Period(s)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Selector and Options */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Class Selection Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handlePrevClass}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Previous Class"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {classes.map((cls) => {
            const hasClash = conflicts.some((c) => c.classes.includes(cls.id));
            const clsStatus = completeness?.classStatuses.find((s) => s.classId === cls.id);
            const isComplete = clsStatus ? clsStatus.isFullyScheduled : true;

            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative flex items-center gap-1 ${
                  selectedClassId === cls.id
                    ? hasClash
                      ? 'bg-red-700 text-white shadow-md ring-2 ring-red-400'
                      : !isComplete
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-blue-900 text-white shadow-xs'
                    : hasClash
                    ? 'bg-red-50 text-red-900 border-2 border-red-400 hover:bg-red-100 font-black'
                    : !isComplete
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={
                  clsStatus && !clsStatus.isFullyScheduled
                    ? `Class ${cls.id}: Incomplete (${clsStatus.missingSubjects.map((m) => `${m.subjectName} ${m.scheduled}/${m.target}`).join(', ')})`
                    : `Class ${cls.id}: Fully scheduled (40/40 periods)`
                }
              >
                <span>{cls.id}</span>
                <span className="text-[10px] opacity-75">
                  ({cls.medium[0]})
                </span>

                {/* Completeness / Clash indicator dot */}
                {hasClash ? (
                  <span className="w-2 h-2 rounded-full bg-red-500 ring-1 ring-white animate-ping"></span>
                ) : !isComplete ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white animate-pulse"></span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedClassId === cls.id ? 'bg-emerald-300' : 'bg-emerald-500'}`}></span>
                )}
              </button>
            );
          })}

          <button
            onClick={handleNextClass}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Next Class"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle & PDF Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-1">Display:</span>
            <button
              onClick={() => setFormatMode('standard')}
              className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                formatMode === 'standard' ? 'bg-white text-blue-950 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Teacher Name
            </button>
            <button
              onClick={() => setFormatMode('withTeacherCode')}
              className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                formatMode === 'withTeacherCode'
                  ? 'bg-white text-blue-950 shadow-2xs font-bold'
                  : 'text-slate-600'
              }`}
            >
              Code (T-1)
            </button>
            <button
              onClick={() => setFormatMode('subjectOnly')}
              className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                formatMode === 'subjectOnly'
                  ? 'bg-white text-blue-950 shadow-2xs font-bold'
                  : 'text-slate-600'
              }`}
            >
              Subject Only
            </button>
          </div>

          {/* Download Class PDF */}
          <button
            onClick={handleDownloadSinglePDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Download PDF for this class"
          >
            <FileDown className="w-3.5 h-3.5 text-red-200" />
            <span>Download PDF</span>
          </button>

          {/* Download All 10 Classes PDF */}
          <button
            onClick={handleDownloadAllPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Download all 10 classes in one PDF booklet"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">All 10 Classes Booklet</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            title="Print view"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Class Specific Conflict Warning Banner */}
      {classConflicts.length > 0 && (
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm text-red-900">
                ⚠️ Teacher Double-Booking in Class {currentClass.id}! ({classConflicts.length} Conflicting Periods)
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                The periods highlighted in red below have teachers assigned simultaneously to another class. Click the red slots to reassign or swap periods.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs self-start sm:self-center shrink-0">
            Action Required
          </span>
        </div>
      )}

      {/* Class Printable Timetable Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Official Header Banner matching GHSS style */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white text-center py-4 px-6 border-b-2 border-blue-800">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">{schoolName}</h2>
          <p className="text-xs sm:text-sm text-blue-200 font-semibold mt-0.5">
            ACADEMIC PERIOD ALLOTMENT SYSTEM • AY {academicYear}
          </p>
          <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs">
            <span className="font-extrabold text-amber-300">
              CLASS {currentClass.id} ({currentClass.standard}th Standard)
            </span>
            <span>•</span>
            <span>Group {currentClass.groupCode}</span>
            <span>•</span>
            <span>{currentClass.medium} Medium</span>
            <span>•</span>
            <span className="text-blue-100 truncate max-w-xs">{currentClass.groupName}</span>
          </div>
        </div>

        {/* Timetable Grid with Breaks */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-center border-collapse border border-slate-300 text-xs">
            <thead>
              {/* Timing row */}
              <tr className="bg-blue-900 text-white text-[11px] font-bold">
                <th className="py-2.5 px-3 border border-slate-300 w-28 bg-blue-950">
                  Day \ Period
                </th>
                {PERIOD_TIMINGS.map((timing) => (
                  <th key={timing.periodNumber} className="py-2 px-2 border border-slate-300">
                    <div className="text-xs font-extrabold">{timing.label}</div>
                    <div className="text-[10px] text-blue-200 font-normal">
                      {timing.startTime} - {timing.endTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day} className="hover:bg-slate-50">
                  {/* Day Label */}
                  <td className="py-3 px-3 font-extrabold text-slate-900 bg-slate-100 border border-slate-300 text-left">
                    {day}
                  </td>

                  {/* 8 Periods */}
                  {PERIOD_TIMINGS.map((timing) => {
                    const pNum = timing.periodNumber;
                    const cellKey = getCellKey(currentClass.id, day, pNum);
                    const cell = schedule[cellKey] || {
                      classId: currentClass.id,
                      day,
                      period: pNum,
                      subjectId: '',
                      teacherId: '',
                    };

                    const subject = subjects[cell.subjectId];
                    const teacher = teacherMap.get(cell.teacherId);

                    // Check if this cell is part of any conflict
                    const cellConflict = conflicts.find(
                      (c) =>
                        c.day === day &&
                        c.period === pNum &&
                        c.classes.includes(currentClass.id)
                    );
                    const otherClasses = cellConflict
                      ? cellConflict.classes.filter((c) => c !== currentClass.id)
                      : [];

                    return (
                      <td
                        key={pNum}
                        onClick={() => onCellClick(cell)}
                        title={
                          cellConflict
                            ? `CONFLICT: ${cellConflict.teacherName} is also teaching in Class ${otherClasses.join(
                                ', '
                              )} at this time!`
                            : undefined
                        }
                        className={`p-1.5 border border-slate-300 cursor-pointer transition-all ${
                          cellConflict
                            ? 'bg-red-200/95 ring-2 ring-red-500'
                            : subject?.isPractical
                            ? 'bg-purple-50/30 hover:bg-purple-100/50'
                            : 'hover:bg-blue-50/80'
                        }`}
                      >
                        {cell.subjectId ? (
                          <div
                            className={`p-2 rounded-lg border flex flex-col items-center justify-center min-h-[64px] transition-all ${
                              cellConflict
                                ? 'border-2 border-red-600 bg-red-100 text-red-950 font-black shadow-md ring-2 ring-red-400 animate-pulse'
                                : subject?.badgeBg || 'bg-slate-100 border-slate-200'
                            }`}
                          >
                            {cellConflict && (
                              <div className="flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.2 rounded text-[9px] font-black uppercase mb-1 shadow-xs">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>CLASH WITH {otherClasses.join(', ')}</span>
                              </div>
                            )}

                            <span
                              className={`font-extrabold text-xs ${
                                cellConflict ? 'text-red-950 font-black' : 'text-slate-900'
                              }`}
                            >
                              {subject?.name || cell.subjectId}
                            </span>

                            {formatMode !== 'subjectOnly' && (
                              <span
                                className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded shadow-2xs ${
                                  cellConflict
                                    ? 'bg-red-200 text-red-950 font-black'
                                    : 'bg-white/80 text-blue-900'
                                }`}
                              >
                                {formatMode === 'withTeacherCode'
                                  ? `${teacher?.code || 'T'} ${cell.teacherId}`
                                  : cell.teacherId}
                              </span>
                            )}

                            {cellConflict && otherClasses.length > 0 && (
                              <span className="text-[9px] text-red-800 font-extrabold mt-0.5">
                                (Busy in Class {otherClasses.join(', ')})
                              </span>
                            )}

                            {!cellConflict && cell.combinedWith && cell.combinedWith.length > 1 && (
                              <span className="text-[9px] font-bold text-blue-800 bg-blue-100/90 px-1.5 py-0.5 rounded mt-0.5">
                                Combined: {cell.combinedWith.join('+')}
                              </span>
                            )}

                            {!cellConflict && subject?.isPractical && (
                              <span className="text-[9px] font-bold text-purple-700 uppercase mt-0.5">
                                Practical Lab
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="min-h-[64px] flex items-center justify-center text-slate-400 italic text-[11px]">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tamil Nadu Period Timings & Break Interval Footer Strip */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              School Hours: 09:30 AM – 04:10 PM
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              Intervals: 11:00-11:10 (Morning) | 12:40-01:20 (Lunch) | 02:40-02:50 (Afternoon)
            </span>
          </div>

          <div className="font-bold text-blue-950">
            Total Weekly Periods: 40 / 40 Allotted
          </div>
        </div>
      </div>

      {/* Class Subject Periods Allocation Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Weekly Subject Allotment for Class {currentClass.id}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(currentClass.subjectPeriodsTarget).map(([subjId, target]) => {
            const subj = subjects[subjId];
            const current = scheduledCounts[subjId] || 0;
            const diff = current - target;
            const isMatch = diff === 0;

            return (
              <div
                key={subjId}
                className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                  isMatch
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-amber-200 bg-amber-50/50'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 block truncate">
                    {subj?.name || subjId}
                  </span>
                  <span className="text-[10px] text-slate-500">{subj?.category}</span>
                </div>
                <div className="mt-2 flex items-center justify-between font-bold">
                  <span className="text-slate-600">
                    {current} / {target}
                  </span>
                  {isMatch ? (
                    <span className="text-emerald-700 text-[11px] font-bold">✓ 0 Diff</span>
                  ) : (
                    <span className="text-amber-700 text-[11px] font-bold">
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
