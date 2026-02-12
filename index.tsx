import { exportToCSV, exportToWord } from "./services/exportService";

import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  AttendanceStatus, 
  Teacher, 
  Student, 
  MeetingRecord, 
  MONTHS, 
  WEEKS, 
  TEACHER_INITIALS,
  StudentAttendance
} from './types';
import { 
  getTeachers, 
  getStudents, 
  subscribeToRecords, 
  saveRecordToCloud, 
  getCurrentUser, 
  setCurrentUser 
} from './services/dataService';

const Icons = {
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Clipboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>,
  Loader: () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  QrCode: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3"/><path d="M7 12h3"/><path d="M12 21v-5"/><path d="M12 12v.01"/><path d="M16 12h5"/></svg>
};

const LoginScreen: React.FC<{ onLogin: (user: Teacher) => void }> = ({ onLogin }) => {
  const [selected, setSelected] = useState('');
  const [isHOS, setIsHOS] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Use the current URL for the QR code
  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
        <div className="autumn-gradient p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="w-24 h-24 bg-white/20 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
            <div className="-rotate-12"><Icons.Book /></div>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">GSIS</h1>
          <p className="text-xl font-medium opacity-90">Autumn House Portal</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex bg-orange-50 p-1.5 rounded-2xl">
            <button onClick={() => setIsHOS(false)} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${!isHOS ? 'bg-white shadow-sm text-orange-600' : 'text-orange-400'}`}>Mentor</button>
            <button onClick={() => setIsHOS(true)} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${isHOS ? 'bg-white shadow-sm text-orange-600' : 'text-orange-400'}`}>HOS</button>
          </div>
          {!isHOS ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-orange-950 uppercase tracking-widest ml-1">Staff Identification</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-orange-50 focus:border-orange-500 outline-none transition-all appearance-none bg-orange-50/50 font-bold text-orange-950">
                <option value="">Select Initials</option>
                {TEACHER_INITIALS.map(init => <option key={init} value={init}>{init}</option>)}
              </select>
            </div>
          ) : (
            <div className="bg-orange-50/50 p-5 rounded-2xl border-2 border-dashed border-orange-200 text-sm text-orange-800 italic leading-relaxed text-center">Cloud Access Mode: Viewing live house interaction data.</div>
          )}
          <button onClick={() => { if (isHOS) onLogin({ id: 'HOS', initials: 'HOS', isHOS: true }); else if (selected) onLogin({ id: selected, initials: selected }); }} disabled={!isHOS && !selected} className="w-full py-5 autumn-gradient text-white font-black rounded-2xl shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest">Access Dashboard</button>
          
          <div className="pt-6 border-t border-orange-50">
            <button 
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-orange-400 hover:text-orange-600 uppercase tracking-[0.2em] transition-colors"
            >
              <Icons.QrCode /> {showQR ? 'Hide Portal QR' : 'Show Portal Access QR'}
            </button>
            
            {showQR && (
              <div className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 bg-white border-2 border-orange-100 rounded-3xl shadow-lg relative">
                  <img src={qrUrl} alt="Portal QR Code" className="w-40 h-40" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-950 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap border-2 border-white shadow-md">
                    Autumn House Portal
                  </div>
                </div>
                <p className="mt-6 text-[10px] font-bold text-orange-300 text-center uppercase tracking-widest leading-relaxed px-4">
                  Screenshot this QR to save as an image on your phone for quick daily access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Global Schools International • Autumn House</p>
    </div>
  );
};

