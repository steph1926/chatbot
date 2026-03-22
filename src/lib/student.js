import { state } from './state.js';
import { renderChat } from './chat.js';
import { showPage } from './router.js';
import { formatDate, formatMonth, formatDay, highlightText, renderMarkdown } from './utils.js';

export function renderStudentPage(page) {
  const container = document.getElementById('page-' + page);
  if (!container) return;

  switch (page) {
    case 'chat-history': renderChatHistory(container); break;
    case 'search-chat': renderSearchChat(container); break;
    case 'announcements': renderStudentAnnouncements(container); break;
    case 'events': renderStudentEvents(container); break;
  }
  lucide.createIcons();
}

function renderChatHistory(el) {
  const convos = state.conversations.filter(c => c.messages.some(m => m.role === 'user'));

  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-1">
          <i data-lucide="history" class="h-4 w-4 text-primary"></i>
          <span class="text-xs font-bold uppercase tracking-widest text-primary">Previous</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Chat History</h1>
        <p class="text-sm text-muted-foreground mt-1">View and continue your previous conversations</p>
      </div>

      ${convos.length === 0
        ? '<div class="bg-card rounded-xl border border-border p-8 text-center"><i data-lucide="message-square" class="h-12 w-12 text-muted-foreground/30 mx-auto mb-3"></i><p class="text-muted-foreground text-sm">No conversations yet. Start chatting to see your history here.</p></div>'
        : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${convos.map(c => {
          const userMsgs = c.messages.filter(m => m.role === 'user');
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          const lastBotReply = c.messages.find((m, i) => i > c.messages.indexOf(lastUserMsg) && m.role === 'assistant');
          const msgCount = c.messages.length;
          const time = c.createdAt.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          return `<button data-open-convo="${c.id}" class="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow text-left group">
            <div class="flex items-start justify-between mb-3">
              <div class="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <i data-lucide="message-square" class="h-4 w-4 text-primary"></i>
              </div>
              <span class="text-[10px] text-muted-foreground">${time}</span>
            </div>
            <h3 class="text-sm font-semibold text-card-foreground font-space mb-2 line-clamp-2">${lastUserMsg?.content || c.title}</h3>
            <p class="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">${lastBotReply ? renderMarkdown(lastBotReply.content) : 'No response yet'}</p>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1 text-[10px] text-muted-foreground">
                <i data-lucide="messages-square" class="h-3 w-3"></i> ${msgCount} messages
              </span>
              <span class="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
            </div>
          </button>`;
        }).join('')}</div>`
      }
    </main>
  </div>`;

  el.querySelectorAll('[data-open-convo]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeId = btn.dataset.openConvo;
      showPage('chat');
      renderChat();
    });
  });
}

function renderSearchChat(el) {
  el.innerHTML = `<div class="flex-1 overflow-y-auto bg-background">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-1">
          <i data-lucide="search" class="h-4 w-4 text-primary"></i>
          <span class="text-xs font-bold uppercase tracking-widest text-primary">Find</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Search Chats</h1>
        <p class="text-sm text-muted-foreground mt-1">Search through your previous conversations</p>
      </div>

      <div class="mb-6">
        <div class="flex items-center gap-2 bg-card rounded-xl border border-border px-4 py-2">
          <i data-lucide="search" class="h-4 w-4 text-muted-foreground"></i>
          <input id="search-chat-input" type="text" placeholder="Search keywords..." class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        </div>
      </div>

      <div id="search-results"></div>
    </main>
  </div>`;

  const searchInput = document.getElementById('search-chat-input');
  const resultsDiv = document.getElementById('search-results');

  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) { resultsDiv.innerHTML = '<p class="text-sm text-muted-foreground text-center py-8">Type a keyword to search your conversations</p>'; return; }

    const results = [];
    state.conversations.forEach(c => {
      c.messages.forEach((msg, idx) => {
        if (msg.content.toLowerCase().includes(keyword)) {
          // Find the bot reply (next assistant message)
          const botReply = msg.role === 'user'
            ? c.messages.find((m, i) => i > idx && m.role === 'assistant')
            : null;
          results.push({ convo: c, msg, botReply });
        }
      });
    });

    if (results.length === 0) {
      resultsDiv.innerHTML = `<div class="bg-card rounded-xl border border-border p-8 text-center">
        <i data-lucide="search-x" class="h-12 w-12 text-muted-foreground/30 mx-auto mb-3"></i>
        <p class="text-muted-foreground text-sm">No results found for "<strong>${keyword}</strong>"</p>
      </div>`;
      lucide.createIcons();
      return;
    }

    resultsDiv.innerHTML = `<p class="text-xs text-muted-foreground mb-3">${results.length} result(s) found</p>
      <div class="space-y-3">
        ${results.map(r => {
          const time = r.msg.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          const isUser = r.msg.role === 'user';
          return `<div class="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <div class="h-6 w-6 rounded-full ${isUser ? 'bg-primary' : 'bg-primary/10'} flex items-center justify-center">
                <i data-lucide="${isUser ? 'user' : 'bot'}" class="h-3 w-3 ${isUser ? 'text-primary-foreground' : 'text-primary'}"></i>
              </div>
              <span class="text-xs font-medium text-card-foreground">${isUser ? 'You' : 'Assistant'}</span>
              <span class="text-[10px] text-muted-foreground ml-auto">${time}</span>
            </div>
            <p class="text-sm text-card-foreground leading-relaxed mb-2">${highlightText(renderMarkdown(r.msg.content), searchInput.value.trim())}</p>
            ${r.botReply ? `<div class="mt-2 pl-3 border-l-2 border-primary/30">
              <p class="text-xs text-muted-foreground leading-relaxed">${highlightText(renderMarkdown(r.botReply.content), searchInput.value.trim())}</p>
            </div>` : ''}
            <button data-search-open="${r.convo.id}" class="mt-2 text-[10px] text-primary font-medium hover:underline">Open conversation →</button>
          </div>`;
        }).join('')}
      </div>`;

    lucide.createIcons();

    resultsDiv.querySelectorAll('[data-search-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeId = btn.dataset.searchOpen;
        showPage('chat');
        renderChat();
      });
    });
  });
}

