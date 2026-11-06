import { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { api } from "../../api";
import { useOrders } from "../../context/OrderContext";
import { products } from "../../data/products";
import { LOW_STOCK } from "../../data/adminData";
import "./AdminPages.css";

// the products page lives in its own file
export { default as AdminProducts } from "./AdminProducts";

const formatPrice = (amount) => `Rs. ${amount.toLocaleString("en-LK")}`;

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// the last 7 days, today last
function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toLocaleDateString("en-CA"),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: 0,
    });
  }
  return days;
}

function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api("/users")
      .then(setUsers)
      .catch(() => {});
  }, []);
  return [users, setUsers];
}

/* ---------- Overview ---------- */
export function AdminOverview() {
  const { orders } = useOrders();
  const [users] = useUsers();

  const live = orders.filter((o) => o.status !== "Cancelled");
  const sales = live.reduce((sum, o) => sum + o.total, 0);
  const customers = users.filter((u) => u.role === "customer").length;
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK);

  const week = lastSevenDays();
  live.forEach((o) => {
    const slot = week.find((d) => d.key === o.date);
    if (slot) slot.amount += o.total;
  });
  const maxSale = Math.max(1, ...week.map((d) => d.amount));

  return (
    <>
      <h1>Admin Overview</h1>
      <p className="dash-sub">Sales, orders and stock at a glance.</p>

      <div className="stat-row four">
        <div className="stat-card">
          <span>Total sales</span>
          <strong className="stat-money">{formatPrice(sales)}</strong>
        </div>
        <div className="stat-card">
          <span>Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat-card">
          <span>Customers</span>
          <strong>{customers}</strong>
        </div>
        <div className="stat-card alert">
          <span>Low stock</span>
          <strong>{lowStock.length}</strong>
        </div>
      </div>

      <div className="admin-two">
        <div className="panel">
          <h2 className="dash-h2 flush">Sales this week</h2>
          <div className="bars">
            {week.map((d) => (
              <div key={d.key} className="bar-col">
                <div
                  className="bar"
                  style={{ height: `${(d.amount / maxSale) * 100}%` }}
                  title={formatPrice(d.amount)}
                />
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 className="dash-h2 flush">Low-stock alerts</h2>
          {lowStock.length === 0 ? (
            <p className="muted">All products are well stocked.</p>
          ) : (
            <ul className="alert-list">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <AlertTriangle size={16} />
                  <span>{p.name}</span>
                  <strong>{p.stock} left</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h2 className="dash-h2">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td>{o.number}</td>
                  <td>{o.customerName}</td>
                  <td>{o.date}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`status ${o.status.toLowerCase()}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ---------- Orders ---------- */
export function AdminOrders() {
  const { orders, updateStatus } = useOrders();

  const change = async (id, status) => {
    try {
      await updateStatus(id, status);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <h1>Orders</h1>
      <p className="dash-sub">View orders and update their status.</p>

      {orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.number}</td>
                  <td>{o.customerName}</td>
                  <td>{o.date}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>{o.payment}</td>
                  <td>
                    <select
                      className={`status-select ${o.status.toLowerCase()}`}
                      value={o.status}
                      onChange={(e) => change(o.id, e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ---------- Users ---------- */
export function AdminUsers() {
  const [users, setUsers] = useUsers();

  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.name}?`)) return;
    try {
      await api(`/users/${u._id}`, { method: "DELETE" });
      setUsers(users.filter((x) => x._id !== u._id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <h1>Users</h1>
      <p className="dash-sub">Manage your customers.</p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("en-CA")}</td>
                <td>
                  {u.role === "customer" ? (
                    <div className="row-actions">
                      <button onClick={() => remove(u)} aria-label="Remove" className="danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}