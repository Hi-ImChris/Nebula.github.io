let messages = JSON.parse(localStorage.getItem('messages') || '[]');
let currentChat = 'Class GC';
let selectedFiles = [];
let lastMessageCount = 0;

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;

    const content = messageInput.value.trim();
    if (!content) return;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('You must be logged in to send messages', 'error');
        return;
    }

    const message = {
        sender: currentUser,
        content: content,
        timestamp: Date.now(),
        chat: currentChat
    };

    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    messageInput.value = '';
    displayMessages();
    updateLastActivity();
}

function displayMessages() {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const currentMessages = messages.filter(msg => !msg.chat || msg.chat === currentChat);
    
    let html = '';
    currentMessages.forEach(msg => {
        if (msg.sender === 'SYSTEM') {
            html += `
                <div class="message system">
                    <div class="message-content">${msg.content}</div>
                    <div class="system-timestamp">${formatTimestamp(msg.timestamp)}</div>
                </div>`;
        } else {
            html += `
                <div class="message">
                    <div class="message-header">
                        <span class="sender">${sanitizeHTML(msg.sender)}</span>
                        <span class="timestamp">${formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <div class="message-content">${sanitizeHTML(msg.content)}</div>
                </div>`;
        }
    });

    chatBox.innerHTML = html;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function purgeMessages() {
    const currentUser = localStorage.getItem('currentUser');
    if (!isAdmin(currentUser)) {
        showToast('You do not have permission to purge messages', 'error');
        return;
    }

    // Remove old purge messages first
    messages = messages.filter(msg => !msg.isPurgeMessage);

    // Create new purge message with timestamp
    const systemMessage = {
        sender: 'SYSTEM',
        content: '[CONSOLE] A Purge Has Been Initialised!',
        timestamp: Date.now(),
        chat: currentChat,
        isPurgeMessage: true
    };

    messages = [systemMessage];
    localStorage.setItem('messages', JSON.stringify(messages));
    displayMessages();
    showToast('Chat has been purged', 'success');
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    
    // If message is from today, show only time
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date and time
    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateLastActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
}

// Message input enter key handler
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Initialize chat if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        displayMessages();
    }
});

// Auto-refresh messages
setInterval(displayMessages, 5000);