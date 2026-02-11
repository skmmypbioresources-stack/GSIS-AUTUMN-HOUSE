import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { Teacher, Student, MeetingRecord, TEACHER_INITIALS } from "../types";

/* =========================
   FIREBASE CONFIG (SAFE)
   ========================= */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   LOCAL STORAGE (LOGIN)
   ========================= */
const STORAGE_KEY_USER = "gsis_autumn_user_v1";

/* =========================
   STUDENT MASTER LIST
   (UNCHANGED – UI DEPENDS ON THIS)
   ========================= */
const STUDENT_MASTER_LIST: Record<string, { name: string; grade: string }[]> = {
  RZ: [
    { name: "Aadit Vinyaka Parthiban", grade: "PYP 4" },
    { name: "Vishal Gowda", grade: "PYP 4" },
    { name: "Advik A", grade: "PYP 4" },
    { name: "Riya Pachipula", grade: "PYP 4" },
    { name: "Rushil Naik", grade: "PYP 5" },
    { name: "Shashank Karthickyen", grade: "PYP 5" },
  ],

  MVS: [
    { name: "Shayam Rangpriya", grade: "PYP 5" },
    { name: "Kummithi Shanmukha Sai Reddy", grade: "PYP 5" },
    { name: "Kiaan Sameer Patel", grade: "PYP 5" },
    { name: "Takshvee Manok Kumar", grade: "PYP 5" },
    { name: "Anjana Harikrishnan", grade: "PYP 5" },
  ],

  PCN: [
    { name: "Ved Neeraj Znvar", grade: "IGCSE 10B" },
    { name: "Aarav Manoj Jangid", grade: "ICSE 10A" },
    { name: "Kanishk Garg", grade: "ICSE 10A" },
    { name: "Yashvanth Kumar PJ", grade: "ICSE 10B" },
    { name: "Tejas Surana", grade: "IGCSE 10B" },
    { name: "Aaryaman Harlaka", grade: "ICSE 10B" },
  ],

  GGR: [
    { name: "Yasvi Kataria", grade: "IB 12A" },
    { name: "Irene Anna Shabu", grade: "IB 12C" },
    { name: "Pooja E", grade: "ISC 12B" },
    { name: "Tanushiri S", grade: "ISC 12B" },
    { name: "Tishya Agarwal", grade: "IB 12B" },
  ],

  CDS: [
    { name: "Nitya Kabra", grade: "IB 11B" },
    { name: "Preha Piyush Bhai Patel", grade: "IB 11B" },
    { name: "Aarya Manglani", grade: "IB 11A" },
    { name: "Sanskriti Shiv Agarwal", grade: "ISC 11A" },
    { name: "Eva Koradia", grade: "ISC 11A" },
    { name: "Nandika Ramprabhu", grade: "ISC 12B" },
  ],

  BNG: [
    { name: "Harshith Kumar PS", grade: "ISC 11A" },
    { name: "Aarav S Salunkhe", grade: "IB 11B" },
    { name: "Roshan Rony", grade: "ISC 11A" },
    { name: "Kousthav Krishnamurthy", grade: "ISC 11A" },
    { name: "Ruhaan Singh", grade: "IB 11A" },
    { name: "Vyan Thiagu", grade: "IB 11B" },
  ],

  SUS: [
    { name: "Sarthak Modi", grade: "IGCSE 10A" },
    { name: "Manthan Ranmani", grade: "ICSE 10B" },
    { name: "Sanskar Agarwal", grade: "ICSE 10B" },
    { name: "Aakarsh Goyal", grade: "IB 10A" },
    { name: "Parikshit Singh Rana", grade: "ICSE 10B" },
    { name: "Jayasimha Chowdary", grade: "ISC 11A" },
  ],

  KLP: [
    { name: "S Krishna Prasad", grade: "IB 11A" },
    { name: "Yug Kothari", grade: "IB 12B" },
    { name: "Yuvraj Aggarwal", grade: "IB 12C" },
    { name: "Manav Alkesh Patel", grade: "IB 12D" },
  ],

  DPI: [
    { name: "Vyom Gupta", grade: "ICSE 8B" },
    { name: "Jayesh Prahiladka", grade: "ICSE 8A" },
    { name: "Hridaan Agarwal", grade: "IGCSE 8B" },
    { name: "Reyansh Jiwani", grade: "IB 8C" },
    { name: "Navdeep Chhabra", grade: "ICSE 9B" },
  ],

  MJS: [
    { name: "Diva Adeshra", grade: "IB 9A" },
    { name: "Shanaya Sameer Doshi", grade: "IGCSE 9B" },
    { name: "Vaidehi Anand", grade: "IB 9B" },
    { name: "Nina Ashwin Gandhi", grade: "IB 9B" },
    { name: "Aashi Akabari", grade: "IGCSE 9B" },
  ],

  SRL: [
    { name: "Suhavi Kaur Saluja", grade: "ICSE 8B" },
    { name: "Anant Singh Arora", grade: "IB 8C" },
    { name: "Ryann Francy Joseph", grade: "IB 8B" },
    { name: "Tanushree Anand Agarwal", grade: "ICSE 8B" },
    { name: "Neev Nirav Patel", grade: "IB 8C" },
    { name: "Lakshya Agarwal", grade: "IGCSE 8A" },
    { name: "Grihitha Srinivas Gowda", grade: "IB 8A" },
  ],

  RSH: [
    { name: "Akshay Datta Bolisetti", grade: "ISC 12A" },
    { name: "K R Sanjith", grade: "ISC 12A" },
    { name: "Mithuran Dhayanad H", grade: "IB 12A" },
    { name: "Neel Kumar Haresh Gamara", grade: "IB 12B" },
    { name: "Rajvir Vishaal Chordia", grade: "IB 12C" },
  ],

  SEL: [
    { name: "Fiona Hardik Patel", grade: "IB 10A" },
    { name: "Alapati Ambica Rupika", grade: "ICSE 10A" },
    { name: "Siya Jindal", grade: "IGCSE 10B" },
    { name: "Dhruvi Agarwal", grade: "IB 10A" },
    { name: "Dhanya Elangovan Arumugam", grade: "IB 10A" },
    { name: "J Sharon Lourdes", grade: "ICSE 10A" },
  ],

  KPA: [
    { name: "Jinanshi Jain", grade: "IB 9B" },
    { name: "Nainesha Reddy Gunreddy", grade: "IB 9B" },
    { name: "Pragati Nand Kumar", grade: "ICSE 9B" },
    { name: "Vidusshi Jain", grade: "IB 9B" },
    { name: "Tiara Agarwal", grade: "IB 9A" },
    { name: "Raelynn Benecia Anthony", grade: "ICSE 8" },
  ],

  AA: [
    { name: "Johan Mathew Sareen", grade: "IB 7A" },
    { name: "Avni Samara", grade: "IB 7A" },
    { name: "Neerja Nayani", grade: "IB 7B" },
    { name: "S Lacshit Naarayanan", grade: "IB 7B" },
    { name: "Shiv Rama Chandra Saddigale", grade: "IB 7B" },
    { name: "Prisha Rahul Mangukia", grade: "IB 7A" },
  ],

  RTH: [
    { name: "Disha Khirwal", grade: "ICSE 8A" },
    { name: "Siya Kiran Gali", grade: "IB 8A" },
    { name: "Gaurangi Bhanot", grade: "IB 8B" },
    { name: "Nishika Juneja", grade: "IB 8A" },
    { name: "Keeyan Mahajan", grade: "IGCSE 8A" },
  ],

  SYB: [
    { name: "Inaaya Dina Rawthar", grade: "IB 6" },
    { name: "Thaneeksha Gowda R", grade: "IB 6" },
    { name: "Kakarla Ranga", grade: "IB 6" },
    { name: "Vivvan Kaul", grade: "IB 6" },
    { name: "Shanya Khemka", grade: "IGCSE 6" },
    { name: "Jentri Amrathian", grade: "ICSE 6" },
  ],

  AJM: [
    { name: "Samnyu Gali", grade: "IB 6" },
    { name: "Dhyani Birju Gala", grade: "IGCSE 6" },
    { name: "Krishang Singh Panwar", grade: "ICSE 6" },
    { name: "Mihir Solanki", grade: "IB 6" },
    { name: "Jenish Siddarth Patel", grade: "IB 6" },
  ],

  AKY: [
    { name: "Vivaan Agarwal", grade: "IGCSE 7A" },
    { name: "Arav Ghuna R", grade: "IGCSE 7A" },
    { name: "Shanaya Seth", grade: "IGCSE 7A" },
    { name: "Gowtham S", grade: "IB 7A" },
    { name: "Vivan Ajmera", grade: "ICSE 7A" },
    { name: "Dhruthi P", grade: "ICSE 7A" },
  ],

  TJ: [
    { name: "Zayaan Mansuri", grade: "IB 8C" },
    { name: "Anikait Singhania", grade: "ICSE 8B" },
    { name: "Jilay Hitesh Sardhara", grade: "IB 8C" },
    { name: "Samar Agarwal", grade: "IB 8A" },
    { name: "Swwarah Agarwal", grade: "IGCSE 8B" },
    { name: "Siddanth Chowdary", grade: "ICSE 8A" },
    { name: "Manthri Hanvish Reddy", grade: "IGCSE 8B" },
    { name: "Virat Giri Pathapati", grade: "IGCSE 8B" },
    { name: "Daksh Ritesh", grade: "ICSE 8B" },
  ],

  SDT: [
    { name: "Sasank Balam", grade: "IGCSE 8B" },
    { name: "Aaryan Kansagra", grade: "IB 8B" },
    { name: "Athrav Arunil", grade: "IGCSE 9B" },
    { name: "Ishaan Vinayak Parthiban", grade: "IGCSE 9A" },
    { name: "Shourya Rahul Mane", grade: "IB 9A" },
  ],

  VNK: [
    { name: "Vihaan Chopra", grade: "IGCSE 10B" },
    { name: "Nanajappa", grade: "IGCSE 10A" },
    { name: "Maitik Bharat Aghara", grade: "IGCSE 10A" },
    { name: "Rachit Gupta", grade: "IGCSE 10A" },
    { name: "Aahan Aditya Kharwa", grade: "IGCSE 10B" },
    { name: "Prajwal Sahoo", grade: "IB 10A" },
  ],

  AMC: [
    { name: "Yuvraj Sahu", grade: "IB 7A" },
    { name: "Reyansh Kasyap Majethia", grade: "IGCSE 7A" },
    { name: "Aarush Bodhaasu", grade: "IB 7A" },
    { name: "Prakshi Lunawat", grade: "ICSE 7A" },
    { name: "Nalini Ramakrishna", grade: "ICSE 7A" },
    { name: "Jagdeesh Shaik C", grade: "ICSE 7A" },
    { name: "Venkata Jahanvi Reddy", grade: "IGCSE 7A" },
  ],

  SKM: [
    { name: "Bhavik Reddy L", grade: "IGCSE 9A" },
    { name: "Kuldip Dubisetty", grade: "IB 9A" },
    { name: "Sagar Singh", grade: "ICSE 9A" },
    { name: "Aswini Ivaan Bagaria", grade: "ICSE 9A" },
    { name: "Maanvik Reddy", grade: "IGCSE 9A" },
  ],

  CMW: [
    { name: "Keyvhan Dannish Chotani", grade: "GCSE 9A" },
    { name: "Rehann Lajwanti Puraswami", grade: "IGCSE 9B" },
    { name: "Yuvan Satish", grade: "IGCSE 9A" },
    { name: "Derek Mathew Vargese", grade: "ICSE 9B" },
    { name: "Aarav Kailah Kattepur", grade: "ICSE 9B" },
    { name: "Surya Pratap Singh", grade: "IGCSE 9A" },
    { name: "Vishvin Prakash Jayrani", grade: "IGCSE 10A" },
  ],

  AR: [
    { name: "Harshith Kumar PS", grade: "ISC 11A" },
    { name: "Aarav S Salunkhe", grade: "IB 11B" },
    { name: "Roshan Rony", grade: "ISC 11A" },
    { name: "Kousthav Krishnamurthy", grade: "ISC 11A" },
    { name: "Ruhaan Singh", grade: "IB 11A" },
    { name: "Vyan Thiagu", grade: "IB 11B" },
  ],

  NMI: [
    { name: "Nived Vikas Ganna", grade: "ISC 12B" },
    { name: "Sparsh Agarwal", grade: "IB 12A" },
    { name: "Vismaya Grade Sajan", grade: "ISC 12A" },
    { name: "Kashvee Manish Dattani", grade: "ISC 12A" },
  ],

  ADR: [
    { name: "Harshil Himanshu Agarwal", grade: "IGCSE 9B" },
    { name: "Abhirup Paul", grade: "IGCSE 9A" },
    { name: "Yaj Sunit Patel", grade: "MYP 4" },
    { name: "Tejeshwar Reddy Kummithi", grade: "MYP 4" },
  ],
};

  



