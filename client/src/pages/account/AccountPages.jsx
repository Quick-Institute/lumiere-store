import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/ProductCard";
import { products } from "../../data/products";
import "./AccountPages.css";

const formatPrice = (amount) => `Rs. ${amount.toLocaleString("en-LK")}`;

// Sample past orders (shown below the real ones)
const sampleOrders = [
  { id: "#LM1003", date: "2026-10-18", items: 2, total: 21300, status: "Shipped" },
  { id: "#LM1002", date: "2026-10-05", items: 1, total: 8900, status: "Delivered" },
  { id: "#LM1001", date: "2026-09-21", items: 1, total: 17900, status: "Delivered" },
];

// Real orders placed by the logged-in customer + the samples
function useMyOrders() {
  const { user } = useAuth();
  const { orders } = useOrders();

  const real = orders
    .filter((o) => o.userEmail === user.email)
    .map((o) => ({
      id: o.id,
      date: o.date,
      items: o.itemCount,
      total: o.total,
      status: o.status,
    }));

  return [...real, ...sampleOrders];
}

function OrdersTable({ list }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.date}</td>
              <td>{o.items}</td>
              <td>{formatPrice(o.total)}</td>
              <td>
                <span className={`status ${o.status.toLowerCase()}`}>{o.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AccountOverview() {
  const { user } = useAuth();
  const orders = useMyOrders();
  const { count } = useWishlist();

  return (
    <>
      <h1>Hello, {user.name}</h1>
      <p className="dash-sub">Here is a quick look at your account.</p>

      <div className="stat-row">
        <div className="stat-card">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat-card">
          <span>In transit</span>
          <strong>{orders.filter((o) => o.status === "Shipped").length}</strong>
        </div>
        <div className="stat-card">
          <span>Wishlist items</span>
          <strong>{count}</strong>
        </div>
      </div>

      <h2 className="dash-h2">Recent orders</h2>
      <OrdersTable list={orders.slice(0, 5)} />

      <Link to="/shop" className="btn dash-btn">
        Continue shopping
      </Link>
    </>
  );
}

export function MyOrders() {
  const orders = useMyOrders();

  return (
    <>
      <h1>My Orders</h1>
      <p className="dash-sub">Track the status of your orders.</p>
      <OrdersTable list={orders} />
    </>
  );
}

export function Wishlist() {
  const { ids } = useWishlist();
  const saved = products.filter((p) => ids.includes(p.id));

  return (
    <>
      <h1>Wishlist</h1>
      <p className="dash-sub">Pieces you saved for later.</p>

      {saved.length === 0 ? (
        <>
          <p className="dash-sub">
            Your wishlist is empty. Tap the heart on any product to save it here.
          </p>
          <Link to="/shop" className="btn dash-btn">
            Browse the shop
          </Link>
        </>
      ) : (
        <div className="product-grid wish-grid">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

export function Profile() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const save = (e) => {
    e.preventDefault();
    setMessage("Profile saved (demo).");
  };

  return (
    <>
      <h1>Profile</h1>
      <p className="dash-sub">Update your personal details.</p>

      <form className="profile-form" onSubmit={save}>
        <label>
          Full name
          <input type="text" defaultValue={user.name} />
        </label>
        <label>
          Email
          <input type="email" defaultValue={user.email} />
        </label>
        <label>
          Phone
          <input type="tel" placeholder="+94 77 000 0000" />
        </label>
        <label>
          Address
          <input type="text" placeholder="Street, city, postal code" />
        </label>
        <button type="submit" className="btn">
          Save changes
        </button>
        {message && <p className="profile-msg">{message}</p>}
      </form>
    </>
  );
}