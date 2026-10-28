/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Grid,
  Users,
  Clock,
  BookOpen,
  Settings,
  Sparkles,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  School,
  FileSpreadsheet,
  BarChart3,
} from 'lucide-react';
import {
  ClassDef,
  ClassSubjectTeacherMapping,
  Conflict,
  DayOfWeek,
  TeacherDef,
  TimetableCell,
} from './types';
import {
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  SUBJECTS,
  getInitialTeacherAllotments,
} from './data/initialData';
import {
  detectConflicts,
  generateTimetable,
  getCellKey,
  getScheduleCompletenessSummary,
} from './utils/scheduler';
import { Header } from './components/Header';
import { MasterTimetable } from './components/MasterTimetable';
import { ClassTimetable } from './components/ClassTimetable';
import { TeacherTimetable } from './components/TeacherTimetable';
import { FreePeriodsView } from './components/FreePeriodsView';
import { PeriodAllotmentMatrix } from './components/PeriodAllotmentMatrix';
import { TeacherAllocationSettings } from './components/TeacherAllocationSettings';
import { ReportsView } from './components/ReportsView';
import { SlotEditModal } from './components/SlotEditModal';
import { exportTimetableToCSV } from './utils/exportCsv';
import {
  downloadMasterTimetablePDF,
  downloadAllClassesPDFBooklet,
} from './utils/pdfGenerator';

type ActiveTab =
  | 'master'
  | 'classwise'
  | 'teacherwise'
  | 'freeperiods'
  | 'allotment'
  | 'allocation'
  | 'reports';

const STORAGE_KEY = 'hss_timetable_data_v4';

