import Icon from "./Icon";

export default function EmptyState({ icon = "spark", text }) {
  return (
    <div className="empty-state-rich">
      <div className="empty-state-icon">
        <Icon name={icon} size={19} />
      </div>
      <p>{text}</p>
    </div>
  );
}