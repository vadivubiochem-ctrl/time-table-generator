import React, { useState } from 'react';
import {
  ClassDef,
  ClassSubjectTeacherMapping,
  SubjectDef,
  TeacherDef,
} from '../types';
import {
  Users,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  BookOpen,
} from 'lucide-react';

interface TeacherAllocationSettingsProps {
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  allotments: ClassSubjectTeacherMapping[];
  onUpdateAllotment: (classId: string, subjectId: string, teacherId: string) => void;
  onResetToDefaults: () => void;
  onAutoGenerateAfterAllocation: () => void;
}

export const TeacherAllocationSettings: React.FC<TeacherAllocationSettingsProps> = ({
  classes,
  teachers,
  subjects,
  allotments,
  onUpdateAllotment,
  onResetToDefaults,
  onAutoGenerateAfterAllocation,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Lookup helper: (classId, subjectId) -> teacherId
  const getTeacherId = (classId: string, subjectId: string): string => {
    const item = allotments.find((a) => a.classId === classId && a.subjectId === subjectId);
    return item?.teacherId || 'PET_TEACHER';
  };

  const displayedClasses =
    selectedClassFilter === 'ALL'
      ? classes
      : classes.filter((c) => c.id === selectedClassFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Class-wise Subject Teachers' Allotment (PDF Pg 10-12)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Designate the PG Teacher or Vocational Agriculture Teacher responsible for each subject across the 10 classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800"
          >
            <option value="ALL">Show All 10 Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                Class {cls.id} ({cls.medium} Med)
              </option>
            ))}
          </select>

          <button
            onClick={onAutoGenerateAfterAllocation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Apply & Generate Timetable
          </button>

          <button
            onClick={onResetToDefaults}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Reset to default teacher assignments"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Roster Quick Summary of Classes Taken by Each Teacher */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-800">
        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Faculty Class Allotment Summary (11th & 12th Standards)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {teachers
            .filter((t) => t.id !== 'PET_TEACHER')
            .map((t) => (
              <div
                key={t.id}
                className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">
                    {t.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-400 text-slate-950">
                    {t.code}
                  </span>
                </div>
                <div className="text-[11px] text-blue-200 mt-0.5 font-medium">
                  {t.specialization}
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-300 uppercase font-bold">
                    Classes:
                  </span>
                  {t.assignedClasses?.map((clsId) => (
                    <span
                      key={clsId}
                      className="px-1.5 py-0.5 rounded bg-blue-600/40 border border-blue-400/40 text-[11px] font-black text-white"
                    >
                      {clsId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Grid of Class-Subject Allotment Cards matching PDF Page 10-12 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedClasses.map((cls, idx) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white p-3.5 border-b border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                  Class-{idx + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-black bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {cls.id}
                </span>
              </div>
              <h4 className="font-extrabold text-sm mt-0.5 text-white">{cls.name}</h4>
              <p className="text-[11px] text-slate-300 truncate">
                Grp {cls.groupCode} • {cls.medium} Medium
              </p>
            </div>

            {/* Table of Subjects and Teachers */}
            <div className="p-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-1.5 px-2">Subject</th>
                    <th className="py-1.5 px-2">Assigned Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cls.subjectIds.map((sid) => {
                    const subj = subjects[sid];
                    const currentTeacherId = getTeacherId(cls.id, sid);

                    return (
                      <tr key={sid} className="hover:bg-slate-50">
                        <td className="py-2 px-2 font-bold text-slate-800">
                          <span className="block truncate max-w-[130px]">
                            {subj?.name || sid}
                          </span>
                          {subj?.isPractical && (
                            <span className="text-[9px] text-purple-700 font-semibold uppercase">
                              (Lab)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={currentTeacherId}
                            onChange={(e) => onUpdateAllotment(cls.id, sid, e.target.value)}
                            className={`w-full py-1 px-1.5 rounded text-xs font-semibold border outline-none ${
                              currentTeacherId === 'MARITHEIVAM'
                                ? 'bg-amber-50 text-amber-950 border-amber-300 font-bold'
                                : 'bg-white text-slate-800 border-slate-300'
                            }`}
                          >
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.specialization})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{cls.subjectIds.length} Subjects</span>
              <span className="font-bold text-blue-900">40 Periods/Wk</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