/* =========================
   TEACHERS (UI LOGIN)
   ========================= */
export const getTeachers = (): Teacher[] => {
  return TEACHER_INITIALS.map((initials) => ({
    id: initials,
    initials,
  }));
};

/* =========================
   STUDENTS (ATTENDANCE UI)
   ========================= */
export const getStudents = (): Student[] => {
  const students: Student[] = [];

  console.log("STUDENT_MASTER_LIST =", STUDENT_MASTER_LIST);

  TEACHER_INITIALS.forEach((teacherId) => {
    const list = STUDENT_MASTER_LIST[teacherId];

    console.log("Teacher:", teacherId, "Students:", list);

    if (!list) return;

    list.forEach((s, index) => {
      students.push({
        id: `S-${teacherId}-${index}`,
        name: s.name,
        grade: s.grade,
        teacherId,
      });
    });
  });

  console.log("FINAL students =", students);
  return students;
};


/* =========================
   FIREBASE: SAVE RECORD
   (NO UI CHANGE)
   ========================= */
export const saveRecordToCloud = async (
  record: MeetingRecord
): Promise<void> => {
  const id = `${record.teacherId}-${record.month}-${record.week}`;
  await setDoc(doc(db, "records", id), record);
};

/* =========================
   FIREBASE: LIVE SUBSCRIBE
   (HOUSE TIMELINE)
   ========================= */
export const subscribeToRecords = (
  callback: (records: MeetingRecord[]) => void
) => {
  const q = query(
    collection(db, "records"),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(
      (doc) => doc.data() as MeetingRecord
    );
    callback(records);
  });
};

/* =========================
   LOGIN SESSION (LOCAL)
   ========================= */
export const getCurrentUser = (): Teacher | null => {
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  return raw ? JSON.parse(raw) : null;
};

export const setCurrentUser = (user: Teacher | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
};
