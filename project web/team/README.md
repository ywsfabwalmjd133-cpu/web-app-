# EduAI — Course Management System
## فريق المشروع | Project Team

### 📋 Project Overview
EduAI is a web-based Course Management System built with:
- **Backend:** Node.js + Express.js
- **Database:** SQLite3
- **Frontend:** HTML + CSS + JavaScript
- **Architecture:** REST API (Client-Server)

---

## 👥 Team Members & Responsibilities

| # | Name (English) | Folder | Role | File |
|---|----------------|--------|------|------|
| 1 | **Youssef Hani** Kamel Ibrahim Abu El Magd | `Youssef_Hani/` | 🏆 Project Leader - Server Setup | `server.js` |
| 2 | **Ahmed Sherif** Abdel Moneim El Sayed | `Ahmed_Sherif/` | 🗄️ Database Design & Schema | `db.js` |
| 3 | **Youssef Alaa** El Din Mohamed Mokheimer | `Youssef_Alaa/` | 📚 Courses API Routes | `coursesRoutes.js` |
| 4 | **Nour El Din** Mohamed Shaker (1) | `Nour_Eldin_1/` | 🔐 Authentication API (Register/Login) | `studentsRoutes.js` |
| 5 | **Radwa Ihab** Mohamed Abdel Bari | `Radwa_Ihab/` | 📝 Enrollment System API | `enrollmentRoutes.js` |
| 6 | **Mostafa Fares** Abu Horeira | `Mostafa_Fares/` | 📊 Dashboard API | `dashboardRoutes.js` |
| 7 | **Abdel Magid** Essam Abdel Magid El Samry | `Abdel_Magid/` | 📈 Progress Tracking API + HTML Structure | `progressRoutes.js` |
| 8 | **Nour El Din** Mohamed Shaker (2) | `Nour_Eldin_2/` | 🖥️ Frontend Navigation & Auth UI | `frontend.js` |
| 9 | **Mostafa Mahmoud** Ahmed Abdel Shafy | `Mostafa_Mahmoud/` | 🎨 Courses Frontend UI | `coursesUI.js` |
| 10 | **Mina Shafiq** Samir | `Mina_Shafiq/` | 🎭 CSS Design & Styling | `style.css` |

---

## 🏗️ Project Architecture

```
Client (Browser)          Server (Node.js)          Database (SQLite)
     |                         |                         |
     |  1. HTTP Request  --->  |                         |
     |  (GET /api/courses)     |  2. SQL Query  --->     |
     |                         |  (SELECT * FROM...)     |
     |                         |  3. Results  <---       |
     |  4. JSON Response <---  |                         |
     |  { data: [...] }        |                         |
```

## 🚀 How to Run
```bash
npm install
npm start
# Open http://localhost:3000
```
