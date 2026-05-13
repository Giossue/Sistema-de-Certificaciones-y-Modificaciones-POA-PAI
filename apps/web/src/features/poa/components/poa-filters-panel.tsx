import type { Dispatch, SetStateAction } from "react";
import { Search, X } from "lucide-react";
import { SectionCard } from "@/components/saas-layout";
import type { CatalogosPoa, Filtro, PeriodoFiscal } from "../types";
import { FilterDropdown } from "./filter-dropdown";

export function PoaFiltersPanel({
  filtro,
  setFiltro,
  periodoFiscalId,
  periodos,
  periodosError,
  catalogos,
  actividadesLength,
  totalItems,
  onPeriodoChange,
}: {
  filtro: Filtro;
  setFiltro: Dispatch<SetStateAction<Filtro>>;
  periodoFiscalId: string;
  periodos: PeriodoFiscal[];
  periodosError: string;
  catalogos: CatalogosPoa;
  actividadesLength: number;
  totalItems: number;
  onPeriodoChange: (periodoFiscalId: string) => void;
}) {
  const programas = catalogos.programas;
  const actividadesUnicas = catalogos.actividades;
  const itemsUnicos = catalogos.items;
  const fuentesUnicas = catalogos.fuentes;

  return (
    <SectionCard title="Filtros" className="mb-4" contentClassName="p-0">
      <div className="flex flex-col gap-3 p-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
        <label className="app-search-box sm:col-span-2">
          <Search size={16} className="shrink-0" />
          <input
            type="text"
            value={filtro.texto}
            onChange={(e) =>
              setFiltro((f) => ({ ...f, texto: e.target.value }))
            }
            placeholder="Buscar en todo..."
            className="tramite-search-input min-w-0 flex-1 bg-transparent outline-none "
          />
          {filtro.texto && (
            <button
              type="button"
              className="shrink-0 "
              aria-label="Limpiar búsqueda"
              onClick={() => setFiltro((f) => ({ ...f, texto: "" }))}
            >
              <X size={15} />
            </button>
          )}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            Periodo
            <select
              value={periodoFiscalId}
              onChange={(e) => onPeriodoChange(e.target.value)}
              className="app-compact-select min-w-44"
            >
              <option value="">Seleccione un periodo</option>
              {periodos.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} ({periodo.anio})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Programa"
            value={filtro.programa}
            placeholder="Todos"
            options={programas}
            labelLimit={34}
            onChange={(value) =>
              setFiltro((f) => ({
                ...f,
                programa: value,
                actividad: "",
                item: "",
                fuente: "",
              }))
            }
          />
          <FilterDropdown
            label="Actividad"
            value={filtro.actividad}
            placeholder={filtro.programa ? "Todas" : "Seleccione programa"}
            options={actividadesUnicas}
            labelLimit={34}
            disabled={!filtro.programa}
            onChange={(value) =>
              setFiltro((f) => ({
                ...f,
                actividad: value,
                item: "",
                fuente: "",
              }))
            }
          />
          <FilterDropdown
            label="Ítem"
            value={filtro.item}
            placeholder={filtro.actividad ? "Todos" : "Seleccione actividad"}
            options={itemsUnicos}
            labelLimit={30}
            disabled={!filtro.actividad}
            onChange={(value) =>
              setFiltro((f) => ({ ...f, item: value, fuente: "" }))
            }
          />
          <FilterDropdown
            label="Fuente"
            value={filtro.fuente}
            placeholder={filtro.item ? "Todas" : "Seleccione ítem"}
            options={fuentesUnicas}
            labelLimit={30}
            disabled={!filtro.item}
            onChange={(value) => setFiltro((f) => ({ ...f, fuente: value }))}
          />
          <label className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={filtro.verSoloConSaldo}
              className="filter-toggle-button inline-flex items-center bg-transparent p-0"
              onClick={() =>
                setFiltro((f) => ({
                  ...f,
                  verSoloConSaldo: !f.verSoloConSaldo,
                }))
              }
            >
              <span
                className={`filter-toggle-track ${filtro.verSoloConSaldo ? "is-on" : ""}`}
              >
                <span className="filter-toggle-thumb" />
              </span>
            </button>
            Solo con saldo
          </label>
        </div>
        {periodosError && <p className="basis-full">{periodosError}</p>}
        <div className="ml-auto flex items-center gap-3">
          {(filtro.texto ||
            filtro.programa ||
            filtro.actividad ||
            filtro.item ||
            filtro.fuente ||
            filtro.verSoloConSaldo) && (
            <button
              onClick={() =>
                setFiltro({
                  texto: "",
                  programa: "",
                  actividad: "",
                  item: "",
                  fuente: "",
                  verSoloConSaldo: false,
                })
              }
              className="filter-clear-button app-filter-clear"
            >
              Limpiar filtros
            </button>
          )}
          <span className="">
            {actividadesLength} de {totalItems} actividades
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
