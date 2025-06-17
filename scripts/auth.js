import { db } from './firebase-config.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { setUserOnline } from './online.js';
import { displayMessages } from './chat.js';
import { loadFriends } from './social.js';

const ADMIN_USERNAMES = ['SusLOL'];
let currentUser = null;
const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const showToast = debounce((message, type = 'info') => {
    const existingContainer = document.querySelector('.toast-container');
    if (existingContainer) {
        document.body.removeChild(existingContainer);
    }

    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 300);
    }, 3000);
}, 300);

async function loginUser() {
    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        const userRef = ref(db, `users/${username}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        
        if (!userData) {
            showToast('User not found', 'error');
            return;
        }
        
        if (userData.password === password) {
            // Set user as logged in
            currentUser = username;
            localStorage.setItem('currentUser', username);
            
            // Update UI
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('chat-container').style.display = 'grid';
            
            // Setup admin controls if needed
            if (isAdmin(username)) {
                const adminControls = document.getElementById('admin-controls');
                if (adminControls) {
                    adminControls.style.display = 'flex';
                }
            }
            
            // Initialize user presence
            await setUserOnline(username);
            
            // Load app data
            displayMessages();
            loadFriends();
            
            showToast(`Welcome back, ${username}!`, 'success');
        } else {
            showToast('Invalid password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast(`Login failed: ${error.message}`, 'error');
    }
}

async function registerUser() {
    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        const userRef = ref(db, `users/${username}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            showToast('Username already exists!', 'error');
            return;
        }
        
        await set(userRef, {
            password: password,
            friends: [],
            friendRequests: [],
            banned: false,
            createdAt: Date.now()
        });
        
        showToast('Registered successfully!', 'success');
        loginUser();
    } catch (error) {
        console.error('Registration error:', error);
        showToast('An error occurred during registration', 'error');
    }
}

function isAdmin(username) {
    return ADMIN_USERNAMES.includes(username);
}

function logout() {
    const username = localStorage.getItem('currentUser');
    if (username) {
        const userStatusRef = ref(db, `online/${username}`);
        set(userStatusRef, {
            status: 'offline',
            lastSeen: Date.now()
        });
    }
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('chat-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    showToast('Logged out successfully', 'success');
}

function startActivityCheck() {
    setInterval(() => {
        const lastActivity = parseInt(localStorage.getItem('lastActivity')) || 0;
        if (Date.now() - lastActivity > INACTIVE_TIMEOUT) {
            logout();
        }
    }, 60000); // Check every minute
}

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        loginUser();
    }
});

// Update last activity timestamp on user interaction
document.addEventListener('mousemove', () => {
    if (currentUser) {
        localStorage.setItem('lastActivity', Date.now().toString());
    }
});

export { loginUser, registerUser, isAdmin, logout };