function renderStudentAnnouncements(el) {
  const featured = state.announcements.find(a => a.featured);
  const others = state.announcements.filter(a => !a.featured);

  // Modal HTML
  const modalHTML = `
    <div id="announcement-modal" class="fixed inset-0 bg-black/40 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 z-50">
      <div class="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform scale-95 transition-transform duration-300">
        <button id="close-announcement-modal" class="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition">
          <i data-lucide="x" class="h-6 w-6"></i>
        </button>
        <h2 id="announcement-modal-title" class="text-2xl font-bold mb-3 font-space text-foreground"></h2>
        <p id="announcement-modal-description" class="text-sm text-muted-foreground mb-4 leading-relaxed"></p>
        <div class="flex flex-col gap-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <i data-lucide="clock" class="h-4 w-4"></i>
            <span id="announcement-modal-time"></span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="map-pin" class="h-4 w-4"></i>
            <span id="announcement-modal-source"></span>
          </div>
        </div>
      </div>
    </div>
  `;

  el.innerHTML = `
    ${modalHTML}
    <div class="flex-1 overflow-y-auto bg-background">
      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-1">
            <i data-lucide="bell" class="h-4 w-4 text-primary"></i>
            <span class="text-xs font-bold uppercase tracking-widest text-primary">Latest Updates</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">Announcements</h1>
          <p class="text-sm text-muted-foreground mt-1">Stay informed with the latest university news and notices</p>
        </div>

        ${featured ? `
        <article class="bg-card rounded-xl border-l-4 border-l-primary border border-border p-5 sm:p-6 mb-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="text-[10px] sm:text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">NEW</span>
                <span class="text-[10px] sm:text-xs font-medium text-muted-foreground">Featured</span>
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-card-foreground mb-2 font-space">${featured.title}</h2>
              <p class="text-sm text-muted-foreground leading-relaxed mb-4">${featured.body}</p>
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <i data-lucide="clock" class="h-3.5 w-3.5"></i>
                <span>${featured.source} · ${formatDate(featured.date)}</span>
              </div>
              <button onclick="openAnnouncementModal('${featured.title}', '${featured.body}', '${formatDate(featured.date)}', '${featured.source}')" class="mt-2 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition">View Details</button>
            </div>
            <!-- Megaphone icon preserved -->
            <div class="flex h-10 w-10 rounded-lg bg-primary/10 items-center justify-center shrink-0 ml-4">
              <i data-lucide="megaphone" class="h-5 w-5 text-primary"></i>
            </div>
          </div>
        </article>` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${others.map(a => `
            <article class="bg-card rounded-xl border border-border p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col">
              <div class="flex items-start mb-3">
                <!-- Megaphone icon preserved -->
                <div class="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mr-3">
                  <i data-lucide="megaphone" class="h-4 w-4 text-primary"></i>
                </div>
                <div class="flex-1">
                  <h3 class="text-sm sm:text-base font-semibold text-card-foreground mb-2 font-space">${a.title}</h3>
                  <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">${a.body}</p>
                  <div class="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mb-2">
                    <i data-lucide="clock" class="h-3 w-3"></i>
                    <span>${a.source} · ${formatDate(a.date)}</span>
                  </div>
                  <button onclick="openAnnouncementModal('${a.title}', '${a.body}', '${formatDate(a.date)}', '${a.source}')" class="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition mt-1">View Details</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </main>
    </div>
  `;

  // Modal logic
  const modal = el.querySelector('#announcement-modal');
  const closeModalBtn = el.querySelector('#close-announcement-modal');

  window.openAnnouncementModal = (title, body, date, source) => {
    el.querySelector('#announcement-modal-title').textContent = title;
    el.querySelector('#announcement-modal-description').textContent = body;
    el.querySelector('#announcement-modal-time').textContent = date;
    el.querySelector('#announcement-modal-source').textContent = source;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => modal.querySelector('div').classList.remove('scale-95'), 10);
  };

  const closeModal = () => {
    modal.querySelector('div').classList.add('scale-95');
    modal.classList.add('opacity-0', 'pointer-events-none');
  };

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (window.lucide) window.lucide.replace();
}

function renderStudentEvents(el) {
  const featured = state.events.find(e => e.featured);
  const others = state.events.filter(e => !e.featured);

  // Modal HTML (clean design)
  const modalHTML = `
    <div id="event-modal" class="fixed inset-0 bg-black/40 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 z-50">
      <div class="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform scale-95 transition-transform duration-300">
        <button id="close-modal" class="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition">
          <i data-lucide="x" class="h-6 w-6"></i>
        </button>
        <h2 id="modal-title" class="text-2xl font-bold mb-3 font-space text-foreground"></h2>
        <p id="modal-description" class="text-sm text-muted-foreground mb-4 leading-relaxed"></p>
        <div class="flex flex-col gap-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2"><i data-lucide="clock" class="h-4 w-4"></i><span id="modal-time"></span></div>
          <div class="flex items-center gap-2"><i data-lucide="map-pin" class="h-4 w-4"></i><span id="modal-location"></span></div>
        </div>
      </div>
    </div>
  `;

  el.innerHTML = `
    ${modalHTML}
    <div class="flex-1 overflow-y-auto bg-background">
      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-1">
            <i data-lucide="calendar-days" class="h-4 w-4 text-primary"></i>
            <span class="text-xs font-bold uppercase tracking-widest text-primary">Upcoming</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-space">School Events</h1>
          <p class="text-sm text-muted-foreground mt-1">Don't miss out on exciting campus activities and events</p>
        </div>

        ${featured ? `
        <article class="bg-card rounded-2xl border-l-4 border-l-primary border border-border overflow-hidden mb-6 hover:shadow-xl transition-shadow">
          <div class="flex flex-col sm:flex-row">
            <div class="sm:w-28 shrink-0 bg-primary/10 flex sm:flex-col items-center justify-center gap-1 p-4 sm:p-6">
              <span class="text-xs font-bold text-primary uppercase tracking-wider">${formatMonth(featured.date)}</span>
              <span class="text-3xl sm:text-4xl font-bold text-primary font-space">${formatDay(featured.date)}</span>
            </div>
            <div class="flex-1 p-5 sm:p-6">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="text-[10px] sm:text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground">UPCOMING</span>
                <span class="text-[10px] sm:text-xs font-medium text-muted-foreground">Featured Event</span>
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-card-foreground mb-2 font-space">${featured.title}</h2>
              <p class="text-sm text-muted-foreground leading-relaxed mb-3">${featured.description}</p>
              <div class="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm text-muted-foreground">
                <span class="flex items-center gap-1"><i data-lucide="clock" class="h-3.5 w-3.5"></i>${featured.time}</span>
                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="h-3.5 w-3.5"></i>${featured.location}</span>
              </div>
              <button onclick="openEventModal('${featured.title}', '${featured.description}', '${featured.time}', '${featured.location}')" class="mt-2 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition">View Details</button>
            </div>
          </div>
        </article>` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${others.map(ev => `
            <article class="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
              <div class="flex">
                <div class="w-16 sm:w-20 shrink-0 bg-primary/10 flex flex-col items-center justify-center p-3">
                  <span class="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">${formatMonth(ev.date)}</span>
                  <span class="text-xl sm:text-2xl font-bold text-primary font-space">${formatDay(ev.date)}</span>
                </div>
                <div class="flex-1 p-4">
                  <h3 class="text-sm sm:text-base font-semibold text-card-foreground font-space mb-1">${ev.title}</h3>
                  <p class="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">${ev.description}</p>
                  <div class="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1"><i data-lucide="clock" class="h-3 w-3"></i>${ev.time}</span>
                    <span class="flex items-center gap-1"><i data-lucide="map-pin" class="h-3 w-3"></i>${ev.location}</span>
                  </div>
                  <button onclick="openEventModal('${ev.title}', '${ev.description}', '${ev.time}', '${ev.location}')" class="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition">View Details</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </main>
    </div>
  `;

  // Modal logic with animations
  const modal = el.querySelector('#event-modal');
  const closeModalBtn = el.querySelector('#close-modal');

  window.openEventModal = (title, description, time, location) => {
    el.querySelector('#modal-title').textContent = title;
    el.querySelector('#modal-description').textContent = description;
    el.querySelector('#modal-time').textContent = time;
    el.querySelector('#modal-location').textContent = location;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      modal.querySelector('div').classList.remove('scale-95');
    }, 10);
  };

  const closeModal = () => {
    modal.querySelector('div').classList.add('scale-95');
    modal.classList.add('opacity-0', 'pointer-events-none');
  };

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (window.lucide) window.lucide.replace();
}
