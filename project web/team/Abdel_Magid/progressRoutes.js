// ============================================================
// progressRoutes.js — Progress Update API
// Author: Abdel Magid Essam Abdel Magid El Samry
// Role: Progress Tracking System
// ============================================================

// --- Route: Update Student Progress in a Course ---
// Method: PUT (because we're UPDATING existing data)
// URL: /api/enrollments/:student_id/:course_id/progress

app.put('/api/enrollments/:student_id/:course_id/progress', (req, res) => {
    const { progress } = req.body;
    // progress = new percentage value (e.g., 25, 50, 75, 100)

    db.run(
        "UPDATE enrollments SET progress = ? WHERE student_id = ? AND course_id = ?",
        [progress, req.params.student_id, req.params.course_id],
        function (err) {
            // UPDATE = SQL command to modify existing data
            // SET progress = ? = change the progress column
            // WHERE = which row to update (specific student + course)

            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Progress updated." });
        }
    );
});

// KEY CONCEPTS:
// - PUT method = used for updating existing resources
// - SQL UPDATE = modifies data in existing rows
// - Multiple URL params: :student_id and :course_id
// - Progress is stored as integer (0-100) in enrollments table
