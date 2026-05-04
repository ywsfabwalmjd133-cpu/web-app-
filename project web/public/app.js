const API = '/api';

// ─── STATE ───────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('edu_user')) || null;
let allCourses = [];

// ─── EMOJI MAP ────────────────────────────────────────
const courseEmoji = {
    "Programming": "🐍",
    "AI & ML": "🤖",
    "Web Dev": "🌐",
    "default": "📚"
};

// ─── BOOT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateNavForUser();
    fetchCourses();
    showPage('home');
});

// ─── NAVIGATION ──────────────────────────────────────
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

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

function logout() {
    localStorage.removeItem('edu_user');
    currentUser = null;
    updateNavForUser();
    showToast('Logged out successfully.');
    showPage('home');
}

// ─── COURSES ─────────────────────────────────────────
async function fetchCourses() {
    try {
        const res = await fetch(`${API}/courses`);
        const json = await res.json();
        allCourses = json.data;
        renderCourses(allCourses);
    } catch {
        document.getElementById('courses-grid').innerHTML =
            '<p style="color:var(--danger);grid-column:1/-1">Failed to load courses.</p>';
    }
}

function renderCourses(courses) {
    const grid = document.getElementById('courses-grid');
    if (!courses.length) {
        grid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1">No courses found.</p>';
        return;
    }
    grid.innerHTML = courses.map(c => `
        <div class="course-card" onclick="loadCourseDetail(${c.id})">
            <div class="course-thumb">
                ${courseEmoji[c.category] || courseEmoji['default']}
                <span class="course-level-badge badge-${c.level}">${c.level}</span>
            </div>
            <div class="course-body">
                <div class="course-category">${c.category}</div>
                <div class="course-title">${c.title}</div>
                <div class="course-desc">${c.description}</div>
                <div class="course-meta">
                    <span><i class="fas fa-user-tie"></i> ${c.instructor}</span>
                    <span><i class="fas fa-clock"></i> ${c.duration}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCourses(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = category === 'all' ? allCourses : allCourses.filter(c => c.category === category);
    renderCourses(filtered);
}

// ─── COURSE DETAIL ────────────────────────────────────
async function loadCourseDetail(id) {
    showPage('course-detail');
    const container = document.getElementById('course-detail-content');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div>';

    try {
        const res = await fetch(`${API}/courses/${id}`);
        const json = await res.json();
        const c = json.data;
        const emoji = courseEmoji[c.category] || courseEmoji['default'];

        const lessonsHtml = c.lessons.map(l => `
            <div class="lesson-item">
                <div class="lesson-left">
                    <div class="lesson-num">${l.order_num}</div>
                    <div>
                        <div class="lesson-title">${l.title}</div>
                        <div class="lesson-dur"><i class="fas fa-clock"></i> ${l.duration}</div>
                    </div>
                </div>
                <button class="btn-play" onclick="openVideo('${l.video_url}','${l.title.replace(/'/g,"\\'")}')">
                    <i class="fas fa-play"></i> Watch
                </button>
            </div>
        `).join('');

        const alreadyEnrolled = currentUser ? await checkEnrollment(currentUser.id, c.id) : false;

        container.innerHTML = `
            <div class="detail-header">
                <div class="detail-info">
                    <div class="detail-tags">
                        <span class="tag"><i class="fas fa-tag"></i> ${c.category}</span>
                        <span class="tag"><i class="fas fa-signal"></i> ${c.level}</span>
                        <span class="tag"><i class="fas fa-clock"></i> ${c.duration}</span>
                        <span class="tag"><i class="fas fa-user-tie"></i> ${c.instructor}</span>
                    </div>
                    <h2>${c.title}</h2>
                    <p>${c.description}</p>
                    ${alreadyEnrolled
                        ? `<button class="btn-primary" disabled style="opacity:.6">✅ Already Enrolled</button>`
                        : `<button class="btn-primary" onclick="enrollIn(${c.id})">Enroll Now — Free</button>`
                    }
                </div>
                <div class="detail-icon">${emoji}</div>
            </div>
            <div class="lessons-list">
                <h3><i class="fas fa-list-ul"></i> Course Lessons (${c.lessons.length})</h3>
                ${lessonsHtml || '<p style="color:var(--muted)">No lessons yet.</p>'}
            </div>
        `;
    } catch {
        container.innerHTML = '<p style="color:var(--danger)">Failed to load course details.</p>';
    }
}

async function checkEnrollment(studentId, courseId) {
    try {
        const res = await fetch(`${API}/students/${studentId}/dashboard`);
        const json = await res.json();
        return json.data.some(c => c.id === courseId);
    } catch { return false; }
}

async function enrollIn(courseId) {
    if (!currentUser) {
        showToast('Please login to enroll!', true);
        showPage('login');
        return;
    }
    try {
        const res = await fetch(`${API}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: currentUser.id, course_id: courseId })
        });
        const json = await res.json();
        if (res.ok) {
            showToast('🎉 Enrolled successfully!');
            loadCourseDetail(courseId); // refresh
        } else {
            showToast(json.error || 'Could not enroll.', true);
        }
    } catch {
        showToast('Server error.', true);
    }
}

