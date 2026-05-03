# 🌬️ Full Care AC Tech — AC Services & Maintenance System

A complete, production-ready web application for managing AC services, bookings, technicians, inventory, and analytics.

---

## 📁 Project Structure

```
fullcare-ac/
├── backend/
│   ├── config/              # (reserved for future DB config abstraction)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── serviceController.js
│   │   ├── technicianController.js
│   │   ├── inventoryController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js          # JWT protect + role authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Technician.js
│   │   └── Inventory.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── technicians.js
│   │   ├── inventory.js
│   │   ├── payments.js
│   │   ├── analytics.js
│   │   └── notifications.js
│   ├── utils/
│   │   └── seeder.js        # Database seeder with mock data
│   ├── .env                 # Environment variables (update with your values)
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── index.js   # StatusBadge, Modal, StatCard, etc.
    │   │       ├── Navbar.js
    │   │       └── Footer.js
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── ServicesPage.js
    │   │   ├── BookingPage.js
    │   │   ├── BookingDetailPage.js
    │   │   ├── InvoicePage.js
    │   │   ├── UserDashboard.js
    │   │   ├── AdminDashboard.js
    │   │   └── TechnicianDashboard.js
    │   ├── services/
    │   │   └── api.js         # All Axios API calls
    │   ├── App.js             # Routing + protected routes
    │   └── index.js
    ├── package.json
    └── tailwind.config.js
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

---

### 1. Clone / Extract the project
```bash
cd fullcare-ac
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure environment variables** — edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fullcare_ac?retryWrites=true&w=majority
JWT_SECRET=fullcare_ac_super_secret_jwt_key_2024
JWT_EXPIRE=30d
NODE_ENV=development
```

> Replace `MONGODB_URI` with your actual MongoDB Atlas connection string.

**Seed the database** (creates admin, user, technicians, services, inventory):
```bash
npm run seed
```

**Start the backend**:
```bash
npm run dev       # Development (with nodemon)
# or
npm start         # Production
```

Backend will run at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend will run at: `http://localhost:3000`

> The frontend proxies API requests to `http://localhost:5000` automatically (configured in package.json).

---

## 🔐 Demo Login Credentials

After running `npm run seed`:

| Role        | Email                    | Password   |
|-------------|--------------------------|------------|
| **Admin**   | admin@fullcareac.com     | admin123   |
| **User**    | user@test.com            | user1234   |
| **Technician** | bilal@tech.com        | tech1234   |

---

## 🗺️ API Routes

### Auth
| Method | Route                        | Access  | Description          |
|--------|------------------------------|---------|----------------------|
| POST   | /api/auth/register           | Public  | Register user        |
| POST   | /api/auth/login              | Public  | Login                |
| GET    | /api/auth/me                 | Private | Get current user     |
| PUT    | /api/auth/updateprofile      | Private | Update profile       |
| PUT    | /api/auth/changepassword     | Private | Change password      |
| GET    | /api/auth/users              | Admin   | Get all users        |

### Services
| Method | Route              | Access | Description      |
|--------|--------------------|--------|------------------|
| GET    | /api/services      | Public | All services     |
| GET    | /api/services/:id  | Public | Single service   |
| POST   | /api/services      | Admin  | Create service   |
| PUT    | /api/services/:id  | Admin  | Update service   |
| DELETE | /api/services/:id  | Admin  | Delete service   |

### Bookings
| Method | Route                           | Access            | Description              |
|--------|---------------------------------|-------------------|--------------------------|
| GET    | /api/bookings                   | Private           | Get bookings             |
| GET    | /api/bookings/:id               | Private           | Get single booking       |
| POST   | /api/bookings                   | User/Admin        | Create booking           |
| PUT    | /api/bookings/:id/status        | Admin/Technician  | Update status            |
| PUT    | /api/bookings/:id/assign        | Admin             | Assign technician        |
| PUT    | /api/bookings/:id/cancel        | Private           | Cancel booking           |
| GET    | /api/bookings/recommendations   | Private           | Smart recommendations    |

