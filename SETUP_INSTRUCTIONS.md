# 🚀 Full Care AC Tech — Setup Instructions

## ⚠️ IMPORTANT: MongoDB Atlas IP Whitelist

Your MongoDB connection string is already configured in `backend/.env`.
**Before running the project**, you MUST whitelist your IP in MongoDB Atlas:

1. Go to → https://cloud.mongodb.com
2. Select your cluster: **Cluster0**
3. Click **Network Access** (left sidebar)
4. Click **+ ADD IP ADDRESS**
5. Click **ALLOW ACCESS FROM ANYWHERE** (adds `0.0.0.0/0`)  
   OR enter your specific IP address
6. Click **Confirm**

---

## ✅ Quick Start (After IP Whitelist)

### Step 1 — Backend
```bash
cd backend
npm install
npm run seed      # Seeds DB with demo data
npm run dev       # Starts on http://localhost:5000
```

### Step 2 — Frontend (new terminal)
```bash
cd frontend
npm install
npm start         # Opens http://localhost:3000
```

---

## 🔐 Demo Accounts (after seeding)

| Role        | Email                    | Password   |
|-------------|--------------------------|------------|
| **Admin**   | admin@fullcareac.com     | admin123   |
| **User**    | user@test.com            | user1234   |
| **Tech**    | bilal@tech.com           | tech1234   |

---

## 📋 Your MongoDB Connection

```
URI: mongodb+srv://classifiedallinon_db_user:***@cluster0.cnszuci.mongodb.net/fullcare_ac
Database: fullcare_ac (auto-created on first connection)
```

The `.env` file in `backend/` already has your connection string configured.

---

## 🌐 Pages & URLs

| Page                | URL                    | Access          |
|---------------------|------------------------|-----------------|
| Home                | /                      | Everyone        |
| Login               | /login                 | Everyone        |
| Register            | /register              | Everyone        |
| Services            | /services              | Everyone        |
| Book Service        | /book/:serviceId       | User            |
| My Booking          | /booking/:id           | User/Admin/Tech |
| Invoice             | /invoice/:bookingId    | User/Admin      |
| User Dashboard      | /dashboard             | User            |
| Admin Dashboard     | /admin                 | Admin           |
| Technician Portal   | /technician            | Technician      |
