import Icon from "./Icon";

export default function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name="check" size={16} />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}