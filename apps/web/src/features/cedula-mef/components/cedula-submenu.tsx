import type { CedulaSection } from "../types";
import { AppButton } from "@/components/app-ui";

export function CedulaSubmenu({
  active,
  onChange,
  totalCambios,
}: {
  active: CedulaSection;
  onChange: (section: CedulaSection) => void;
  totalCambios: number;
}) {
  const items: Array<{ key: CedulaSection; label: string; meta?: string }> = [
    { key: "carga", label: "Carga" },
    {
      key: "historial",
      label: "Historial",
    },
    {
      key: "diferencias",
      label: "Diferencias",
      meta: totalCambios ? totalCambios.toLocaleString("es-EC") : undefined,
    },
    { key: "catalogos", label: "Catálogos" },
  ];

  return (
    <div className="section-card app-segmented-tabs mb-5">
      {items.map((item) => (
        <AppButton
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          variant={active === item.key ? "primary" : "ghost"}
        >
          <span className="inline-flex items-center gap-2">
            {item.label}
            {item.meta && <span className="app-meta">{item.meta}</span>}
          </span>
        </AppButton>
      ))}
    </div>
  );
}
