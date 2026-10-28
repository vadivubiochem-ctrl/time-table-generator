import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { calculateTeacherLoads, getCellKey, getTeachersFreePeriods } from './scheduler';

// 1. Download Master Timetable PDF
export function downloadMasterTimetablePDF(
  classes: ClassDef[],
  teachers: TeacherDef[],
  subjects: Record<string, SubjectDef>,
  schedule: Record<string, TimetableCell>,
  schoolName: string,
  academicYear: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const teacherMap = new Map(teachers.map((t) => [t.id, t.name]));

  // Title & Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 54, 93); // Dark navy
  doc.text(schoolName.toUpperCase(), 148, 14, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text(`ALL CLASS MASTER TIME TABLE • ACADEMIC YEAR ${academicYear}`, 148, 20, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Higher Secondary School (Class 11 & 12 Only) • 8 Periods Daily (40 Periods/Week)', 148, 25, {
    align: 'center',
  });

  // Table columns: Day-Period, then each of the 10 classes
  const tableHeaders = ['Day-Period', ...classes.map((c) => `${c.id}\n(Grp ${c.groupCode})`)];

  const tableBody: any[][] = [];

  DAYS_OF_WEEK.forEach((day) => {
    for (let p = 1; p <= 8; p++) {
      const dayPeriodLabel = `${day.slice(0, 3)}-${p}`;
      const row: string[] = [dayPeriodLabel];

      classes.forEach((cls) => {
        const k = getCellKey(cls.id, day, p);
        const cell = schedule[k];
        if (cell?.subjectId) {
          const s = subjects[cell.subjectId];
          const tName = cell.teacherId ? teacherMap.get(cell.teacherId) || cell.teacherId : '';
          const sName = s?.shortName || cell.subjectId;
          row.push(`${sName}\n(${tName})`);
        } else {
          row.push('---');
        }
      });

      tableBody.push(row);
    }
  });

  autoTable(doc, {
    head: [tableHeaders],
    body: tableBody,
    startY: 28,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
      lineColor: [180, 195, 215],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [27, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [235, 242, 250], cellWidth: 20 },
    },
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Generated from HSS Timetable System • Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        148,
        202,
        { align: 'center' }
      );
    },
  });

  doc.save(`${schoolName.replace(/\s+/g, '_')}_Master_Timetable_${academicYear}.pdf`);
}

// 2. Download Individual Class Timetable PDF
export function downloadClassTimetablePDF(
  cls: ClassDef,
  teachers: TeacherDef[],
  subjects: Record<string, SubjectDef>,
  schedule: Record<string, TimetableCell>,
  schoolName: string,
  academicYear: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 54, 93);
  doc.text(schoolName.toUpperCase(), 148, 16, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`CLASS TIME TABLE: ${cls.id} (${cls.name})`, 148, 24, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(
    `Group Code: ${cls.groupCode} • ${cls.medium} Medium • Academic Year: ${academicYear}`,
    148,
    30,
    { align: 'center' }
  );
  doc.text(`${cls.groupName}`, 148, 35, { align: 'center' });

  // Columns for 8 periods
  const headers = [
    'Day',
    ...PERIOD_TIMINGS.map((p) => `Period ${p.label}\n${p.startTime}-${p.endTime}`),
  ];

  const body: any[][] = [];

  DAYS_OF_WEEK.forEach((day) => {
    const row: string[] = [day];

    PERIOD_TIMINGS.forEach((p) => {
      const k = getCellKey(cls.id, day, p.periodNumber);
      const cell = schedule[k];
      if (cell?.subjectId) {
        const s = subjects[cell.subjectId];
        const t = teacherMap.get(cell.teacherId);
        const subName = s?.name || cell.subjectId;
        const teacherName = t?.name || cell.teacherId || 'Unassigned';
        const labTag = s?.isPractical ? ' [LAB]' : '';
        row.push(`${subName}${labTag}\n(${teacherName})`);
      } else {
        row.push('FREE');
      }
    });

    body.push(row);
  });

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
      lineColor: [180, 195, 215],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [27, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [235, 242, 250], cellWidth: 26, halign: 'left' },
    },
  });

  // Footer notes & Break schedules
  const finalY = (doc as any).lastAutoTable?.finalY || 140;
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'School Timings: 09:30 AM - 04:10 PM | Morning Break: 11:00 - 11:10 AM | Lunch: 12:40 - 01:20 PM | Afternoon Break: 02:40 - 02:50 PM',
    148,
    finalY + 12,
    { align: 'center' }
  );

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Teacher Signature', 40, finalY + 35);
  doc.text('Timetable Coordinator', 148, finalY + 35, { align: 'center' });
  doc.text('Headmaster / Principal', 250, finalY + 35, { align: 'right' });

  doc.save(`${schoolName.replace(/\s+/g, '_')}_Class_${cls.id}_Timetable_${academicYear}.pdf`);
}

