import { useState } from "react";
import Icon from "../ui/Icon";
import EmptyState from "../ui/EmptyState";

export default function EventsAlumniPanel({ events, onRsvp }) {
  const [pendingEvents, setPendingEvents] = useState(() => new Set());

  async function respond(eventId) {
    setPendingEvents((current) => new Set(current).add(eventId));
    try {
      await onRsvp(eventId);
    } finally {
      setPendingEvents((current) => {
        const next = new Set(current);
        next.delete(eventId);
        return next;
      });
    }
  }

  return (
    <div className="panel-block list-block">
      {events.length === 0 && <EmptyState icon="calendar" text="No events posted yet." />}
      {events.map((ev) => {
        const going = ev.myRsvp === "going";
        return (
          <div className="list-item" key={ev.id}>
            <div className="list-item-main">
              <div className="list-item-title">{ev.title}</div>
              <div className="list-item-sub">{ev.date} · {ev.rsvpCount ?? ev.rsvps.length} attending</div>
              {ev.description && <div className="list-item-sub">{ev.description}</div>}
            </div>
            <button
              className={`btn-rsvp ${going ? "going" : ""}`}
              onClick={() => respond(ev.id)}
              disabled={pendingEvents.has(ev.id)}
            >
              <Icon name={going ? "check" : "plus"} size={13} /> {going ? "Going" : "RSVP"}
            </button>
          </div>
        );
      })}
    </div>
  );
}