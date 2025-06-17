import { db } from './firebase-config.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { setUserOnline } from './online.js';

const ADMIN_USERNAMES = ['SusLOL'];
export let currentUser = null;

// Toast notification system
function createToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info') {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            container.removeChild(toast);
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

// Login function
export async function loginUser() {
    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        console.log('Login attempt:', username); // Debug log
        
        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        const userRef = ref(db, `users/${username}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        
        console.log('User data:', userData); // Debug log

        if (!userData) {
            showToast('User not found', 'error');
            return;
        }
        
        if (userData.password === password) {
            localStorage.setItem('currentUser', username);
            
            // Update UI
            const authContainer = document.getElementById('auth-container');
            const chatContainer = document.getElementById('chat-container');
            
            console.log('Containers:', { authContainer, chatContainer }); // Debug log
            
            if (authContainer && chatContainer) {
                authContainer.style.display = 'none';
                chatContainer.style.display = 'grid';
                
                await setUserOnline(username);
                showToast(`Welcome back, ${username}!`, 'success');
                console.log('Login successful'); // Debug log
            } else {
                console.error('Container elements not found');
            }
        } else {
            showToast('Invalid password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred during login', 'error');
    }
}

export async function registerUser() {
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

export function isAdmin(username) {
    return ADMIN_USERNAMES.includes(username);
}