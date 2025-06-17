import { db } from './firebase-config.js';
import { ref, push, onValue, remove, set } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { isAdmin } from './auth.js';

let currentChat = 'general'; // Default chat room

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('You must be logged in to send messages', 'error');
        return;
    }

    const messagesRef = ref(db, `messages/${currentChat}`);
    push(messagesRef, {
        sender: currentUser,
        content: content,
        timestamp: Date.now()
    });

    messageInput.value = '';
}

function displayMessages() {
    const messagesRef = ref(db, `messages/${currentChat}`);
    
    onValue(messagesRef, (snapshot) => {
        const chatBox = document.getElementById('chat-box');
        if (!chatBox) return;

        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort messages by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);

        let html = '';
        messages.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            if (msg.sender === 'SYSTEM') {
                html += `
                    <div class="message system">
                        <div class="message-content">${msg.content}</div>
                        <div class="system-timestamp">${time}</div>
                    </div>`;
            } else {
                html += `
                    <div class="message">
                        <div class="message-header">
                            <span class="sender">${sanitizeHTML(msg.sender)}</span>
                            <span class="timestamp">${time}</span>
                        </div>
                        <div class="message-content">${sanitizeHTML(msg.content)}</div>
                    </div>`;
            }
        });

        chatBox.innerHTML = html;
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

export async function purgeMessages() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isAdmin(currentUser)) {
        showToast('You do not have permission to purge messages', 'error');
        return;
    }

    try {
        const messagesRef = ref(db, `messages/${currentChat}`);
        await remove(messagesRef);
        
        // Add system message about purge
        const systemMessage = {
            sender: 'SYSTEM',
            content: '[CONSOLE] A Purge Has Been Initialised!',
            timestamp: Date.now()
        };
        
        await set(ref(db, `messages/${currentChat}/system`), systemMessage);
        showToast('Chat has been purged', 'success');
    } catch (error) {
        console.error('Purge error:', error);
        showToast('Failed to purge messages', 'error');
    }
}

function initializeChatControls() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('.send-button');
    const attachmentButton = document.querySelector('.attachment-btn');

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);
    
    attachmentButton.addEventListener('click', () => {
        // TODO: Implement file upload functionality
        showToast('File upload coming soon!', 'info');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayMessages();
    initializeChatControls();
});

export { sendMessage, displayMessages };