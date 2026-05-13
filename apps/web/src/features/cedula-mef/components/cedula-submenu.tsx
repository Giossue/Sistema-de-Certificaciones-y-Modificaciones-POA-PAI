import type { CedulaSection } from "../types";

export function CedulaSubmenu({
  active,
  onChange,
  totalVersiones,
  totalCambios,
}: {
  active: CedulaSection;
  onChange: (section: CedulaSection) => void;
  totalVersiones: number;
  totalCambios: number;
}) {
  const items: Array<{ key: CedulaSection; label: string; meta?: string }> = [
    { key: "carga", label: "Carga" },
    {
      key: "historial",
      label: "Historial",
      meta: totalVersiones ? String(totalVersiones) : undefined,
    },
    {
      key: "diferencias",
      label: "Diferencias",
      meta: totalCambios ? totalCambios.toLocaleString("es-EC") : undefined,
    },
    { key: "catalogos", label: "Catálogos" },
  ];

  return (
    <div className="app-subnav motion-section">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`app-subnav-button ${active === item.key ? "is-active" : ""}`}
        >
          <span className="inline-flex items-center gap-2">
            {item.label}
            {item.meta && <span className="app-meta">{item.meta}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
