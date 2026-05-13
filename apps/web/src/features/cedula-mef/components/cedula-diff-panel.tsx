import { EmptyState, SectionCard } from "@/components/saas-layout";
import type { DiffOption, DiffResult, DiffTab, VersionCedula } from "../types";
import { DiffList } from "./diff-list";

export function CedulaDiffPanel({
  selectedVersion,
  loadingDiff,
  diff,
  totalCambios,
  diffOptions,
  diffTab,
  activeDiffOption,
  onDiffTabChange,
}: {
  selectedVersion?: VersionCedula;
  loadingDiff: boolean;
  diff: DiffResult | null;
  totalCambios: number;
  diffOptions: DiffOption[];
  diffTab: DiffTab;
  activeDiffOption?: DiffOption;
  onDiffTabChange: (tab: DiffTab) => void;
}) {
  return (
    <SectionCard
      title="Diferencias vs versión anterior"
      description={
        selectedVersion
          ? `Versión: ${selectedVersion.archivoNombre}`
          : "Seleccione una versión desde el historial"
      }
      contentClassName="p-0"
    >
      {loadingDiff ? (
        <EmptyState title="Cargando..." />
      ) : !diff ? (
        <EmptyState title="Seleccione una versión desde el historial para ver sus diferencias" />
      ) : totalCambios === 0 ? (
        <EmptyState
          title="No hay cambios entre versiones"
          description="La versión actual es idéntica a la anterior"
        />
      ) : (
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {diffOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => onDiffTabChange(option.key)}
                className={`app-subnav-button min-w-40 ${diffTab === option.key ? "is-active" : ""}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  <span className="tabular-nums">
                    {option.total.toLocaleString("es-EC")}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {activeDiffOption && (
            <div className="mt-3">
              <DiffList
                title={activeDiffOption.label}
                total={activeDiffOption.total}
                tone={activeDiffOption.tone}
                entries={activeDiffOption.entries}
                valueKey={activeDiffOption.valueKey}
              />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
