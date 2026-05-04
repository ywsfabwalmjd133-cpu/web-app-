// ============================================================
// studentsRoutes.js — Student Registration & Login API
// Author: Nour El Din Mohamed Shaker (1)
// Role: Authentication System (Register & Login)
// ============================================================
// Description:
//   This file handles all API routes related to STUDENTS.
//   - POST /api/students/register  → Create new account
//   - POST /api/students/login     → Log into existing account
// ============================================================

// --- Route 1: Student Registration ---
// Method: POST (because we're CREATING new data)
// URL: /api/students/register
// Purpose: Creates a new student account

app.post('/api/students/register', (req, res) => {
    // req.body contains the data sent from the frontend form
    const { name, email, password } = req.body;
    // Destructuring: extracts name, email, password from req.body
    // Same as: const name = req.body.name; etc.

    // --- Validation ---
    if (!name || !email || !password)
        return res.status(400).json({ error: "All fields are required." });
    // status(400) = Bad Request (client sent incomplete data)

    // --- Insert into Database ---
    db.run("INSERT INTO students (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        function (err) {
            // Note: we use function() not arrow function () =>
            // because we need access to 'this.lastID'

            if (err) {
                if (err.message.includes('UNIQUE'))
                    return res.status(409).json({ error: "Email already registered." });
                // status(409) = Conflict (duplicate email)
                return res.status(500).json({ error: err.message });
            }

            // Success! Send back the new student data
            res.json({
                message: "Registered successfully!",
                data: { id: this.lastID, name, email }
                // this.lastID = the auto-generated ID of the new student
                // We DON'T send back the password (security!)
            });
        }
    );
});


// --- Route 2: Student Login ---
// Method: POST (POST because we're sending sensitive data)
// URL: /api/students/login
// Purpose: Verifies student credentials and logs them in

app.post('/api/students/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM students WHERE email = ? AND password = ?",
        [email, password], (err, row) => {
            // db.get() returns ONE row if found, or null if not found
            // We check BOTH email AND password must match

            if (err) return res.status(500).json({ error: err.message });

            if (!row) return res.status(401).json({ error: "Invalid email or password." });
            // status(401) = Unauthorized (wrong credentials)

            // Success! Send back student data (without password)
            res.json({
                message: "Login successful!",
                data: { id: row.id, name: row.name, email: row.email }
            });
        }
    );
});

// ============================================================
// KEY CONCEPTS TO REMEMBER:
//
// Q: Why use POST for login instead of GET?
// A: POST sends data in the request BODY (hidden).
//    GET sends data in the URL (visible: /login?email=...&pass=...)
//    Sensitive data like passwords should NEVER be in URLs.
//
// Q: What is Authentication?
// A: The process of verifying who a user is.
//    Register = creating an identity
//    Login = proving your identity
//
// Q: What is req.body?
// A: The data sent by the frontend in a POST request.
//    It's parsed by express.json() middleware.
//
// Q: What is HTTP Status 409?
// A: "Conflict" — the request conflicts with existing data.
//    We use it when someone tries to register with an
//    email that already exists.
//
// Q: Why not send password back in the response?
// A: Security best practice! Never expose passwords
//    in API responses. Only send what the frontend needs.
//
// Q: What is SQL Injection?
// A: A hack where an attacker puts SQL code in input fields.
//    Using ? placeholders prevents this automatically.
// ============================================================
