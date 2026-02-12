import { MeetingRecord, Student, AttendanceStatus } from "../types";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

/* ===================================================
   CSV EXPORT (RAW STRUCTURED DATA)
=================================================== */

export function exportToCSV(
  records: MeetingRecord[],
  students: Student[]
) {
  const headers = [
    "Mentor",
    "Month",
    "Week",
    "Student Name",
    "Grade",
    "Attendance",
    "Individual Feedback",
    "Focus Area",
    "Activities",
    "Discussion",
    "Date",
  ];

  const rows: string[][] = [];

  records.forEach((record) => {
    record.attendance.forEach((a) => {
      const student = students.find((s) => s.id === a.studentId);

      rows.push([
        record.teacherInitials,
        record.month,
        record.week.toString(),
        student?.name ?? "",
        student?.grade ?? "",
        a.status,
        (a as any).remarks ?? "",
        record.focusArea ?? "",
        record.activitiesVolunteered ?? "",
        record.keyDiscussion ?? "",
        new Date(record.timestamp).toLocaleDateString(),
      ]);
    });
  });

  const csvContent =
    [headers, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, "GSIS_Autumn_House_Report.csv");
}

/* ===================================================
   WORD EXPORT (ANALYTICAL PER-STUDENT REPORT WITH MENTOR NAME)
=================================================== */

export async function exportToWord(
  records: MeetingRecord[],
  students: Student[]
) {
  const studentStats: Record<
    string,
    {
      present: number;
      absent: number;
      late: number;
      excused: number;
      remarks: { text: string; mentor: string }[];
    }
  > = {};

  // ===============================
  // Aggregate Data
  // ===============================

  records.forEach((record) => {
    record.attendance.forEach((a) => {
      if (!studentStats[a.studentId]) {
        studentStats[a.studentId] = {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          remarks: [],
        };
      }

      if (a.status === AttendanceStatus.PRESENT)
        studentStats[a.studentId].present++;

      if (a.status === AttendanceStatus.ABSENT)
        studentStats[a.studentId].absent++;

      if (a.status === AttendanceStatus.LATE)
        studentStats[a.studentId].late++;

      if (a.status === AttendanceStatus.EXCUSED)
        studentStats[a.studentId].excused++;

      if ((a as any).remarks && (a as any).remarks.trim() !== "") {
        studentStats[a.studentId].remarks.push({
          text: (a as any).remarks,
          mentor: record.teacherInitials,
        });
      }
    });
  });

  const docChildren: Paragraph[] = [];

  docChildren.push(
    new Paragraph({
      text: "GSIS Autumn House – Individual Student Performance Report",
      heading: "Heading1",
    })
  );

  docChildren.push(new Paragraph(" "));

  // ===============================
  // Build Student Sections
  // ===============================

  Object.keys(studentStats).forEach((studentId) => {
    const stats = studentStats[studentId];
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const total =
      stats.present + stats.absent + stats.late + stats.excused;

    const attendancePercent =
      total > 0 ? Math.round((stats.present / total) * 100) : 0;

    // Professional Summary Logic
    let summary = "";

    if (attendancePercent >= 90)
      summary =
        "Demonstrates excellent attendance consistency and responsible engagement.";
    else if (attendancePercent >= 75)
      summary =
        "Shows satisfactory attendance with minor areas for punctuality improvement.";
    else
      summary =
        "Attendance pattern indicates need for structured mentoring intervention.";

    if (stats.late > 2)
      summary += " Repeated lateness observed.";
    if (stats.absent > 2)
      summary += " Multiple absences recorded.";

    // Student Heading
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${student.name} (Grade ${student.grade})`,
            bold: true,
            size: 28,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph(
        `Present: ${stats.present} | Absent: ${stats.absent} | Late: ${stats.late} | Excused: ${stats.excused}`
      )
    );

    docChildren.push(
      new Paragraph(`Attendance Percentage: ${attendancePercent}%`)
    );

    docChildren.push(
      new Paragraph(`Summary: ${summary}`)
    );

    // ===============================
    // Mentor Feedback Section
    // ===============================

    if (stats.remarks.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Mentor Feedback:",
              bold: true,
            }),
          ],
        })
      );

      stats.remarks.forEach((remark) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `(${remark.mentor}) `,
                bold: true,
              }),
              new TextRun({
                text: remark.text,
              }),
            ],
          })
        );
      });
    }

    docChildren.push(new Paragraph(" "));
    docChildren.push(
      new Paragraph("------------------------------------------------------")
    );
    docChildren.push(new Paragraph(" "));
  });

  const doc = new Document({
    sections: [
      {
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "GSIS_Autumn_House_Student_Performance_Report.docx");
}