// ─── VIDEO MODAL ──────────────────────────────────────
function openVideo(url, title) {
    document.getElementById('modal-lesson-title').textContent = title;
    document.getElementById('video-iframe').src = url;
    document.getElementById('video-modal').classList.add('active');
}

function closeVideoModal(e) {
    if (!e || e.target.id === 'video-modal' || e.currentTarget.tagName === 'BUTTON') {
        document.getElementById('video-modal').classList.remove('active');
        document.getElementById('video-iframe').src = '';
    }
}

// ─── DASHBOARD ────────────────────────────────────────
async function loadDashboard() {
    if (!currentUser) return;
    document.getElementById('dash-welcome').textContent = `Welcome back, ${currentUser.name}! 👋`;
    const container = document.getElementById('dashboard-content');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div>';

    try {
        const res = await fetch(`${API}/students/${currentUser.id}/dashboard`);
        const json = await res.json();
        const enrolled = json.data;

        if (!enrolled.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>You haven't enrolled in any courses yet.</p>
                    <button class="btn-primary" onclick="showPage('courses')">Browse Courses</button>
                </div>`;
            return;
        }

        container.innerHTML = `<div class="dashboard-grid">
            ${enrolled.map(c => {
                const emoji = courseEmoji[c.category] || courseEmoji['default'];
                const prog = c.progress || 0;
                return `
                <div class="enrolled-card">
                    <div class="enrolled-top">
                        <div class="enroll-icon">${emoji}</div>
                        <div class="enroll-info">
                            <h4>${c.title}</h4>
                            <p>${c.instructor}</p>
                        </div>
                    </div>
                    <div class="progress-section">
                        <label><span>Progress</span><span>${prog}%</span></label>
                        <div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>
                        <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
                            <button class="btn-play" onclick="loadCourseDetail(${c.id});showPage('course-detail')">
                                <i class="fas fa-play"></i> Continue
                            </button>
                            <button class="btn-play" onclick="updateProgress(${currentUser.id},${c.id},${Math.min(prog+25,100)},this)">
                                <i class="fas fa-check"></i> +25% Progress
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    } catch {
        container.innerHTML = '<p style="color:var(--danger)">Failed to load dashboard.</p>';
    }
}

async function updateProgress(studentId, courseId, newProgress, btn) {
    try {
        await fetch(`${API}/enrollments/${studentId}/${courseId}/progress`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: newProgress })
        });
        showToast(`Progress updated to ${newProgress}%!`);
        loadDashboard();
    } catch {
        showToast('Failed to update progress.', true);
    }
}

// ─── AUTH ─────────────────────────────────────────────
async function register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errEl = document.getElementById('register-error');
    const sucEl = document.getElementById('register-success');
    errEl.style.display = 'none';
    sucEl.style.display = 'none';

    if (!name || !email || !password) { showAlert(errEl, 'All fields are required.'); return; }
    if (password.length < 6) { showAlert(errEl, 'Password must be at least 6 characters.'); return; }

    try {
        const res = await fetch(`${API}/students/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const json = await res.json();
        if (res.ok) {
            // Auto-login after successful registration
            currentUser = json.data;
            localStorage.setItem('edu_user', JSON.stringify(currentUser));
            updateNavForUser();
            showToast(`🎉 Welcome, ${currentUser.name}! Account created successfully.`);
            showPage('dashboard');
        } else {
            showAlert(errEl, json.error || 'Registration failed.');
        }
    } catch {
        showAlert(errEl, 'Server error. Is the server running?');
    }
}

async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';

    if (!email || !password) { showAlert(errEl, 'Please fill in all fields.'); return; }

    try {
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
            showToast(`Welcome back, ${currentUser.name}! 🎉`);
            showPage('dashboard');
        } else {
            showAlert(errEl, json.error || 'Login failed.');
        }
    } catch {
        showAlert(errEl, 'Server error. Is the server running?');
    }
}

// ─── HELPERS ─────────────────────────────────────────
function showAlert(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}

function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show${isError ? ' error' : ''}`;
    setTimeout(() => toast.className = 'toast', 3500);
}
