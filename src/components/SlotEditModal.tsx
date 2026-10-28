import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  ArrowRightLeft,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  User,
  BookOpen,
} from 'lucide-react';
import {
  ClassDef,
  DAYS_OF_WEEK,
  DayOfWeek,
  PeriodTiming,
  SubjectDef,
  TeacherDef,
  TimetableCell,
} from '../types';
import { PERIOD_TIMINGS } from '../data/initialData';

interface SlotEditModalProps {
  cell: TimetableCell | null;
  onClose: () => void;
  onSave: (updated: TimetableCell) => void;
  onSwap: (source: TimetableCell, targetDay: DayOfWeek, targetPeriod: number) => void;
  onClear: (classId: string, day: DayOfWeek, period: number) => void;
  classes: ClassDef[];
  teachers: TeacherDef[];
  subjects: Record<string, SubjectDef>;
  schedule: Record<string, TimetableCell>;
}

export const SlotEditModal: React.FC<SlotEditModalProps> = ({
  cell,
  onClose,
  onSave,
  onSwap,
  onClear,
  classes,
  teachers,
  subjects,
  schedule,
}) => {
  if (!cell) return null;

  const currentClass = classes.find((c) => c.id === cell.classId);
  const timing = PERIOD_TIMINGS.find((p) => p.periodNumber === cell.period);

  const [selectedSubjectId, setSelectedSubjectId] = useState(cell.subjectId || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState(cell.teacherId || '');
  const [isLocked, setIsLocked] = useState(Boolean(cell.isLocked));

  // Swap mode state
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapDay, setSwapDay] = useState<DayOfWeek>(cell.day);
  const [swapPeriod, setSwapPeriod] = useState<number>(cell.period === 8 ? 1 : cell.period + 1);

  // Check which teachers are busy at this day & period in OTHER classes
  const busyTeachersAtThisSlot = new Map<string, string>();
  Object.values(schedule).forEach((c) => {
    if (
      c.day === cell.day &&
      c.period === cell.period &&
      c.classId !== cell.classId &&
      c.teacherId &&
      c.teacherId !== 'PET_TEACHER'
    ) {
      busyTeachersAtThisSlot.set(c.teacherId, c.classId);
    }
  });

  const handleSave = () => {
    onSave({
      ...cell,
      subjectId: selectedSubjectId,
      teacherId: selectedTeacherId,
      isLocked,
    });
    onClose();
  };

  const handleExecuteSwap = () => {
    onSwap(cell, swapDay, swapPeriod);
    onClose();
  };

  const handleClear = () => {
    onClear(cell.classId, cell.day, cell.period);
    onClose();
  };

  const eligibleSubjectIds = currentClass?.subjectIds || Object.keys(subjects);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-black text-xs bg-white text-blue-900">
                {cell.classId}
              </span>
              <h3 className="font-bold text-base sm:text-lg">Edit Timetable Period</h3>
            </div>
            <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {cell.day} • Period {cell.period} ({timing?.startTime} - {timing?.endTime})
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Class Information badge */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-blue-950">{currentClass?.name}</span>
              <p className="text-slate-600">
                Group: <strong>{currentClass?.groupCode}</strong> ({currentClass?.medium} Medium)
              </p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                {currentClass?.groupName.slice(0, 24)}...
              </span>
            </div>
          </div>

          {!isSwapMode ? (
            <>
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setSelectedSubjectId(sid);
                    // auto pick assigned teacher if available
                    const mapping = currentClass?.subjectIds.includes(sid);
                    if (mapping) {
                      // leave as is or suggest
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                >
                  <option value="">-- Empty / Free Period --</option>
                  {eligibleSubjectIds.map((sid) => {
                    const s = subjects[sid];
                    if (!s) return null;
                    return (
                      <option key={sid} value={sid}>
                        {s.name} ({s.category}) {s.isPractical ? '[Practical Lab]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Assigned Teacher
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                >
                  <option value="">-- No Teacher Assigned --</option>
                  {teachers.map((t) => {
                    const busyInClass = busyTeachersAtThisSlot.get(t.id);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.designation} - {t.specialization}){' '}
                        {busyInClass ? `⚠️ Busy in ${busyInClass}!` : '✓ Available'}
                      </option>
                    );
                  })}
                </select>
                {selectedTeacherId && busyTeachersAtThisSlot.has(selectedTeacherId) && (
                  <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      <strong>Warning:</strong> {selectedTeacherId} is already taking a class in{' '}
                      <strong>{busyTeachersAtThisSlot.get(selectedTeacherId)}</strong> during this period!
                    </span>
                  </div>
                )}
              </div>

              {/* Pin / Lock Slot */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isLocked
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Slot is Locked (Pinned)
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-slate-500" />
                        Unlock Slot
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Locked slots won't be replaced during automatic generation.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSwapMode(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Swap Period...
                </button>
              </div>
            </>
          ) : (
            /* Swap Mode Panel */
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                  Swap with Another Period in {cell.classId}
                </div>
                <button
                  onClick={() => setIsSwapMode(false)}
                  className="text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Back to edit
                </button>
              </div>

              <p className="text-xs text-indigo-800">
                Choose the target day and period to swap this slot ({cell.day} P{cell.period}) with:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Target Day
                  </label>
                  <select
                    value={swapDay}
                    onChange={(e) => setSwapDay(e.target.value as DayOfWeek)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Target Period
                  </label>
                  <select
                    value={swapPeriod}
                    onChange={(e) => setSwapPeriod(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                      <option key={p} value={p}>
                        Period {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target info preview */}
              {(() => {
                const targetKey = `${cell.classId}_${swapDay}_${swapPeriod}`;
                const targetCell = schedule[targetKey];
                const targetSubj = targetCell?.subjectId
                  ? subjects[targetCell.subjectId]?.name
                  : 'Empty';
                return (
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-xs text-slate-700">
                    Target is currently:{' '}
                    <strong className="text-indigo-900">
                      {targetSubj} ({targetCell?.teacherId || 'No teacher'})
                    </strong>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSwapMode(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSwap}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow cursor-pointer"
                >
                  Confirm Swap
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isSwapMode && (
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Period
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
