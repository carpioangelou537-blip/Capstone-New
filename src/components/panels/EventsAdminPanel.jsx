import { useState } from "react";
import Icon from "../ui/Icon";

export default function EventsAdminPanel({ events, onAdd, onRemove, onRefreshResponses }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [expandedEvents, setExpandedEvents] = useState(() => new Set());
  const [refreshingEvents, setRefreshingEvents] = useState(() => new Set());
  const [responseErrors, setResponseErrors] = useState({});

  function toggleResponses(eventId) {
    const expanding = !expandedEvents.has(eventId);
    setExpandedEvents((current) => {
      const next = new Set(current);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
    if (expanding && onRefreshResponses) {
      setRefreshingEvents((current) => new Set(current).add(eventId));
      setResponseErrors((current) => ({ ...current, [eventId]: "" }));
      onRefreshResponses(eventId)
        .catch((error) => {
          setResponseErrors((current) => ({
            ...current,
            [eventId]: `Could not load responses: ${error.message || "database request failed."}`,
          }));
        })
        .finally(() => {
          setRefreshingEvents((current) => {
            const next = new Set(current);
            next.delete(eventId);
            return next;
          });
        });
    }
  }

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
              <div className="list-item-sub">{ev.date} · {ev.rsvpCount ?? (ev.rsvps || []).length} RSVP{(ev.rsvpCount ?? (ev.rsvps || []).length) === 1 ? "" : "s"}</div>
              {ev.description && <div className="list-item-sub">{ev.description}</div>}
            </div>
            <div className="list-item-actions">
              <button
                type="button"
                className="btn-ghost"
                aria-expanded={expandedEvents.has(ev.id)}
                aria-controls={`event-responses-${ev.id}`}
                onClick={() => toggleResponses(ev.id)}
              >
                {expandedEvents.has(ev.id) ? "Hide responses" : "View responses"}
              </button>
              <button className="btn-danger" onClick={() => onRemove(ev.id)} aria-label={`Remove ${ev.title}`}><Icon name="trash" size={15} /></button>
            </div>
            {expandedEvents.has(ev.id) && (
              <div className="event-responses" id={`event-responses-${ev.id}`}>
                {refreshingEvents.has(ev.id) && <p>Refreshing responses…</p>}
                {responseErrors[ev.id] && <p role="alert">{responseErrors[ev.id]}</p>}
                <div className="list-item-title">Going ({ev.rsvpCount ?? (ev.rsvps || []).length})</div>
                {(() => {
                  const responses = ev.rsvpResponses || [];
                  const going = responses.filter((response) => response.response === "going");
                  const respondedNames = new Set(responses.map((response) => response.name));
                  const legacy = (ev.legacyRsvps || ev.rsvps || [])
                    .filter((name) => !respondedNames.has(name));
                  const attendees = [
                    ...legacy.map((name, index) => ({ key: `legacy-${index}-${name}`, name })),
                    ...going.map((response) => ({ key: response.userId, name: response.name })),
                  ];
                  return attendees.length > 0
                    ? <ul>{attendees.map((attendee) => <li key={attendee.key}>{attendee.name}</li>)}</ul>
                    : <p>No alumni have RSVP’d as going yet.</p>;
                })()}
                {(ev.rsvpResponses || []).some((response) => response.response === "not_going") && (
                  <>
                    <div className="list-item-title">Not going</div>
                    <ul>
                      {ev.rsvpResponses
                        .filter((response) => response.response === "not_going")
                        .map((response) => <li key={response.userId}>{response.name}</li>)}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}