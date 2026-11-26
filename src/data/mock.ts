
export type Course = {
  id: number;
  name: string;
  days: number;
  price: number;
  icon: string;
  videos: string[];
};

// ==========================================
// COURSE DATA
// ==========================================

export const courses: Course[] = [
  {
    id: 1,
    name: "Professional Makeup",
    days: 7,
    price: 14999,
    icon: "💄",
    videos: [
      "Skin prep & tools",
      "Base & contouring",
      "Eye makeup",
      "Bridal look",
      "HD & airbrush",
      "Final styling & assessment",
    ],
  },
  {
    id: 2,
    name: "Hair Styling",
    days: 2,
    price: 3999,
    icon: "💇‍♀️",
    videos: [
      "Hair types & prep",
      "Blow-dry & curls",
      "Party updos",
    ],
  },
  {
    id: 3,
    name: "Nail Art",
    days: 1,
    price: 1999,
    icon: "💅",
    videos: [
      "Nail shaping & care",
      "Gel art designs",
    ],
  },
  {
    id: 4,
    name: "Saree Pleating",
    days: 1,
    price: 999,
    icon: "🥻",
    videos: [
      "Draping basics",
      "Pleating & pinning",
    ],
  },
];

// ==========================================
// COURSE HELPER
// ==========================================

export const getCourse = (id: number) =>
  courses.find((course) => course.id === id);

// ==========================================
// ENROLLMENT DATA
// ==========================================

const H = 60 * 60 * 1000;

export const enrolled = [
  {
    courseId: 1,
    msLeft: 5.4 * 24 * H,
    done: 2,
  },
  {
    courseId: 2,
    msLeft: 30 * H,
    done: 0,
  },
  {
    courseId: 3,
    msLeft: 0,
    done: 2,
  },
];

// ==========================================
// STUDENT DATA
// ==========================================

export const students = [
  {
    id: 1,
    name: "Anjali R",
    email: "anjali@mail.com",
    phone: "98765 43210",
    courses: [1, 2],
  },
  {
    id: 2,
    name: "Meena S",
    email: "meena@mail.com",
    phone: "98411 22003",
    courses: [3],
  },
  {
    id: 3,
    name: "Divya K",
    email: "divya@mail.com",
    phone: "90030 55667",
    courses: [4, 2],
  },
];

// ==========================================
// LIVE CLASSES
// ==========================================

export const liveClasses = [
  {
    id: 1,
    title: "Bridal Makeup Masterclass",
    when: "Sat, 28 Nov · 6:00 PM",
    freq: "Weekly",
  },
  {
    id: 2,
    title: "Hair Styling Q&A",
    when: "Sat, 12 Dec · 5:00 PM",
    freq: "Monthly",
  },
];

// ==========================================
// CLASS RECORDINGS
// ==========================================

export const recordings = [
  {
    id: 1,
    title: "Contour Live Session",
    when: "14 Nov",
    course: "Not added",
  },
  {
    id: 2,
    title: "Nail Art Special",
    when: "31 Oct",
    course: "Nail Art",
  },
];