export default function App() {
  const [schoolName, setSchoolName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schoolName) return parsed.schoolName;
      }
    } catch (e) {
      // ignore
    }
    return 'GHSS PANNAIPURAM';
  });

  const [academicYear, setAcademicYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.academicYear) return parsed.academicYear;
      }
    } catch (e) {
      // ignore
    }
    return '2026-2027';
  });

  const [classes] = useState<ClassDef[]>(INITIAL_CLASSES);
  const [teachers] = useState<TeacherDef[]>(INITIAL_TEACHERS);
  const [subjects] = useState(SUBJECTS);

  const [allotments, setAllotments] = useState<ClassSubjectTeacherMapping[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.allotments) return parsed.allotments;
      }
    } catch (e) {
      // ignore
    }
    return getInitialTeacherAllotments();
  });

  const [schedule, setSchedule] = useState<Record<string, TimetableCell>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schedule && Object.keys(parsed.schedule).length > 0) {
          return parsed.schedule;
        }
      }
    } catch (e) {
      // ignore
    }
    // Generate initial valid schedule
    const initialAllot = getInitialTeacherAllotments();
    const result = generateTimetable(INITIAL_CLASSES, INITIAL_TEACHERS, initialAllot);
    return result.schedule;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('master');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCell, setEditingCell] = useState<TimetableCell | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute conflicts whenever schedule changes
  const conflicts = useMemo(() => {
    return detectConflicts(schedule, teachers);
  }, [schedule, teachers]);

  // Check schedule completeness (fully scheduled vs missing subjects)
  const completeness = useMemo(() => {
    return getScheduleCompletenessSummary(classes, schedule);
  }, [classes, schedule]);

  // Count locked slots
  const totalLockedSlots = useMemo(() => {
    return Object.values(schedule).filter((c) => c.isLocked).length;
  }, [schedule]);

  // Persist to local storage
  useEffect(() => {
    try {
      const dataToSave = {
        schoolName,
        academicYear,
        allotments,
        schedule,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [schoolName, academicYear, allotments, schedule]);

  // Toast notification trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Auto generate action
  const handleAutoGenerate = (keepLocked: boolean = true) => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateTimetable(classes, teachers, allotments, schedule, keepLocked);
      setSchedule(result.schedule);
      setIsGenerating(false);
      showToast(result.message);
    }, 150);
  };

  // Reset to initial clean state
  const handleReset = () => {
    if (
      window.confirm(
        'Reset timetable to initial default schedule? Any unsaved custom locks will be regenerated.'
      )
    ) {
      const defaultAllotments = getInitialTeacherAllotments();
      setAllotments(defaultAllotments);
      const result = generateTimetable(INITIAL_CLASSES, INITIAL_TEACHERS, defaultAllotments, {}, false);
      setSchedule(result.schedule);
      showToast('Timetable reset to initial default state.');
    }
  };

  // Manual edit handlers
  const handleSaveCell = (updated: TimetableCell) => {
    const key = getCellKey(updated.classId, updated.day, updated.period);
    setSchedule((prev) => ({
      ...prev,
      [key]: updated,
    }));
    showToast(`Updated Class ${updated.classId} ${updated.day} Period ${updated.period}`);
  };

  const handleSwapSlots = (source: TimetableCell, targetDay: DayOfWeek, targetPeriod: number) => {
    const sourceKey = getCellKey(source.classId, source.day, source.period);
    const targetKey = getCellKey(source.classId, targetDay, targetPeriod);

    const targetCell = schedule[targetKey] || {
      classId: source.classId,
      day: targetDay,
      period: targetPeriod,
      subjectId: '',
      teacherId: '',
    };

    setSchedule((prev) => {
      const next = { ...prev };
      next[sourceKey] = {
        ...source,
        subjectId: targetCell.subjectId,
        teacherId: targetCell.teacherId,
        isLocked: targetCell.isLocked,
      };
      next[targetKey] = {
        ...targetCell,
        subjectId: source.subjectId,
        teacherId: source.teacherId,
        isLocked: source.isLocked,
      };
      return next;
    });

    showToast(`Swapped ${source.day} P${source.period} with ${targetDay} P${targetPeriod}`);
  };

  const handleClearSlot = (classId: string, day: DayOfWeek, period: number) => {
    const key = getCellKey(classId, day, period);
    setSchedule((prev) => {
      const next = { ...prev };
      next[key] = {
        classId,
        day,
        period,
        subjectId: '',
        teacherId: '',
        isLocked: false,
      };
      return next;
    });
    showToast(`Cleared Class ${classId} ${day} Period ${period}`);
  };

  // Substitute assignment from Free Periods view
  const handleAssignSubstitute = (
    classId: string,
    day: DayOfWeek,
    period: number,
    substituteTeacherId: string
  ) => {
    const key = getCellKey(classId, day, period);
    setSchedule((prev) => {
      const current = prev[key];
      if (!current) return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          teacherId: substituteTeacherId,
        },
      };
    });
  };

  // Update teacher-to-subject allotment
  const handleUpdateAllotment = (classId: string, subjectId: string, teacherId: string) => {
    setAllotments((prev) => {
      const filtered = prev.filter((a) => !(a.classId === classId && a.subjectId === subjectId));
      return [...filtered, { classId, subjectId, teacherId }];
    });
  };

  const handleResetAllotmentsToDefaults = () => {
    const defaultAllot = getInitialTeacherAllotments();
    setAllotments(defaultAllot);
    showToast('Reset subject-teacher allotments to standard postings.');
  };

  // Export CSV
  const handleExportCSV = () => {
    exportTimetableToCSV(classes, teachers, subjects, schedule, schoolName, academicYear);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* App Header */}
      <Header
        schoolName={schoolName}
        onUpdateSchoolName={setSchoolName}
        academicYear={academicYear}
        onUpdateAcademicYear={setAcademicYear}
        conflicts={conflicts}
        onAutoGenerate={() => handleAutoGenerate(true)}
        isGenerating={isGenerating}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
        onDownloadMasterPDF={() =>
          downloadMasterTimetablePDF(classes, teachers, subjects, schedule, schoolName, academicYear)
        }
        onDownloadBookletPDF={() =>
          downloadAllClassesPDFBooklet(classes, teachers, subjects, schedule, schoolName, academicYear)
        }
        onReset={handleReset}
        totalLockedSlots={totalLockedSlots}
      />

      {/* Navigation Tabs Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('master')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'master'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Master Time Table</span>
            </button>

            <button
              onClick={() => setActiveTab('classwise')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'classwise'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={
                completeness.isAllComplete
                  ? `All ${completeness.totalClasses} classes are fully scheduled (40/40 periods with all required subjects)`
                  : `${completeness.fullyScheduledCount} of ${completeness.totalClasses} classes fully scheduled • ${completeness.incompleteCount} class(es) have missing subjects`
              }
            >
              <Layers className="w-4 h-4" />
              <span>Classwise Time Table</span>

              {/* Summary Badge: Fully Scheduled vs Missing Subjects */}
              {completeness.isAllComplete ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'classwise'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>${completeness.fullyScheduledCount}/${completeness.totalClasses} Full</span>
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse ${
                    activeTab === 'classwise'
                      ? 'bg-amber-400/30 text-amber-200 border border-amber-400/60'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>
                    ${completeness.fullyScheduledCount}/${completeness.totalClasses} Full • ${completeness.incompleteCount} Missing
                  </span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('teacherwise')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'teacherwise'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teacherwise Time Table</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
                8 PG + 1 Voc
              </span>
            </button>

            <button
              onClick={() => setActiveTab('freeperiods')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'freeperiods'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Free Periods & Substitution</span>
            </button>

            <button
              onClick={() => setActiveTab('allotment')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'allotment'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Period Allotment Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('allocation')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'allocation'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Teacher Allotment Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Workload Reports</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold">
                Analytics
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-blue-950 text-white rounded-xl shadow-lg border border-blue-700 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-blue-300 hover:text-white ml-3 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Master Timetable */}
        {activeTab === 'master' && (
          <MasterTimetable
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            schedule={schedule}
            conflicts={conflicts}
            schoolName={schoolName}
            academicYear={academicYear}
            onCellClick={(cell) => setEditingCell(cell)}
            onAutoGenerate={() => handleAutoGenerate(true)}
          />
        )}

        {/* Tab 2: Classwise Timetable */}
        {activeTab === 'classwise' && (
          <ClassTimetable
            completeness={completeness}
            onAutoGenerate={() => handleAutoGenerate(true)}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            schedule={schedule}
            conflicts={conflicts}
            schoolName={schoolName}
            academicYear={academicYear}
            onCellClick={(cell) => setEditingCell(cell)}
            onPrint={handlePrint}
          />
        )}

        {/* Tab 3: Teacherwise Timetable */}
        {activeTab === 'teacherwise' && (
          <TeacherTimetable
            teachers={teachers}
            subjects={subjects}
            schedule={schedule}
            schoolName={schoolName}
            academicYear={academicYear}
            onPrint={handlePrint}
          />
        )}

        {/* Tab 4: Free Periods & Substitution */}
        {activeTab === 'freeperiods' && (
          <FreePeriodsView
            teachers={teachers}
            schedule={schedule}
            schoolName={schoolName}
            academicYear={academicYear}
            onPrint={handlePrint}
            onAssignSubstitute={handleAssignSubstitute}
          />
        )}

        {/* Tab 5: Period Allotment Matrix */}
        {activeTab === 'allotment' && (
          <PeriodAllotmentMatrix
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            schedule={schedule}
            schoolName={schoolName}
            academicYear={academicYear}
            onPrint={handlePrint}
          />
        )}

        {/* Tab 6: Teacher Allotment Settings */}
        {activeTab === 'allocation' && (
          <TeacherAllocationSettings
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            allotments={allotments}
            onUpdateAllotment={handleUpdateAllotment}
            onResetToDefaults={handleResetAllotmentsToDefaults}
            onAutoGenerateAfterAllocation={() => handleAutoGenerate(false)}
          />
        )}

        {/* Tab 7: Workload Reports & Imbalance Analysis */}
        {activeTab === 'reports' && (
          <ReportsView
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            schedule={schedule}
            schoolName={schoolName}
            academicYear={academicYear}
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* Manual Slot Edit Modal */}
      {editingCell && (
        <SlotEditModal
          cell={editingCell}
          onClose={() => setEditingCell(null)}
          onSave={handleSaveCell}
          onSwap={handleSwapSlots}
          onClear={handleClearSlot}
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          schedule={schedule}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {schoolName} • Higher Secondary School Period Allotment System (Class 11 & 12)
          </p>
          <p className="text-[11px] text-slate-400">
            Tamil Nadu Higher Secondary Standards (8 Periods/Day • 40 Periods/Week)
          </p>
        </div>
      </footer>
    </div>
  );
}
