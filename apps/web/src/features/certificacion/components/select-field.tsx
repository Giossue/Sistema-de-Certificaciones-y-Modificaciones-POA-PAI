import { Search } from "lucide-react";

export function SelectField({
  label,
  value,
  disabled,
  onChange,
  items,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  items: Array<{ codigo: string; nombre: string }>;
}) {
  return (
    <div>
      <label className="block mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="app-field-input pr-8"
        >
          <option value="">Seleccione...</option>
          {items.map((item) => (
            <option key={item.codigo} value={item.codigo}>
              {item.codigo} - {item.nombre}
            </option>
          ))}
        </select>
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>
    </div>
  );
}