// 3. Download All 10 Classes Timetable PDF Booklet
export function downloadAllClassesPDFBooklet(
  classes: ClassDef[],
  teachers: TeacherDef[],
  subjects: Record<string, SubjectDef>,
  schedule: Record<string, TimetableCell>,
  schoolName: string,
  academicYear: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  classes.forEach((cls, idx) => {
    if (idx > 0) {
      doc.addPage();
    }

    // Header
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 54, 93);
    doc.text(schoolName.toUpperCase(), 148, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`CLASS TIME TABLE: ${cls.id} (${cls.name})`, 148, 22, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(
      `Group Code: ${cls.groupCode} • ${cls.medium} Medium • Academic Year: ${academicYear} • Class ${idx + 1} of 10`,
      148,
      28,
      { align: 'center' }
    );

    const headers = [
      'Day',
      ...PERIOD_TIMINGS.map((p) => `Period ${p.label}\n${p.startTime}-${p.endTime}`),
    ];

    const body: any[][] = [];

    DAYS_OF_WEEK.forEach((day) => {
      const row: string[] = [day];

      PERIOD_TIMINGS.forEach((p) => {
        const k = getCellKey(cls.id, day, p.periodNumber);
        const cell = schedule[k];
        if (cell?.subjectId) {
          const s = subjects[cell.subjectId];
          const t = teacherMap.get(cell.teacherId);
          const subName = s?.name || cell.subjectId;
          const teacherName = t?.name || cell.teacherId || 'Unassigned';
          const labTag = s?.isPractical ? ' [LAB]' : '';
          row.push(`${subName}${labTag}\n(${teacherName})`);
        } else {
          row.push('FREE');
        }
      });

      body.push(row);
    });

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 33,
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
        lineColor: [180, 195, 215],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [27, 54, 93],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 253],
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [235, 242, 250], cellWidth: 26, halign: 'left' },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(
      '09:30 AM - 04:10 PM | Morning Break: 11:00-11:10 | Lunch: 12:40-01:20 | Afternoon Break: 02:40-02:50',
      148,
      finalY + 10,
      { align: 'center' }
    );

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Class Teacher Signature', 40, finalY + 30);
    doc.text('Timetable Coordinator', 148, finalY + 30, { align: 'center' });
    doc.text('Headmaster / Principal', 250, finalY + 30, { align: 'right' });
  });

  doc.save(`${schoolName.replace(/\s+/g, '_')}_All_10_Classes_Timetable_Booklet_${academicYear}.pdf`);
}

