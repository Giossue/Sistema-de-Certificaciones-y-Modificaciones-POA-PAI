import type { FilterOption } from "../types";

function optionLabel(codigo: string, nombre: string, limit = 40) {
  const cleanName = nombre.trim();
  const available = Math.max(10, limit - codigo.length - 3);
  const shortName =
    cleanName.length > available
      ? `${cleanName.slice(0, available - 1)}...`
      : cleanName;
  return `${codigo} - ${shortName}`;
}

export function FilterDropdown({
  label,
  value,
  placeholder,
  options,
  labelLimit,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: FilterOption[];
  labelLimit?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="app-compact-select min-w-44"
        title={
          value
            ? options.find((option) => option.codigo === value)?.nombre
            : placeholder
        }
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.codigo} value={option.codigo}>
            {optionLabel(option.codigo, option.nombre, labelLimit)}
          </option>
        ))}
      </select>
    </label>
  );
}
