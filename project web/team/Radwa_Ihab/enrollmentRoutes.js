// ============================================================
// enrollmentRoutes.js — Enrollment API Endpoints
// Author: Radwa Ihab Mohamed Abdel Bari
// Role: Enrollment System (Join Courses)
// ============================================================

// --- Route: Enroll Student in a Course ---
// Method: POST | URL: /api/enrollments

app.post('/api/enrollments', (req, res) => {
    const { student_id, course_id } = req.body;

    db.run(
        "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
        [student_id, course_id],
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

// KEY CONCEPTS:
// - db.run() = executes INSERT/UPDATE/DELETE (modifies data)
// - UNIQUE(student_id, course_id) prevents duplicate enrollments
// - Junction table = connects students and courses (Many-to-Many)
// - Status 409 = Conflict (already enrolled)
