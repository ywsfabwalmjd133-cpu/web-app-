// ============================================================
// frontend.js — Frontend Logic (Navigation & Auth UI)
// Author: Nour El Din Mohamed Shaker (2)
// Role: Frontend Navigation & Authentication UI
// ============================================================

const API = '/api';

// --- State Management ---
let currentUser = JSON.parse(localStorage.getItem('edu_user')) || null;
// localStorage = browser storage that persists even after closing
// We save user data here so they stay logged in

let allCourses = [];

// --- Emoji Map for Course Categories ---
const courseEmoji = {
    "Programming": "🐍",
    "AI & ML": "🤖",
    "Web Dev": "🌐",
    "default": "📚"
};

// --- Boot (runs when page loads) ---
document.addEventListener('DOMContentLoaded', () => {
    updateNavForUser();
    fetchCourses();
    showPage('home');
});

// --- Page Navigation ---
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

    // Show the requested page
    const page = document.getElementById(`page-${pageName}`);
    if (page) {
        page.classList.add('active');
        const navLink = document.getElementById(`nav-${pageName}`);
        if (navLink) navLink.classList.add('active');
    }

    if (pageName === 'dashboard') {
        if (!currentUser) { showPage('login'); return; }
        loadDashboard();
    }
}

// --- Update Navbar Based on Login State ---
function updateNavForUser() {
    const authDiv = document.getElementById('nav-auth');
    const userDiv = document.getElementById('nav-user');
    const dashLink = document.getElementById('nav-dashboard');

    if (currentUser) {
        authDiv.style.display = 'none';
        userDiv.style.display = 'flex';
        document.getElementById('nav-uname-text').textContent = currentUser.name;
        dashLink.style.display = 'inline';
    } else {
        authDiv.style.display = 'flex';
        userDiv.style.display = 'none';
        dashLink.style.display = 'none';
    }
}

// --- Logout ---
function logout() {
    localStorage.removeItem('edu_user');
    currentUser = null;
    updateNavForUser();
    showToast('Logged out successfully.');
    showPage('home');
}

// --- Register ---
async function register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!name || !email || !password) return;

    const res = await fetch(`${API}/students/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const json = await res.json();

    if (res.ok) {
        currentUser = json.data;
        localStorage.setItem('edu_user', JSON.stringify(currentUser));
        updateNavForUser();
        showToast(`Welcome, ${currentUser.name}!`);
        showPage('dashboard');
    }
}

// --- Login ---
async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const res = await fetch(`${API}/students/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const json = await res.json();

    if (res.ok) {
        currentUser = json.data;
        localStorage.setItem('edu_user', JSON.stringify(currentUser));
        updateNavForUser();
        showToast(`Welcome back, ${currentUser.name}!`);
        showPage('dashboard');
    }
}

// KEY CONCEPTS:
// - localStorage = persistent browser storage (key-value pairs)
// - fetch() = sends HTTP requests from browser to server
// - async/await = cleaner way to handle asynchronous operations
// - JSON.stringify/parse = convert between JS objects and JSON strings
// - DOM manipulation = changing HTML elements with JavaScript
