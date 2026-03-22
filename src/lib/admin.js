// ============= ADMIN PANEL LOGIC =============
import { state } from './state.js';
import { uuid, formatDate } from './utils.js';
import { renderSidebars } from './sidebar.js';

export function renderAdminPage(page) {
  const container = document.getElementById('page-' + page);
  if (!container) return;

  switch (page) {
    case 'admin-dashboard': renderDashboard(container); break;
    case 'admin-responses': renderResponses(container); break;
    case 'admin-chatlogs': renderChatLogs(container); break;
    case 'admin-announcements': renderAdminAnnouncements(container); break;
    case 'admin-events': renderAdminEvents(container); break;
    case 'admin-settings': renderSettings(container); break;
  }
  lucide.createIcons();
}

function getDailyUsageFromLogs() {
  let logs = [];
  try { logs = JSON.parse(localStorage.getItem('chatLogs') || '[]'); } catch (_) {}
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  // Count today's day for each log entry (simplified since we don't store timestamps in localStorage)
  const today = days[new Date().getDay()];
  counts[today] = logs.length;
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, count: counts[day] }));
}

function renderDashboard(el) {
  let chatLogsCount = 0;
  try { chatLogsCount = JSON.parse(localStorage.getItem('chatLogs') || '[]').length; } catch (_) {}
  const totalChats = chatLogsCount;
  const kbEntries = state.knowledgeBase.length;
  const annCount = state.announcements.length;
  const upcomingEvents = state.events.filter(e => new Date(e.date) >= new Date()).length;
  const usage = getDailyUsageFromLogs();
  const maxUsage = Math.max(...usage.map(d => d.count), 1);

  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Admin Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">Overview of your university AI assistant</p>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <i data-lucide="message-square" class="h-5 w-5 text-primary"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-card-foreground font-space">${totalChats}</p>
          <p class="text-xs text-muted-foreground mt-1">Total Chats</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <i data-lucide="database" class="h-5 w-5 text-primary"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-card-foreground font-space">${kbEntries}</p>
          <p class="text-xs text-muted-foreground mt-1">Knowledge Base Entries</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <i data-lucide="bell" class="h-5 w-5 text-primary"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-card-foreground font-space">${annCount}</p>
          <p class="text-xs text-muted-foreground mt-1">Announcements</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <i data-lucide="calendar-days" class="h-5 w-5 text-primary"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-card-foreground font-space">${upcomingEvents}</p>
          <p class="text-xs text-muted-foreground mt-1">Upcoming Events</p>
        </div>
      </div>

      <!-- Daily Usage Chart (from chat logs) -->
      <div class="bg-card rounded-xl border border-border p-6">
        <h2 class="text-lg font-semibold text-card-foreground font-space mb-1">Student Questions Activity</h2>
        <p class="text-xs text-muted-foreground mb-4">Questions asked per day this week (from chat logs)</p>
        <div class="flex items-end gap-3 h-48">
          ${usage.map(d => `
            <div class="flex-1 flex flex-col items-center gap-2">
              <span class="text-xs font-medium text-muted-foreground">${d.count}</span>
              <div class="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary" style="height: ${d.count === 0 ? '4px' : (d.count / maxUsage) * 100 + '%'}; min-height: 4px;"></div>
              <span class="text-xs font-medium text-muted-foreground">${d.day}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  </div>`;
}

function renderResponses(el) {
  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Manage Responses</h1>
          <p class="text-sm text-muted-foreground mt-1">Edit chatbot knowledge base entries</p>
        </div>
        <button id="add-response-btn" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-accent transition-colors">
          <i data-lucide="plus" class="h-4 w-4"></i> Add Entry
        </button>
      </div>

      <!-- Add/Edit Form (hidden by default) -->
      <div id="response-form-wrapper" class="hidden mb-6">
        <div class="bg-card rounded-xl border border-border p-5">
          <h3 id="response-form-title" class="text-sm font-semibold text-card-foreground mb-3 font-space">Add New Entry</h3>
          <div class="space-y-3">
            <input id="response-question" type="text" placeholder="Question / Trigger keyword" class="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <textarea id="response-answer" placeholder="Bot response" rows="3" class="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
            <div class="flex gap-2">
              <button id="response-save-btn" class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-accent transition-colors">Save</button>
              <button id="response-cancel-btn" class="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
          <input type="hidden" id="response-edit-id" value="" />
        </div>
      </div>

      <div id="responses-list" class="space-y-3">
        ${state.knowledgeBase.map(kb => `
          <div class="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-card-foreground font-space mb-1">${kb.question}</h3>
                <p class="text-xs text-muted-foreground leading-relaxed">${kb.answer}</p>
              </div>
              <div class="flex gap-1 ml-3 shrink-0">
                <button data-edit-kb="${kb.id}" class="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <i data-lucide="pencil" class="h-3.5 w-3.5"></i>
                </button>
                <button data-delete-kb="${kb.id}" class="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                  <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>
  </div>`;

  // Bind events
  const formWrapper = document.getElementById('response-form-wrapper');
  const qInput = document.getElementById('response-question');
  const aInput = document.getElementById('response-answer');
  const editId = document.getElementById('response-edit-id');

  document.getElementById('add-response-btn').addEventListener('click', () => {
    document.getElementById('response-form-title').textContent = 'Add New Entry';
    qInput.value = ''; aInput.value = ''; editId.value = '';
    formWrapper.classList.remove('hidden');
  });

  document.getElementById('response-cancel-btn').addEventListener('click', () => {
    formWrapper.classList.add('hidden');
  });

  document.getElementById('response-save-btn').addEventListener('click', () => {
    const q = qInput.value.trim();
    const a = aInput.value.trim();
    if (!q || !a) return;
    if (editId.value) {
      const kb = state.knowledgeBase.find(k => k.id === editId.value);
      if (kb) { kb.question = q; kb.answer = a; }
    } else {
      state.knowledgeBase.push({ id: uuid(), question: q, answer: a });
    }
    renderResponses(el);
    lucide.createIcons();
  });

  el.querySelectorAll('[data-edit-kb]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kb = state.knowledgeBase.find(k => k.id === btn.dataset.editKb);
      if (!kb) return;
      document.getElementById('response-form-title').textContent = 'Edit Entry';
      qInput.value = kb.question; aInput.value = kb.answer; editId.value = kb.id;
      formWrapper.classList.remove('hidden');
    });
  });

  el.querySelectorAll('[data-delete-kb]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.knowledgeBase = state.knowledgeBase.filter(k => k.id !== btn.dataset.deleteKb);
      renderResponses(el);
      lucide.createIcons();
    });
  });
}

