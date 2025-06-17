import { db } from './firebase-config.js';
import { ref, set, onValue, onDisconnect } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

function setUserOnline(username) {
    if (!username) return;
    
    const userStatusRef = ref(db, `online/${username}`);
    
    set(userStatusRef, {
        status: 'online',
        lastSeen: Date.now()
    });

    // Handle disconnection
    onDisconnect(userStatusRef).set({
        status: 'offline',
        lastSeen: Date.now()
    });
}

function loadOnlineUsers() {
    const onlineRef = ref(db, 'online');
    
    onValue(onlineRef, (snapshot) => {
        const users = snapshot.val() || {};
        updateMembersList(users);
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

export { setUserOnline, loadOnlineUsers };