import { useEffect, useMemo, useState } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
} from "../api/admin/adminCategoryApi";

import {
  Plus,
  Layers,
  Search,
  Edit,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Tag,
  FileText,
  ListOrdered,
  Link,
  Grid3x3,
  List,
  Filter,
} from "lucide-react";

import "../styles/AdminCategories.css";

/* ============================================================
   ADMIN CATEGORIES — all backend logic unchanged
   ============================================================ */

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    displayOrder: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  /* ---- load ---- */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchCategories();
      setCategories(res.data || []);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCategories();
  }, []);

  /* ---- toast ---- */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  /* ---- filter ---- */
  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.slug?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && c.isActive) ||
        (filterStatus === "inactive" && !c.isActive);
      return matchSearch && matchStatus;
    });
  }, [categories, search, filterStatus]);

  /* ---- validation ---- */
  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Category name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(form.slug))
      e.slug = "Only lowercase letters, numbers & hyphens";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---- form helpers ---- */
  const openCreateForm = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
    });
    setErrors({});
    setShowForm(true);
  };

  const openEditForm = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      imageUrl: c.imageUrl || "",
      displayOrder: c.displayOrder || 0,
      isActive: Boolean(c.isActive),
    });
    setErrors({});
    setShowForm(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm({ ...form, name, slug: editing ? form.slug : slug });
  };

  const submitForm = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      editing
        ? await updateCategory(editing.id, form)
        : await createCategory(form);
      showToast("Category saved successfully", "success");
      setShowForm(false);
      loadCategories();
    } catch {
      showToast("Failed to save category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCategoryStatus(id);
      loadCategories();
      showToast("Status updated successfully", "success");
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.isActive).length,
      inactive: categories.filter((c) => !c.isActive).length,
    }),
    [categories],
  );

  /* ============================================================ */

  return (
    <div className="ac-wrapper">
      {/* ── Toast ── */}
      {toast.message && (
        <div className={`ac-toast ${toast.type}`}>
          <div className="ac-toast-body">
            {toast.type === "success" ? (
              <CheckCircle size={17} />
            ) : (
              <AlertCircle size={17} />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            className="ac-toast-close"
            onClick={() => setToast({ message: "", type: "" })}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="ac-container">
        {/* ── Header ── */}
        <div className="ac-header">
          <div className="ac-header-left">
            <div className="ac-header-icon">
              <Layers size={22} strokeWidth={2.2} />
            </div>
            <div className="ac-header-text">
              <h1>Category Management</h1>
              <p>Organize your product hierarchy</p>
            </div>
          </div>

          <button className="ac-btn-add" onClick={openCreateForm}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Category</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="ac-stats">
          <div className="ac-stat">
            <div className="ac-stat-icon all">
              <Layers size={18} />
            </div>
            <div className="ac-stat-info">
              <span className="ac-stat-label">Total</span>
              <span className="ac-stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="ac-stat">
            <div className="ac-stat-icon active">
              <CheckCircle size={18} />
            </div>
            <div className="ac-stat-info">
              <span className="ac-stat-label">Active</span>
              <span className="ac-stat-value">{stats.active}</span>
            </div>
          </div>
          <div className="ac-stat">
            <div className="ac-stat-icon inactive">
              <AlertCircle size={18} />
            </div>
            <div className="ac-stat-info">
              <span className="ac-stat-label">Inactive</span>
              <span className="ac-stat-value">{stats.inactive}</span>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="ac-controls">
          {/* search */}
          <div className="ac-search">
            <span className="ac-search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ac-search-clear" onClick={() => setSearch("")}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="ac-controls-divider" />

          {/* filter tabs */}
          <div className="ac-filter-tabs">
            {[
              { key: "all", icon: <Filter size={13} />, label: "All" },
              {
                key: "active",
                icon: <CheckCircle size={13} />,
                label: "Active",
              },
              {
                key: "inactive",
                icon: <AlertCircle size={13} />,
                label: "Inactive",
              },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                className={`ac-filter-tab ${filterStatus === key ? "active" : ""}`}
                onClick={() => setFilterStatus(key)}>
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="ac-controls-divider" />

          {/* view toggle */}
          <div className="ac-view-toggle">
            <button
              className={`ac-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <Grid3x3 size={16} />
            </button>
            <button
              className={`ac-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <List size={16} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="ac-content">
          {loading ? (
            <div className="ac-loading">
              <Loader size={36} className="ac-spinner ac-spin" />
              <p>Loading categories…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon">
                <Layers size={30} />
              </div>
              <h3>No Categories Found</h3>
              <p>
                {search || filterStatus !== "all"
                  ? "Try adjusting your filters or search query."
                  : "Start by creating your first category."}
              </p>
              {!search && filterStatus === "all" && (
                <button className="ac-btn-primary" onClick={openCreateForm}>
                  <Plus size={15} /> Create Category
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="ac-grid">
              {filtered.map((c) => (
                <GridCard
                  key={c.id}
                  category={c}
                  onEdit={() => openEditForm(c)}
                  onToggle={() => handleToggleStatus(c.id)}
                />
              ))}
            </div>
          ) : (
            <div className="ac-list">
              {filtered.map((c) => (
                <ListRow
                  key={c.id}
                  category={c}
                  onEdit={() => openEditForm(c)}
                  onToggle={() => handleToggleStatus(c.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="ac-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            {/* header */}
            <div className="ac-modal-header">
              <div className="ac-modal-title">
                <div className="ac-modal-title-icon">
                  {editing ? <Edit size={18} /> : <Plus size={18} />}
                </div>
                <h2>{editing ? "Edit Category" : "Create New Category"}</h2>
              </div>
              <button
                className="ac-modal-close"
                onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>

            {/* body */}
            <div className="ac-modal-body">
              {/* Name */}
              <div className="ac-field">
                <label className="ac-label">Category Name</label>
                <div className="ac-input-wrap">
                  <span className="ac-input-icon">
                    <Tag size={15} />
                  </span>
                  <input
                    type="text"
                    className={`ac-input ${errors.name ? "has-error" : ""}`}
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Electronics, Fashion, Home & Garden"
                  />
                </div>
                {errors.name && (
                  <span className="ac-field-error">
                    <AlertCircle size={13} /> {errors.name}
                  </span>
                )}
              </div>

              {/* Slug */}
              <div className="ac-field">
                <label className="ac-label">URL Slug</label>
                <div className="ac-input-wrap">
                  <span className="ac-input-icon">
                    <Link size={15} />
                  </span>
                  <input
                    type="text"
                    className={`ac-input ${errors.slug ? "has-error" : ""}`}
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value.toLowerCase() })
                    }
                    placeholder="electronics-gadgets"
                  />
                </div>
                {errors.slug && (
                  <span className="ac-field-error">
                    <AlertCircle size={13} /> {errors.slug}
                  </span>
                )}
              </div>

              {/* Image URL */}
              <div className="ac-field">
                <label className="ac-label">Image URL</label>
                <div className="ac-input-wrap">
                  <span className="ac-input-icon">
                    <Image size={15} />
                  </span>
                  <input
                    type="text"
                    className="ac-input"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {form.imageUrl && (
                  <div className="ac-img-preview">
                    <img src={form.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="ac-field">
                <label className="ac-label">Description</label>
                <div className="ac-input-wrap">
                  <span className="ac-input-icon ac-input-textarea-icon">
                    <FileText size={15} />
                  </span>
                  <textarea
                    className="ac-textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Brief description of this category…"
                  />
                </div>
              </div>

              {/* Order + Status */}
              <div className="ac-field-row">
                <div className="ac-field">
                  <label className="ac-label">Display Order</label>
                  <div className="ac-input-wrap">
                    <span className="ac-input-icon">
                      <ListOrdered size={15} />
                    </span>
                    <input
                      type="number"
                      className="ac-input"
                      value={form.displayOrder}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          displayOrder: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="ac-field">
                  <label className="ac-label">Status</label>
                  <div className="ac-status-toggle-row">
                    <button
                      className={`cat-toggle ${form.isActive ? "on" : "off"}`}
                      onClick={() =>
                        setForm({ ...form, isActive: !form.isActive })
                      }
                      type="button">
                      <span className="cat-toggle-thumb" />
                    </button>
                    <span
                      className={`ac-status-label-text ${form.isActive ? "on" : "off"}`}>
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="ac-modal-footer">
              <button
                className="ac-btn-cancel"
                onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                className="ac-btn-save"
                onClick={submitForm}
                disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader size={15} className="ac-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />{" "}
                    {editing ? "Update Category" : "Create Category"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   GRID CARD
   ============================================================ */
function GridCard({ category: c, onEdit, onToggle }) {
  return (
    <div className="cat-card">
      {/* image */}
      <div className="cat-card-img">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt={c.name} />
        ) : (
          <div className="cat-card-placeholder">
            <Image size={36} />
          </div>
        )}
        <span
          className={`cat-status-badge ${c.isActive ? "active" : "inactive"}`}>
          {c.isActive ? "Active" : "Inactive"}
        </span>
        <span className="cat-order-badge">
          <ListOrdered size={12} /> {c.displayOrder}
        </span>
      </div>

      {/* body */}
      <div className="cat-card-body">
        <h3 className="cat-card-name" title={c.name}>
          {c.name}
        </h3>
        <span className="cat-card-slug">
          <Tag size={11} />
          <code>/{c.slug}</code>
        </span>
        {c.description && <p className="cat-card-desc">{c.description}</p>}
      </div>

      {/* actions */}
      <div className="cat-card-actions">
        <button className="cat-edit-btn" onClick={onEdit}>
          <Edit size={14} /> Edit
        </button>
        <button
          className={`cat-toggle ${c.isActive ? "on" : "off"}`}
          onClick={onToggle}
          title={c.isActive ? "Deactivate" : "Activate"}>
          <span className="cat-toggle-thumb" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   LIST ROW
   ============================================================ */
function ListRow({ category: c, onEdit, onToggle }) {
  return (
    <div className="cat-list-row">
      {/* thumbnail */}
      <div className="cat-list-thumb">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt={c.name} />
        ) : (
          <Image size={20} />
        )}
      </div>

      {/* info */}
      <div className="cat-list-info">
        <span className="cat-list-name">{c.name}</span>
        <span className="cat-list-slug">
          <Tag size={11} />
          <code>/{c.slug}</code>
        </span>
        {c.description && (
          <span className="cat-list-desc">{c.description}</span>
        )}
      </div>

      {/* order */}
      <div className="cat-list-order">
        <ListOrdered size={13} /> {c.displayOrder}
      </div>

      {/* status */}
      <div className="cat-list-status">
        <span
          className={`cat-status-badge ${c.isActive ? "active" : "inactive"}`}>
          {c.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* actions */}
      <div className="cat-list-actions">
        <button className="cat-list-edit-btn" onClick={onEdit}>
          <Edit size={13} /> Edit
        </button>
        <button
          className={`cat-toggle ${c.isActive ? "on" : "off"}`}
          onClick={onToggle}
          title={c.isActive ? "Deactivate" : "Activate"}>
          <span className="cat-toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
