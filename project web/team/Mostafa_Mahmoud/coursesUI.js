// ============================================================
// coursesUI.js — Courses Display & Filtering (Frontend)
// Author: Mostafa Mahmoud Ahmed Abdel Shafy
// Role: Courses Frontend UI (Display, Filter, Detail, Enroll)
// ============================================================

// --- Fetch All Courses from Server ---
async function fetchCourses() {
    try {
        const res = await fetch(`${API}/courses`);
        const json = await res.json();
        allCourses = json.data;
        renderCourses(allCourses);
    } catch {
        document.getElementById('courses-grid').innerHTML =
            '<p style="color:var(--danger)">Failed to load courses.</p>';
    }
}

// --- Render Course Cards ---
function renderCourses(courses) {
    const grid = document.getElementById('courses-grid');
    if (!courses.length) {
        grid.innerHTML = '<p>No courses found.</p>';
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

// --- Filter Courses by Category ---
function filterCourses(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = category === 'all' ? allCourses : allCourses.filter(c => c.category === category);
    renderCourses(filtered);
}

// --- Load Course Detail Page ---
async function loadCourseDetail(id) {
    showPage('course-detail');
    const container = document.getElementById('course-detail-content');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div>';

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
            <button class="btn-play" onclick="openVideo('${l.video_url}','${l.title}')">
                <i class="fas fa-play"></i> Watch
            </button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="detail-header">
            <div class="detail-info">
                <h2>${c.title}</h2>
                <p>${c.description}</p>
                <button class="btn-primary" onclick="enrollIn(${c.id})">Enroll Now</button>
            </div>
            <div class="detail-icon">${emoji}</div>
        </div>
        <div class="lessons-list">
            <h3>Course Lessons (${c.lessons.length})</h3>
            ${lessonsHtml}
        </div>
    `;
}

// --- Enroll in Course ---
async function enrollIn(courseId) {
    if (!currentUser) { showPage('login'); return; }
    const res = await fetch(`${API}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: currentUser.id, course_id: courseId })
    });
    if (res.ok) {
        showToast('Enrolled successfully!');
        loadCourseDetail(courseId);
    }
}

// KEY CONCEPTS:
// - Template Literals (backticks ``) = create HTML strings with JS variables
// - .map() = transforms each array item into something new
// - .join('') = combines array items into one string
// - .filter() = returns only items that match a condition
// - Dynamic HTML = building HTML from JavaScript data