function renderChatLogs(el) {
  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem('chatLogs') || '[]');
  } catch (_) {}

  const sortedLogs = [...logs].reverse();

  function saveChatLog(studentNumber, question, response) {
    let logs = JSON.parse(localStorage.getItem('chatLogs') || '[]');
    logs.push({
      studentNumber,
      question,
      response,
      timestamp: Date.now()
    });
    localStorage.setItem('chatLogs', JSON.stringify(logs));
  }

  el.innerHTML = `
    <div class="flex-1 overflow-y-auto bg-background">
      <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">
              Student Chat Logs
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              View all student questions sent to the AI assistant
            </p>
          </div>

          ${sortedLogs.length > 0 ? `
            <button id="clear-chatlogs-btn"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/80 transition-colors">
              Clear Logs
            </button>
          ` : ''}
        </div>

        ${sortedLogs.length === 0
          ? `<div class="bg-card rounded-xl border border-border p-8 text-center">
               <p class="text-muted-foreground text-sm">
                 No chat logs yet. Logs will appear here when students use the chatbot.
               </p>
             </div>`
          : `
          <!-- Desktop table -->
          <div class="hidden sm:block bg-card rounded-xl border border-border overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border bg-muted/50">
                    <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Student Number</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Question</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">AI Response</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date and Time</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  ${sortedLogs.map((log, index) => {
                    const d = log.timestamp ? new Date(log.timestamp) : null;
                    const formatted = d && !isNaN(d.getTime())
                      ? d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
                        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'No date';

                    return `
                      <tr class="hover:bg-muted/30 transition-colors">
                        <td class="px-4 py-3 font-medium whitespace-nowrap">${log.studentNumber}</td>
                        <td class="px-4 py-3 max-w-xs truncate">${log.question}</td>
                        <td class="px-4 py-3 text-muted-foreground max-w-xs truncate">${log.response}</td>
                        <td class="px-4 py-3 text-muted-foreground whitespace-nowrap">${formatted}</td>
                        <td class="px-4 py-3">
                          <button data-index="${index}" class="view-details-btn text-primary hover:underline text-sm">View Details</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mobile cards -->
          <div class="sm:hidden space-y-3">
            ${sortedLogs.map((log, index) => {
              const d = log.timestamp ? new Date(log.timestamp) : null;
              const formatted = d && !isNaN(d.getTime())
                ? d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
                  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'No date';

              return `
                <div class="bg-card rounded-xl border border-border p-4">
                  <p class="text-xs text-muted-foreground">Student Number</p>
                  <p class="text-sm font-medium mb-2">${log.studentNumber}</p>

                  <p class="text-xs text-muted-foreground">Question</p>
                  <p class="text-sm mb-2 truncate">${log.question}</p>

                  <p class="text-xs text-muted-foreground">AI Response</p>
                  <p class="text-sm text-muted-foreground mb-2 truncate">${log.response}</p>

                  <p class="text-xs text-muted-foreground">Date & Time</p>
                  <p class="text-xs text-muted-foreground">${formatted}</p>

                  <button data-index="${index}" class="view-details-btn text-primary hover:underline text-sm mt-2">View Details</button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </main>

      <!-- Modern Chat Details Modal -->
      <div id="chatlog-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
          <!-- Close button -->
          <button id="close-modal" 
                  class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">
            ×
          </button>

          <!-- Modal Header -->
          <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Chat Details</h2>

          <!-- Modal Content with Cards -->
          <div id="modal-content" class="space-y-5">
            <div class="bg-blue-50 p-4 rounded-xl shadow-sm">
              <p class="text-xs text-blue-700 font-semibold">Student Number</p>
              <p class="text-sm text-gray-900" id="modal-studentNumber"></p>
            </div>

            <div class="bg-yellow-50 p-4 rounded-xl shadow-sm">
              <p class="text-xs text-yellow-700 font-semibold">Question</p>
              <p class="text-sm text-gray-900" id="modal-question"></p>
            </div>

            <div class="bg-green-50 p-4 rounded-xl shadow-sm">
              <p class="text-xs text-green-700 font-semibold">AI Response</p>
              <p class="text-sm text-gray-900" id="modal-response"></p>
            </div>

            <div class="bg-gray-50 p-2 rounded-lg text-right text-gray-500 text-xs">
              <span id="modal-timestamp"></span>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      </style>
  `;

  // Clear logs button
  document.getElementById('clear-chatlogs-btn')?.addEventListener('click', () => {
    localStorage.removeItem('chatLogs');
    renderChatLogs(el);
  });

  // Modal functionality
  const modal = document.getElementById('chatlog-modal');
  const closeModalBtn = document.getElementById('close-modal');

document.querySelectorAll('.view-details-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const index = btn.dataset.index;
    const log = sortedLogs[index];

    // Format timestamp correctly
    let formattedDate = 'No date';
    if (log.timestamp) {
      const d = new Date(log.timestamp);
      if (!isNaN(d.getTime())) {
        formattedDate =
          d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' ' +
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }

    // Populate modal
    document.getElementById('modal-studentNumber').textContent = log.studentNumber;
    document.getElementById('modal-question').textContent = log.question;
    document.getElementById('modal-response').textContent = log.response;
    document.getElementById('modal-timestamp').textContent = formattedDate;

    // Show modal
    document.getElementById('chatlog-modal').classList.remove('hidden');
  });
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('chatlog-modal').classList.add('hidden');
});
}

function renderAdminAnnouncements(el) {
  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Manage Announcements</h1>
          <p class="text-sm text-muted-foreground mt-1">Create, edit, and delete announcements</p>
        </div>
        <button id="add-ann-btn" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-accent transition-colors">
          <i data-lucide="plus" class="h-4 w-4"></i> Add
        </button>
      </div>

      <div id="ann-form-wrapper" class="hidden mb-6">
        <div class="bg-card rounded-xl border border-border p-5">
          <h3 id="ann-form-title" class="text-sm font-semibold text-card-foreground mb-3 font-space">Add Announcement</h3>
          <div class="space-y-3">
            <input id="ann-title" type="text" placeholder="Title" class="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <textarea id="ann-body" placeholder="Content" rows="3" class="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
            <input id="ann-source" type="text" placeholder="Source (e.g. Registrar Office)" class="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <label class="flex items-center gap-2 text-sm text-card-foreground">
              <input id="ann-featured" type="checkbox" class="rounded" /> Featured
            </label>
            <div class="flex gap-2">
              <button id="ann-save-btn" class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-accent transition-colors">Save</button>
              <button id="ann-cancel-btn" class="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
          <input type="hidden" id="ann-edit-id" value="" />
        </div>
      </div>

      <div class="space-y-3">
        ${state.announcements.map(a => `
          <div class="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow ${a.featured ? 'border-l-4 border-l-primary' : ''}">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-card-foreground font-space">${a.title}</h3>
                  ${a.featured ? '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">Featured</span>' : ''}
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed mb-2">${a.body}</p>
                <p class="text-[10px] text-muted-foreground">${a.source} · ${formatDate(a.date)}</p>
              </div>
              <div class="flex gap-1 ml-3 shrink-0">
                <button data-edit-ann="${a.id}" class="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <i data-lucide="pencil" class="h-3.5 w-3.5"></i>
                </button>
                <button data-delete-ann="${a.id}" class="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                  <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>
  </div>`;

  const formWrapper = document.getElementById('ann-form-wrapper');
  document.getElementById('add-ann-btn').addEventListener('click', () => {
    document.getElementById('ann-form-title').textContent = 'Add Announcement';
    document.getElementById('ann-title').value = '';
    document.getElementById('ann-body').value = '';
    document.getElementById('ann-source').value = '';
    document.getElementById('ann-featured').checked = false;
    document.getElementById('ann-edit-id').value = '';
    formWrapper.classList.remove('hidden');
  });

  document.getElementById('ann-cancel-btn').addEventListener('click', () => formWrapper.classList.add('hidden'));

  document.getElementById('ann-save-btn').addEventListener('click', () => {
    const title = document.getElementById('ann-title').value.trim();
    const body = document.getElementById('ann-body').value.trim();
    const source = document.getElementById('ann-source').value.trim();
    const featured = document.getElementById('ann-featured').checked;
    const editId = document.getElementById('ann-edit-id').value;
    if (!title || !body) return;
    if (editId) {
      const a = state.announcements.find(x => x.id === editId);
      if (a) { a.title = title; a.body = body; a.source = source || a.source; a.featured = featured; }
    } else {
      state.announcements.unshift({ id: uuid(), title, body, source: source || 'Admin', date: new Date().toISOString().split('T')[0], featured });
    }
    renderAdminAnnouncements(el);
    lucide.createIcons();
  });

  el.querySelectorAll('[data-edit-ann]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = state.announcements.find(x => x.id === btn.dataset.editAnn);
      if (!a) return;
      document.getElementById('ann-form-title').textContent = 'Edit Announcement';
      document.getElementById('ann-title').value = a.title;
      document.getElementById('ann-body').value = a.body;
      document.getElementById('ann-source').value = a.source;
      document.getElementById('ann-featured').checked = a.featured;
      document.getElementById('ann-edit-id').value = a.id;
      formWrapper.classList.remove('hidden');
    });
  });

  el.querySelectorAll('[data-delete-ann]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.announcements = state.announcements.filter(x => x.id !== btn.dataset.deleteAnn);
      renderAdminAnnouncements(el);
      renderSidebars();
      lucide.createIcons();
    });
  });
}

function renderAdminEvents(el) {
  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Manage School Events</h1>
          <p class="text-sm text-muted-foreground mt-1">Add, update, and delete events</p>
        </div>
        <button id="add-event-btn" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-accent transition-colors">
          <i data-lucide="plus" class="h-4 w-4"></i> Add Event
        </button>
      </div>

      <div id="event-form-wrapper" class="hidden mb-6">
        <div class="bg-card rounded-xl border border-border p-5">
          <h3 id="event-form-title" class="text-sm font-semibold text-card-foreground mb-3 font-space">Add Event</h3>
          <div class="space-y-3">
            <input id="event-title" type="text" placeholder="Event title" class="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <textarea id="event-desc" placeholder="Description" rows="3" class="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
            <div class="grid grid-cols-2 gap-3">
              <input id="event-date" type="date" class="h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <input id="event-time" type="text" placeholder="Time (e.g. 9 AM - 5 PM)" class="h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <input id="event-location" type="text" placeholder="Location" class="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <label class="flex items-center gap-2 text-sm text-card-foreground">
              <input id="event-featured" type="checkbox" class="rounded" /> Featured Event
            </label>
            <div class="flex gap-2">
              <button id="event-save-btn" class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-accent transition-colors">Save</button>
              <button id="event-cancel-btn" class="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
          <input type="hidden" id="event-edit-id" value="" />
        </div>
      </div>

      <div class="space-y-3">
        ${state.events.map(ev => `
          <div class="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow ${ev.featured ? 'border-l-4 border-l-primary' : ''}">
            <div class="flex">
              <div class="w-16 shrink-0 bg-primary/10 flex flex-col items-center justify-center p-3">
                <span class="text-[10px] font-bold text-primary uppercase">${new Date(ev.date).toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</span>
                <span class="text-xl font-bold text-primary font-space">${new Date(ev.date).getDate().toString().padStart(2,'0')}</span>
              </div>
              <div class="flex-1 p-4">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-card-foreground font-space">${ev.title}</h3>
                  ${ev.featured ? '<span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Featured</span>' : ''}
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed mb-2">${ev.description}</p>
                <div class="flex flex-wrap gap-x-3 gap-y-1">
                  <span class="flex items-center gap-1 text-[10px] text-muted-foreground"><i data-lucide="clock" class="h-3 w-3"></i> ${ev.time}</span>
                  <span class="flex items-center gap-1 text-[10px] text-muted-foreground"><i data-lucide="map-pin" class="h-3 w-3"></i> ${ev.location}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1 p-3 shrink-0">
                <button data-edit-ev="${ev.id}" class="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <i data-lucide="pencil" class="h-3.5 w-3.5"></i>
                </button>
                <button data-delete-ev="${ev.id}" class="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                  <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>
  </div>`;

  const formWrapper = document.getElementById('event-form-wrapper');
  document.getElementById('add-event-btn').addEventListener('click', () => {
    document.getElementById('event-form-title').textContent = 'Add Event';
    document.getElementById('event-title').value = '';
    document.getElementById('event-desc').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('event-time').value = '';
    document.getElementById('event-location').value = '';
    document.getElementById('event-featured').checked = false;
    document.getElementById('event-edit-id').value = '';
    formWrapper.classList.remove('hidden');
  });

  document.getElementById('event-cancel-btn').addEventListener('click', () => formWrapper.classList.add('hidden'));

  document.getElementById('event-save-btn').addEventListener('click', () => {
    const title = document.getElementById('event-title').value.trim();
    const desc = document.getElementById('event-desc').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value.trim();
    const location = document.getElementById('event-location').value.trim();
    const featured = document.getElementById('event-featured').checked;
    const editId = document.getElementById('event-edit-id').value;
    if (!title || !desc || !date) return;
    if (editId) {
      const ev = state.events.find(x => x.id === editId);
      if (ev) { ev.title = title; ev.description = desc; ev.date = date; ev.time = time || ev.time; ev.location = location || ev.location; ev.featured = featured; }
    } else {
      state.events.unshift({ id: uuid(), title, description: desc, date, time: time || 'TBD', location: location || 'TBD', featured });
    }
    renderAdminEvents(el);
    lucide.createIcons();
  });

  el.querySelectorAll('[data-edit-ev]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ev = state.events.find(x => x.id === btn.dataset.editEv);
      if (!ev) return;
      document.getElementById('event-form-title').textContent = 'Edit Event';
      document.getElementById('event-title').value = ev.title;
      document.getElementById('event-desc').value = ev.description;
      document.getElementById('event-date').value = ev.date;
      document.getElementById('event-time').value = ev.time;
      document.getElementById('event-location').value = ev.location;
      document.getElementById('event-featured').checked = ev.featured;
      document.getElementById('event-edit-id').value = ev.id;
      formWrapper.classList.remove('hidden');
    });
  });

  el.querySelectorAll('[data-delete-ev]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.events = state.events.filter(x => x.id !== btn.dataset.deleteEv);
      renderAdminEvents(el);
      lucide.createIcons();
    });
  });
}

function renderSettings(el) {
  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Settings</h1>
        <p class="text-sm text-muted-foreground mt-1">Configure your admin preferences</p>
      </div>
      <div class="bg-card rounded-xl border border-border p-6 space-y-6">
        <div>
          <h3 class="text-sm font-semibold text-card-foreground font-space mb-2">Bot Configuration</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-medium text-card-foreground mb-1.5 block">Bot Name</label>
              <input type="text" value="MerlionsMind" class="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="text-xs font-medium text-card-foreground mb-1.5 block">Welcome Message</label>
              <textarea rows="3" class="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none">Hello! 👋 I'm your University Assistant. I can help you with enrollment, schedules, tuition, campus services, and more.</textarea>
            </div>
          </div>
        </div>
        <div class="border-t border-border pt-6">
          <h3 class="text-sm font-semibold text-card-foreground font-space mb-2">Account</h3>
          <p class="text-xs text-muted-foreground mb-3">Logged in as <strong>${state.currentUser?.email || ''}</strong></p>
        </div>
      </div>
    </main>
  </div>`;
}
