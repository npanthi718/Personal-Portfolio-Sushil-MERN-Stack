# 🚀 Personal Portfolio Backend

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</div>

---

## ✨ Features

- **Content Management:** APIs for Hero, About, Skills, Projects, Experience, and more.
- **Admin Authentication:** Secure JWT-based login and cookie-based session management.
- **Real-time Updates:** Server-Sent Events (SSE) for instant dashboard updates.
- **File Uploads:** Integrated with Cloudinary for handling Resumes and Profile Photos.
- **Validation:** Robust data validation using Joi.
- **CORS & Security:** Configured for secure cross-origin resource sharing.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 🟢
- **Framework:** Express.js 🚂
- **Database:** MongoDB (via Mongoose) 🍃
- **Authentication:** JSON Web Tokens (JWT) 🔑
- **File Storage:** Cloudinary ☁️
- **Validation:** Joi 🛡️

---

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account

### ⚙️ Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173,https://www.sushilpanthi.com

# Cloudinary Config
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Default Admin (Auto-created on first run)
ADMIN_USER=admin
ADMIN_EMAIL=admin@sushilpanthi.com
ADMIN_PASS=admin123
```

### 🛠️ Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```

---

## 🛤️ API Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/content/:key` | Get portfolio content by key | No |
| `PUT` | `/api/content/:key` | Update portfolio content | **Yes** |
| `POST` | `/api/admin/login` | Admin login | No |
| `POST` | `/api/upload` | Upload file to Cloudinary | **Yes** |
| `GET` | `/api/contact/list` | View contact messages | **Yes** |

---

## 👨‍💻 Author

**Sushil Panthi**
- Website: [www.sushilpanthi.com](https://www.sushilpanthi.com)
- GitHub: [@npanthi718](https://github.com/npanthi718)
