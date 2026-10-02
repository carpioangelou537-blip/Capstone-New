import Icon from "./Icon";

export default function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        {subtitle && <p className="modal-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}