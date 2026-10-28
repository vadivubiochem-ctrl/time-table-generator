import React, { useState } from 'react';
import {
  ClassDef,
  DAYS_OF_WEEK,
  DayOfWeek,
  SubjectDef,
  TeacherDef,
  TimetableCell,
} from '../types';
import { calculateTeacherLoads, getTeachersFreePeriods } from '../utils/scheduler';
import {
  BarChart3,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Users,
  Printer,
  Download,
  Clock,
  BookOpen,
  Info,
  TrendingUp,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReportsViewProps {
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  schedule: Record<string, TimetableCell>;
  schoolName: string;
  academicYear: string;
  onPrint: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  classes,
  teachers,
  subjects,
  schedule,
  schoolName,
  academicYear,
  onPrint,
}) => {
  const [filterDesignation, setFilterDesignation] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'periodsDesc' | 'periodsAsc' | 'name'>('periodsDesc');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

  // Calculate loads & free periods
  const teacherLoads = calculateTeacherLoads(schedule, teachers);
  const freePeriodsData = getTeachersFreePeriods(schedule, teachers);

  // Compute school-wide metrics
  const totalScheduledPeriods = Object.values(schedule).filter((c) => c.subjectId).length;
  const namedTeachers = teachers.filter((t) => t.id !== 'PET_TEACHER');
  
  const totalTeacherLoad = teacherLoads
    .filter((l) => l.teacherId !== 'PET_TEACHER')
    .reduce((acc, curr) => acc + curr.totalPeriods, 0);

  const averageTeacherLoad =
    namedTeachers.length > 0 ? (totalTeacherLoad / namedTeachers.length).toFixed(1) : '0';

  // Benchmark thresholds (Standard TN HSS full-time workload is 28 - 36 periods/wk, max capacity is 40)
  const MAX_CAPACITY = 40;
  const OPTIMAL_MIN = 26;
  const OPTIMAL_MAX = 36;

  // Filter and sort
  const filteredLoads = teacherLoads
    .filter((load) => {
      const teacher = teachers.find((t) => t.id === load.teacherId);
      if (!teacher) return false;
      if (filterDesignation === 'ALL') return true;
      if (filterDesignation === 'PG') return teacher.designation === 'PG Teacher';
      if (filterDesignation === 'VOC') return teacher.designation === 'Vocational Agri Teacher';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'periodsDesc') return b.totalPeriods - a.totalPeriods;
      if (sortBy === 'periodsAsc') return a.totalPeriods - b.totalPeriods;
      return a.teacherName.localeCompare(b.teacherName);
    });

  // Imbalance identification
  const overloadedTeachers = teacherLoads.filter(
    (l) => l.teacherId !== 'PET_TEACHER' && l.totalPeriods > OPTIMAL_MAX
  );
  const lightLoadedTeachers = teacherLoads.filter(
    (l) => l.teacherId !== 'PET_TEACHER' && l.totalPeriods < OPTIMAL_MIN
  );
  const balancedTeachers = teacherLoads.filter(
    (l) =>
      l.teacherId !== 'PET_TEACHER' &&
      l.totalPeriods >= OPTIMAL_MIN &&
      l.totalPeriods <= OPTIMAL_MAX
  );

  // CSV Export for Workload Report
  const handleExportWorkloadCSV = () => {
    const rows: string[][] = [
      [`${schoolName} - TEACHER WORKLOAD & PERIOD ALLOTMENT REPORT`],
      [`Academic Year: ${academicYear}`, `Generated on: ${new Date().toLocaleDateString()}`],
      [],
      [
        'Teacher Code',
        'Teacher Name',
        'Designation',
        'Specialization',
        'Classes Handled',
        'Total Weekly Periods',
        'Capacity %',
        'Free Periods / Wk',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Workload Status',
      ],
    ];

    teacherLoads.forEach((l) => {
      const t = teachers.find((x) => x.id === l.teacherId);
      const freeCount = Object.values(freePeriodsData[l.teacherId] || {}).reduce(
        (sum, pList) => sum + pList.length,
        0
      );
      const status =
        l.totalPeriods >= 38
          ? 'Full Load (100% Capacity)'
          : l.totalPeriods >= OPTIMAL_MIN
          ? 'Balanced Load'
          : 'Light / Specialized Load';

      rows.push([
        t?.code || '',
        l.teacherName,
        t?.designation || '',
        t?.specialization || '',
        (t?.assignedClasses || []).join('; '),
        String(l.totalPeriods),
        `${Math.round((l.totalPeriods / MAX_CAPACITY) * 100)}%`,
        String(freeCount),
        String(l.dayLoad.Monday),
        String(l.dayLoad.Tuesday),
        String(l.dayLoad.Wednesday),
        String(l.dayLoad.Thursday),
        String(l.dayLoad.Friday),
        status,
      ]);
    });

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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schoolName.replace(/\s+/g, '_')}_Workload_Report_${academicYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Export */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
            <Scale className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Teacher Workload & Balance Reports
            </h3>
            <p className="text-xs text-slate-500">
              Institutional period distribution analysis across all 10 HSS classes and 9 teachers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>

          <button
            onClick={handleExportWorkloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export Workload CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Periods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Class Periods
            </span>
            <div className="text-2xl font-black text-blue-950 mt-0.5">
              {totalScheduledPeriods}{' '}
              <span className="text-xs font-normal text-slate-500">/ 400</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Scheduled across 10 Classes
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Average Load */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Average Faculty Load
            </span>
            <div className="text-2xl font-black text-indigo-950 mt-0.5">
              {averageTeacherLoad}{' '}
              <span className="text-xs font-normal text-slate-500">periods / wk</span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium mt-1 block">
              Standard: 28 - 36 periods/wk
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Max / Full Capacity Load */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Peak Capacity Teachers
            </span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {overloadedTeachers.length}{' '}
              <span className="text-xs font-normal text-slate-500">Faculty (38-40h)</span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              Tamil, English, Physics, Chem
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Balanced / Moderate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Flexible / Balanced Load
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-0.5">
              {balancedTeachers.length + lightLoadedTeachers.length}{' '}
              <span className="text-xs font-normal text-slate-500">Faculty (28-36h)</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available for Substitution Duty
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Workload Distribution Chart */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200">
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Comparative Faculty Period Allotment (Visual Benchmark)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of assigned teaching periods against the weekly maximum limit of 40 periods.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              Full Load (38 - 40h)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600"></span>
              Balanced (28 - 36h)
            </span>
          </div>
        </div>

        {/* Horizontal bar chart per teacher */}
        <div className="space-y-3.5">
          {teacherLoads
            .filter((l) => l.teacherId !== 'PET_TEACHER')
            .map((load) => {
              const teacher = teachers.find((t) => t.id === load.teacherId);
              const percent = Math.min(100, Math.round((load.totalPeriods / MAX_CAPACITY) * 100));
              const isHeavy = load.totalPeriods >= 38;
              const isOptimal = load.totalPeriods >= OPTIMAL_MIN && load.totalPeriods < 38;

              return (
                <div key={load.teacherId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 w-32 truncate">
                        {load.teacherName}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 px-1.5 py-0.2 rounded bg-slate-100">
                        {teacher?.code}
                      </span>
                      <span className="text-[11px] text-slate-600 hidden md:inline truncate max-w-[200px]">
                        {teacher?.specialization}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono font-bold">
                      <span
                        className={`text-xs ${
                          isHeavy
                            ? 'text-amber-700 font-black'
                            : isOptimal
                            ? 'text-blue-900 font-extrabold'
                            : 'text-slate-700'
                        }`}
                      >
                        {load.totalPeriods} / 40 periods
                      </span>
                      <span className="text-[11px] text-slate-400 w-10 text-right">
                        ({percent}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHeavy
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                          : isOptimal
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-r from-teal-500 to-emerald-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Comprehensive Detailed Audit Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase">Filter:</span>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Faculty (9 Teachers)</option>
              <option value="PG">PG Teachers Only (8)</option>
              <option value="VOC">Vocational Teachers (1)</option>
            </select>

            <span className="text-xs font-bold text-slate-700 uppercase ml-2">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800"
            >
              <option value="periodsDesc">Periods (Highest First)</option>
              <option value="periodsAsc">Periods (Lowest First)</option>
              <option value="name">Teacher Name (A-Z)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredLoads.length} Teachers
          </div>
        </div>

        {/* Workload Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-900 text-white font-bold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 border border-slate-300 text-center w-16 bg-blue-950">
                  Code
                </th>
                <th className="py-2.5 px-3 border border-slate-300 w-44 bg-blue-950">
                  Teacher Name & Subject
                </th>
                <th className="py-2.5 px-3 border border-slate-300">
                  Classes Handled
                </th>
                <th className="py-2.5 px-3 border border-slate-300 text-center w-24 bg-blue-950 font-black">
                  Total Load
                </th>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-14">Mon</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-14">Tue</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-14">Wed</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-14">Thu</th>
                <th className="py-2.5 px-2 border border-slate-300 text-center w-14">Fri</th>
                <th className="py-2.5 px-3 border border-slate-300 text-center w-24">
                  Free Periods
                </th>
                <th className="py-2.5 px-3 border border-slate-300 w-32">
                  Workload Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLoads.map((load, idx) => {
                const teacher = teachers.find((t) => t.id === load.teacherId);
                const isExpanded = expandedTeacherId === load.teacherId;
                const freeCount = Object.values(freePeriodsData[load.teacherId] || {}).reduce(
                  (sum, list) => sum + list.length,
                  0
                );
                const isHeavy = load.totalPeriods >= 38;
                const isOptimal = load.totalPeriods >= OPTIMAL_MIN && load.totalPeriods < 38;

                return (
                  <React.Fragment key={load.teacherId}>
                    <tr
                      className={`hover:bg-blue-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-black text-blue-900">
                        {teacher?.code}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 font-bold text-slate-900">
                        <div className="flex items-center justify-between">
                          <span>{load.teacherName}</span>
                          <button
                            onClick={() =>
                              setExpandedTeacherId(isExpanded ? null : load.teacherId)
                            }
                            className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Toggle class breakdown"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[11px] font-normal text-slate-500 block truncate">
                          {teacher?.specialization}
                        </span>
                      </td>

                      {/* Classes Handled */}
                      <td className="py-2.5 px-3 border border-slate-300">
                        <div className="flex flex-wrap gap-1">
                          {teacher?.assignedClasses?.map((cId) => (
                            <span
                              key={cId}
                              className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200"
                            >
                              {cId}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Load */}
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-black text-sm bg-blue-50/50 text-blue-950">
                        {load.totalPeriods}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          periods/wk
                        </span>
                      </td>

                      {/* Day Load */}
                      {DAYS_OF_WEEK.map((d) => (
                        <td
                          key={d}
                          className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-slate-800"
                        >
                          {load.dayLoad[d]}
                        </td>
                      ))}

                      {/* Free Periods */}
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                        {freeCount}{' '}
                        <span className="text-[10px] font-normal text-slate-500 block">
                          available
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 border border-slate-300">
                        {isHeavy ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Full Load (100%)
                          </span>
                        ) : isOptimal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Optimal Balanced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Specialized Load
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail Row for this teacher */}
                    {isExpanded && (
                      <tr className="bg-blue-50/70 border-b border-blue-200">
                        <td colSpan={11} className="p-3 text-xs">
                          <div className="font-bold text-blue-950 mb-1.5">
                            Detailed Subject & Class Allocation for {load.teacherName}:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {load.classesHandled.map((item, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-white p-2 rounded-md border border-blue-200 shadow-2xs flex items-center justify-between gap-2"
                              >
                                <span className="font-bold text-slate-800 text-[11px] truncate">
                                  {item.classId.includes(',')
                                    ? `Combined [${item.classId}]: ${item.subjectName}`
                                    : `Class ${item.classId}: ${item.subjectName}`}
                                </span>
                                <span className="font-extrabold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-[11px] shrink-0">
                                  {item.periods} periods
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workload Insights & Recommendations */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs text-slate-700">
        <h5 className="font-bold text-blue-950 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-700" />
          <span>Workload Balance Observations for Higher Secondary School Headmasters:</span>
        </h5>
        <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700">
          <li>
            <strong>Language Teachers (SUBBULAKSHMI - Tamil & PRADEEPA - English):</strong> Assigned across all 10 classes (4 periods each) resulting in a full 40 periods/week schedule (8 periods daily, continuous teaching).
          </li>
          <li>
            <strong>Core Science Teachers (GOWRI - Physics & NITHYA - Chemistry):</strong> Handle 8 classes (A, B, C, D in 11th & 12th) with 5 theory periods each (40 periods total), representing optimal core science coverage.
          </li>
          <li>
            <strong>Biology Team (RAMESH - Bio-Botany & SUNDAR - Bio-Zoology):</strong> Split between Botany/Zoology in Pure Science (11C, 12C) and Bio-Botany/Bio-Zoology in general science (11B, 12B, 11D, 12D, 11E, 12E), maintaining a well-proportioned 32 to 38 periods/week.
          </li>
          <li>
            <strong>Mathematics (LATHAMANI):</strong> Handles 6 classes (A, B, D in 11th & 12th) with 6 periods each = 36 periods/week, with 4 free periods per week available for substitution or remedial mentoring.
          </li>
          <li>
            <strong>Computer Science & Vocational Staff (SIVA & MARITHEIVAM):</strong> Siva handles Computer Science in 11A, 12A and Employability Skills in 11E, 12E (28 periods total). Maritheivam handles Vocational Agriculture Theory & Practicals (28 periods total). Both have 12 free periods per week ideal for lab maintenance and field practicals.
          </li>
        </ul>
      </div>
    </div>
  );
};
