# Lumiere: Women's Clothing E-Commerce Management System

**Lumiere** ("Fashion for every you") is a full-stack web application for a women's clothing store. Customers browse and order clothes, and the admin manages products, stock, orders and users.

## Features

**Roles:** Guest, Customer, Admin

- Register and login with JWT authentication
- Shop and product details pages (login required)
- Shopping cart and checkout
- Payment by Cash on Delivery or by card (Stripe test mode, charged in LKR)
- Order history with status (Pending, Processing, Shipped, Delivered, Cancelled)
- PDF invoice download, and the invoice is also emailed automatically when an order is placed
- Prices in LKR (Rs.), free shipping over Rs. 10,000
- Admin dashboard with sales, orders, customers and low-stock overview
- Admin product management: add, edit, delete, update stock, upload photos
- Admin order management: change order status
- Stock is reduced when an order is placed and restored when it is cancelled
- Prices are calculated on the server, so they cannot be changed from the browser

## Technologies

| Part | Technology |
| --- | --- |
| Front end | React, Vite, React Router, Context API, jsPDF, Stripe.js |
| Back end | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Security | JWT, bcryptjs, role-based access |
| Email and payments | Nodemailer (Gmail), PDFKit, Stripe (test mode) |

## Project Structure

```
lumiere-store/
├── client/    React front end
└── server/    Express API and MongoDB models
```

## How to Run

You need Node.js, a free MongoDB Atlas cluster, and (optional) a Gmail App Password and a Stripe test account.

### 1. Back end

```bash
cd server
npm install
```

Create a file named `.env` inside `server`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_text
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
STRIPE_SECRET_KEY=sk_test_your_key
```

`EMAIL_USER`, `EMAIL_PASS` and `STRIPE_SECRET_KEY` are optional. Without them the shop works, but the invoice email and card payment are turned off.

Load the sample products (run once), then start the server:

```bash
node seed.js
npm run dev
```

The server runs on http://localhost:5000 and creates the admin account automatically.

### 2. Front end

```bash
cd client
npm install
```

For card payments, create a file named `.env` inside `client`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

Then start it:

```bash
npm run dev
```

Open the address it prints (usually http://localhost:5173).

## Demo Accounts

- Admin: `admin@lumiere.lk` / `Admin@12345`
- Customers can register from the Register page.
- Stripe test card: `4242 4242 4242 4242`, any future date, any CVC

## Known Limitations and Future Improvements

- Wishlist and product reviews are stored in the browser only
- The project runs locally and is not yet hosted online
- Card payment works in Stripe test mode only

## Author
Madheeha, SE Intern (October batch)