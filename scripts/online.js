import { db } from './firebase-config.js';
import { ref, set, onValue, onDisconnect } from "firebase/database";

function setUserOnline(username) {
    if (!username) return;
    
    const userStatusRef = ref(db, `online/${username}`);
    const connectedRef = ref(db, '.info/connected');
    
    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            set(userStatusRef, {
                status: 'online',
                lastSeen: new Date().toISOString()
            });

            onDisconnect(userStatusRef).set({
                status: 'offline',
                lastSeen: new Date().toISOString()
            });
        }
    });
}

function loadOnlineUsers() {
    const onlineRef = ref(db, 'online');
    
    onValue(onlineRef, (snapshot) => {
        const membersList = document.getElementById('members-list');
        if (!membersList) return;

        const users = snapshot.val() || {};
        let html = '';
        
        Object.entries(users).forEach(([username, data]) => {
            const isOnline = data.status === 'online';
            const isVerified = isAdmin(username);
            
            html += `
                <div class="member-item">
                    <div class="member-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                    ${username}
                    ${isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                </div>`;
        });

        membersList.innerHTML = html;
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('currentUser')) {
        loadOnlineUsers();
    }
});