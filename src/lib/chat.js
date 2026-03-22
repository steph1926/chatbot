// ============= CHAT STATE & LOGIC =============
import { state, WELCOME_MSG } from './state.js';
import { uuid, renderMarkdown, getBotReply } from './utils.js';

const BOT_AVATAR = '/ai-avatar.png';

let _renderedMsgIds = new Set();
let _renderedConvoId = null;

// -----------------------------
// Typing Indicator (DOM only)
// -----------------------------
function showTyping() {
  const chatMessages = document.getElementById('chat-messages');

  // جلوگیری sa duplicate
  if (document.getElementById('typing-indicator')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'typing-indicator';

  wrapper.innerHTML = `
    <div class="flex gap-3 justify-start">
      <img src="${BOT_AVATAR}" class="h-8 w-8 rounded-full mt-1" />
      <div class="bg-chat-bot rounded-2xl px-4 py-3 text-sm">
        <div class="flex gap-1">
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  `;

  chatMessages.appendChild(wrapper);

  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function hideTyping() {
  document.getElementById('typing-indicator')?.remove();
}

// -----------------------------
// Core Functions
// -----------------------------
export function createConversation(firstMsg) {
  const id = uuid();
  const msgs = [
    {
      id: 'welcome-' + id,
      role: 'assistant',
      content: WELCOME_MSG,
      timestamp: new Date()
    }
  ];

  if (firstMsg) {
    msgs.push({
      id: uuid(),
      role: 'user',
      content: firstMsg,
      timestamp: new Date()
    });
  }

  return {
    id,
    title: firstMsg || 'New Chat',
    messages: msgs,
    createdAt: new Date()
  };
}

export function getActiveConvo() {
  return state.conversations.find(c => c.id === state.activeId) || state.conversations[0];
}

function buildMessageHTML(msg) {
  const isUser = msg.role === 'user';
  const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const avatar = !isUser
    ? `<img src="${BOT_AVATAR}" class="h-8 w-8 rounded-full mt-1" />`
    : '';

  const bubbleCls = isUser
    ? 'bg-chat-user text-primary-foreground rounded-br-md'
    : 'bg-chat-bot text-card-foreground rounded-bl-md';

  const timeCls = isUser
    ? 'text-primary-foreground/60'
    : 'text-muted-foreground';

  return `
    <div class="flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}" data-msg-id="${msg.id}">
      ${avatar}
      <div class="max-w-[70%] rounded-2xl px-4 py-3 text-sm ${bubbleCls}">
        <div class="prose prose-sm max-w-none">${renderMarkdown(msg.content)}</div>
        <p class="text-[10px] mt-1 ${timeCls}">${time}</p>
      </div>
    </div>
  `;
}

export function renderChat() {
  const chatMessages = document.getElementById('chat-messages');
  const suggestedDiv = document.getElementById('suggested-questions');
  const convo = getActiveConvo();
  if (!convo) return;

  if (_renderedConvoId !== convo.id) {
    _renderedMsgIds.clear();
    _renderedConvoId = convo.id;
    chatMessages.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();
  let hasNew = false;

  convo.messages.forEach(msg => {
    if (!_renderedMsgIds.has(msg.id)) {
      _renderedMsgIds.add(msg.id);

      const wrapper = document.createElement('div');
      wrapper.innerHTML = buildMessageHTML(msg);
      fragment.appendChild(wrapper.firstElementChild);

      hasNew = true;
    }
  });

  if (hasNew) {
    chatMessages.appendChild(fragment);

    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  const hasUserMsg = convo.messages.some(m => m.role === 'user');
  if (suggestedDiv) suggestedDiv.style.display = hasUserMsg ? 'none' : 'block';
}

// -----------------------------
// SEND MESSAGE (UPDATED)
// -----------------------------
export function sendMessage(content) {
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');

  if (!content.trim()) return;

  const convo = getActiveConvo();
  if (!convo) return;

  const isFirst = !convo.messages.some(m => m.role === 'user');

  // 1. Add user message
  convo.messages.push({
    id: uuid(),
    role: 'user',
    content,
    timestamp: new Date()
  });

  renderChat();

  // 2. Show typing indicator (DOM only)
  showTyping();

  // 3. Simulate delay
  setTimeout(() => {
    hideTyping();

    // 4. Bot reply
    const botReply = getBotReply(content);

    convo.messages.push({
      id: uuid(),
      role: 'assistant',
      content: botReply,
      timestamp: new Date()
    });

    // 5. Update title
    if (isFirst) convo.title = content.slice(0, 50);

    // 6. Save logs
    const logEntry = {
      studentNumber: state.currentUser?.studentNumber || 'N/A',
      question: content,
      response: botReply,
      timestamp: Date.now()
    };

    state.chatLogs.push({
      ...logEntry,
      id: uuid(),
      conversationId: convo.id
    });

    try {
      const existing = JSON.parse(localStorage.getItem('chatLogs') || '[]');
      existing.push(logEntry);
      localStorage.setItem('chatLogs', JSON.stringify(existing));
    } catch (_) {}

    renderChat();

    chatInput.value = '';
    chatSendBtn.disabled = true;

  }, 800);
}

export function newChat() {
  const c = createConversation();
  state.conversations.unshift(c);
  state.activeId = c.id;

  _renderedMsgIds.clear();
  _renderedConvoId = null;
}