// src/pages/AdminProducts.jsx
import { useEffect, useMemo, useState } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
} from "../api/admin/adminProductApi";
import { fetchCategories } from "../api/admin/adminCategoryApi";
import ProductVariantDrawer from "../components/ProductVariantDrawer";

import "../styles/AdminProducts.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faBoxOpen,
  faImage,
  faSearch,
  faTag,
  faLayerGroup,
  faTimes,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faAlignLeft,
  faThLarge,
  faList,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   TOAST
   ============================================================ */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="ap-toast">
      <div className="ap-toast-body">
        <FontAwesomeIcon icon={faCheckCircle} size="sm" />
        <span>{message}</span>
      </div>
      <button className="ap-toast-close" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} size="xs" />
      </button>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  /* ---- load ---- */
  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch {
      setToast("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  /* ---- filter ---- */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        (p.categoryName || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && p.isActive) ||
        (filterStatus === "inactive" && !p.isActive);
      return matchSearch && matchStatus;
    });
  }, [products, search, filterStatus]);

  /* ---- form helpers ---- */
  const resetForm = () => {
    setForm({
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      isActive: true,
    });
    setEditing(null);
    setShowForm(false);
  };

  const submitForm = async () => {
    try {
      editing
        ? await updateProduct(editing.id, form)
        : await createProduct(form);
      setToast(`Product ${editing ? "updated" : "created"} successfully`);
      resetForm();
      loadData();
    } catch {
      setToast("Failed to save product");
    }
  };

  const startEdit = (p, e) => {
    e.stopPropagation();
    setEditing(p);
    setForm({
      categoryId: Number(p.categoryId),
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      isActive: p.isActive,
    });
    setShowForm(true);
  };

  const handleToggle = (p, e) => {
    e.stopPropagation();
    toggleProductStatus(p.id).then((res) => {
      const updated = res.data;
      setProducts((prev) =>
        prev.map((prod) => (prod.id === updated.id ? updated : prod)),
      );
    });
  };

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      inactive: products.filter((p) => !p.isActive).length,
      categories: categories.length,
    }),
    [products, categories],
  );

  /* ============================================================ */

  return (
    <div className="ap-wrapper">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="ap-container">
        {/* ── Header ── */}
        <div className="ap-header">
          <div className="ap-header-left">
            <div className="ap-header-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="ap-header-text">
              <h1>Product Management</h1>
              <p>Manage your product catalogue and inventory</p>
            </div>
          </div>
          <button className="ap-btn-add" onClick={() => setShowForm(true)}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Product</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="ap-stats">
          <div className="ap-stat">
            <div className="ap-stat-icon total">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-label">Total Products</span>
              <span className="ap-stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="ap-stat">
            <div className="ap-stat-icon active">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-label">Active</span>
              <span className="ap-stat-value">{stats.active}</span>
            </div>
          </div>
          <div className="ap-stat">
            <div className="ap-stat-icon inactive">
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-label">Inactive</span>
              <span className="ap-stat-value">{stats.inactive}</span>
            </div>
          </div>
          <div className="ap-stat">
            <div className="ap-stat-icon categories">
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-label">Categories</span>
              <span className="ap-stat-value">{stats.categories}</span>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="ap-controls">
          {/* search */}
          <div className="ap-search">
            <span className="ap-search-icon">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search by name, slug or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ap-search-clear" onClick={() => setSearch("")}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="ap-divider" />

          {/* filter tabs */}
          <div className="ap-filter-tabs">
            {[
              { key: "all", icon: faFilter, label: "All" },
              { key: "active", icon: faCheckCircle, label: "Active" },
              { key: "inactive", icon: faTimesCircle, label: "Inactive" },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                className={`ap-filter-tab ${filterStatus === key ? "active" : ""}`}
                onClick={() => setFilterStatus(key)}>
                <FontAwesomeIcon icon={icon} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="ap-divider" />

          {/* view toggle */}
          <div className="ap-view-toggle">
            <button
              className={`ap-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              className={`ap-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="ap-content">
          {loading ? (
            <div className="ap-loading">
              <div className="ap-spinner" />
              <p>Loading products…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h3>No Products Found</h3>
              <p>
                {search || filterStatus !== "all"
                  ? "Try adjusting your filters or search query."
                  : "Start by adding your first product."}
              </p>
              {!search && filterStatus === "all" && (
                <button
                  className="ap-btn-primary"
                  onClick={() => setShowForm(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Add Your First Product
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="ap-grid">
              {filteredProducts.map((p) => (
                <GridCard
                  key={p.id}
                  product={p}
                  onEdit={(e) => startEdit(p, e)}
                  onToggle={(e) => handleToggle(p, e)}
                  onVariants={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(p);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="ap-list">
              {filteredProducts.map((p) => (
                <ListRow
                  key={p.id}
                  product={p}
                  onEdit={(e) => startEdit(p, e)}
                  onToggle={(e) => handleToggle(p, e)}
                  onVariants={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(p);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Product Form Modal ── */}
      {showForm && (
        <div className="ap-modal-backdrop" onClick={resetForm}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            {/* header */}
            <div className="ap-modal-header">
              <div className="ap-modal-title">
                <div className="ap-modal-title-icon">
                  <FontAwesomeIcon icon={editing ? faEdit : faPlus} />
                </div>
                <h2>{editing ? "Edit Product" : "Create New Product"}</h2>
              </div>
              <button className="ap-modal-close" onClick={resetForm}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* body */}
            <div className="ap-modal-body">
              {/* Category — full width */}
              <div className="ap-field full">
                <label className="ap-label">Category</label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon">
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </span>
                  <select
                    className="ap-select"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: Number(e.target.value) })
                    }>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {!c.isActive ? " (Inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name */}
              <div className="ap-field">
                <label className="ap-label">Product Name</label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon">
                    <FontAwesomeIcon icon={faTag} />
                  </span>
                  <input
                    type="text"
                    className="ap-input"
                    placeholder="e.g. Classic White Sneakers"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Slug */}
              <div className="ap-field">
                <label className="ap-label">Slug</label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon">
                    <FontAwesomeIcon icon={faLink} />
                  </span>
                  <input
                    type="text"
                    className="ap-input"
                    placeholder="classic-white-sneakers"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
              </div>

              {/* Image URL — full width */}
              <div className="ap-field full">
                <label className="ap-label">Image URL</label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                  <input
                    type="text"
                    className="ap-input"
                    placeholder="https://example.com/image.jpg"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                  />
                </div>
                {form.imageUrl && (
                  <div className="ap-img-preview">
                    <img src={form.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>

              {/* Description — full width */}
              <div className="ap-field full">
                <label className="ap-label">Description</label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon top">
                    <FontAwesomeIcon icon={faAlignLeft} />
                  </span>
                  <textarea
                    className="ap-textarea"
                    rows={3}
                    placeholder="Enter product description…"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Status — full width */}
              <div className="ap-field full">
                <label className="ap-label">Status</label>
                <div className="ap-status-row">
                  <button
                    type="button"
                    className={`prod-toggle ${form.isActive ? "on" : "off"}`}
                    onClick={() =>
                      setForm({ ...form, isActive: !form.isActive })
                    }>
                    <span className="prod-toggle-thumb" />
                  </button>
                  <span
                    className={`ap-status-text ${form.isActive ? "on" : "off"}`}>
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="ap-modal-footer">
              <button className="ap-btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button className="ap-btn-save" onClick={submitForm}>
                <FontAwesomeIcon icon={editing ? faEdit : faPlus} />
                {editing ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Variant Drawer ── */}
      {selectedProduct && (
        <ProductVariantDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   GRID CARD
   ============================================================ */
function GridCard({ product: p, onEdit, onToggle, onVariants }) {
  return (
    <div className="prod-card">
      {/* image */}
      <div className="prod-card-img">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} />
        ) : (
          <div className="prod-img-placeholder">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
        <span
          className={`prod-status-badge ${p.isActive ? "active" : "inactive"}`}>
          {p.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* body */}
      <div className="prod-card-body">
        <h3 className="prod-card-name" title={p.name}>
          {p.name}
        </h3>
        <div className="prod-card-tags">
          <span className="prod-tag slug">
            <FontAwesomeIcon icon={faTag} />
            <code>{p.slug}</code>
          </span>
          {p.categoryName && (
            <span className="prod-tag category">
              <FontAwesomeIcon icon={faLayerGroup} />
              {p.categoryName}
            </span>
          )}
        </div>
        {p.description && <p className="prod-card-desc">{p.description}</p>}
      </div>

      {/* actions */}
      <div className="prod-card-actions">
        <button className="prod-edit-btn" onClick={onEdit}>
          <FontAwesomeIcon icon={faEdit} /> Edit
        </button>
        <button
          className={`prod-toggle ${p.isActive ? "on" : "off"}`}
          onClick={onToggle}
          title={p.isActive ? "Deactivate" : "Activate"}>
          <span className="prod-toggle-thumb" />
        </button>
        <button className="prod-variants-btn" onClick={onVariants}>
          <FontAwesomeIcon icon={faLayerGroup} /> Variants
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   LIST ROW
   ============================================================ */
function ListRow({ product: p, onEdit, onToggle, onVariants }) {
  return (
    <div className="prod-list-row">
      {/* thumbnail */}
      <div className="prod-list-thumb">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} />
        ) : (
          <FontAwesomeIcon icon={faImage} />
        )}
      </div>

      {/* info */}
      <div className="prod-list-info">
        <span className="prod-list-name">{p.name}</span>
        <span className="prod-list-slug">
          <FontAwesomeIcon icon={faTag} size="xs" />
          <code>{p.slug}</code>
        </span>
        {p.description && (
          <span className="prod-list-desc">{p.description}</span>
        )}
      </div>

      {/* category */}
      {p.categoryName && (
        <div className="prod-list-category">
          <FontAwesomeIcon icon={faLayerGroup} size="xs" />
          {p.categoryName}
        </div>
      )}

      {/* status */}
      <div className="prod-list-status">
        <span
          className={`prod-status-badge ${p.isActive ? "active" : "inactive"}`}>
          {p.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* actions */}
      <div className="prod-list-actions">
        <button className="prod-list-edit-btn" onClick={onEdit}>
          <FontAwesomeIcon icon={faEdit} size="xs" /> Edit
        </button>
        <button
          className={`prod-toggle ${p.isActive ? "on" : "off"}`}
          onClick={onToggle}
          title={p.isActive ? "Deactivate" : "Activate"}>
          <span className="prod-toggle-thumb" />
        </button>
        <button className="prod-list-variants-btn" onClick={onVariants}>
          <FontAwesomeIcon icon={faLayerGroup} size="xs" /> Variants
        </button>
      </div>
    </div>
  );
}
