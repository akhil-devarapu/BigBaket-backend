# 🛒 BigBasket - Online Grocery Shopping & Delivery (Backend)

This is a fully functional backend system for an online grocery delivery application, inspired by platforms like **BigBasket**. It handles users, admins, products, cart, orders, payments, delivery staff, and more — using **Node.js**, **Express**, and **SQLite3**.

---

## 🚀 Tech Stack

- **Node.js** + **Express.js**
- **SQLite3** (Relational DB)
- **JWT Authentication**
- **RESTful APIs**
- **bcrypt** (secure password hashing)

---

## 📁 Project Structure
bigbasket-backend/
│
├── src/
│   ├── config/
│   │   └── database.js                 # SQLite connection & initialization
│   │
│   ├── controllers/
│   │   ├── authController.js           # User auth (register/login)
│   │   ├── userController.js           # Profile, address, cart, orders
│   │   ├── adminController.js          # Admin product/order management
│   │   ├── deliveryController.js       # Delivery staff login & delivery APIs
│   │   ├── paymentController.js        # Payment initiation/confirm/status
│   │   └── couponController.js         # Get & validate coupons
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT authentication middleware
│   │   └── isAdmin.js                  # Admin access restriction
│   │
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth/...
│   │   ├── userRoutes.js               # /api/users/...
│   │   ├── adminRoutes.js              # /api/admin/...
│   │   ├── deliveryRoutes.js           # /api/delivery/...
│   │   ├── paymentRoutes.js            # /api/payments/...
│   │   └── couponRoutes.js             # /api/coupons
│   │
│   └── app.js                          # Express app setup & route mounting
│
├── Database/
│   ├── schema.sql                      # SQLite schema (CREATE TABLEs)
│   └── seed.sql                        # Sample data for dev/testing
│
├── .env                                # Environment variables (JWT secret, PORT)
├── .gitignore                          # Ignore node_modules, .env, *.db, etc.
├── package.json                        # Project metadata & dependencies
├── package-lock.json                   # Locked versions of dependencies
├── README.md                           # Full documentation
├── Data/
      |-----Bigbasket.db                 # Your actual SQLite database file
                                          # App entry point: starts Express server        

## 🔐 Authentication & Roles

- **Users:** register, login, manage profile, place orders
- **Admins:** manage products, update order statuses
- **Delivery Staff:** login, view assigned orders, update delivery status

---

## 🧑‍💻 Key Features

### 👤 User Features
- User registration & login (JWT)
- Profile & address management
- Add to cart, update quantity, remove items
- Apply coupons & place orders
- View past orders and order details

### 🛍️ Product Module
- View product listings and details
- Filter by category
- Admin: add/update/delete products

### 🧾 Order System
- Place orders with delivery slot & coupon
- Cancel orders (if not shipped)
- Track status: pending → confirmed → shipped → delivered

### 💳 Payment Flow (Mock)
- Initiate and confirm payments
- Validate coupons
- Check payment status

### 🚚 Delivery Panel
- Delivery staff login/register
- View assigned orders
- Update order delivery status (`picked_up`, `on_the_way`, `delivered`)

### 🛠️ Admin APIs
- Add/update/delete products
- View all orders
- Update order statuses

---

## 🔧 Setup Instructions

```bash
git clone https://github.com/your-username/bigbasket-backend.git
cd bigbasket-backend
npm install
