import React, { useState } from 'react';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  TeacherDef,
  TimetableCell,
} from '../types';
import { PERIOD_TIMINGS } from '../data/initialData';
import {
  findAvailableSubstitutes,
  getCellKey,
  getTeachersFreePeriods,
} from '../utils/scheduler';
import {
  Calendar,
  Clock,
  Printer,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileDown,
} from 'lucide-react';
import { downloadFreePeriodSchedulePDF } from '../utils/pdfGenerator';

interface FreePeriodsViewProps {
  teachers: TeacherDef[];
  schedule: Record<string, TimetableCell>;
  schoolName: string;
  academicYear: string;
  onPrint: () => void;
  onAssignSubstitute: (
    classId: string,
    day: DayOfWeek,
    period: number,
    substituteTeacherId: string
  ) => void;
}

export const FreePeriodsView: React.FC<FreePeriodsViewProps> = ({
  teachers,
  schedule,
  schoolName,
  academicYear,
  onPrint,
  onAssignSubstitute,
}) => {
  const freeSchedule = getTeachersFreePeriods(schedule, teachers);

  // Substitution assistant state
  const [subDay, setSubDay] = useState<DayOfWeek>('Monday');
  const [subPeriod, setSubPeriod] = useState<number>(3);
  const [absentTeacherId, setAbsentTeacherId] = useState<string>(
    teachers[0]?.id || 'SUBBULAKSHMI'
  );
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  const [substitutionSuccess, setSubstitutionSuccess] = useState<string | null>(null);

  // Available free teachers for this slot
  const availableSubstitutes = findAvailableSubstitutes(
    schedule,
    teachers,
    subDay,
    subPeriod,
    absentTeacherId
  );

  // What is the absent teacher doing at this slot?
  const absentTeacherSlots = Object.values(schedule).filter(
    (c) =>
      c.day === subDay &&
      c.period === subPeriod &&
      c.teacherId === absentTeacherId
  );

  const handleApplySubstitute = () => {
    if (!selectedSubstituteId) return;
    const targetClass = targetClassId || (absentTeacherSlots[0]?.classId ?? '');
    if (!targetClass) return;

    onAssignSubstitute(targetClass, subDay, subPeriod, selectedSubstituteId);
    setSubstitutionSuccess(
      `Assigned ${selectedSubstituteId} as substitute for Class ${targetClass} on ${subDay} Period ${subPeriod}!`
    );
    setTimeout(() => setSubstitutionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Substitution Assistant Box */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-blue-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Smart Teacher Substitution Assistant</span>
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              If a PG or Vocational teacher is on leave, instantly identify which teachers have a free period and assign substitution duty.
            </p>
          </div>
          <span className="text-xs bg-blue-500/30 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full font-medium self-start sm:self-center">
            Live Free Slot Matching
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Select Day
            </label>
            <select
              value={subDay}
              onChange={(e) => setSubDay(e.target.value as DayOfWeek)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/90 text-white border border-blue-400/40 font-medium"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Select Period
            </label>
            <select
              value={subPeriod}
              onChange={(e) => setSubPeriod(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/90 text-white border border-blue-400/40 font-medium"
            >
              {PERIOD_TIMINGS.map((p) => (
                <option key={p.periodNumber} value={p.periodNumber}>
                  Period {p.periodNumber} ({p.startTime} - {p.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Absent Teacher
            </label>
            <select
              value={absentTeacherId}
              onChange={(e) => setAbsentTeacherId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/90 text-white border border-blue-400/40 font-medium"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-200 uppercase mb-1">
              Class in Need
            </label>
            <select
              value={targetClassId || (absentTeacherSlots[0]?.classId ?? '')}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/90 text-white border border-blue-400/40 font-medium"
            >
              {absentTeacherSlots.length > 0 ? (
                absentTeacherSlots.map((s) => (
                  <option key={s.classId} value={s.classId}>
                    Class {s.classId} (Scheduled: {s.subjectId})
                  </option>
                ))
              ) : (
                <option value="">Teacher has no class this period</option>
              )}
            </select>
          </div>
        </div>

        {/* Results Strip */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-blue-200">
              Available Free Teachers during <strong>{subDay} Period {subPeriod}</strong>:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {availableSubstitutes.length > 0 ? (
                availableSubstitutes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedSubstituteId(t.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      selectedSubstituteId === t.id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-white'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    ✓ {t.name} ({t.specialization})
                  </button>
                ))
              ) : (
                <span className="text-rose-300 italic">No free teachers in this period!</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplySubstitute}
              disabled={!selectedSubstituteId || absentTeacherSlots.length === 0}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              Confirm Substitution
            </button>
          </div>
        </div>

        {substitutionSuccess && (
          <div className="mt-2 p-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{substitutionSuccess}</span>
          </div>
        )}
      </div>

      {/* Teachers Free Period Schedule Table (PDF Page 42) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-blue-800">
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">
              TEACHERS' FREE PERIOD SCHEDULE
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              {schoolName} • Master Free Period Registry (Class 11 & 12 Periods)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() =>
                downloadFreePeriodSchedulePDF(teachers, schedule, schoolName, academicYear)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Download Free Period Schedule as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-red-200" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Chart</span>
            </button>
          </div>
        </div>

        {/* Table matching PDF page 42 layout */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-blue-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 border border-slate-300 w-20 text-center bg-blue-950">
                  Code
                </th>
                <th className="py-2.5 px-3 border border-slate-300 w-44 bg-blue-950">
                  Teacher's Name
                </th>
                <th className="py-2.5 px-3 border border-slate-300 w-36">
                  Designation / Subject
                </th>
                {DAYS_OF_WEEK.map((d) => (
                  <th key={d} className="py-2.5 px-3 border border-slate-300 text-center font-bold">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teachers.map((teacher, index) => {
                const isVoc = teacher.id === 'MARITHEIVAM';
                const freeDays = freeSchedule[teacher.id] || {
                  Monday: [],
                  Tuesday: [],
                  Wednesday: [],
                  Thursday: [],
                  Friday: [],
                };

                return (
                  <tr
                    key={teacher.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    } ${isVoc ? 'bg-amber-50/30' : ''}`}
                  >
                    <td className="py-2.5 px-3 border border-slate-300 font-extrabold text-blue-900 text-center">
                      {teacher.code}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{teacher.name}</span>
                        {isVoc && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                            Vocational
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-slate-600 font-medium">
                      {teacher.specialization}
                    </td>

                    {/* Mon to Fri Free Periods */}
                    {DAYS_OF_WEEK.map((day) => {
                      const periods = freeDays[day] || [];
                      return (
                        <td
                          key={day}
                          className="py-2.5 px-3 border border-slate-300 text-center font-mono text-xs"
                        >
                          {periods.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {periods.map((p) => (
                                <span
                                  key={p}
                                  className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300"
                                  title={`Free in Period ${p}`}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No Free Slots</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
