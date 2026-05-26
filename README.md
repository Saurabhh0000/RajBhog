# 🛒 RajBhog — Hyperlocal Kirana E-Commerce Platform

RajBhog is a modern full-stack hyperlocal grocery delivery platform built to digitize traditional kirana stores. The platform enables customers to browse products, place orders, receive OTP-based authentication, and manage orders seamlessly while giving admins complete control over inventory, categories, users, and support.

The project focuses on:
- ⚡ Fast local grocery delivery
- 🔐 Secure OTP authentication
- 🧾 Invoice generation
- 📧 Automated transactional emails
- 🛍️ Smooth shopping experience
- 📱 Responsive UI for all devices
- 🧑‍💼 Powerful admin management system

---

# 🌐 Live Demo

## Frontend
https://rajbhog-store.netlify.app/

## Backend
https://rajbhog-backend.onrender.com

## Swagger API Docs
https://rajbhog-backend.onrender.com/swagger-ui.html

---

# ✨ Features

## 👤 User Features

- OTP-based secure login
- JWT authentication
- Browse products by category
- Search and filter products
- Add products to cart
- Quantity management
- Address management
- Place online orders
- Razorpay payment integration
- Download invoice
- Order tracking
- View order history
- Responsive mobile-first UI
- Contact support system
- Email notifications

---

## 🧑‍💼 Admin Features

- Admin dashboard analytics
- Category management
- Product management
- Order management
- Customer management
- Review moderation
- Support ticket handling
- Inventory control
- Product status toggle
- Order delivery updates
- Admin-only route protection

---

## 📧 Email System

Integrated with Brevo API for reliable production email delivery.

### Supported Emails

- OTP verification email
- Welcome email
- Order confirmation email
- PDF invoice attachment email
- Support ticket resolution email
- Order delivered email

---

# 🧱 Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- CSS3
- Font Awesome
- Lucide React
- React Hot Toast

---

## Backend

- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- JWT Authentication
- Maven
- REST APIs
- Brevo Email API
- Razorpay Payment Gateway

---

## Deployment

### Frontend Hosting
- Netlify

### Backend Hosting
- Render

### Database
- Supabase PostgreSQL

---

# 📂 Project Structure

## Frontend Structure

```bash
rajbhog-frontend/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── routes/
│   └── assets/
│
├── public/
├── package.json
└── vite.config.js
```

---

## Backend Structure

```bash
rajbhog-backend/
│
├── src/main/java/com/rajbhog/
│   ├── controller/
│   ├── service/
│   ├── service/impl/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   ├── security/
│   ├── config/
│   ├── exception/
│   └── bootstrap/
│
├── src/main/resources/
│   ├── templates/
│   └── application-prod.yml
│
├── Dockerfile
├── pom.xml
└── mvnw
```

---

# 🔐 Authentication Flow

RajBhog uses OTP-based passwordless authentication.

### Flow

1. User enters email
2. OTP generated and stored
3. OTP sent via Brevo email API
4. User verifies OTP
5. JWT token generated
6. Token stored in localStorage
7. Protected APIs accessed using Bearer Token

---

# 💳 Payment Integration

Integrated with Razorpay for secure online payments.

### Features

- Razorpay order creation
- Secure payment verification
- Online payment support
- Future support for COD

---

# 🧾 Invoice System

- Automatic PDF invoice generation
- Invoice emailed after order placement
- Downloadable order invoice
- Includes:
  - customer details
  - order items
  - pricing
  - delivery charges
  - total amount

---

# 📬 Email Integration

RajBhog uses Brevo Transactional Email API.

### Why Brevo?

- Better than Gmail SMTP
- Production-ready
- Reliable delivery
- Easy API integration
- Works smoothly on Render

---

# 🗄️ Database Design

Main entities:

- User
- Product
- Category
- Cart
- CartItem
- Order
- OrderItem
- Address
- OTPVerification
- SupportTicket
- Review

---

# 🔒 Security Features

- JWT Authentication
- Spring Security
- Role-based authorization
- Protected admin routes
- OTP verification
- Secure API access
- Passwordless login

---

# 📱 Responsive Design

Fully responsive across:

- Desktop
- Tablet
- Mobile devices

Features:
- Adaptive layouts
- Mobile optimized forms
- Responsive navbar
- Touch-friendly UI
- Optimized spacing and typography

---

# ⚙️ Environment Variables

## Backend Environment Variables

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
ADMIN_EMAIL=
RAZORPAY_KEY=
RAZORPAY_SECRET=
```

---

## Frontend Environment Variables

```env
VITE_API_BASE_URL=https://rajbhog-backend.onrender.com
```

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/Saurabhh0000/RajBhog.git
cd RajBhog
```

---

# ▶️ Backend Setup

```bash
cd rajbhog-backend
./mvnw clean install
./mvnw spring-boot:run
```

Backend runs on:

```bash
http://localhost:8080
```

---

# ▶️ Frontend Setup

```bash
cd rajbhog-frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🐳 Docker Support

Backend is containerized using Docker.

## Build Docker Image

```bash
docker build -t rajbhog-backend .
```

## Run Container

```bash
docker run -p 8080:8080 rajbhog-backend
```

---

# 📖 API Documentation

Swagger UI available at:

```bash
https://rajbhog-backend.onrender.com/swagger-ui.html
```

---

# 📌 Major Functionalities Implemented

## Authentication
- Send OTP
- Verify OTP
- JWT generation
- Admin bootstrap

## Product Management
- Create category
- Create product
- Update product
- Toggle status
- Upload product images

## Cart System
- Add to cart
- Remove from cart
- Update quantity
- Calculate totals

## Order System
- Place order
- Payment verification
- Generate invoice
- Order history
- Order delivery updates

## Review System
- Add review
- Approve review
- Review moderation

## Support System
- Contact support
- Ticket management
- Resolution emails

---

# 🧠 Key Learnings From This Project

- Full-stack application architecture
- REST API design
- JWT authentication implementation
- OTP verification systems
- Production deployment
- Docker containerization
- PostgreSQL integration
- Spring Security
- Email API integration
- Payment gateway integration
- Responsive frontend design

---

# 📸 Screenshots

## Authentication Page
- Modern responsive login UI
- OTP verification flow

## Admin Dashboard
- Analytics overview
- Product management
- Order management

## User Dashboard
- Browse products
- Cart management
- Order tracking

---

# 📈 Future Enhancements

- Real-time order tracking
- Push notifications
- AI product recommendations
- Multi-vendor support
- Coupon system
- Wallet integration
- Delivery partner module
- Dark mode
- Progressive Web App (PWA)
- Multi-language support

---

# 👨‍💻 Developer

### Saurabh Keshri

Full Stack Java Developer

### Tech Skills
- Java
- Spring Boot
- React.js
- PostgreSQL
- REST APIs
- JWT Security
- Docker
- Deployment

GitHub:
https://github.com/Saurabhh0000

LinkedIn:
Add your LinkedIn profile here

---

# ⭐ Support

If you like this project:

- Give it a star ⭐
- Fork the repository 🍴
- Share feedback 💬

---

# 📜 License

This project is developed for educational and portfolio purposes.

---

# ❤️ RajBhog

"जो भी खाए, दोस्त बन जाए"

