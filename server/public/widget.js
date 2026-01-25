// UseEmbed Widget - Embeddable AI Chat Widget
// This file should be served by the server and loaded by client websites

(function () {
    'use strict';

    // Get configuration from script tag
    const currentScript = document.currentScript;
    const apiKey = currentScript?.getAttribute('data-api-key');
    const apiUrl = currentScript?.getAttribute('data-api-url') || currentScript?.src.replace('/widget.js', '');

    if (!apiKey) {
        console.error('[UseEmbed] API key is required. Add data-api-key attribute to the script tag.');
        return;
    }

    // Generate session ID
    const sessionId = localStorage.getItem('useembed_session') ||
        'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('useembed_session', sessionId);

    // State
    let isOpen = false;
    let isLoading = false;
    let conversationId = null;
    let messages = [];
    let theme = {
        primaryColor: '#0ea5e9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 12,
        position: 'bottom-right',
        headerText: 'How can I help you?',
        placeholderText: 'Type your message...',
        buttonIcon: 'chat'
    };

    // Initialize widget
    async function init() {
        try {
            const response = await fetch(`${apiUrl}/widget/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({ sessionId })
            });

            if (!response.ok) throw new Error('Failed to initialize widget');

            const data = await response.json();

            if (data.tenant?.settings?.widgetTheme) {
                theme = { ...theme, ...data.tenant.settings.widgetTheme };
            }

            if (data.conversation) {
                conversationId = data.conversation.id;
                messages = data.conversation.messages || [];
            }

            render();
        } catch (error) {
            console.error('[UseEmbed] Initialization error:', error);
            render();
        }
    }

    // Send message
    async function sendMessage(content) {
        if (!content.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: content.trim(),
            createdAt: new Date().toISOString()
        };
        messages.push(userMessage);
        renderMessages();

        isLoading = true;
        renderInput();

        try {
            const response = await fetch(`${apiUrl}/widget/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({
                    message: content.trim(),
                    sessionId,
                    conversationId
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();
            conversationId = data.conversationId;
            messages.push(data.message);
            renderMessages();
        } catch (error) {
            console.error('[UseEmbed] Send message error:', error);
            messages.push({
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                createdAt: new Date().toISOString()
            });
            renderMessages();
        } finally {
            isLoading = false;
            renderInput();
        }
    }

    // Create styles
    function createStyles() {
        const style = document.createElement('style');
        style.textContent = `
      #useembed-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      #useembed-widget {
        font-family: ${theme.fontFamily};
        font-size: 14px;
        line-height: 1.5;
        position: fixed;
        ${theme.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
        bottom: 20px;
        z-index: 999999;
      }
      
      #useembed-toggle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: ${theme.primaryColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      #useembed-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
      
      #useembed-toggle svg {
        width: 24px;
        height: 24px;
        fill: white;
      }
      
      #useembed-chat {
        position: absolute;
        ${theme.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
        bottom: 70px;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 500px;
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: ${theme.borderRadius}px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: useembed-slide-up 0.3s ease;
      }
      
      #useembed-chat.open {
        display: flex;
      }
      
      @keyframes useembed-slide-up {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #useembed-header {
        padding: 16px;
        background: ${theme.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      #useembed-header h3 {
        font-size: 16px;
        font-weight: 600;
      }
      
      #useembed-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      #useembed-close:hover {
        opacity: 1;
      }
      
      #useembed-close svg {
        width: 20px;
        height: 20px;
        fill: white;
      }
      
      #useembed-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .useembed-message {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: ${theme.borderRadius}px;
        word-wrap: break-word;
        white-space: pre-wrap;
      }
      
      .useembed-message.user {
        align-self: flex-end;
        background: ${theme.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      .useembed-message.assistant {
        align-self: flex-start;
        background: #f3f4f6;
        color: #111827;
        border-bottom-left-radius: 4px;
      }
      
      .useembed-typing {
        align-self: flex-start;
        background: #f3f4f6;
        padding: 12px 16px;
        border-radius: ${theme.borderRadius}px;
        display: flex;
        gap: 4px;
      }
      
      .useembed-typing span {
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: useembed-bounce 1.4s infinite ease-in-out;
      }
      
      .useembed-typing span:nth-child(1) { animation-delay: -0.32s; }
      .useembed-typing span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes useembed-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      
      #useembed-input-container {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }
      
      #useembed-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: ${theme.borderRadius - 4}px;
        font-family: inherit;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      #useembed-input:focus {
        border-color: ${theme.primaryColor};
      }
      
      #useembed-input::placeholder {
        color: #9ca3af;
      }
      
      #useembed-send {
        width: 40px;
        height: 40px;
        border-radius: ${theme.borderRadius - 4}px;
        background: ${theme.primaryColor};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
      }
      
      #useembed-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      #useembed-send svg {
        width: 18px;
        height: 18px;
        fill: white;
      }
      
      #useembed-branding {
        padding: 8px 16px;
        text-align: center;
        font-size: 11px;
        color: #9ca3af;
        border-top: 1px solid #f3f4f6;
      }
      
      #useembed-branding a {
        color: ${theme.primaryColor};
        text-decoration: none;
      }
    `;
        document.head.appendChild(style);
    }

    // Render widget
    function render() {
        // Remove existing widget
        const existing = document.getElementById('useembed-widget');
        if (existing) existing.remove();

        createStyles();

        const widget = document.createElement('div');
        widget.id = 'useembed-widget';
        widget.innerHTML = `
      <button id="useembed-toggle" aria-label="Open chat">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
      </button>
      <div id="useembed-chat">
        <div id="useembed-header">
          <h3>${theme.headerText}</h3>
          <button id="useembed-close" aria-label="Close chat">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div id="useembed-messages"></div>
        <div id="useembed-input-container">
          <input type="text" id="useembed-input" placeholder="${theme.placeholderText}" />
          <button id="useembed-send" aria-label="Send message">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div id="useembed-branding">
          Powered by <a href="https://useembed.com" target="_blank">UseEmbed</a>
        </div>
      </div>
    `;

        document.body.appendChild(widget);

        // Event listeners
        document.getElementById('useembed-toggle').addEventListener('click', toggleChat);
        document.getElementById('useembed-close').addEventListener('click', toggleChat);
        document.getElementById('useembed-send').addEventListener('click', handleSend);
        document.getElementById('useembed-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        renderMessages();
    }

    // Toggle chat
    function toggleChat() {
        isOpen = !isOpen;
        const chat = document.getElementById('useembed-chat');
        chat.classList.toggle('open', isOpen);

        if (isOpen) {
            document.getElementById('useembed-input').focus();
            scrollToBottom();
        }
    }

    // Handle send
    function handleSend() {
        const input = document.getElementById('useembed-input');
        const content = input.value.trim();
        if (content) {
            input.value = '';
            sendMessage(content);
        }
    }

    // Render messages
    function renderMessages() {
        const container = document.getElementById('useembed-messages');
        if (!container) return;

        container.innerHTML = messages.map(msg => `
      <div class="useembed-message ${msg.role}">
        ${escapeHtml(msg.content)}
      </div>
    `).join('');

        if (isLoading) {
            container.innerHTML += `
        <div class="useembed-typing">
          <span></span><span></span><span></span>
        </div>
      `;
        }

        scrollToBottom();
    }

    // Render input
    function renderInput() {
        const sendBtn = document.getElementById('useembed-send');
        const input = document.getElementById('useembed-input');
        if (sendBtn) sendBtn.disabled = isLoading;
        if (input) input.disabled = isLoading;
    }

    // Scroll to bottom
    function scrollToBottom() {
        const container = document.getElementById('useembed-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
