import Icon from "../ui/Icon";
import EmptyState from "../ui/EmptyState";

export default function EventsAlumniPanel({ events, me, onRsvp }) {
  return (
    <div className="panel-block list-block">
      {events.length === 0 && <EmptyState icon="calendar" text="No events posted yet." />}
      {events.map((ev) => {
        const going = ev.rsvps.includes(me.name);
        return (
          <div className="list-item" key={ev.id}>
            <div className="list-item-main">
              <div className="list-item-title">{ev.title}</div>
              <div className="list-item-sub">{ev.date} · {ev.rsvps.length} attending</div>
            </div>
            <button className={`btn-rsvp ${going ? "going" : ""}`} onClick={() => onRsvp(ev.id)}>
              <Icon name={going ? "check" : "plus"} size={13} /> {going ? "Going" : "RSVP"}
            </button>
          </div>
        );
      })}
    </div>
  );
}