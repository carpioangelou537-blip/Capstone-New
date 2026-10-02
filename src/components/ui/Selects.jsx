import { PROGRAM_OPTIONS, YEAR_OPTIONS } from "../../lib/constants";

export function ProgramSelect({ value, onChange, label = true }) {
  const inner = (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {PROGRAM_OPTIONS.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
  if (!label) return inner;
  return <label>Program{inner}</label>;
}

export function YearSelect({ value, onChange, label = true }) {
  const inner = (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {YEAR_OPTIONS.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
  if (!label) return inner;
  return <label>Year graduated{inner}</label>;
}