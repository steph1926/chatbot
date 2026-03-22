// ============= SIDEBAR RENDERING =============
import { state } from './state.js';
import { newChat, renderChat } from './chat.js';
import { showPage, closeMobile } from './router.js';

// ================= NAV ITEMS =================
function getNavItems() {
  if (state.currentUser?.role === 'admin') {
    return [
      { icon: 'layout-dashboard', label: 'Dashboard', page: 'admin-dashboard' },
      { icon: 'database', label: 'Manage Responses', page: 'admin-responses' },
      { icon: 'message-square', label: 'Chat Logs', page: 'admin-chatlogs' },
      { icon: 'bell', label: 'Announcements', page: 'admin-announcements' },
      { icon: 'calendar-days', label: 'School Events', page: 'admin-events' },
      { icon: 'settings', label: 'Settings', page: 'admin-settings' },
    ];
  }

  return [
    { icon: 'message-square', label: 'Chat', page: 'chat' },
    { icon: 'history', label: 'Chat History', page: 'chat-history' },
    { icon: 'search', label: 'Search Chat', page: 'search-chat' },
    { icon: 'bell', label: 'Announcements', page: 'announcements', badge: state.announcements.length },
    { icon: 'calendar-days', label: 'School Events', page: 'events' },
  ];
}

// ================= HTML =================
export function sidebarHTML() {
  const navItems = getNavItems();
  const isAdmin = state.currentUser?.role === 'admin';
  const user = state.currentUser;
  const collapsed = state.sidebarCollapsed;

  const nav = navItems.map(item => {
    const isActive = item.page === state.currentPage;

    const base = "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all";
    const active = "bg-sidebar-primary text-sidebar-primary-foreground";
    const inactive = "text-sidebar-foreground hover:bg-sidebar-accent";

    const cls = `${base} ${isActive ? active : inactive} ${collapsed ? 'justify-center' : 'gap-3'}`;

    const badge = item.badge && !collapsed
      ? `<span class="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">${item.badge}</span>`
      : '';

    return `
      <button data-nav="${item.page}" title="${item.label}" class="${cls}">
        <i data-lucide="${item.icon}" class="h-5 w-5"></i>
        ${!collapsed ? `<span>${item.label}</span>` : ''}
        ${badge}
      </button>
    `;
  }).join('');

  return `
<!-- HEADER -->
<div class="relative p-4 flex items-center">

  <!-- LEFT: Logo + Name -->
  <div class="flex items-center w-full ${collapsed ? 'justify-center' : 'gap-3'}">
    <img src="/ai-avatar.png" class="h-10 w-10 rounded-lg" />

    ${!collapsed ? `
      <div>
        <h1 class="text-lg font-bold">MerlionsMind</h1>
        <p class="text-xs text-sidebar-muted truncate">${user?.name || 'User'}</p>
      </div>
    ` : ''}
  </div>

  <!-- COLLAPSE BUTTON (ALWAYS CLICKABLE) -->
  <button 
    data-action="toggle-sidebar"
    class="absolute top-4 right-3 z-10 p-2 rounded-lg hover:bg-sidebar-accent transition flex items-center justify-center"
  >
    <i data-lucide="${collapsed ? 'chevron-right' : 'chevron-left'}" class="h-5 w-5"></i>
  </button>

</div>

    <!-- NAV -->
    <nav class="px-2 space-y-1" data-sidebar-nav>
      ${nav}
    </nav>

    <!-- NEW CHAT -->
    ${!isAdmin && !collapsed ? `
      <div class="px-3 mt-4">
        <button data-action="new-chat"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-sidebar-border text-sm hover:bg-sidebar-accent">
          <i data-lucide="plus" class="h-4 w-4"></i>New Chat
        </button>
      </div>
    ` : ''}

    <div class="flex-1"></div>

    <!-- FOOTER -->
    <div class="p-3 border-t border-sidebar-border">
      <button data-action="logout"
        class="w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg hover:bg-sidebar-accent">
        <i data-lucide="log-out" class="h-4 w-4"></i>
        ${!collapsed ? 'Log out' : ''}
      </button>
    </div>
  `;
}

// ================= EVENTS =================
function showLogin() {
  state.currentUser = null;
  state.conversations = [];
  state.activeId = null;
  state.chatLogs = [];
  _sidebarInitialized = false;

  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
}

function bindSidebarEvents(container) {
  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      showPage(btn.dataset.nav);
      closeMobile();
    });
  });

  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      if (action === 'new-chat') {
        newChat();
        showPage('chat');
        renderChat();
      }

      if (action === 'logout') {
        showLogin();
      }

      if (action === 'toggle-sidebar') {
        state.sidebarCollapsed = !state.sidebarCollapsed;

        // Force re-render
        _sidebarInitialized = false;
        renderSidebars();
      }

      closeMobile();
    });
  });
}

// ================= ACTIVE STATE =================
let _sidebarInitialized = false;

function updateNavActiveStates() {
  document.querySelectorAll('[data-sidebar-nav] [data-nav]').forEach(btn => {
    const page = btn.dataset.nav;

    btn.classList.remove(
      'bg-sidebar-primary',
      'text-sidebar-primary-foreground',
      'text-sidebar-foreground',
      'hover:bg-sidebar-accent'
    );

    if (page === state.currentPage) {
      btn.classList.add('bg-sidebar-primary', 'text-sidebar-primary-foreground');
    } else {
      btn.classList.add('text-sidebar-foreground', 'hover:bg-sidebar-accent');
    }
  });
}

// ================= RENDER =================
export function renderSidebars() {
  const desktopSidebar = document.getElementById('desktop-sidebar');
  const mobileSidebar = document.getElementById('mobile-sidebar');

  // Animate width
  desktopSidebar.classList.add('transition-all', 'duration-300');
  desktopSidebar.classList.toggle('w-[260px]', !state.sidebarCollapsed);
  desktopSidebar.classList.toggle('w-[80px]', state.sidebarCollapsed);

  // Prevent re-render flicker
  if (_sidebarInitialized) {
    updateNavActiveStates();
    return;
  }

  const html = sidebarHTML();

  desktopSidebar.innerHTML = html;

  mobileSidebar.innerHTML =
    `<button id="mobile-close-btn-inner"
      class="absolute top-4 right-4">
      <i data-lucide="x"></i>
    </button>` + html;

  lucide.createIcons();

  bindSidebarEvents(desktopSidebar);
  bindSidebarEvents(mobileSidebar);

  document
    .getElementById('mobile-close-btn-inner')
    ?.addEventListener('click', closeMobile);

  _sidebarInitialized = true;
}