let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');

function setUserOnline(username) {
    if (!onlineUsers.includes(username)) {
        onlineUsers.push(username);
        localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
    }
    localStorage.setItem(`lastActivity_${username}`, Date.now().toString());
    loadOnlineUsers();
}

function setUserOffline(username) {
    onlineUsers = onlineUsers.filter(user => user !== username);
    localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
    localStorage.removeItem(`lastActivity_${username}`);
    loadOnlineUsers();
}

function loadOnlineUsers() {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const currentTime = Date.now();

    let html = '';
    Object.keys(users).forEach(username => {
        const lastActivity = localStorage.getItem(`lastActivity_${username}`);
        const isOnline = lastActivity && (currentTime - parseInt(lastActivity) < 5 * 60 * 1000);
        const isVerified = isAdmin(username);

        html += `
            <div class="member-item">
                <div class="member-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                ${username}
                ${isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </div>`;
    });

    membersList.innerHTML = html;
}

function cleanupOnlineUsers() {
    const currentTime = Date.now();
    const inactiveTimeout = 5 * 60 * 1000; // 5 minutes

    onlineUsers.forEach(username => {
        const lastActivity = localStorage.getItem(`lastActivity_${username}`);
        if (!lastActivity || (currentTime - parseInt(lastActivity) > inactiveTimeout)) {
            setUserOffline(username);
        }
    });
}

// Update online users periodically
setInterval(cleanupOnlineUsers, 60000); // Every minute
setInterval(loadOnlineUsers, 30000); // Every 30 seconds

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('currentUser')) {
        loadOnlineUsers();
    }
});