
export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  EXCUSED = 'Excused'
}

export interface Student {
  id: string;
  name: string;
  teacherId: string;
  grade: string;
}

export interface Teacher {
  id: string;
  initials: string;
  isHOS?: boolean;
}

export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

export interface MeetingRecord {
  id: string;
  teacherId: string;
  teacherInitials: string;
  month: string;
  week: number;
  attendance: StudentAttendance[];
  focusArea: string;
  activitiesVolunteered: string;
  keyDiscussion: string;
  timestamp: number;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKS = [1, 2, 3, 4, 5];

export const TEACHER_INITIALS = [
  'RZ', 'MVS', 'PCN', 'GGR', 'CDS', 'BNG', 'SUS', 'KLP', 'DPI', 'MJS', 
  'SRL', 'RSH', 'SEL', 'KP', 'AA', 'RTH', 'SYB', 'AJM', 'AKY', 
  'TJ', 'SDT', 'VNK', 'AMC', 'SKM', 'CMW', 'AR', 'NMI', 'ADR'
];