### Technicians
| Method | Route                        | Access      | Description              |
|--------|------------------------------|-------------|--------------------------|
| GET    | /api/technicians             | Private     | All technicians          |
| GET    | /api/technicians/profile/me  | Technician  | My profile               |
| GET    | /api/technicians/:id         | Private     | Single technician        |
| POST   | /api/technicians             | Admin       | Create technician        |
| PUT    | /api/technicians/:id         | Admin       | Update technician        |
| PUT    | /api/technicians/status      | Technician  | Update my status         |
| PUT    | /api/technicians/location    | Technician  | Update GPS location      |
| DELETE | /api/technicians/:id         | Admin       | Deactivate               |

### Inventory
| Method | Route                        | Access       | Description      |
|--------|------------------------------|--------------|------------------|
| GET    | /api/inventory               | Admin/Tech   | All items        |
| POST   | /api/inventory               | Admin        | Add item         |
| PUT    | /api/inventory/:id           | Admin        | Update item      |
| PUT    | /api/inventory/:id/restock   | Admin        | Restock item     |
| DELETE | /api/inventory/:id           | Admin        | Remove item      |

### Analytics
| Method | Route                    | Access | Description        |
|--------|--------------------------|--------|--------------------|
| GET    | /api/analytics/dashboard | Admin  | Dashboard data     |
| GET    | /api/analytics/revenue   | Admin  | Revenue analytics  |

### Payments
| Method | Route                          | Access  | Description       |
|--------|--------------------------------|---------|-------------------|
| POST   | /api/payments/initiate         | Private | Start payment     |
| GET    | /api/payments/invoice/:id      | Private | Get invoice       |

### Notifications
| Method | Route                            | Access  | Description       |
|--------|----------------------------------|---------|-------------------|
| GET    | /api/notifications               | Private | Get notifications |
| PUT    | /api/notifications/:id/read      | Private | Mark read         |
| PUT    | /api/notifications/read-all      | Private | Mark all read     |

---

## 🧱 MongoDB Models

### User
- name, email, password (hashed), phone, address
- role: `admin | user | technician`
- bookingHistory (refs), notifications (embedded)
- JWT methods: `getSignedJwtToken()`, `matchPassword()`

### Service
- name, category, description, price, duration
- category: `Cleaning | Repair | Installation | Gas Charging | Maintenance | Inspection`
- rating, totalReviews, bookingCount
- inventoryRequired (refs to Inventory)

### Booking
- bookingNumber (auto: FCAC-01001), user, service, technician
- scheduledDate, scheduledTime, address
- status: `pending | confirmed | assigned | in_progress | completed | cancelled`
- paymentMethod: `cash | jazzcash | easypaisa | card`
- invoice (embedded), statusHistory (audit log)

### Technician
- user (ref to User), employeeId (auto: TECH-101)
- specializations, experience, salary
- currentStatus: `available | on_job | offline | break`
- currentLocation (lat/lng), assignedBookings

### Inventory
- name, sku (auto: INV-1001), category, quantity, unit
- minStockLevel, costPrice, sellingPrice
- usageHistory, restockHistory
- virtual `isLowStock`

---

## ✨ Features Summary

| Feature                          | Status |
|----------------------------------|--------|
| JWT Authentication               | ✅     |
| Role-based Access (3 roles)      | ✅     |
| Service CRUD (Admin)             | ✅     |
| Booking & Scheduling             | ✅     |
| Technician Management            | ✅     |
| Real-Time Status Updates         | ✅     |
| Simulated GPS Tracking           | ✅     |
| Cash / JazzCash / EasyPaisa      | ✅     |
| Invoice Generation               | ✅     |
| Admin Analytics (Charts)         | ✅     |
| Smart Recommendations            | ✅     |
| Inventory Management             | ✅     |
| Low Stock Alerts                 | ✅     |
| Notification System              | ✅     |
| Protected Routes                 | ✅     |
| Responsive UI (Tailwind)         | ✅     |
| Database Seeder                  | ✅     |

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build frontend: `cd frontend && npm run build`
3. Serve the `build/` folder from your Express backend or deploy separately to Vercel/Netlify
4. Deploy backend to Railway, Render, or any Node.js host
5. Use MongoDB Atlas for the database

---

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Recharts, React Router v6, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Database**: MongoDB Atlas (or local)
- **Fonts**: Syne (display) + DM Sans (body)

---

Built with ❤️ for Full Care AC Tech — Pakistan's trusted AC service provider.
