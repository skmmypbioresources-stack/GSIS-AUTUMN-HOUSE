import { MeetingRecord, Student } from "../types";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "docx";

/* ===================================================
   CSV EXPORT
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
   WORD EXPORT
=================================================== */

export async function exportToWord(
  records: MeetingRecord[],
  students: Student[]
) {
  const tableRows: TableRow[] = [];

  // Header Row
  tableRows.push(
    new TableRow({
      children: [
        "Mentor",
        "Month",
        "Week",
        "Student",
        "Grade",
        "Attendance",
        "Focus",
        "Activities",
        "Discussion",
      ].map(
        (header) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: header,
                    bold: true,
                  }),
                ],
              }),
            ],
          })
      ),
    })
  );

  // Data Rows
  records.forEach((record) => {
    record.attendance.forEach((a) => {
      const student = students.find((s) => s.id === a.studentId);

      tableRows.push(
        new TableRow({
          children: [
            record.teacherInitials,
            record.month,
            record.week.toString(),
            student?.name ?? "",
            student?.grade ?? "",
            a.status,
            record.focusArea ?? "",
            record.activitiesVolunteered ?? "",
            record.keyDiscussion ?? "",
          ].map(
            (value) =>
              new TableCell({
                children: [new Paragraph(String(value))],
              })
          ),
        })
      );
    });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "GSIS Autumn House – Consolidated Mentorship Report",
            heading: "Heading1",
          }),
          new Table({
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "GSIS_Autumn_House_Report.docx");
}
