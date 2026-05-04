// ============================================================
// dashboardRoutes.js — Student Dashboard API
// Author: Mostafa Fares Abu Horeira
// Role: Dashboard System (Student's enrolled courses)
// ============================================================

// --- Route: Get Student Dashboard ---
// Method: GET | URL: /api/students/:id/dashboard
// Purpose: Returns all courses a student is enrolled in + progress

app.get('/api/students/:id/dashboard', (req, res) => {
    // :id = the student's ID from the URL

    const sql = `
        SELECT c.*, e.progress, e.enrolled_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
    `;
    // SQL JOIN explained:
    // We need data from TWO tables: enrollments + courses
    // JOIN connects them where enrollment.course_id = course.id
    // c.* = all columns from courses table
    // e.progress = progress percentage from enrollments
    // e.enrolled_at = enrollment date from enrollments
    // WHERE e.student_id = ? = filter by this specific student

    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
        // Returns: { data: [{course info + progress}, ...] }
    });
});

// KEY CONCEPTS:
// - SQL JOIN = combines data from multiple tables
// - req.params.id = gets :id from URL path
// - db.all() = returns multiple rows as array
// - Dashboard shows courses the student enrolled in
