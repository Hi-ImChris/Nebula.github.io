import { db } from './firebase-config.js';
import { ref, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

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

function purgeMessages() {
    const currentUser = localStorage.getItem('currentUser');
    if (!isAdmin(currentUser)) {
        showToast('You do not have permission to purge messages', 'error');
        return;
    }

    const messagesRef = ref(db, `messages/${currentChat}`);
    remove(messagesRef).then(() => {
        const systemMessage = {
            sender: 'SYSTEM',
            content: '[CONSOLE] A Purge Has Been Initialised!',
            timestamp: Date.now()
        };
        
        push(messagesRef, systemMessage);
        showToast('Chat has been purged', 'success');
    });
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    displayMessages();
});

export { sendMessage, displayMessages, purgeMessages };