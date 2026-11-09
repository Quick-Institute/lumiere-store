import { useState, useRef } from "react";
import { Pencil, Trash2, Minus, Plus, ImagePlus, X, Check } from "lucide-react";
import {
  products,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../data/products";
import "./AdminPages.css";

const CATEGORIES = ["dresses", "tops", "pants", "jackets", "bags"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const PALETTE = [
  "#000000",
  "#ffffff",
  "#f2ede8",
  "#d9c3b8",
  "#c9ad93",
  "#c46b72",
  "#7b1e3a",
  "#3b5b8a",
  "#3d6b4f",
  "#b9a3d9",
];
const FALLBACK_IMAGE = "/images/products/p1.jpg";

const emptyForm = {
  name: "",
  category: "dresses",
  price: "",
  stock: 10,
  sizes: ["S", "M", "L"],
  colors: ["#000000"],
  description: "",
  image: "",
};

// shrink the picture so it stays small
function readImage(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 600;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

const swatchStyle = (color, selected) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: color,
  border: selected ? "3px solid var(--deep-rose)" : "1px solid #d9cfe0",
  boxShadow: selected ? "inset 0 0 0 2px #fff" : "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
});

const textareaStyle = {
  width: "100%",
  minHeight: 110,
  padding: "12px 14px",
  border: "1px solid #e3d8ec",
  borderRadius: 10,
  background: "var(--white)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  lineHeight: 1.6,
  resize: "vertical",
};

function AdminProducts() {
  const [items, setItems] = useState(() => [...products]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  // the shared list is updated by the helpers, so just copy it
  const refresh = () => setItems([...products]);

  const reset = () => {
    setForm(emptyForm);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (file) readImage(file, (data) => setForm((f) => ({ ...f, image: data })));
  };

  const toggleSize = (s) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));

  const toggleColor = (c) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c],
    }));

  const addCustomColor = (c) =>
    setForm((f) => (f.colors.includes(c) ? f : { ...f, colors: [...f.colors, c] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    const base = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: SIZES.filter((s) => form.sizes.includes(s)),
      colors: form.colors.length ? form.colors : ["#000000"],
      description: form.description.trim(),
      image: form.image || FALLBACK_IMAGE,
    };

    setBusy(true);
    try {
      if (editId) {
        await updateProduct(editId, base);
      } else {
        await createProduct({
          oldPrice: null,
          discount: null,
          rating: 4.5,
          reviews: 0,
          ...base,
        });
      }
      refresh();
      reset();
    } catch (err) {
      alert(err.message);
    }
    setBusy(false);
  };

  const edit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      sizes: p.sizes || [],
      colors: p.colors || [],
      description: p.description || "",
      image: p.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const changeStock = async (p, delta) => {
    try {
      await updateProduct(p.id, { stock: Math.max(0, p.stock + delta) });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const formStock = (delta) =>
    setForm((f) => ({ ...f, stock: Math.max(0, Number(f.stock) + delta) }));

  // palette + any custom colours already chosen
  const swatches = [...PALETTE, ...form.colors.filter((c) => !PALETTE.includes(c))];

  return (
    <>
      <h1>Products & Stock</h1>
      <p className="dash-sub">Add, edit and delete products, and manage stock.</p>

      <form className="ap-form" onSubmit={submit}>
        <h2 className="dash-h2">{editId ? "Edit product" : "Add product"}</h2>

        <div className="ap-grid">
          <div className="ap-photo">
            <label className="ap-label">Photo</label>
            <div
              className="ap-drop"
              onClick={() => fileRef.current.click()}
              style={form.image ? { backgroundImage: `url(${form.image})` } : {}}
            >
              {!form.image && (
                <span>
                  <ImagePlus size={28} />
                  Click to upload
                </span>
              )}
            </div>
            {form.image && (
              <button
                type="button"
                className="ap-remove-img"
                onClick={() => {
                  setForm({ ...form, image: "" });
                  fileRef.current.value = "";
                }}
              >
                <X size={14} /> Remove photo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} hidden />
          </div>

          <div className="ap-fields">
            <div>
              <label className="ap-label">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="ap-label">Category</label>
              <select
                className="ap-cap"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="ap-label">Price (Rs.)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="ap-label">Stock</label>
              <div className="ap-stepper">
                <button type="button" onClick={() => formStock(-1)} aria-label="Decrease">
                  <Minus size={16} />
                </button>
                <strong>{form.stock}</strong>
                <button type="button" onClick={() => formStock(1)} aria-label="Increase">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="ap-wide">
              <label className="ap-label">Available sizes</label>
              <div className="ap-sizes">
                {SIZES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={form.sizes.includes(s) ? "ap-size on" : "ap-size"}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-wide">
              <label className="ap-label">Colours (tap to select)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                {swatches.map((c) => {
                  const selected = form.colors.includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      title={c}
                      aria-label={`Colour ${c}`}
                      onClick={() => toggleColor(c)}
                      style={swatchStyle(c, selected)}
                    >
                      {selected && (
                        <Check
                          size={16}
                          color={["#ffffff", "#f2ede8", "#d9c3b8"].includes(c) ? "#333" : "#fff"}
                        />
                      )}
                    </button>
                  );
                })}

                <label
                  title="Add your own colour"
                  style={{
                    ...swatchStyle("#fff", false),
                    border: "2px dashed var(--dusty-rose)",
                    color: "var(--deep-rose)",
                  }}
                >
                  <Plus size={16} />
                  <input
                    type="color"
                    hidden
                    onChange={(e) => addCustomColor(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="ap-wide">
              <label className="ap-label">Description</label>
              <textarea
                style={textareaStyle}
                placeholder="Fabric, fit, and what makes this piece special..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="ap-buttons">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Saving..." : editId ? "Save changes" : "Add product"}
          </button>
          <button className="btn btn-outline" type="button" onClick={reset}>
            Cancel
          </button>
        </div>
      </form>

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
                      style={{ backgroundImage: p.image ? `url(${p.image})` : "none" }}
                    />
                    {p.name}
                  </div>
                </td>
                <td className="ap-cap">{p.category}</td>
                <td>Rs. {Number(p.price).toLocaleString()}</td>
                <td>
                  <div className="ap-stepper small">
                    <button onClick={() => changeStock(p, -1)} aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <strong>{p.stock}</strong>
                    <button onClick={() => changeStock(p, 1)} aria-label="Increase">
                      <Plus size={14} />
                    </button>
                    {p.stock === 0 ? (
                      <span className="ap-badge out">Out</span>
                    ) : p.stock <= 5 ? (
                      <span className="ap-badge">Low</span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => edit(p)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="danger" onClick={() => remove(p)} aria-label="Delete">
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

export default AdminProducts;