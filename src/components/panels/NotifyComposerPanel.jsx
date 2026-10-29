import { useState } from "react";
import Icon from "../ui/Icon";
import { NOTIFICATION_TARGETS } from "../../lib/constants";

export default function NotifyComposerPanel({ notifications, onSend, onUpdate, onDelete }) {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("");
  const [link, setLink] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setText("");
    setTarget("");
    setLink("");
    setEditingId(null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      const succeeded = editingId
        ? await onUpdate(editingId, { text: text.trim(), target, link: link.trim() })
        : await onSend(text.trim(), target, link.trim());
      if (succeeded) resetForm();
    } finally {
      setSaving(false);
    }
  }

  function editNotification(notification) {
    setEditingId(notification.id);
    setText(notification.text);
    setTarget(notification.target || "");
    setLink(notification.link || "");
  }

  async function deleteNotification(notification) {
    if (!window.confirm(`Delete this notification: "${notification.text}"?`)) return;
    const succeeded = await onDelete(notification.id);
    if (succeeded && editingId === notification.id) resetForm();
  }

  return (
    <div className="panel-block">
      <form className="panel-form" onSubmit={submit}>
        <label>
          {editingId ? "Edit notification message" : "Message to all alumni"}
          <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Reminder: survey deadline is this Friday…" />
        </label>
        <label>
          Route the notification to
          <select className="notification-target-select" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">No destination</option>
            {NOTIFICATION_TARGETS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Optional link
          <input
            type="url"
            pattern="https?://.+"
            title="Enter a link starting with http:// or https://"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
          />
        </label>
        <div className="row" style={{ alignItems: "center" }}>
          <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }} disabled={saving}>
            <Icon name={editingId ? "check" : "bell"} size={14} /> {editingId ? "Save changes" : "Send notification"}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="list-block">
        {notifications.map((n) => (
          <div className="list-item" key={n.id}>
            <div className="list-item-main">
              <div className="list-item-title" style={{ fontWeight: 500 }}>{n.text}</div>
              <div className="list-item-sub">{n.date}</div>
              {n.link && /^https?:\/\//i.test(n.link) && (
                <a href={n.link} target="_blank" rel="noopener noreferrer" className="notif-goto" style={{ marginTop: 6, display: "inline-flex" }}>
                  Open link <Icon name="arrow" size={12} />
                </a>
              )}
            </div>
            <div className="list-item-actions">
              <button type="button" className="btn-ghost" onClick={() => editNotification(n)} aria-label={`Edit notification: ${n.text}`}>
                Edit
              </button>
              <button type="button" className="btn-danger" onClick={() => deleteNotification(n)} aria-label={`Delete notification: ${n.text}`}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}