const AttendanceBadge: React.FC<{ status: AttendanceStatus; onClick?: () => void; active?: boolean }> = ({ status, onClick, active }) => {
  const colors = {
    [AttendanceStatus.PRESENT]: 'bg-emerald-500 text-white border-emerald-500',
    [AttendanceStatus.ABSENT]: 'bg-rose-500 text-white border-rose-500',
    [AttendanceStatus.LATE]: 'bg-amber-500 text-white border-amber-500',
    [AttendanceStatus.EXCUSED]: 'bg-sky-500 text-white border-sky-500',
  };
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${active ? colors[status] : 'bg-white text-slate-300 border-slate-100 hover:border-orange-200 hover:text-orange-400'}`}>
      {status.toUpperCase()}
    </button>
  );
};

const TeacherDashboard: React.FC<{ user: Teacher }> = ({ user }) => {
  const students = useMemo(() => getStudents(), []);


  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [week, setWeek] = useState(1);
  const [focusArea, setFocusArea] = useState('');
  const [activities, setActivities] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [records, setRecords] = useState<MeetingRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const visibleRecords = useMemo(
  () => records.filter(r => r.teacherId === user.id),
  [records, user.id]
);

const allStudents = useMemo(() => getStudents(), []);

const myStudents = useMemo(() => {
  return allStudents.filter(s => s.teacherId === user.id);
}, [allStudents, user.id]);



  useEffect(() => {
    const unsubscribe = subscribeToRecords((all) => {
      setRecords(all);
      const existing = all.find(r => r.teacherId === user.id && r.month === month && r.week === week);
      if (existing) {
        setFocusArea(existing.focusArea);
        setActivities(existing.activitiesVolunteered);
        setDiscussion(existing.keyDiscussion);
        setAttendance(existing.attendance);
      } else {
        setFocusArea('');
        setActivities('');
        setDiscussion('');
        setAttendance(
  myStudents.map(s => ({
    studentId: s.id,
    status: AttendanceStatus.PRESENT,
    remarks: ""
  }))
);

      }
    });
    return () => unsubscribe();
  }, [user.id, month, week, myStudents]);

 const handleAttendance = (studentId: string, status: AttendanceStatus) => {
  setAttendance(prev =>
    prev.map(a =>
      a.studentId === studentId
        ? { ...a, status }
        : a
    )
  );
};

// ✅ ADD THIS BELOW (do not replace the above)
const handleRemark = (studentId: string, text: string) => {
  setAttendance(prev =>
    prev.map(a =>
      a.studentId === studentId
        ? { ...a, remarks: text }
        : a
    )
  );
};


  const onShare = async () => {
    setIsSaving(true);
    const newRecord: MeetingRecord = {
      id: `${user.id}-${month}-${week}`,
      teacherId: user.id,
      teacherInitials: user.initials,
      month,
      week,
      attendance,
      focusArea,
      activitiesVolunteered: activities,
      keyDiscussion: discussion,
      timestamp: Date.now()
    };
    try {
      await saveRecordToCloud(newRecord);
      alert("✓ Mentorship Record Published Live!");
    } catch (e) {
      alert("Failed to share. Please check internet connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-100 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-orange-50 pb-8">
            <div>
              <h2 className="text-2xl font-black text-orange-950 flex items-center gap-3"><Icons.Calendar /> Weekly Log</h2>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mt-1">Mentor Session for {user.initials}</p>
            </div>
            <div className="flex gap-3 bg-orange-50/50 p-2 rounded-2xl border border-orange-100">
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-white px-4 py-2 rounded-xl text-xs font-black text-orange-950 border-none outline-none shadow-sm cursor-pointer">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={week} onChange={(e) => setWeek(Number(e.target.value))} className="bg-white px-4 py-2 rounded-xl text-xs font-black text-orange-950 border-none outline-none shadow-sm cursor-pointer">
                {WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-black text-orange-950 uppercase tracking-[0.2em] px-2">Mentee Attendance (Strength: {myStudents.length})</h3>
            <div className="space-y-3">
              {myStudents.map(student => {
  const current = attendance.find(a => a.studentId === student.id)?.status;
  const remark = attendance.find(a => a.studentId === student.id)?.remarks || "";

  return (
    <div key={student.id} className="flex flex-col p-6 rounded-3xl bg-orange-50/30 border-2 border-transparent hover:border-orange-100 transition-all group space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-orange-300 border border-orange-50 group-hover:bg-orange-950 group-hover:text-white transition-all">
            {student.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-orange-950 text-lg">{student.name}</span>
            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
              Grade {student.grade}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4 sm:mt-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {Object.values(AttendanceStatus).map(s => (
            <AttendanceBadge
              key={s}
              status={s}
              active={current === s}
              onClick={() => handleAttendance(student.id, s)}
            />
          ))}
        </div>
      </div>

      {/* ✅ Individual Student Feedback */}
      <div>
        <label className="block text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2">
          Individual Feedback
        </label>
        <textarea
          value={remark}
          onChange={(e) => handleRemark(student.id, e.target.value)}
          placeholder="Write feedback specific to this student..."
          className="w-full p-4 bg-white border-2 border-orange-50 focus:border-orange-400 rounded-2xl outline-none transition-all text-sm font-medium text-orange-950 resize-none"
          rows={2}
        />
      </div>

    </div>
  );
})}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-100 space-y-8">
          <h3 className="text-2xl font-black text-orange-950 flex items-center gap-3">
            <Icons.Clipboard /> Observation Data
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-orange-900 mb-3 uppercase tracking-widest ml-1">
                Focus Area
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={e => setFocusArea(e.target.value)}
                placeholder="e.g. Academic Consistency"
                className="w-full p-5 bg-orange-50/50 border-2 border-orange-50 focus:border-orange-500 rounded-[1.25rem] outline-none transition-all font-bold text-orange-950"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-orange-900 mb-3 uppercase tracking-widest ml-1">
                Activities Volunteered
              </label>
              <textarea
                rows={3}
                value={activities}
                onChange={e => setActivities(e.target.value)}
                placeholder="Roles taken by students..."
                className="w-full p-5 bg-orange-50/50 border-2 border-orange-50 focus:border-orange-500 rounded-[1.25rem] outline-none transition-all font-bold text-orange-950 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-orange-900 mb-3 uppercase tracking-widest ml-1">
                Critical Observations
              </label>
              <textarea
                rows={3}
                value={discussion}
                onChange={e => setDiscussion(e.target.value)}
                placeholder="Session summary..."
                className="w-full p-5 bg-orange-50/50 border-2 border-orange-50 focus:border-orange-500 rounded-[1.25rem] outline-none transition-all font-bold text-orange-950 resize-none"
              />
            </div>
          </div>

          <button
            onClick={onShare}
            disabled={isSaving}
            className="w-full py-6 autumn-gradient text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-orange-100 transition-all active:scale-[0.98] text-xl uppercase tracking-widest disabled:opacity-50"
          >
            {isSaving ? <Icons.Loader /> : <><Icons.Share /> Share Live with House</>}
          </button>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <h3 className="text-xl font-black text-orange-950 px-2 flex items-center gap-3">
          <Icons.Eye /> House Timeline
        </h3>

        <div className="space-y-4 max-h-[1200px] overflow-y-auto pr-2 scrollbar-hide">
          {visibleRecords.sort((a,b) => b.timestamp - a.timestamp).map(record => (

            <div key={record.id} className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm border-l-8 border-l-orange-500">

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black uppercase rounded mb-1 inline-block">
                    Mentor: {record.teacherInitials}
                  </div>
                  <div className="text-lg font-black text-orange-950">
                    {record.month} <span className="text-orange-300">•</span> W{record.week}
                  </div>
                </div>
                <div className="text-[9px] font-black text-slate-300 flex items-center gap-1 uppercase">
                  <Icons.Clock /> {new Date(record.timestamp).toLocaleDateString()}
                </div>
              </div>

              <p className="text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-2xl italic mb-4 leading-relaxed">
                "{record.keyDiscussion || 'Observation shared.'}"
              </p>

              <div className="grid grid-cols-4 gap-2">

                <div className="bg-emerald-50 p-2 rounded-xl text-center">
                  <div className="text-[10px] font-black text-emerald-600 uppercase">P</div>
                  <div className="font-black text-emerald-700">
                    {record.attendance.filter(a => a.status === AttendanceStatus.PRESENT).length}
                  </div>
                </div>

                <div className="bg-rose-50 p-2 rounded-xl text-center">
                  <div className="text-[10px] font-black text-rose-600 uppercase">A</div>
                  <div className="font-black text-rose-700">
                    {record.attendance.filter(a => a.status === AttendanceStatus.ABSENT).length}
                  </div>
                </div>

                <div className="bg-amber-50 p-2 rounded-xl text-center">
                  <div className="text-[10px] font-black text-amber-600 uppercase">L</div>
                  <div className="font-black text-amber-700">
                    {record.attendance.filter(a => a.status === AttendanceStatus.LATE).length}
                  </div>
                </div>

                <div className="bg-sky-50 p-2 rounded-xl text-center">
                  <div className="text-[10px] font-black text-sky-600 uppercase">E</div>
                  <div className="font-black text-sky-700">
                    {record.attendance.filter(a => a.status === AttendanceStatus.EXCUSED).length}
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const HOSDashboard: React.FC<{ 
  teachers: Teacher[];
  students: Student[];
}> = ({ teachers, students }) => {

  const [records, setRecords] = useState<MeetingRecord[]>([]);
  
  const [filterMonth, setFilterMonth] = useState(MONTHS[new Date().getMonth()]);
  const [filterWeek, setFilterWeek] = useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToRecords(setRecords);
    return () => unsubscribe();
  }, []);

  const filtered = records.filter(r => r.month === filterMonth && r.week === filterWeek);
  const stats = useMemo(() => {
    if (filtered.length === 0) return { attendance: 0, reporting: 0 };
    const totalPresent = filtered.reduce((acc, r) => acc + r.attendance.filter(a => a.status === AttendanceStatus.PRESENT).length, 0);
    const totalStudents = filtered.reduce((acc, r) => acc + r.attendance.length, 0);
    return { attendance: Math.round((totalPresent / totalStudents) * 100), reporting: filtered.length };
  }, [filtered]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-950 p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6"><div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white border border-white/20"><Icons.Eye /></div><div><div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Live Attendance</div><div className="text-4xl font-black text-white">{stats.attendance}%</div></div></div>
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-50 shadow-sm flex items-center gap-6"><div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600"><Icons.User /></div><div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reports In</div><div className="text-4xl font-black text-orange-950">{stats.reporting} / {teachers.length}</div></div></div>
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-50 shadow-sm flex flex-col justify-center gap-3">
          <div className="flex gap-2">
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="flex-1 bg-orange-50/50 p-3 rounded-xl text-xs font-black uppercase tracking-widest border-none cursor-pointer">{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
            <select value={filterWeek} onChange={e => setFilterWeek(Number(e.target.value))} className="flex-1 bg-orange-50/50 p-3 rounded-xl text-xs font-black uppercase tracking-widest border-none cursor-pointer">{WEEKS.map(w => <option key={w} value={w}>Week {w}</option>)}</select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[3rem] border-2 border-orange-50 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-orange-50 bg-orange-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div><h3 className="text-2xl font-black text-orange-950 uppercase tracking-tighter">HOS Live Insight Dashboard</h3><p className="text-sm font-bold text-orange-400 uppercase tracking-widest">{filterMonth} Performance • Week {filterWeek}</p></div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-orange-100"><span className="animate-ping w-2.5 h-2.5 bg-emerald-500 rounded-full"></span><span className="text-xs font-black text-slate-600 uppercase tracking-widest">Global Cloud Sync Active</span></div>
        </div><div className="flex gap-4 px-10 py-6 bg-white border-b border-orange-50">
  <button
    onClick={() => exportToCSV(records, students)}
    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
  >
    Download CSV
  </button>

  <button
    onClick={() => exportToWord(records, students)}
    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
  >
    Download Word
  </button>
</div>

        <div className="overflow-x-auto">
  <table className="w-full text-left">
    <thead className="bg-orange-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
      <tr className="border-b border-orange-50">
        <th className="px-10 py-6">Mentor</th>
        <th className="px-10 py-6">Status Counts</th>
        <th className="px-10 py-6">Focus Area</th>
        <th className="px-10 py-6">Key Discussion</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-orange-50">
      {filtered.map(record => (
        <tr key={record.id} className="hover:bg-orange-50/10 transition-all">
          
          <td className="px-10 py-8">
            <div className="w-10 h-10 bg-orange-950 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-md">
              {record.teacherInitials}
            </div>
          </td>

          <td className="px-10 py-8">
            <div className="flex gap-6">
              
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-emerald-600 uppercase">Present</span>
                <span className="text-xl font-black text-emerald-700">
                  {record.attendance.filter(a => a.status === AttendanceStatus.PRESENT).length}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-black text-rose-600 uppercase">Absent</span>
                <span className="text-xl font-black text-rose-700">
                  {record.attendance.filter(a => a.status === AttendanceStatus.ABSENT).length}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-black text-amber-600 uppercase">Late</span>
                <span className="text-xl font-black text-amber-700">
                  {record.attendance.filter(a => a.status === AttendanceStatus.LATE).length}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-black text-sky-600 uppercase">Excused</span>
                <span className="text-xl font-black text-sky-700">
                  {record.attendance.filter(a => a.status === AttendanceStatus.EXCUSED).length}
                </span>
              </div>

            </div>
          </td>

          <td className="px-10 py-8">
            <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-black uppercase tracking-tight shadow-inner">
              {record.focusArea || 'NOT SET'}
            </span>
          </td>

          <td className="px-10 py-8">
            <p className="text-sm font-medium text-slate-500 line-clamp-2 italic leading-relaxed max-w-sm">
              "{record.keyDiscussion}"
            </p>
          </td>

        </tr>
      ))}

      {filtered.length === 0 && (
        <tr>
          <td colSpan={4} className="px-10 py-32 text-center text-orange-300 font-bold uppercase tracking-widest opacity-30">
            Awaiting Mentor Submissions
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [user, setUser] = useState<Teacher | null>(null);
  const [teachers] = useState<Teacher[]>(getTeachers());
  const students = useMemo(() => getStudents(), []);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) setUser(saved);
    setInitialized(true);
  }, []);

  if (!initialized) return null;
  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); setCurrentUser(u); }} />;

  return (
    <div className="min-h-screen pb-24 selection:bg-orange-500 selection:text-white">
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-orange-100 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4"><div className="w-12 h-12 autumn-gradient rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div><div><h1 className="text-xl font-black text-orange-950 tracking-tighter uppercase leading-none">GSIS Autumn House</h1><div className="flex items-center gap-2 mt-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span><p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Global Cloud Portal</p></div></div></div>
          <div className="flex items-center gap-6"><div className="hidden lg:flex items-center gap-4 bg-orange-50/50 px-6 py-3 rounded-2xl border border-orange-100"><div className="flex flex-col items-end"><span className="text-[9px] font-black text-orange-950 uppercase">{user.isHOS ? 'Head of School' : 'House Mentor'}</span><span className="text-[10px] font-black text-emerald-600 uppercase">Active: {user.initials}</span></div></div><button onClick={() => { setUser(null); setCurrentUser(null); }} className="p-4 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all border border-rose-100"><Icons.Logout /></button></div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-8 mt-12">
  {user.isHOS ? <HOSDashboard teachers={teachers} students={students} />
 : <TeacherDashboard user={user} />}
</main>

      <footer className="max-w-7xl mx-auto px-8 mt-32 text-center border-t border-orange-100 pt-12"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">GSIS Autumn House Mentorship Portal • v1.0 Live</p></footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
