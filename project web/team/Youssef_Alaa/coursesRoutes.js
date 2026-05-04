// ============================================================
// coursesRoutes.js — Courses API Endpoints
// Author: Youssef Alaa El Din Mohamed Mokheimer
// Role: Courses API (Backend Routes)
// ============================================================
// Description:
//   This file handles all API routes related to COURSES.
//   - GET /api/courses       → Get all courses
//   - GET /api/courses/:id   → Get a single course with its lessons
// ============================================================

// --- What is an API Route? ---
// An API route is a URL path that the server listens to.
// When the frontend sends a request to this URL, the server
// executes the corresponding function and sends back data.

// --- Route 1: Get All Courses ---
// Method: GET
// URL: /api/courses
// Purpose: Returns a list of ALL courses from the database

app.get('/api/courses', (req, res) => {
    // req = the incoming request from the client
    // res = the response we send back

    db.all("SELECT * FROM courses", [], (err, rows) => {
        // db.all() = fetch ALL matching rows from the database
        // "SELECT * FROM courses" = SQL query meaning "get everything from courses table"
        // [] = no parameters needed for this query
        // err = error (if any)
        // rows = array of course objects

        if (err) return res.status(500).json({ error: err.message });
        // status(500) = Internal Server Error
        // .json() = send response as JSON format

        res.json({ data: rows });
        // Send all courses as JSON: { data: [{course1}, {course2}, ...] }
    });
});


// --- Route 2: Get Single Course with Lessons ---
// Method: GET
// URL: /api/courses/:id   (e.g., /api/courses/1, /api/courses/2)
// Purpose: Returns ONE course and all its lessons

app.get('/api/courses/:id', (req, res) => {
    // :id is a URL parameter
    // If URL is /api/courses/3, then req.params.id = "3"

    db.get("SELECT * FROM courses WHERE id = ?", [req.params.id], (err, course) => {
        // db.get() = fetch ONE row from the database
        // "WHERE id = ?" = filter by course id
        // [req.params.id] = the value that replaces ?

        if (err || !course) return res.status(404).json({ error: "Course not found" });
        // 404 = Not Found (course doesn't exist)

        // Now get the lessons for this course
        db.all("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num",
            [req.params.id], (err2, lessons) => {
                // "ORDER BY order_num" = sort lessons by their order (1, 2, 3...)

                res.json({ data: { ...course, lessons: lessons || [] } });
                // { ...course } = spread operator (copies all course properties)
                // lessons: lessons || [] = include lessons array (empty array if none)
                // Result: { data: { id:1, title:"...", ..., lessons: [{...}, {...}] } }
            }
        );
    });
});

// ============================================================
// KEY CONCEPTS TO REMEMBER:
//
// Q: What is REST API?
// A: A way to design APIs using HTTP methods:
//    GET = Read data
//    POST = Create new data
//    PUT = Update existing data
//    DELETE = Remove data
//
// Q: What is a Route Parameter (:id)?
// A: A dynamic part of the URL. /api/courses/:id means
//    the :id part can be any value (1, 2, 3, etc.)
//    Access it with: req.params.id
//
// Q: What does res.json() do?
// A: Converts a JavaScript object to JSON format and
//    sends it as the HTTP response.
//
// Q: What is SQL SELECT?
// A: A SQL command that reads data from the database.
//    SELECT * = get all columns
//    WHERE = filter results
//    ORDER BY = sort results
//
// Q: What is the ? in SQL queries?
// A: A placeholder for values. It prevents SQL Injection
//    (a type of security attack).
// ============================================================
