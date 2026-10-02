import { useState } from "react";
import Icon from "../ui/Icon";
import { NOTIFICATION_TARGETS } from "../../lib/constants";

export default function NotifyComposerPanel({ notifications, onSend }) {
  const [text, setText] = useState("");
  const [target, setTarget] = useState(NOTIFICATION_TARGETS[0]);

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim(), target);
    setText("");
    setTarget(NOTIFICATION_TARGETS[0]);
  }

  return (
    <div className="panel-block">
      <form className="panel-form" onSubmit={submit}>
        <label>
          Message to all alumni
          <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Reminder: survey deadline is this Friday…" />
        </label>
        <label>
          Route the notification to
          <select className="notification-target-select" value={target} onChange={(e) => setTarget(e.target.value)}>
            {NOTIFICATION_TARGETS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }}>
          <Icon name="bell" size={14} /> Send notification
        </button>
      </form>
      <div className="list-block">
        {notifications.map((n) => (
          <div className="list-item" key={n.id}>
            <div className="list-item-main">
              <div className="list-item-title" style={{ fontWeight: 500 }}>{n.text}</div>
              <div className="list-item-sub">{n.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}