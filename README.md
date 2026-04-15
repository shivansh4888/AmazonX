# ShopX — Full-Stack E-Commerce Application

> A production-grade, Amazon-like e-commerce platform with simulated payment workflows, real-time cart management, and transactional email notifications.

![ShopX Banner](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=300&fit=crop)

---

## 🚀 Live Demo

| Service    | URL                              |
|------------|----------------------------------|
| Frontend   | `https://shopx.vercel.app`       |
| Backend    | `https://shopx-api.onrender.com` |

---

## ✨ Features

### 🛍️ Shopping Experience
- **Product Listing** — Grid layout with search, category filter, sort, and pagination
- **Product Detail** — Image carousel, specs table, star ratings, stock indicator
- **Smart Cart** — Session-based cart (no login required), quantity controls, live totals
- **Sticky Order Summary** — Always-visible checkout panel

### 💳 Checkout & Payments (100% Simulated)
- **Multi-step checkout** — Address → Payment → Review
- **Credit/Debit Card** — Realistic card form with live card preview, type detection (Visa/MC/RuPay/Amex), format validation
- **UPI Payment** — Dynamic QR code generation with 30-second countdown timer, auto-success
- **Cash on Delivery** — Simple selection with delivery notes
- All payment methods show realistic processing states and UI feedback

### 📦 Order Management
- UUID-based order IDs
- Order tracker with step indicator (Confirmed → Processing → Shipped → Delivered)
- Order history lookup by email
- Estimated delivery date calculation by payment method

### 📧 Email Notifications
- HTML email templates styled like real transactional emails
- Nodemailer with Gmail SMTP or Ethereal (auto-configured for development)
- Includes: order ID, items list, total, delivery address, estimated date

### 🔒 Stock Management
- Real-time stock deduction on order placement
- Atomic database transactions (prevents overselling)
- Stock display: "Only X left", "Out of Stock", "In Stock"
- Pre-order stock validation

---

## 🏗️ Architecture

```
ecommerce/
├── backend/                    # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── seed.js             # 12 realistic products
│   └── src/
│       ├── controllers/
│       │   ├── productController.js  # Search, filter, pagination
│       │   ├── cartController.js     # Session-based cart CRUD
│       │   └── orderController.js    # Order + payment + stock + email
│       ├── routes/
│       │   ├── products.js
│       │   ├── cart.js
│       │   └── orders.js
│       ├── services/
│       │   └── emailService.js   # Nodemailer + HTML templates
│       └── index.js              # Express server
│
└── frontend/                   # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── page.js               # Product listing (home)
        │   ├── products/[id]/page.js # Product detail
        │   ├── cart/page.js          # Shopping cart
        │   ├── checkout/page.js      # 3-step checkout + payment
        │   └── orders/
        │       ├── page.js           # Order history
        │       └── [id]/page.js      # Order confirmation
        ├── components/
        │   ├── layout/Navbar.js
        │   └── product/ProductCard.js
        └── lib/
            ├── api.js          # Axios instance + all API calls
            └── cartContext.js  # Global cart state (React Context)
```

---

## 🗄️ Database Schema

```prisma
model Product {
  id          String      # UUID
  name        String
  description String
  price       Float
  stock       Int         # Decremented on order
  category    String      # Indexed for filtering
  images      String[]    # Array of image URLs
  specs       Json?       # Key-value product specs
  rating      Float
  reviewCount Int
  brand       String?
}

model Cart {
  id        String     # UUID
  sessionId String     # @unique — browser session
  items     CartItem[]
}

model CartItem {
  cartId    String
  productId String
  quantity  Int
  # @@unique([cartId, productId]) — no duplicates
}

model Order {
  id              String        # UUID — shown to customer
  status          OrderStatus   # CONFIRMED|PROCESSING|SHIPPED|DELIVERED
  paymentMethod   PaymentMethod # CARD|UPI|COD
  paymentStatus   PaymentStatus # PENDING|PAID
  subtotal        Float
  tax             Float         # 18% GST
  shippingCost    Float         # 0 if subtotal >= ₹500
  total           Float
  shippingAddress Json          # Snapshot at time of order
  customerEmail   String        # Indexed for order history lookup
  estimatedDelivery DateTime
  items           OrderItem[]
}
```

---

