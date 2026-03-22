// ============= UTILITY HELPERS =============
export function uuid() {
  return crypto.randomUUID();
}

export function renderMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function getBotReply(msg) {
  const l = msg.toLowerCase();
  if (l.includes('enroll', 'enrollment')) return "To enroll for the next semester, visit the Registrar's Office or log in to the student portal. Make sure to check the enrollment schedule and prepare your required documents.";
  if (l.includes('admission') || l.includes('requirements')) return "Freshmen applicants need to submit: Form 138 (Report Card), Certificate of Good Moral Character, PSA Birth Certificate, 2x2 ID photos, and a filled-out application form.";
  if (l.includes('course') || l.includes('program')) return "UDM offers programs in Business, Education, Engineering, IT, Nursing, and more. Visit the Admissions page for a complete list of degree programs.";
  if (l.includes('uniform') || l.includes('civilian')) return "Students are required to wear the prescribed uniform on regular school days. Civilian clothing is allowed only on designated 'wash days' or special events.";
  if (l.includes('registrar')) return "You can reach the Registrar's Office at the main campus ground floor. For inquiries, email registrar@udm.edu.ph or call (02) 8123-4567.";
  if (l.includes('gwa') || l.includes('average')) return "Your GWA is computed by multiplying each grade by its unit credit, summing them up, then dividing by the total units. Check the student portal for your computed GWA.";
  return "Thank you for your question! I'll do my best to help. Could you provide more details so I can give you a more accurate answer?";
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

export function formatDay(dateStr) {
  return new Date(dateStr).getDate().toString().padStart(2, '0');
}

export function highlightText(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-foreground rounded px-0.5">$1</mark>');
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
