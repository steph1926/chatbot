// ============= ROUTING & NAVIGATION =============
import { state } from './state.js';
import { renderSidebars } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderAdminPage } from './admin.js';
import { renderStudentPage } from './student.js';

export function showPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  renderSidebars();

  // Render dynamic page content
  if (page === 'chat') renderChat();
  if (page.startsWith('admin-')) renderAdminPage(page);
  if (['chat-history', 'search-chat'].includes(page)) renderStudentPage(page);
  if (page === 'announcements') renderStudentPage(page);
  if (page === 'events') renderStudentPage(page);
}

export function openMobile() {
  document.getElementById('mobile-overlay').classList.remove('hidden');
}

export function closeMobile() {
  document.getElementById('mobile-overlay').classList.add('hidden');
}

export function openHistory() {
  document.getElementById('history-overlay').classList.remove('hidden');
}

export function closeHistory() {
  document.getElementById('history-overlay').classList.add('hidden');
}
