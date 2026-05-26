import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faRulerCombined,
  faIndianRupeeSign,
  faBoxes,
  faCheckCircle,
  faPlus,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/VariantForm.css";

/* ============================================================
   VARIANT FORM — all original logic unchanged
   ============================================================ */

export default function VariantForm({ productId, editing, onSave, onCancel }) {
  const [form, setForm] = useState(
    editing || { unit: "", price: "", stock: "", isActive: true },
  );

  const submit = () => {
    onSave({
      ...form,
      productId,
      price: Number(form.price),
      stock: Number(form.stock),
    });
  };

  return (
    <div className="vf-overlay" onClick={onCancel}>
      <div className="vf-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="vf-header">
          <div className="vf-header-left">
            <div className="vf-header-icon">
              <FontAwesomeIcon icon={editing ? faEdit : faPlus} />
            </div>
            <h3>{editing ? "Edit Variant" : "Add New Variant"}</h3>
          </div>
          <button className="vf-close" onClick={onCancel} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="vf-body">
          {/* Unit / Size — full width */}
          <div className="vf-field">
            <label className="vf-label" htmlFor="vf-unit">
              Unit / Size
            </label>
            <div className="vf-input-wrap">
              <span className="vf-input-icon">
                <FontAwesomeIcon icon={faRulerCombined} />
              </span>
              <input
                id="vf-unit"
                type="text"
                className="vf-input"
                placeholder="e.g. 500g, 1kg, 250ml"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
          </div>

          {/* Price + Stock — 2 columns */}
          <div className="vf-row">
            <div className="vf-field">
              <label className="vf-label" htmlFor="vf-price">
                Price (₹)
              </label>
              <div className="vf-input-wrap">
                <span className="vf-input-icon">
                  <FontAwesomeIcon icon={faIndianRupeeSign} />
                </span>
                <input
                  id="vf-price"
                  type="number"
                  className="vf-input"
                  placeholder="0.00"
                  value={form.price}
                  min="0"
                  step="0.01"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="vf-field">
              <label className="vf-label" htmlFor="vf-stock">
                Stock Quantity
              </label>
              <div className="vf-input-wrap">
                <span className="vf-input-icon">
                  <FontAwesomeIcon icon={faBoxes} />
                </span>
                <input
                  id="vf-stock"
                  type="number"
                  className="vf-input"
                  placeholder="0"
                  value={form.stock}
                  min="0"
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Status toggle */}
          <div className="vf-status-wrap">
            <div className="vf-status-label">
              <span className="vf-status-title">Variant Status</span>
              <span className="vf-status-desc">
                {form.isActive
                  ? "Visible and available for purchase"
                  : "Hidden from the storefront"}
              </span>
            </div>
            <div className="vf-status-right">
              <span
                className={`vf-status-text ${form.isActive ? "on" : "off"}`}>
                {form.isActive ? "Active" : "Inactive"}
              </span>
              <button
                type="button"
                className={`vf-toggle ${form.isActive ? "on" : "off"}`}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                <span className="vf-toggle-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="vf-footer">
          <button className="vf-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="vf-btn-save" onClick={submit}>
            <FontAwesomeIcon icon={faCheckCircle} />
            {editing ? "Update" : "Save"} Variant
          </button>
        </div>
      </div>
    </div>
  );
}
