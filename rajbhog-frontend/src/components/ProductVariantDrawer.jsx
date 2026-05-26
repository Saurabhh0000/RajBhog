import { useEffect, useState } from "react";
import {
  fetchVariantsByProduct,
  createVariant,
  updateVariant,
  toggleVariantStatus,
} from "../api/admin/adminProductVariantApi";

import VariantForm from "./VariantForm";

import "../styles/AdminProductVariants.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faCube,
  faBoxes,
  faCheckCircle,
  faTimesCircle,
  faLayerGroup,
  faEdit,
  faImage,
  faTag,
  faHashtag,
  faRupeeSign,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   PRODUCT VARIANT DRAWER — all original logic unchanged
   ============================================================ */

export default function ProductVariantDrawer({ product, onClose }) {
  const [variants, setVariants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchVariantsByProduct(product.id)
      .then((r) => setVariants(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const saveVariant = (data) => {
    const api = editing ? updateVariant(editing.id, data) : createVariant(data);
    api.then(() => {
      setShowForm(false);
      setEditing(null);
      load();
    });
  };

  const activeCount = variants.filter((v) => v.isActive).length;
  const inactiveCount = variants.filter((v) => !v.isActive).length;

  return (
    <>
      <div className="vd-backdrop" onClick={onClose} />

      <div className="vd-drawer">
        {/* ── Header ── */}
        <div className="vd-header">
          <div className="vd-header-left">
            <div className="vd-header-icon">
              <FontAwesomeIcon icon={faCube} />
            </div>
            <div className="vd-header-text">
              <h2 title={product.name}>{product.name}</h2>
              <p>Product Variants</p>
            </div>
          </div>
          <button className="vd-close-btn" onClick={onClose} title="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="vd-stats">
          <div className="vd-stat">
            <div className="vd-stat-icon total">
              <FontAwesomeIcon icon={faBoxes} />
            </div>
            <div className="vd-stat-info">
              <span className="vd-stat-value">{variants.length}</span>
              <span className="vd-stat-label">Total</span>
            </div>
          </div>
          <div className="vd-stat">
            <div className="vd-stat-icon active">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="vd-stat-info">
              <span className="vd-stat-value">{activeCount}</span>
              <span className="vd-stat-label">Active</span>
            </div>
          </div>
          <div className="vd-stat">
            <div className="vd-stat-icon inactive">
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <div className="vd-stat-info">
              <span className="vd-stat-value">{inactiveCount}</span>
              <span className="vd-stat-label">Inactive</span>
            </div>
          </div>
        </div>

        {/* ── Add button ── */}
        <div className="vd-add-row">
          <button
            className="vd-btn-add"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Add New Variant</span>
          </button>
        </div>

        {/* ── Variants list ── */}
        <div className="vd-body">
          {loading ? (
            <div className="vd-loading">
              <div className="vd-spinner" />
              <p>Loading variants…</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="vd-empty">
              <div className="vd-empty-icon">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <h3>No Variants Yet</h3>
              <p>Create your first variant to get started.</p>
              <button
                className="vd-btn-empty"
                onClick={() => setShowForm(true)}>
                <FontAwesomeIcon icon={faPlus} /> Create Variant
              </button>
            </div>
          ) : (
            variants.map((v) => (
              <VariantItem
                key={v.id}
                variant={v}
                onEdit={() => {
                  setEditing(v);
                  setShowForm(true);
                }}
                onToggle={() =>
                  toggleVariantStatus(v.id).then((res) => {
                    const updated = res.data;
                    setVariants((prev) =>
                      prev.map((item) =>
                        item.id === updated.id ? updated : item,
                      ),
                    );
                  })
                }
              />
            ))
          )}
        </div>

        {/* ── Variant Form ── */}
        {showForm && (
          <VariantForm
            productId={product.id}
            editing={editing}
            onSave={saveVariant}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        )}
      </div>
    </>
  );
}

/* ============================================================
   VARIANT ITEM
   ============================================================ */
function VariantItem({ variant: v, onEdit, onToggle }) {
  return (
    <div
      className={`vd-variant-card ${v.isActive ? "is-active" : "is-inactive"}`}>
      {/* main row */}
      <div className="vd-vc-main">
        {/* thumbnail */}
        <div className="vd-vc-img">
          {v.imageUrl ? (
            <img src={v.imageUrl} alt={v.name} />
          ) : (
            <FontAwesomeIcon icon={faImage} />
          )}
        </div>

        {/* info */}
        <div className="vd-vc-info">
          <span className="vd-vc-name" title={v.name}>
            {v.name}
          </span>
          <div className="vd-vc-tags">
            {v.price != null && (
              <span className="vd-vc-tag price">
                <FontAwesomeIcon icon={faRupeeSign} />
                {Number(v.price).toFixed(2)}
              </span>
            )}
            {v.stock != null && (
              <span className="vd-vc-tag stock">
                <FontAwesomeIcon icon={faWarehouse} />
                {v.stock} in stock
              </span>
            )}
            {v.sku && (
              <span className="vd-vc-tag sku">
                <FontAwesomeIcon icon={faHashtag} />
                {v.sku}
              </span>
            )}
            {v.color && (
              <span className="vd-vc-tag color">
                <span
                  className="vd-color-swatch"
                  style={{ background: v.color }}
                />
                {v.color}
              </span>
            )}
            {v.size && (
              <span className="vd-vc-tag sku">
                <FontAwesomeIcon icon={faTag} />
                {v.size}
              </span>
            )}
          </div>
        </div>

        {/* status */}
        <span className={`vd-vc-badge ${v.isActive ? "active" : "inactive"}`}>
          {v.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* actions */}
      <div className="vd-vc-actions">
        <button className="vd-vc-edit-btn" onClick={onEdit}>
          <FontAwesomeIcon icon={faEdit} /> Edit
        </button>
        <button
          className={`vd-toggle ${v.isActive ? "on" : "off"}`}
          onClick={onToggle}
          title={v.isActive ? "Deactivate" : "Activate"}>
          <span className="vd-toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
