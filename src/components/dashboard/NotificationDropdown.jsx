import { useEffect, useRef } from "react";
import Icon from "../ui/Icon";

export default function NotificationDropdown({ notifications, onGoto, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-dropdown-head">
        <span>Notifications</span>
        <span>{notifications.length}</span>
      </div>
      {notifications.length === 0 && <div className="notif-empty">You're all caught up — nothing from the AAO yet.</div>}
      {notifications.map((n) => (
        <div className="notif-item" key={n.id}>
          <div className="notif-item-text">{n.text}</div>
          <div className="notif-item-meta">
            <span className="notif-item-date">{n.date}</span>
            {n.target && (
              <button
                type="button"
                className="notif-goto"
                onClick={() => {
                  onGoto(n.target);
                  onClose();
                }}
              >
                Go to {n.target} <Icon name="arrow" size={12} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}