import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Package,
  Heart,
  Star,
  User,
  Shirt,
  ClipboardList,
  Users,
} from "lucide-react";
import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { PaymentSuccess, PaymentCancelled } from "./pages/PaymentResult";
import {
  AccountOverview,
  MyOrders,
  Wishlist,
  Profile,
} from "./pages/account/AccountPages";
import MyReviews from "./pages/account/MyReviews";
import { AdminOverview, AdminOrders, AdminUsers } from "./pages/admin/AdminPages";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminReviews from "./pages/admin/AdminReviews";

const customerLinks = [
  { to: "/account", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/account/cart", label: "My Cart", icon: ShoppingBag },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/reviews", label: "My Reviews", icon: Star },
  { to: "/account/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products & Stock", icon: Shirt },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/users", label: "Users", icon: Users },
];

function App() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* Login required */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        {/* Card payment results (Stripe sends the customer back here) */}
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute role="customer">
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-cancelled"
          element={
            <ProtectedRoute role="customer">
              <PaymentCancelled />
            </ProtectedRoute>
          }
        />

        {/* Customer dashboard */}
        <Route
          path="/account"
          element={
            <ProtectedRoute role="customer">
              <DashboardLayout title="Customer" links={customerLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountOverview />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout title="Administrator" links={adminLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;