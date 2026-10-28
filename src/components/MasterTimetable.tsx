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
import { getCellKey } from '../utils/scheduler';
import {
  Filter,
  Lock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Info,
  Download,
  FileDown,
} from 'lucide-react';
import { downloadMasterTimetablePDF } from '../utils/pdfGenerator';

interface MasterTimetableProps {
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  schedule: Record<string, TimetableCell>;
  conflicts: Conflict[];
  schoolName: string;
  academicYear: string;
  onCellClick: (cell: TimetableCell) => void;
  onAutoGenerate: () => void;
}

export const MasterTimetable: React.FC<MasterTimetableProps> = ({
  classes,
  teachers,
  subjects,
  schedule,
  conflicts,
  schoolName,
  academicYear,
  onCellClick,
  onAutoGenerate,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'ALL'>('Monday');
  const [standardFilter, setStandardFilter] = useState<'ALL' | '11' | '12'>('ALL');
  const [displayMode, setDisplayMode] = useState<'both' | 'subject' | 'teacher'>('both');

  // Filter classes based on standard
  const filteredClasses = classes.filter((cls) => {
    if (standardFilter === 'ALL') return true;
    return cls.standard === standardFilter;
  });

  // Helper to find conflict for a specific cell
  const getCellConflict = (classId: string, day: DayOfWeek, period: number): Conflict | undefined => {
    return conflicts.find(
      (c) => c.day === day && c.period === period && c.classes.includes(classId)
    );
  };

  const daysToRender: DayOfWeek[] = selectedDay === 'ALL' ? DAYS_OF_WEEK : [selectedDay];

  const handleDownloadPDF = () => {
    downloadMasterTimetablePDF(classes, teachers, subjects, schedule, schoolName, academicYear);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Day selector tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDay === 'ALL'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All 5 Days
          </button>
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDay === day
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Filters and View Options */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Class Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[11px] font-bold text-slate-500 px-1 uppercase">Classes:</span>
            {(['ALL', '11', '12'] as const).map((std) => (
              <button
                key={std}
                onClick={() => setStandardFilter(std)}
                className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                  standardFilter === std
                    ? 'bg-white text-blue-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {std === 'ALL' ? 'All 10' : `${std}th Std`}
              </button>
            ))}
          </div>

          {/* Display Mode */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[11px] font-bold text-slate-500 px-1 uppercase">View:</span>
            <button
              onClick={() => setDisplayMode('both')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                displayMode === 'both' ? 'bg-white text-blue-950 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Subj + Teacher
            </button>
            <button
              onClick={() => setDisplayMode('subject')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                displayMode === 'subject' ? 'bg-white text-blue-950 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Subject Only
            </button>
            <button
              onClick={() => setDisplayMode('teacher')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                displayMode === 'teacher' ? 'bg-white text-blue-950 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Teacher Only
            </button>
          </div>

          {/* Download Master PDF */}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Download Master Timetable as PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-red-200" />
            <span>Download Master PDF</span>
          </button>
        </div>
      </div>

      {/* Guide notice & Conflict Alert */}
      {conflicts.length > 0 ? (
        <div className="px-4 py-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <strong className="text-red-900 block text-sm">
                ⚠️ {conflicts.length} Period Overlap(s) Detected! (Highlighted in Bright Red Below)
              </strong>
              <span className="text-red-800">
                A teacher cannot take two classes at the same time. Click on any red cell to swap or change teachers.
              </span>
            </div>
          </div>
          <button
            onClick={onAutoGenerate}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs shrink-0 cursor-pointer"
          >
            Auto-Fix Conflicts
          </button>
        </div>
      ) : (
        <div className="px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Manual & Auto Mode:</strong> Click any cell to customize, re-assign, lock, or swap periods.
              Conflicting double-booked periods will immediately pulse in bright red.
            </span>
          </div>
          <button
            onClick={onAutoGenerate}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Re-balance Timetable
          </button>
        </div>
      )}

      {/* Timetable Table per Day */}
      <div className="space-y-6">
        {daysToRender.map((day) => (
          <div
            key={day}
            className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden"
          >
            {/* Day Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <h3 className="font-bold text-sm tracking-wide uppercase">{day} Master Schedule</h3>
                <span className="text-xs text-blue-200">
                  (8 Periods • 09:30 AM to 04:10 PM)
                </span>
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {filteredClasses.length} Classes Shown
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[980px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3 border-r border-slate-300 w-32 bg-slate-200/70 text-slate-900">
                      Class / Section
                    </th>
                    {PERIOD_TIMINGS.map((p) => (
                      <th
                        key={p.periodNumber}
                        className="py-2 px-2 text-center border-r border-slate-300 last:border-r-0"
                      >
                        <div className="font-extrabold text-blue-950">Period {p.periodNumber}</div>
                        <div className="text-[10px] font-medium text-slate-500">
                          {p.startTime} - {p.endTime}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Class Info Cell */}
                      <td className="py-2 px-3 border-r border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-black bg-blue-900 text-white">
                            {cls.id}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700">
                            Grp {cls.groupCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate max-w-[120px]">
                          {cls.medium} Medium
                        </div>
                      </td>

                      {/* 8 Periods */}
                      {PERIOD_TIMINGS.map((timing) => {
                        const pNum = timing.periodNumber;
                        const cellKey = getCellKey(cls.id, day, pNum);
                        const cell = schedule[cellKey] || {
                          classId: cls.id,
                          day,
                          period: pNum,
                          subjectId: '',
                          teacherId: '',
                        };

                        const subject = subjects[cell.subjectId];
                        const cellConflict = getCellConflict(cls.id, day, pNum);
                        const otherClasses = cellConflict
                          ? cellConflict.classes.filter((c) => c !== cls.id)
                          : [];

                        return (
                          <td
                            key={pNum}
                            onClick={() => onCellClick(cell)}
                            title={
                              cellConflict
                                ? `CLASH: ${cellConflict.teacherName} is also teaching in Class ${otherClasses.join(
                                    ', '
                                  )} at this period!`
                                : undefined
                            }
                            className={`p-1.5 border-r border-slate-200 last:border-r-0 text-center cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:z-10 relative ${
                              cellConflict
                                ? 'bg-red-200/90 ring-2 ring-red-600 font-bold'
                                : cell.subjectId
                                ? 'bg-white'
                                : 'bg-slate-50/50'
                            }`}
                          >
                            {cell.subjectId ? (
                              <div
                                className={`rounded-md p-1.5 border text-center flex flex-col items-center justify-center min-h-[58px] transition-all ${
                                  cellConflict
                                    ? 'border-2 border-red-600 bg-red-100 text-red-950 shadow-md ring-2 ring-red-400 font-black animate-pulse'
                                    : subject?.badgeBg || 'bg-slate-100 border-slate-200 text-slate-800'
                                }`}
                              >
                                {cell.isLocked && (
                                  <Lock className="w-2.5 h-2.5 text-amber-600 absolute top-1 right-1" />
                                )}

                                {cellConflict && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-tighter mb-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    CLASH!
                                  </span>
                                )}

                                {/* Subject */}
                                {displayMode !== 'teacher' && (
                                  <span
                                    className={`font-bold text-[11px] leading-tight block truncate max-w-[95px] ${
                                      cellConflict ? 'text-red-950 font-black' : ''
                                    }`}
                                  >
                                    {subject?.shortName || cell.subjectId}
                                  </span>
                                )}

                                {/* Teacher */}
                                {displayMode !== 'subject' && (
                                  <span
                                    className={`text-[10px] font-semibold mt-0.5 truncate max-w-[95px] px-1 rounded ${
                                      cellConflict
                                        ? 'bg-red-200 text-red-950 font-black'
                                        : cell.teacherId === 'MARITHEIVAM'
                                        ? 'bg-amber-200/80 text-amber-950 font-bold'
                                        : cell.teacherId === 'PET_TEACHER'
                                        ? 'text-slate-600'
                                        : 'text-blue-900'
                                    }`}
                                  >
                                    {cell.teacherId || 'Unassigned'}
                                  </span>
                                )}

                                {cellConflict && otherClasses.length > 0 && (
                                  <span className="text-[9px] text-red-800 font-bold mt-0.5 block truncate max-w-[95px]">
                                    (Also in {otherClasses.join(',')})
                                  </span>
                                )}

                                {!cellConflict && cell.combinedWith && cell.combinedWith.length > 1 && (
                                  <span className="text-[9px] text-blue-800 bg-blue-100/90 px-1 py-0.5 rounded font-bold tracking-tight mt-0.5 max-w-[95px] truncate">
                                    Comb {cell.combinedWith.join('+')}
                                  </span>
                                )}

                                {!cellConflict && subject?.isPractical && (
                                  <span className="text-[9px] text-purple-700 font-bold uppercase tracking-tighter">
                                    [LAB]
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="min-h-[58px] flex items-center justify-center text-slate-400 text-[11px] italic hover:text-blue-600">
                                + Empty
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
          </div>
        ))}
      </div>
    </div>
  );
};
