export function CatalogSelect({
  label,
  value,
  placeholder,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ codigo: string; nombre: string }>;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="app-compact-select min-w-52"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.codigo} value={option.codigo}>
            {option.codigo} - {option.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
