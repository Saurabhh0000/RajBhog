// src/components/VariantCard.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faRulerCombined,
  faIndianRupeeSign,
  faBoxes,
  faCheckCircle,
  faTimesCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/VariantCard.css";

/* ============================================================
   VARIANT CARD — Admin Component
   Props: v (variant object), onEdit, onToggle
   Scoped: .vc__   |  No animations  |  Mobile-first
   ============================================================ */
export default function VariantCard({ v, onEdit, onToggle }) {
  const isLowStock = v.stock > 0 && v.stock < 10;
  const isOutStock = v.stock === 0;
  const stockClass =
    isLowStock || isOutStock
      ? "vc__metric-value--low"
      : "vc__metric-value--stock";
  const stockIconClass =
    isLowStock || isOutStock
      ? "vc__metric-icon--stock low"
      : "vc__metric-icon--stock";

  return (
    <div className={`vc__card ${!v.isActive ? "vc__card--inactive" : ""}`}>
      {/* ── top colour strip — green=active, red=inactive ── */}
      <div
        className={`vc__strip ${v.isActive ? "vc__strip--active" : "vc__strip--inactive"}`}
      />

      {/* ── head: unit icon + unit value + status badge ── */}
      <div className="vc__head">
        <div className="vc__unit-wrap">
          <div className="vc__unit-icon">
            <FontAwesomeIcon icon={faRulerCombined} />
          </div>
          <div className="vc__unit-info">
            <span className="vc__unit-label">Unit</span>
            <span className="vc__unit-value" title={v.unit}>
              {v.unit}
            </span>
          </div>
        </div>

        <span
          className={`vc__status ${v.isActive ? "vc__status--active" : "vc__status--inactive"}`}>
          <FontAwesomeIcon icon={v.isActive ? faCheckCircle : faTimesCircle} />
          <span>{v.isActive ? "Active" : "Inactive"}</span>
        </span>
      </div>

      {/* ── body: price (left) | stock (right) ── */}
      <div className="vc__body">
        {/* price metric */}
        <div className="vc__metric">
          <div className="vc__metric-icon vc__metric-icon--price">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
          </div>
          <div className="vc__metric-info">
            <span className="vc__metric-label">Price</span>
            <span className={`vc__metric-value vc__metric-value--price`}>
              ₹{v.price}
            </span>
          </div>
        </div>

        {/* stock metric */}
        <div className="vc__metric">
          <div className={stockIconClass}>
            <FontAwesomeIcon
              icon={isLowStock || isOutStock ? faTriangleExclamation : faBoxes}
            />
          </div>
          <div className="vc__metric-info">
            <span className="vc__metric-label">Stock</span>
            <span className={`vc__metric-value ${stockClass}`}>{v.stock}</span>
            {(isLowStock || isOutStock) && (
              <span className="vc__low-pill">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {isOutStock ? "Out of stock" : "Low stock"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── footer: edit button + toggle switch ── */}
      <div className="vc__footer">
        <button
          className="vc__btn-edit"
          onClick={() => onEdit(v)}
          title="Edit variant">
          <FontAwesomeIcon icon={faEdit} />
          Edit Variant
        </button>

        <button
          className={`vc__toggle ${v.isActive ? "vc__toggle--on" : "vc__toggle--off"}`}
          onClick={() => onToggle(v.id)}
          title={v.isActive ? "Deactivate variant" : "Activate variant"}
          aria-label={v.isActive ? "Deactivate" : "Activate"}>
          <span className="vc__toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
