const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'courses_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('DB Error:', err.message);
    } else {
        console.log('Connected to courses database.');
        db.serialize(() => {

            // Table: courses
            db.run(`CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                instructor TEXT,
                duration TEXT,
                level TEXT DEFAULT 'Beginner',
                thumbnail TEXT,
                category TEXT
            )`);

            // Table: lessons
            db.run(`CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                video_url TEXT,
                duration TEXT,
                order_num INTEGER,
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )`);

            // Table: students
            db.run(`CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Table: enrollments
            db.run(`CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                progress INTEGER DEFAULT 0,
                UNIQUE(student_id, course_id),
                FOREIGN KEY(student_id) REFERENCES students(id),
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )`);

            // Seed Data
            db.get("SELECT COUNT(*) AS count FROM courses", (err, row) => {
                if (row && row.count === 0) {
                    console.log("Seeding courses and lessons...");

                    const courseStmt = db.prepare(`INSERT INTO courses 
                        (title, description, instructor, duration, level, thumbnail, category) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`);

                    const coursesData = [
                        ["Python for AI & Data Science", "Master Python from scratch and apply it in real AI and data science projects. Covers NumPy, Pandas, and Matplotlib.", "Dr. Ahmed Samir", "12 Hours", "Beginner", "python.png", "Programming"],
                        ["Machine Learning A-Z", "A comprehensive guide to ML algorithms: Linear Regression, Decision Trees, SVMs, and Neural Networks.", "Prof. Sara Hassan", "20 Hours", "Intermediate", "ml.png", "AI & ML"],
                        ["Web Development Bootcamp", "Full-stack web development using HTML, CSS, JavaScript, Node.js and Express with SQLite.", "Eng. Youssef Ali", "30 Hours", "Beginner", "web.png", "Web Dev"],
                        ["Deep Learning with TensorFlow", "Dive deep into CNNs, RNNs, and Transformers using TensorFlow and Keras for real-world applications.", "Dr. Mona Khalid", "25 Hours", "Advanced", "dl.png", "AI & ML"]
                    ];

                    coursesData.forEach((c, i) => {
                        courseStmt.run(c, function() {
                            const courseId = this.lastID;
                            const lessonStmt = db.prepare(`INSERT INTO lessons (course_id, title, video_url, duration, order_num) VALUES (?, ?, ?, ?, ?)`);
                            
                            const lessonsForCourse = [
                                [`Introduction to ${c[0]}`, "https://www.youtube.com/embed/rfscVS0vtbw", "45 min", 1],
                                ["Core Concepts Explained", "https://www.youtube.com/embed/kqtD5dpn9C8", "1 hr", 2],
                                ["Hands-on Practice Project", "https://www.youtube.com/embed/UB1O30fR-EE", "1.5 hrs", 3],
                            ];

                            lessonsForCourse.forEach(l => lessonStmt.run([courseId, ...l]));
                            lessonStmt.finalize();
                        });
                    });
                    courseStmt.finalize();
                }
            });
        });
    }
});

module.exports = db;
