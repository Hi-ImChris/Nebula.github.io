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

export function loadOnlineUsers() {
    const onlineRef = ref(db, 'online');
    onValue(onlineRef, (snapshot) => {
        updateMembersList(snapshot.val() || {});
    });
}

function updateMembersList(users) {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;

    let html = '';
    Object.entries(users).forEach(([username, data]) => {
        const isOnline = data.status === 'online';
        html += `
            <div class="member-item">
                <div class="member-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                ${username}
                ${isAdmin(username) ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </div>`;
    });

    membersList.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('currentUser')) {
        loadOnlineUsers();
    }
});