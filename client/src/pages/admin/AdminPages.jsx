import { useState } from "react";
import { Pencil, Trash2, Plus, AlertTriangle, Minus } from "lucide-react";
import { usePersisted } from "../../hooks/usePersisted";
import { useOrders } from "../../context/OrderContext";
import { products as baseProducts } from "../../data/products";
import {
  adminOrders,
  adminUsers,
  initialStock,
  LOW_STOCK,
  weeklySales,
} from "../../data/adminData";
import "./AdminPages.css";

const formatPrice = (amount) => `Rs. ${amount.toLocaleString("en-LK")}`;

const categories = ["dresses", "tops", "pants", "jackets", "bags", "shoes"];
const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

function useAdminProducts() {
  return usePersisted(
    "lumiere_admin_products",
    baseProducts.map((p) => ({ ...p, stock: initialStock[p.id] ?? 10 }))
  );
}

// Real orders from customers + the sample orders
function useAllOrders() {
  const { orders: real, updateStatus: updateReal } = useOrders();
  const [sample, setSample] = usePersisted("lumiere_admin_orders", adminOrders);

  const realRows = real.map((o) => ({
    id: o.id,
    customer: o.customerName,
    date: o.date,
    total: o.total,
    payment: o.payment,
    status: o.status,
  }));

  const updateStatus = (id, status) => {
    if (real.some((o) => o.id === id)) {
      updateReal(id, status);
    } else {
      setSample(sample.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  };

  return { orders: [...realRows, ...sample], updateStatus };
}

/* ---------- Overview ---------- */
export function AdminOverview() {
  const [items] = useAdminProducts();
  const { orders } = useAllOrders();
  const [users] = usePersisted("lumiere_admin_users", adminUsers);

  const sales = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const customers = users.filter((u) => u.role === "customer").length;
  const lowStock = items.filter((p) => p.stock <= LOW_STOCK);
  const maxSale = Math.max(...weeklySales.map((d) => d.amount));

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
            {weeklySales.map((d) => (
              <div key={d.day} className="bar-col">
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
                <td>{o.id}</td>
                <td>{o.customer}</td>
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
    </>
  );
}

/* ---------- Products and stock ---------- */
const emptyForm = { name: "", category: "dresses", price: "", stock: "" };

export function AdminProducts() {
  const [items, setItems] = useAdminProducts();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setOpen(true);
  };

  const startEdit = (p) => {
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
    });
    setEditingId(p.id);
    setMessage("");
    setOpen(true);
  };

  const cancel = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  const submit = (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setMessage("Please enter a product name.");
      return;
    }
    if (!(price > 0)) {
      setMessage("Price must be more than 0.");
      return;
    }
    if (!(stock >= 0) || form.stock === "") {
      setMessage("Please enter the stock quantity.");
      return;
    }

    if (editingId) {
      setItems(
        items.map((p) =>
          p.id === editingId
            ? { ...p, name: form.name.trim(), category: form.category, price, stock }
            : p
        )
      );
    } else {
      const nextId = Math.max(0, ...items.map((p) => p.id)) + 1;
      setItems([
        ...items,
        {
          id: nextId,
          name: form.name.trim(),
          category: form.category,
          price,
          oldPrice: null,
          discount: null,
          rating: 4,
          reviews: 0,
          sizes: ["S", "M", "L"],
          colors: ["#000000"],
          image: "/images/products/p1.jpg",
          stock,
        },
      ]);
    }
    cancel();
  };

  const remove = (p) => {
    if (window.confirm(`Delete "${p.name}"?`)) {
      setItems(items.filter((item) => item.id !== p.id));
    }
  };

  const changeStock = (id, delta) => {
    setItems(
      items.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Products &amp; Stock</h1>
          <p className="dash-sub">Add, edit and delete products, and manage stock.</p>
        </div>
        {!open && (
          <button className="btn" onClick={startAdd}>
            <Plus size={18} /> Add product
          </button>
        )}
      </div>

      {open && (
        <form className="panel product-form" onSubmit={submit}>
          <h2 className="dash-h2 flush">{editingId ? "Edit product" : "Add product"}</h2>
          <div className="form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={change} />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={change}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price (Rs.)
              <input type="number" name="price" value={form.price} onChange={change} />
            </label>
            <label>
              Stock
              <input type="number" name="stock" value={form.stock} onChange={change} />
            </label>
          </div>
          {message && <p className="form-error">{message}</p>}
          <div className="form-actions">
            <button type="submit" className="btn">
              {editingId ? "Save changes" : "Add product"}
            </button>
            <button type="button" className="btn-ghost" onClick={cancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="prod-cell">
                    <span
                      className="thumb"
                      style={{ backgroundImage: `url(${p.image})` }}
                    />
                    {p.name}
                  </div>
                </td>
                <td className="cap">{p.category}</td>
                <td>{formatPrice(p.price)}</td>
                <td>
                  <div className="stock-ctrl">
                    <button onClick={() => changeStock(p.id, -1)} aria-label="Less stock">
                      <Minus size={14} />
                    </button>
                    <span className={p.stock <= LOW_STOCK ? "low" : ""}>{p.stock}</span>
                    <button onClick={() => changeStock(p.id, 1)} aria-label="More stock">
                      <Plus size={14} />
                    </button>
                    {p.stock <= LOW_STOCK && <em className="low-tag">Low</em>}
                  </div>
                </td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => startEdit(p)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(p)} aria-label="Delete" className="danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Orders ---------- */
export function AdminOrders() {
  const { orders, updateStatus } = useAllOrders();

  return (
    <>
      <h1>Orders</h1>
      <p className="dash-sub">View orders and update their status.</p>

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
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.date}</td>
                <td>{formatPrice(o.total)}</td>
                <td>{o.payment}</td>
                <td>
                  <select
                    className={`status-select ${o.status.toLowerCase()}`}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
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
    </>
  );
}

/* ---------- Users ---------- */
export function AdminUsers() {
  const [users, setUsers] = usePersisted("lumiere_admin_users", adminUsers);

  const remove = (u) => {
    if (window.confirm(`Remove ${u.name}?`)) {
      setUsers(users.filter((x) => x.id !== u.id));
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
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </td>
                <td>{u.joined}</td>
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