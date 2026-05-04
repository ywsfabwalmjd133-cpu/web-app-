const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── COURSES ───────────────────────────────────────────────────────
// Get all courses
app.get('/api/courses', (req, res) => {
    db.all("SELECT * FROM courses", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Get single course with its lessons
app.get('/api/courses/:id', (req, res) => {
    db.get("SELECT * FROM courses WHERE id = ?", [req.params.id], (err, course) => {
        if (err || !course) return res.status(404).json({ error: "Course not found" });
        db.all("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num", [req.params.id], (err2, lessons) => {
            res.json({ data: { ...course, lessons: lessons || [] } });
        });
    });
});

// ─── STUDENTS ──────────────────────────────────────────────────────
// Register student
app.post('/api/students/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: "All fields are required." });

    db.run("INSERT INTO students (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE'))
                    return res.status(409).json({ error: "Email already registered." });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Registered successfully!", data: { id: this.lastID, name, email } });
        }
    );
});

// Login student
app.post('/api/students/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM students WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid email or password." });
        res.json({ message: "Login successful!", data: { id: row.id, name: row.name, email: row.email } });
    });
});

// ─── ENROLLMENTS ───────────────────────────────────────────────────
// Enroll student in a course
app.post('/api/enrollments', (req, res) => {
    const { student_id, course_id } = req.body;
    db.run("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)", [student_id, course_id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE'))
                    return res.status(409).json({ error: "Already enrolled." });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Enrolled successfully!" });
        }
    );
});

// Get student dashboard (their enrolled courses + progress)
app.get('/api/students/:id/dashboard', (req, res) => {
    const sql = `
        SELECT c.*, e.progress, e.enrolled_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Update progress
app.put('/api/enrollments/:student_id/:course_id/progress', (req, res) => {
    const { progress } = req.body;
    db.run("UPDATE enrollments SET progress = ? WHERE student_id = ? AND course_id = ?",
        [progress, req.params.student_id, req.params.course_id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Progress updated." });
        }
    );
});

app.listen(PORT, () => console.log(`🚀 Course Platform running at http://localhost:${PORT}`));
