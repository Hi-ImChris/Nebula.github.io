import { db } from './firebase-config.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { isAdmin } from './auth.js';

let currentDM = null;

export function loadMembers() {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    let html = '';

    Object.keys(users).forEach(username => {
        const isOnline = checkUserOnline(username);
        html += `
            <div class="member-item">
                <div class="member-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                ${username}
                ${isAdmin(username) ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </div>`;
    });

    membersList.innerHTML = html || '<div class="no-members">No members online</div>';
}

export async function loadFriends() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userRef = ref(db, `users/${currentUser}/friends`);
    const snapshot = await get(userRef);
    const friends = snapshot.val() || [];

    const friendsList = document.getElementById('friends-list');
    if (!friendsList) return;

    if (friends.length === 0) {
        friendsList.innerHTML = '<div class="no-friends">No friends added yet</div>';
        return;
    }

    let html = '';
    friends.forEach(friend => {
        const isOnline = checkUserOnline(friend);
        html += `
            <div class="friend-item" onclick="startChat('${friend}')">
                <div class="friend-info">
                    <div class="friend-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                    <div class="friend-name">
                        ${friend}
                        ${isAdmin(friend) ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="action-btn message-btn" onclick="startChat('${friend}', event)">
                        <i class="fas fa-message"></i>
                    </button>
                    <button class="action-btn remove-btn" onclick="confirmRemoveFriend('${friend}', event)">
                        <i class="fas fa-user-minus"></i>
                    </button>
                </div>
            </div>`;
    });

    friendsList.innerHTML = html;
}

function startDM(username) {
    const currentUser = localStorage.getItem('currentUser');
    if (username === currentUser) return;
    
    currentDM = username;
    currentChat = `DM:${[currentUser, username].sort().join('-')}`;
    
    const chatTitle = document.querySelector('.chat-title');
    if (chatTitle) {
        chatTitle.textContent = `Chat with ${username}`;
    }
    
    displayMessages();
}

function addFriend(username) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser || username === currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (!users[username]) {
        showToast('User not found', 'error');
        return;
    }

    if (!users[currentUser].friends.includes(username)) {
        users[currentUser].friends.push(username);
        localStorage.setItem('users', JSON.stringify(users));
        showToast(`Added ${username} as friend`, 'success');
        loadFriends();
    }
}

function removeFriend(username) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser].friends = users[currentUser].friends.filter(friend => friend !== username);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast(`Removed ${username} from friends`, 'success');
    loadFriends();
}

function checkUserOnline(username) {
    const lastActivity = localStorage.getItem(`lastActivity_${username}`);
    if (!lastActivity) return false;
    return Date.now() - parseInt(lastActivity) < 5 * 60 * 1000; // 5 minutes
}

function handleFriendRequest(username, accept) {
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (accept) {
        users[currentUser].friends.push(username);
        users[username].friends.push(currentUser);
    }

    users[currentUser].friendRequests = users[currentUser].friendRequests.filter(req => req !== username);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast(accept ? `Accepted friend request from ${username}` : `Declined friend request from ${username}`, 'success');
    loadFriends();
}

function showAddFriendModal() {
    const modal = document.getElementById('add-friend-modal');
    modal.style.display = 'flex';
    document.getElementById('friend-username').focus();
}

function hideAddFriendModal() {
    const modal = document.getElementById('add-friend-modal');
    modal.style.display = 'none';
    document.getElementById('friend-username').value = '';
}

function submitAddFriend() {
    const username = document.getElementById('friend-username').value.trim();
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }
    
    addFriend(username);
    hideAddFriendModal();
}

function startChat(username, event) {
    if (event) {
        event.stopPropagation();
    }
    
    currentDM = username;
    currentChat = `DM:${[localStorage.getItem('currentUser'), username].sort().join('-')}`;
    
    // Update chat title
    const chatTitle = document.querySelector('.chat-title');
    if (chatTitle) {
        chatTitle.innerHTML = `
            <div class="chat-title-content">
                <span>${username}</span>
                ${isAdmin(username) ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </div>`;
    }
    
    displayMessages();
}

function confirmRemoveFriend(username, event) {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to remove ${username} from your friends list?`)) {
        removeFriend(username);
    }
}

// Update online status periodically
setInterval(() => {
    loadMembers();
    loadFriends();
}, 30000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('currentUser')) {
        loadMembers();
        loadFriends();
    }

    // Add event listener for Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAddFriendModal();
        }
    });
});