// 4. Download Teacher Timetable PDF (Single Teacher or All Teachers)
export function downloadTeacherTimetablePDF(
  teacher: TeacherDef,
  subjects: Record<string, SubjectDef>,
  schedule: Record<string, TimetableCell>,
  schoolName: string,
  academicYear: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate teacher load
  const dayLoads: Record<DayOfWeek, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
  };
  let totalHours = 0;

  DAYS_OF_WEEK.forEach((d) => {
    for (let p = 1; p <= 8; p++) {
      const isTeaching = Object.values(schedule).some(
        (c) => c.teacherId === teacher.id && c.day === d && c.period === p
      );
      if (isTeaching) {
        dayLoads[d]++;
        totalHours++;
      }
    }
  });

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 54, 93);
  doc.text(schoolName.toUpperCase(), 148, 16, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `FACULTY TIME TABLE: ${teacher.name} (${teacher.code}) - ${teacher.designation}`,
    148,
    24,
    { align: 'center' }
  );

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(
    `Specialization: ${teacher.specialization} • Total Weekly Load: ${totalHours} Periods/Week • AY ${academicYear}`,
    148,
    30,
    { align: 'center' }
  );

  const headers = [
    'Day',
    ...PERIOD_TIMINGS.map((p) => `Period ${p.label}\n${p.startTime}-${p.endTime}`),
    'Day Load',
  ];

  const body: any[][] = [];

  DAYS_OF_WEEK.forEach((day) => {
    const row: string[] = [day];

    PERIOD_TIMINGS.forEach((p) => {
      const match = Object.values(schedule).find(
        (c) => c.teacherId === teacher.id && c.day === day && c.period === p.periodNumber
      );
      if (match) {
        const s = subjects[match.subjectId];
        const subName = s?.name || match.subjectId;
        const labTag = s?.isPractical ? ' [LAB]' : '';
        row.push(`Class ${match.classId}\n${subName}${labTag}`);
      } else {
        row.push('FREE');
      }
    });

    row.push(`${dayLoads[day]} hrs`);
    body.push(row);
  });

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 37,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
      lineColor: [180, 195, 215],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [27, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [235, 242, 250], cellWidth: 24, halign: 'left' },
      9: { fontStyle: 'bold', fillColor: [235, 242, 250], cellWidth: 20 },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 140;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Signature', 40, finalY + 30);
  doc.text('Timetable Coordinator', 148, finalY + 30, { align: 'center' });
  doc.text('Headmaster / Principal', 250, finalY + 30, { align: 'right' });

  doc.save(`${schoolName.replace(/\s+/g, '_')}_Teacher_${teacher.name}_${academicYear}.pdf`);
}

// 5. Download Teachers' Free Period Schedule PDF (PDF Page 42 layout)
export function downloadFreePeriodSchedulePDF(
  teachers: TeacherDef[],
  schedule: Record<string, TimetableCell>,
  schoolName: string,
  academicYear: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const freeSchedule = getTeachersFreePeriods(schedule, teachers);

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 54, 93);
  doc.text(schoolName.toUpperCase(), 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text("TEACHERS' FREE PERIOD SCHEDULE", 105, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Academic Period Allotment System • AY ${academicYear}`, 105, 28, { align: 'center' });

  const headers = ['Code', "Teacher's Name", 'Subject', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const body: any[][] = [];

  teachers.forEach((t) => {
    const freeDays = freeSchedule[t.id] || {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    body.push([
      t.code,
      t.name,
      t.specialization,
      freeDays.Monday.join(', ') || 'None',
      freeDays.Tuesday.join(', ') || 'None',
      freeDays.Wednesday.join(', ') || 'None',
      freeDays.Thursday.join(', ') || 'None',
      freeDays.Friday.join(', ') || 'None',
    ]);
  });

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 34,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      halign: 'center',
      valign: 'middle',
      lineColor: [180, 195, 215],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [27, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 14 },
      1: { fontStyle: 'bold', halign: 'left', cellWidth: 32 },
      2: { halign: 'left', cellWidth: 32 },
    },
  });

  doc.save(`${schoolName.replace(/\s+/g, '_')}_Teachers_Free_Periods_${academicYear}.pdf`);
}
