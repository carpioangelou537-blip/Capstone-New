import { ICONS } from "../../lib/icons";

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      className={`icon icon-${name}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={ICONS[name] || ICONS.spark} />
    </svg>
  );
}