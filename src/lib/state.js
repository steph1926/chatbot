// ============= GLOBAL STATE & MOCK DATA =============

export const MOCK_USERS = [
  { email: 'admin@university.edu', password: 'admin123', role: 'admin', name: 'Admin User' },
];

// Registered students stored here (mock database)
export const registeredStudents = [
  { studentNumber: '24-22-241', password: 'student123', name: 'Stephanie', program: 'BS Information Technology', role: 'student' },
];

export const state = {
  currentUser: null,
  conversations: [],
  activeId: null,
  isSignUp: false,
  showPassword: false,
  sidebarCollapsed: false,
  currentPage: 'chat',
  announcements: [
    { id: 'a1', title: 'Enrollment Period Open', body: "The enrollment period for the 2nd semester is now open. Please visit the registrar's office or enroll online through the student portal.", source: 'Registrar Office', date: '2026-03-01', featured: true },
    { id: 'a2', title: 'Library Hours Extended', body: 'The university library will extend its hours to 10 PM starting this week to accommodate students preparing for midterms.', source: 'Library Services', date: '2026-02-28', featured: false },
    { id: 'a3', title: 'Scholarship Application Deadline', body: 'Reminder: The deadline for merit-based scholarship applications is March 15, 2026. Submit your forms to the financial aid office.', source: 'Financial Aid', date: '2026-02-25', featured: false },
    { id: 'a4', title: 'Uniform Policy Reminder', body: 'Students are reminded to wear the prescribed university uniform on regular class days. Civilian clothing is only allowed on designated wash days.', source: 'Student Affairs', date: '2026-02-20', featured: false },
    { id: 'a5', title: 'Campus Wi-Fi Maintenance', body: 'The campus Wi-Fi will undergo scheduled maintenance on March 12, 2026 from 12:00 AM to 5:00 AM. Please save your work accordingly.', source: 'IT Department', date: '2026-02-18', featured: false },
  ],
  events: [
    { id: 'e1', title: 'Foundation Day Celebration', description: "Join us as we celebrate the university's founding anniversary with cultural performances, exhibits, and a grand alumni homecoming.", date: '2026-03-15', time: '8:00 AM - 5:00 PM', location: 'University Main Campus', featured: true },
    { id: 'e2', title: 'Career Fair 2026', description: 'Meet top employers and explore internship and job opportunities. Bring your resume and dress professionally.', date: '2026-03-20', time: '9:00 AM - 4:00 PM', location: 'University Gymnasium', featured: false },
    { id: 'e3', title: 'Intramurals Opening', description: 'Kick off the annual intramural sports competition. Events include basketball, volleyball, badminton, and track & field.', date: '2026-03-25', time: '7:00 AM - 6:00 PM', location: 'Sports Complex', featured: false },
    { id: 'e4', title: 'Science & Tech Expo', description: 'Showcase of student research projects, robotics demonstrations, and tech talks from industry professionals.', date: '2026-04-02', time: '10:00 AM - 3:00 PM', location: 'Engineering Building', featured: false },
    { id: 'e5', title: 'University Week', description: 'A week-long celebration featuring academic competitions, talent shows, food fairs, and the Mr. & Ms. University pageant.', date: '2026-04-10', time: 'All Day', location: 'Entire Campus', featured: false },
  ],
  chatLogs: [],
  knowledgeBase: [
    { id: 'kb1', question: 'How do I enroll?', answer: "Visit the Registrar's Office or log in to the student portal." },
    { id: 'kb2', question: 'What are the admission requirements?', answer: 'Form 138, Certificate of Good Moral Character, PSA Birth Certificate, 2x2 ID photos, and application form.' },
    { id: 'kb3', question: 'What courses does UDM offer?', answer: 'Business, Education, Engineering, IT, Nursing, and more.' },
    { id: 'kb4', question: 'Can I wear civilian clothes?', answer: 'Only on designated wash days or special events.' },
    { id: 'kb5', question: 'How to compute GWA?', answer: 'Multiply each grade by unit credit, sum them, divide by total units.' },
  ],
};

export const WELCOME_MSG = "Hello! 👋 I'm your **University Assistant**. I can help you with enrollment, schedules, tuition, campus services, and more. How can I help you today?";

export const SUGGESTED_QUESTIONS = [
  "How do I enroll for the next semester?",
  "What courses or degree programs does UDM offer?",
  "Can I wear civilian clothes instead of the uniform?",
  "What are the admission requirements for freshmen?",
  "Who do I contact for registrar concerns?",
  "How do I compute my General Weighted Average (GWA)?",
];

