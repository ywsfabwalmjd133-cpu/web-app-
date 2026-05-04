// ============================================================
// server.js — Main Server Setup & Configuration
// Author: Youssef Hani Kamel Ibrahim Abu El Magd
// Role: Project Leader & Server Configuration
// ============================================================
// Description:
//   This file is the ENTRY POINT of the entire application.
//   It initializes Express.js, sets up middleware, and starts
//   the server on port 3000.
// ============================================================

// --- 1. Import Required Modules ---
const express = require('express');   // Web framework for Node.js
const cors = require('cors');         // Cross-Origin Resource Sharing (allows requests from different domains)
const path = require('path');         // Built-in module for file path operations
const db = require('./db');           // Our database module (created by Ahmed Sherif)

// --- 2. Create the Express Application ---
const app = express();
const PORT = 3000;  // The port number where the server will listen

// --- 3. Apply Middleware ---
// Middleware = functions that run BEFORE the route handlers

app.use(cors());
// What: Allows the frontend to communicate with the backend
// Why: Without this, the browser blocks requests from different origins

app.use(express.json());
// What: Parses incoming JSON request bodies
// Why: When frontend sends data (like login info), this converts it
//      from raw text to a JavaScript object (req.body)

app.use(express.static(path.join(__dirname, 'public')));
// What: Serves static files (HTML, CSS, JS) from the 'public' folder
// Why: When someone visits http://localhost:3000, they get index.html
// path.join(__dirname, 'public') = combines current directory + 'public'

// --- 4. Import Route Handlers ---
// These are defined in separate files by other team members:
// - coursesRoutes   → Handles /api/courses      (by Youssef Alaa)
// - studentsRoutes  → Handles /api/students      (by Nour El Din)
// - enrollRoutes    → Handles /api/enrollments   (by Radwa Ihab)
// - dashboardRoutes → Handles /api/students/:id/dashboard (by Mostafa Fares)
// - progressRoutes  → Handles /api/enrollments/:sid/:cid/progress (by Abdel Magid)

// --- 5. Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Course Platform running at http://localhost:${PORT}`);
});

// ============================================================
// KEY CONCEPTS TO REMEMBER:
// 
// Q: What is Express.js?
// A: A minimal web framework for Node.js that makes it easy
//    to create web servers and APIs.
//
// Q: What is Middleware?
// A: Functions that process requests before they reach route
//    handlers. Example: cors(), express.json()
//
// Q: What does app.listen() do?
// A: Starts the server and makes it listen for incoming
//    HTTP requests on the specified port.
//
// Q: What is the difference between app.use() and app.get()?
// A: app.use() applies middleware to ALL requests.
//    app.get() only handles GET requests to a specific path.
// ============================================================