## 🔌 API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List with `?search=`, `?category=`, `?sortBy=`, `?page=` |
| GET | `/api/products/:id` | Full product details with specs |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart (via `x-session-id` header) |
| POST | `/api/cart` | Add item `{ productId, quantity }` |
| PUT | `/api/cart/:itemId` | Update quantity `{ quantity }` |
| DELETE | `/api/cart/:itemId` | Remove item |
| DELETE | `/api/cart/clear` | Clear entire cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (validates stock, processes payment, sends email) |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders?email=` | Get order history by email |

---

## ⚡ Payment Simulation Logic

```
POST /api/orders flow:
1. Validate request body (items, address, payment method)
2. Check stock for all items atomically
3. simulatePayment() — 1.5s artificial delay + validation
   ├── CARD: validate format → return fake TXN_ID
   ├── UPI:  already verified by frontend timer → return UPI_ID
   └── COD:  no processing → return null txnId
4. Prisma $transaction (atomic):
   ├── Create Order record
   ├── Create OrderItem records (price snapshot)
   └── Decrement product.stock for each item
5. Clear customer's cart
6. sendOrderConfirmationEmail() (fire & forget)
7. Return order confirmation JSON
```

No real money moves. The `simulatePayment` function exists purely to mimic gateway latency and response format.

---

## 📧 Email Setup

### Option A: Gmail (Recommended for demo)
1. Enable 2FA on your Google account
2. Generate an **App Password**: Google Account → Security → App Passwords
3. Add to `backend/.env`:
```env
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # 16-char app password
```

### Option B: Ethereal (Zero config, auto-setup)
Leave `EMAIL_USER` and `EMAIL_PASS` empty — the server auto-creates an Ethereal test account and logs a preview URL to console for every email.

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local or cloud like Supabase/Neon)

### 1. Clone & Install
```bash
git clone https://github.com/yourname/shopx.git
cd shopx

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and email credentials
```

### 3. Setup Database
```bash
cd backend
npx prisma db push          # Create tables
npm run db:seed             # Seed 12 products
npx prisma studio           # (Optional) visual DB browser
```

### 4. Start Backend
```bash
npm run dev   # Starts on http://localhost:5000
```

### 5. Configure & Start Frontend
```bash
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev   # Starts on http://localhost:3000
```

---

## 🚀 Deployment

### Backend → Render

1. Push your backend to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set environment variables in Render dashboard:
   - `DATABASE_URL` — PostgreSQL connection string
   - `EMAIL_USER`, `EMAIL_PASS` — Gmail credentials
   - `FRONTEND_URL` — your Vercel URL
4. Build command: `npm install && npx prisma generate && npx prisma db push && npm run db:seed`
5. Start command: `npm start`

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Set environment variable in Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Free PostgreSQL Options
- **Supabase**: supabase.com (500MB free)
- **Neon**: neon.tech (3GB free)
- **Railway**: railway.app ($5/month credit)

---

## 🧪 Testing the App

1. Browse products on the home page
2. Search for "iPhone" or filter by "Electronics"
3. Click a product → Add to Cart
4. Go to Cart → Proceed to Checkout
5. Fill shipping address (use any real-format data)
6. Choose payment:
   - **Card**: `4111 1111 1111 1111`, `12/28`, `123`
   - **UPI**: Wait for the 30s timer (or click "I have paid")
   - **COD**: Just select and continue
7. Place order → See confirmation page
8. Check console for Ethereal email preview URL

---

## 💡 Assumptions

1. **No authentication required** — Cart uses browser session IDs (localStorage UUID)
2. **Prices in INR** — All prices are in Indian Rupees
3. **18% GST** — Applied on all orders
4. **Free shipping** on orders above ₹500
5. **Stock is global** — Not per-variant (no size/color variants)
6. **Email is optional** — Email failure doesn't block order creation
7. **UPI QR is illustrative** — A real QR would require a payment gateway integration

---

## 🔮 Future Enhancements

- [ ] JWT-based user authentication
- [ ] Product reviews & ratings system
- [ ] Wishlist / Save for later
- [ ] Admin dashboard (inventory management)
- [ ] Real payment gateway (Razorpay integration)
- [ ] Product variants (size, color)
- [ ] Coupon code system
- [ ] Push notifications for order updates
- [ ] Redis for session/cart caching

---

## 🧑‍💻 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, React Context |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Email | Nodemailer (Gmail / Ethereal) |
| Deployment | Vercel (frontend), Render (backend) |
| State | React Context API |
| HTTP Client | Axios |

---

## 📄 License

MIT — Free to use for learning, interviews, and personal projects.
