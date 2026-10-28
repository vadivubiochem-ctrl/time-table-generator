import React, { useState } from 'react';
import {
  ClassDef,
  DAYS_OF_WEEK,
  DayOfWeek,
  SubjectDef,
  TeacherDef,
  TimetableCell,
} from '../types';
import { calculateTeacherLoads, getCellKey } from '../utils/scheduler';
import {
  Table,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface PeriodAllotmentMatrixProps {
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  schedule: Record<string, TimetableCell>;
  schoolName: string;
  academicYear: string;
  onPrint: () => void;
}

export const PeriodAllotmentMatrix: React.FC<PeriodAllotmentMatrixProps> = ({
  classes,
  teachers,
  subjects,
  schedule,
  schoolName,
  academicYear,
  onPrint,
}) => {
  const [subTab, setSubTab] = useState<'classAllotment' | 'teacherLoad'>('classAllotment');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  const teacherLoads = calculateTeacherLoads(schedule, teachers);

  const classesToDisplay =
    selectedClassId === 'ALL'
      ? classes
      : classes.filter((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Sub tabs and actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('classAllotment')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'classAllotment'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Class-wise Subject Period Allotment (PDF Pg 1-9)
          </button>
          <button
            onClick={() => setSubTab('teacherLoad')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'teacherLoad'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Teacher-wise Period Load (PDF Pg 13-15)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'classAllotment' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800"
            >
              <option value="ALL">All 10 Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Class {cls.id} ({cls.medium})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Allotment
          </button>
        </div>
      </div>

      {subTab === 'classAllotment' ? (
        /* Classwise Subject Wise Period Allotment Tables */
        <div className="space-y-6">
          {classesToDisplay.map((cls, classIndex) => {
            // Count periods per day for each subject
            const subjectDayCounts: Record<string, Record<DayOfWeek, number>> = {};
            const subjectTotalCounts: Record<string, number> = {};

            cls.subjectIds.forEach((sid) => {
              subjectDayCounts[sid] = {
                Monday: 0,
                Tuesday: 0,
                Wednesday: 0,
                Thursday: 0,
                Friday: 0,
              };
              subjectTotalCounts[sid] = 0;
            });

            DAYS_OF_WEEK.forEach((d) => {
              for (let p = 1; p <= 8; p++) {
                const k = getCellKey(cls.id, d, p);
                const cell = schedule[k];
                if (cell?.subjectId && subjectDayCounts[cell.subjectId]) {
                  subjectDayCounts[cell.subjectId][d]++;
                  subjectTotalCounts[cell.subjectId]++;
                }
              }
            });

            // Calculate totals
            let grandTarget = 0;
            let grandActual = 0;
            const dayTotals: Record<DayOfWeek, number> = {
              Monday: 0,
              Tuesday: 0,
              Wednesday: 0,
              Thursday: 0,
              Friday: 0,
            };

            Object.entries(cls.subjectPeriodsTarget).forEach(([sid, target]) => {
              grandTarget += target;
              grandActual += subjectTotalCounts[sid] || 0;
              DAYS_OF_WEEK.forEach((d) => {
                dayTotals[d] += subjectDayCounts[sid]?.[d] || 0;
              });
            });

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden"
              >
                {/* Header matching PDF page 1 */}
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white py-3 px-5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-blue-800">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase block">
                      CLASS WISE SUBJECT WISE PERIOD ALLOTMENT
                    </span>
                    <h3 className="text-base sm:text-lg font-black uppercase">
                      Class {classIndex + 1} : {cls.name} ({cls.id})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      Group {cls.groupCode} • {cls.medium} Medium
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Target: 40 Periods/Wk
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto p-4">
                  <table className="w-full text-center border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-blue-900 text-white text-[11px] font-bold">
                        <th className="py-2.5 px-3 border border-slate-300 text-left w-48 bg-blue-950">
                          Subject
                        </th>
                        <th className="py-2 px-2 border border-slate-300 w-24 bg-blue-950">
                          Periods Assigned per Week
                        </th>
                        {DAYS_OF_WEEK.map((d) => (
                          <th key={d} className="py-2 px-2 border border-slate-300 w-20">
                            {d}
                          </th>
                        ))}
                        <th className="py-2 px-2 border border-slate-300 w-20 bg-blue-950 font-extrabold">
                          Total
                        </th>
                        <th className="py-2 px-2 border border-slate-300 w-24 bg-blue-950 font-extrabold">
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {cls.subjectIds.map((sid) => {
                        const subj = subjects[sid];
                        const target = cls.subjectPeriodsTarget[sid] || 0;
                        const actual = subjectTotalCounts[sid] || 0;
                        const diff = actual - target;

                        return (
                          <tr key={sid} className="hover:bg-slate-50">
                            <td className="py-2 px-3 border border-slate-300 text-left font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{subj?.name || sid}</span>
                                {subj?.isPractical && (
                                  <span className="text-[9px] px-1 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">
                                    LAB
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-2 border border-slate-300 font-extrabold text-blue-950 bg-blue-50/40">
                              {target}
                            </td>
                            {DAYS_OF_WEEK.map((d) => {
                              const count = subjectDayCounts[sid]?.[d] || 0;
                              return (
                                <td
                                  key={d}
                                  className={`py-2 px-2 border border-slate-300 font-semibold ${
                                    count > 0 ? 'text-slate-900 font-bold' : 'text-slate-300'
                                  }`}
                                >
                                  {count}
                                </td>
                              );
                            })}
                            <td className="py-2 px-2 border border-slate-300 font-black text-blue-950 bg-slate-100">
                              {actual}
                            </td>
                            <td
                              className={`py-2 px-2 border border-slate-300 font-bold ${
                                diff === 0
                                  ? 'text-emerald-700 bg-emerald-50/60 font-black'
                                  : diff > 0
                                  ? 'text-amber-700 bg-amber-50 font-black'
                                  : 'text-rose-700 bg-rose-50 font-black'
                              }`}
                            >
                              {diff === 0 ? '0' : diff > 0 ? `+${diff}` : diff}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Total row */}
                      <tr className="bg-blue-950 text-white font-extrabold text-xs">
                        <td className="py-2.5 px-3 border border-slate-400 text-left">
                          Total Weekly Periods
                        </td>
                        <td className="py-2.5 px-2 border border-slate-400 text-amber-300 font-black text-sm">
                          {grandTarget}
                        </td>
                        {DAYS_OF_WEEK.map((d) => (
                          <td key={d} className="py-2.5 px-2 border border-slate-400">
                            {dayTotals[d]}
                          </td>
                        ))}
                        <td className="py-2.5 px-2 border border-slate-400 text-amber-300 font-black text-sm">
                          {grandActual}
                        </td>
                        <td
                          className={`py-2.5 px-2 border border-slate-400 font-black ${
                            grandActual - grandTarget === 0
                              ? 'text-emerald-300'
                              : 'text-rose-300'
                          }`}
                        >
                          {grandActual - grandTarget === 0 ? '0 (Balanced)' : `${grandActual - grandTarget}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Teacher-wise Period Load Summary (PDF Page 13-15) */
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white py-4 px-6 border-b-2 border-blue-800">
            <h3 className="text-lg font-black uppercase tracking-wider">
              TEACHER WISE PERIOD ALLOTMENT AND TEACHER'S PERIOD LOAD
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Weekly teaching hours per teacher across 11th and 12th standard classes
            </p>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherLoads.map((load) => {
              const teacher = teachers.find((t) => t.id === load.teacherId);
              const isVoc = teacher?.id === 'MARITHEIVAM';

              return (
                <div
                  key={load.teacherId}
                  className={`rounded-xl border-2 p-4 flex flex-col justify-between ${
                    isVoc
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-300 bg-white shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-black bg-blue-900 text-white">
                            {teacher?.code}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900">{load.teacherName}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {teacher?.designation} • {teacher?.specialization}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          Load / Wk
                        </span>
                        <span className="text-xl font-black text-blue-950">
                          {load.totalPeriods}
                        </span>
                      </div>
                    </div>

                    {/* Classes Handled Table */}
                    <table className="w-full text-xs text-left mb-3">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
                          <th className="py-1">Class & Subject</th>
                          <th className="py-1 text-right">Periods</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {load.classesHandled.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1 text-slate-700 font-medium truncate max-w-[170px]">
                              <strong className="text-blue-900 mr-1">Class {item.classId}</strong>
                              {item.subjectName}
                            </td>
                            <td className="py-1 text-right font-extrabold text-slate-900">
                              {item.periods}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Day-by-Day Load Footer */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg">
                    <span className="font-bold text-slate-600">Daily:</span>
                    {DAYS_OF_WEEK.map((d) => (
                      <span key={d} className="font-semibold text-slate-800">
                        <span className="text-[10px] text-slate-400 block text-center">
                          {d.slice(0, 3)}
                        </span>
                        <strong className="block text-center">{load.dayLoad[d]}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
