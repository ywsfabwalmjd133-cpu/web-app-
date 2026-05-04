// ============================================================
// db.js — Database Setup & Table Creation
// Author: Ahmed Sherif Abdel Moneim El Sayed
// Role: Database Design & Schema
// ============================================================
// Description:
//   This file connects to SQLite database and creates all
//   the tables needed for the application.
//   It also seeds initial course data.
// ============================================================

// --- 1. Import SQLite3 Module ---
const sqlite3 = require('sqlite3').verbose();
// .verbose() gives us more detailed error messages for debugging
const path = require('path');

// --- 2. Connect to Database ---
const dbPath = path.resolve(__dirname, 'courses_db.sqlite');
// path.resolve() creates an absolute path to our database file
// If the file doesn't exist, SQLite will create it automatically

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('DB Error:', err.message);
    } else {
        console.log('Connected to courses database.');

        // db.serialize() ensures queries run ONE AT A TIME (in order)
        db.serialize(() => {

            // --- 3. Create Tables ---
            // CREATE TABLE IF NOT EXISTS = only create if table doesn't already exist

            // TABLE 1: courses
            // Stores all available courses
            db.run(`CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                -- id: unique number, auto-increases (1, 2, 3...)
                title TEXT NOT NULL,
                -- title: course name, cannot be empty (NOT NULL)
                description TEXT,
                -- description: course description (optional)
                instructor TEXT,
                -- instructor: teacher name
                duration TEXT,
                -- duration: how long the course is (e.g., "12 Hours")
                level TEXT DEFAULT 'Beginner',
                -- level: difficulty, defaults to 'Beginner' if not specified
                thumbnail TEXT,
                -- thumbnail: image filename
                category TEXT
                -- category: course category (Programming, AI & ML, Web Dev)
            )`);

            // TABLE 2: lessons
            // Stores individual lessons for each course
            db.run(`CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                -- course_id: which course this lesson belongs to
                title TEXT NOT NULL,
                video_url TEXT,
                -- video_url: YouTube embed link
                duration TEXT,
                order_num INTEGER,
                -- order_num: lesson order (1st, 2nd, 3rd...)
                FOREIGN KEY(course_id) REFERENCES courses(id)
                -- FOREIGN KEY: links lesson to a course
                -- This means course_id MUST match an existing course id
            )`);

            // TABLE 3: students
            // Stores registered users
            db.run(`CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                -- UNIQUE: no two students can have the same email
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                -- created_at: automatically stores registration date/time
            )`);

            // TABLE 4: enrollments
            // Tracks which student is enrolled in which course
            db.run(`CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                progress INTEGER DEFAULT 0,
                -- progress: percentage of course completed (0-100)
                UNIQUE(student_id, course_id),
                -- UNIQUE pair: a student can only enroll ONCE per course
                FOREIGN KEY(student_id) REFERENCES students(id),
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )`);

            // --- 4. Seed Data (Initial Courses) ---
            // Only insert data if the courses table is EMPTY
            db.get("SELECT COUNT(*) AS count FROM courses", (err, row) => {
                if (row && row.count === 0) {
                    console.log("Seeding courses and lessons...");

                    // db.prepare() creates a reusable SQL statement
                    // The ? marks are placeholders for values
                    const courseStmt = db.prepare(`INSERT INTO courses 
                        (title, description, instructor, duration, level, thumbnail, category) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`);

                    const coursesData = [
                        ["Python for AI & Data Science",
                         "Master Python from scratch and apply it in real AI projects.",
                         "Dr. Ahmed Samir", "12 Hours", "Beginner", "python.png", "Programming"],

                        ["Machine Learning A-Z",
                         "A comprehensive guide to ML algorithms.",
                         "Prof. Sara Hassan", "20 Hours", "Intermediate", "ml.png", "AI & ML"],

                        ["Web Development Bootcamp",
                         "Full-stack web development using HTML, CSS, JS, Node.js.",
                         "Eng. Youssef Ali", "30 Hours", "Beginner", "web.png", "Web Dev"],

                        ["Deep Learning with TensorFlow",
                         "Dive deep into CNNs, RNNs, and Transformers.",
                         "Dr. Mona Khalid", "25 Hours", "Advanced", "dl.png", "AI & ML"]
                    ];

                    // Insert each course and its lessons
                    coursesData.forEach((c) => {
                        courseStmt.run(c, function() {
                            const courseId = this.lastID;
                            // this.lastID = the auto-generated id of the inserted course

                            const lessonStmt = db.prepare(
                                `INSERT INTO lessons (course_id, title, video_url, duration, order_num) 
                                 VALUES (?, ?, ?, ?, ?)`
                            );

                            const lessonsForCourse = [
                                [`Introduction to ${c[0]}`,
                                 "https://www.youtube.com/embed/rfscVS0vtbw", "45 min", 1],
                                ["Core Concepts Explained",
                                 "https://www.youtube.com/embed/kqtD5dpn9C8", "1 hr", 2],
                                ["Hands-on Practice Project",
                                 "https://www.youtube.com/embed/UB1O30fR-EE", "1.5 hrs", 3],
                            ];

                            lessonsForCourse.forEach(l => lessonStmt.run([courseId, ...l]));
                            lessonStmt.finalize();
                            // finalize() = we're done using this prepared statement
                        });
                    });
                    courseStmt.finalize();
                }
            });
        });
    }
});

// --- 5. Export the Database ---
module.exports = db;
// This allows other files to use: const db = require('./db')

// ============================================================
// KEY CONCEPTS TO REMEMBER:
//
// Q: What is SQLite?
// A: A lightweight database stored in a single file (.sqlite).
//    No separate server needed (unlike MySQL or PostgreSQL).
//
// Q: What is PRIMARY KEY AUTOINCREMENT?
// A: It creates a unique ID for each row that automatically
//    increases (1, 2, 3, 4...).
//
// Q: What is a FOREIGN KEY?
// A: A column that references another table's PRIMARY KEY.
//    It creates a relationship between tables.
//    Example: lessons.course_id → courses.id
//
// Q: What is UNIQUE constraint?
// A: Ensures no duplicate values in that column.
//    Example: Two students can't have the same email.
//
// Q: What does db.serialize() do?
// A: Runs SQL queries sequentially (one after another)
//    instead of all at once. Prevents race conditions.
//
// Q: What is Seed Data?
// A: Initial data inserted into the database so the app
//    has something to display when first launched.
// ============================================================
