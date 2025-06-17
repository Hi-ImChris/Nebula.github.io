import { db } from './firebase-config.js';
import { ref, set, onValue } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { isAdmin } from './auth.js';

export async function setUserOnline(username) {
    if (!username) return;
    
    const userStatusRef = ref(db, `online/${username}`);
    return set(userStatusRef, {
        status: 'online',
        lastSeen: Date.now()
    });
}

function initializeOnlineUsers() {
    const usersRef = ref(db, 'users');
    
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val() || {};
        const onlineRef = ref(db, 'online');
        
        onValue(onlineRef, (onlineSnapshot) => {
            const onlineUsers = onlineSnapshot.val() || {};
            updateMembersList(users, onlineUsers);
        });
    });
}

function updateMembersList(users, onlineUsers) {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;

    let html = '';
    Object.keys(users).forEach(username => {
        const isOnline = onlineUsers[username]?.status === 'online';
        html += `
            <div class="member-item">
                <div class="member-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                ${username}
                ${isAdmin(username) ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </div>`;
    });

    membersList.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initializeOnlineUsers);