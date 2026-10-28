import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  School,
  Lock,
  Edit2,
  FileSpreadsheet,
  FileDown,
  Layers,
} from 'lucide-react';
import { Conflict } from '../types';

interface HeaderProps {
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  academicYear: string;
  onUpdateAcademicYear: (year: string) => void;
  conflicts: Conflict[];
  onAutoGenerate: () => void;
  isGenerating: boolean;
  onPrint: () => void;
  onExportCSV: () => void;
  onDownloadMasterPDF: () => void;
  onDownloadBookletPDF: () => void;
  onReset: () => void;
  totalLockedSlots: number;
}

export const Header: React.FC<HeaderProps> = ({
  schoolName,
  onUpdateSchoolName,
  academicYear,
  onUpdateAcademicYear,
  conflicts,
  onAutoGenerate,
  isGenerating,
  onPrint,
  onExportCSV,
  onDownloadMasterPDF,
  onDownloadBookletPDF,
  onReset,
  totalLockedSlots,
}) => {
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState(schoolName);
  const [tempYear, setTempYear] = useState(academicYear);

  const handleSaveHeader = () => {
    onUpdateSchoolName(tempSchoolName.trim() || 'GHSS PANNAIPURAM');
    onUpdateAcademicYear(tempYear.trim() || '2026-2027');
    setIsEditingHeader(false);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-lg border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top bar with branding & primary action buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 shadow-inner flex items-center justify-center text-blue-300">
              <School className="w-8 h-8" />
            </div>

            <div>
              {isEditingHeader ? (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempSchoolName}
                    onChange={(e) => setTempSchoolName(e.target.value)}
                    className="px-2.5 py-1 text-base font-bold bg-white text-slate-900 rounded border border-blue-300"
                    placeholder="School Name"
                  />
                  <input
                    type="text"
                    value={tempYear}
                    onChange={(e) => setTempYear(e.target.value)}
                    className="w-28 px-2.5 py-1 text-sm bg-white text-slate-900 rounded border border-blue-300"
                    placeholder="Academic Year"
                  />
                  <button
                    onClick={handleSaveHeader}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingHeader(false)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs rounded text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-sm uppercase">
                    {schoolName}
                  </h1>
                  <button
                    onClick={() => {
                      setTempSchoolName(schoolName);
                      setTempYear(academicYear);
                      setIsEditingHeader(true);
                    }}
                    className="p-1 text-blue-300 hover:text-white rounded hover:bg-white/10 transition-colors"
                    title="Edit School Name & Year"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    AY {academicYear}
                  </span>
                </div>
              )}
              <p className="text-xs sm:text-sm text-blue-200/90 font-medium flex items-center gap-2 mt-0.5">
                <span>Higher Secondary School (Class 11 & 12 Only)</span>
                <span className="inline-block w-1 h-1 rounded-full bg-blue-300"></span>
                <span>Period Allotment & Clash-Free Timetable System</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAutoGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md hover:shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Automatically generate conflict-free timetable for all 10 classes"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isGenerating ? 'Generating...' : 'Auto Generate Timetable'}</span>
            </button>

            {/* PDF Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPdfMenu(!showPdfMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-700/90 hover:bg-red-600 text-white text-xs sm:text-sm font-bold rounded-lg border border-red-500/50 shadow-sm transition-colors cursor-pointer"
                title="Download Print-Ready PDF Schedules"
              >
                <FileDown className="w-4 h-4 text-red-200" />
                <span>Download PDF</span>
              </button>

              {showPdfMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs"
                  onClick={() => setShowPdfMenu(false)}
                >
                  <button
                    onClick={onDownloadMasterPDF}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-600/30 text-slate-200 hover:text-white flex items-center gap-2"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-400" />
                    <div>
                      <strong className="block text-white">Master Timetable PDF</strong>
                      <span className="text-[10px] text-slate-400">All 10 classes in one master grid</span>
                    </div>
                  </button>

                  <button
                    onClick={onDownloadBookletPDF}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-600/30 text-slate-200 hover:text-white flex items-center gap-2 border-t border-slate-800"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <strong className="block text-white">All 10 Classes Booklet</strong>
                      <span className="text-[10px] text-slate-400">Printable booklet for all classes</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 shadow-sm transition-colors cursor-pointer"
              title="Browser Print Preview"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 shadow-sm transition-colors cursor-pointer"
              title="Export Full Timetable to CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-800/60 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Reset to default initial timetable"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Indicator & Stats Strip */}
        <div className="mt-3 pt-3 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {conflicts.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero Teacher Clashes (100% Validated)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {conflicts.length} Teacher Conflict{conflicts.length > 1 ? 's' : ''} Detected
              </span>
            )}

            {totalLockedSlots > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Lock className="w-3 h-3 text-amber-400" />
                {totalLockedSlots} Locked Period{totalLockedSlots > 1 ? 's' : ''} (Pinned)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <span>
              <strong className="text-white">10</strong> Classes (11th & 12th)
            </span>
            <span>•</span>
            <span>
              <strong className="text-white">8</strong> PG Teachers + <strong className="text-amber-300">1</strong> Voc Agri
            </span>
            <span>•</span>
            <span>
              <strong className="text-white">40</strong> Periods/Week (8 Daily)
            </span>
          </div>
        </div>

        {/* Conflict Alert Banner if any conflicts */}
        {conflicts.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/80 border border-rose-600/60 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-rose-100">
                  Double Booking Notice:
                </p>
                <p className="text-xs text-rose-300">
                  {conflicts.slice(0, 3).map((c, i) => (
                    <span key={i} className="mr-2 inline-block">
                      <strong>{c.teacherName}</strong> on {c.day} Period {c.period} in [{c.classes.join(', ')}];
                    </span>
                  ))}
                  {conflicts.length > 3 && ` and ${conflicts.length - 3} more.`}
                </p>
              </div>
            </div>
            <button
              onClick={onAutoGenerate}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-xs self-start sm:self-center shrink-0 cursor-pointer"
            >
              Auto-Resolve Clashes
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
