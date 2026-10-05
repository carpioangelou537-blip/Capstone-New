import { useState } from "react";
import Icon from "../ui/Icon";

export default function EventsAdminPanel({ events, onAdd, onRemove }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onAdd({ title: title.trim(), date, description: description.trim() });
    setTitle(""); setDate(""); setDescription("");
  }

  return (
    <div className="panel-block">
      <form className="panel-form" onSubmit={submit}>
        <div className="row">
          <label>Event title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Homecoming & Career Fair" /></label>
          <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
        <label>Event description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Share event details, activities, venue, or other information." /></label>
        <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }}><Icon name="plus" size={14} /> Post event</button>
      </form>

      <div className="list-block">
        {events.map((ev) => (
          <div className="list-item" key={ev.id}>
            <div className="list-item-main">
              <div className="list-item-title">{ev.title}</div>
              <div className="list-item-sub">{ev.date} · {ev.rsvps.length} RSVP{ev.rsvps.length === 1 ? "" : "s"}</div>
              {ev.description && <div className="list-item-sub">{ev.description}</div>}
            </div>
            <div className="list-item-actions">
              <button className="btn-danger" onClick={() => onRemove(ev.id)} aria-label={`Remove ${ev.title}`}><Icon name="trash" size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}