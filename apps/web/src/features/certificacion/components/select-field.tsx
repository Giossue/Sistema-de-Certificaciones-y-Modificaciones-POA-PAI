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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="app-field-input"
      >
        <option value="">Seleccione...</option>
        {items.map((item) => (
          <option key={item.codigo} value={item.codigo}>
            {item.codigo} - {item.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
