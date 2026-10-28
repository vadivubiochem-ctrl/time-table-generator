import React, { useState } from 'react';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  PeriodTiming,
  SubjectDef,
  TeacherDef,
  TimetableCell,
} from '../types';
import { PERIOD_TIMINGS } from '../data/initialData';
import { calculateTeacherLoads } from '../utils/scheduler';
import {
  User,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  Calendar,
  FileDown,
} from 'lucide-react';
import { downloadTeacherTimetablePDF } from '../utils/pdfGenerator';

interface TeacherTimetableProps {
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  schedule: Record<string, TimetableCell>;
  schoolName: string;
  academicYear: string;
  onPrint: () => void;
}

export const TeacherTimetable: React.FC<TeacherTimetableProps> = ({
  teachers,
  subjects,
  schedule,
  schoolName,
  academicYear,
  onPrint,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || 'SUBBULAKSHMI'
  );

  const currentTeacher =
    teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  const teacherLoads = calculateTeacherLoads(schedule, teachers);
  const currentLoad = teacherLoads.find((l) => l.teacherId === currentTeacher.id);

  // Navigator
  const currentIndex = teachers.findIndex((t) => t.id === currentTeacher.id);
  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + teachers.length) % teachers.length;
    setSelectedTeacherId(teachers[prevIdx].id);
  };
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % teachers.length;
    setSelectedTeacherId(teachers[nextIdx].id);
  };

  // Find cells for this teacher: map (day, period) -> cell
  const teacherCellsMap = new Map<string, TimetableCell>();
  Object.values(schedule).forEach((cell) => {
    if (cell.teacherId === currentTeacher.id) {
      teacherCellsMap.set(`${cell.day}_${cell.period}`, cell);
    }
  });

  return (
    <div className="space-y-5">
      {/* Teacher Selector Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Previous Teacher"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {teachers.map((t) => {
            const isAgri = t.id === 'MARITHEIVAM';
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeacherId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTeacherId === t.id
                    ? isAgri
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-blue-900 text-white shadow-xs'
                    : isAgri
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[10px] font-normal opacity-75">({t.code})</span>
              </button>
            );
          })}

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Next Teacher"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              downloadTeacherTimetablePDF(
                currentTeacher,
                subjects,
                schedule,
                schoolName,
                academicYear
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Download this teacher's timetable as PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-red-200" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Teacher Timetable Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white py-4 px-6 border-b-2 border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-black text-xs bg-amber-400 text-slate-900">
                  {currentTeacher.code}
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                  {currentTeacher.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {currentTeacher.designation}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-blue-200">
                <span>
                  Specialization: <strong>{currentTeacher.specialization}</strong>
                </span>
                {currentTeacher.assignedClasses && currentTeacher.assignedClasses.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <span>Classes Handled ({currentTeacher.assignedClasses.length}):</span>
                      <span className="inline-flex flex-wrap gap-1">
                        {currentTeacher.assignedClasses.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[11px] font-bold"
                          >
                            {c}
                          </span>
                        ))}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Weekly Load Counter Badge */}
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20 text-right">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold block">
                Weekly Teaching Load
              </span>
              <span className="text-2xl font-black text-amber-300">
                {currentLoad?.totalPeriods || 0}{' '}
                <span className="text-xs font-normal text-slate-300">periods / wk</span>
              </span>
            </div>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-center border-collapse border border-slate-300 text-xs">
            <thead>
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
                <th className="py-2 px-2 border border-slate-300 bg-blue-950 w-24">
                  Day Load
                </th>
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => {
                const dayLoad = currentLoad?.dayLoad[day] || 0;

                return (
                  <tr key={day} className="hover:bg-slate-50">
                    {/* Day label */}
                    <td className="py-3 px-3 font-extrabold text-slate-900 bg-slate-100 border border-slate-300 text-left">
                      {day}
                    </td>

                    {/* 8 Periods */}
                    {PERIOD_TIMINGS.map((timing) => {
                      const pNum = timing.periodNumber;
                      const cell = teacherCellsMap.get(`${day}_${pNum}`);
                      const subject = cell ? subjects[cell.subjectId] : null;

                      return (
                        <td
                          key={pNum}
                          className={`p-1.5 border border-slate-300 ${
                            cell ? 'bg-blue-50/40' : 'bg-slate-50/20'
                          }`}
                        >
                          {cell ? (
                            <div
                              className={`p-2 rounded-lg border flex flex-col items-center justify-center min-h-[64px] ${
                                subject?.badgeBg || 'bg-blue-100 border-blue-200 text-blue-900'
                              }`}
                            >
                              <span className="font-black text-sm text-blue-950 px-2 py-0.5 rounded bg-white/90 shadow-2xs border border-blue-200">
                                {cell.classId}
                              </span>
                              <span className="text-[11px] font-bold mt-1 text-slate-900 block truncate max-w-[105px]">
                                {subject?.shortName || cell.subjectId}
                              </span>
                              {subject?.isPractical && (
                                <span className="text-[9px] text-purple-700 font-bold uppercase">
                                  [Lab]
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="min-h-[64px] flex flex-col items-center justify-center text-slate-400">
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Free
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Day Load Count */}
                    <td className="py-2 px-2 border border-slate-300 font-extrabold text-blue-950 bg-slate-50">
                      <span className="text-sm font-black">{dayLoad}</span>
                      <span className="text-[10px] text-slate-500 block">periods</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Classes & Subjects handled breakdown */}
        <div className="bg-slate-50 p-4 border-t border-slate-200">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Class-wise Workload Breakdown for {currentTeacher.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentLoad?.classesHandled.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs flex items-center gap-2"
              >
                <span className="font-black text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">
                  {item.classId}
                </span>
                <span className="font-medium text-slate-700">{item.subjectName}</span>
                <span className="font-bold text-slate-900">({item.periods} hrs/wk)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
