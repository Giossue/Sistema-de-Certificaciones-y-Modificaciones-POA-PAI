import type { Dispatch, SetStateAction } from "react";
import { AppBadge, AppTable } from "@/components/app-ui";
import { EmptyState, SectionCard } from "@/components/saas-layout";
import type { CatalogoFiltro, CatalogosCedula } from "../types";
import { CatalogSelect } from "./catalog-select";

const catalogColumns = [
  { key: "tipo", label: "Tipo", width: "140px" },
  { key: "codigo", label: "Código", width: "120px" },
  { key: "nombre", label: "Nombre" },
];

export function CedulaCatalogsPanel({
  periodoFiscalId,
  loadingCatalogos,
  catalogoFiltro,
  catalogos,
  setCatalogoFiltro,
}: {
  periodoFiscalId: string;
  loadingCatalogos: boolean;
  catalogoFiltro: CatalogoFiltro;
  catalogos: CatalogosCedula;
  setCatalogoFiltro: Dispatch<SetStateAction<CatalogoFiltro>>;
}) {
  const catalogRows = [
    ...catalogos.actividades.map((item) => ({ ...item, tipo: "Actividad" })),
    ...catalogos.items.map((item) => ({ ...item, tipo: "Ítem" })),
    ...catalogos.fuentes.map((item) => ({ ...item, tipo: "Fuente" })),
  ];

  return (
    <SectionCard
      title="Consulta de catálogos"
      description="Seleccione en cascada para revisar actividades, ítems y fuentes"
      contentClassName="p-0"
    >
      {!periodoFiscalId ? (
        <EmptyState title="Seleccione un periodo fiscal para ver los catálogos" />
      ) : loadingCatalogos ? (
        <EmptyState title="Cargando catálogos..." />
      ) : (
        <>
          <div className="app-toolbar flex-wrap">
            <CatalogSelect
              label="Programa"
              value={catalogoFiltro.programa}
              placeholder="Todos"
              options={catalogos.programas}
              onChange={(programa) =>
                setCatalogoFiltro({ programa, actividad: "", item: "" })
              }
            />
            <CatalogSelect
              label="Actividad"
              value={catalogoFiltro.actividad}
              placeholder={
                catalogoFiltro.programa ? "Todas" : "Seleccione programa"
              }
              options={catalogos.actividades}
              disabled={!catalogoFiltro.programa}
              onChange={(actividad) =>
                setCatalogoFiltro((current) => ({
                  ...current,
                  actividad,
                  item: "",
                }))
              }
            />
            <CatalogSelect
              label="Ítem"
              value={catalogoFiltro.item}
              placeholder={
                catalogoFiltro.actividad ? "Todos" : "Seleccione actividad"
              }
              options={catalogos.items}
              disabled={!catalogoFiltro.actividad}
              onChange={(item) =>
                setCatalogoFiltro((current) => ({ ...current, item }))
              }
            />
          </div>
          {catalogRows.length === 0 ? (
            <EmptyState title="Sin registros para los filtros seleccionados" />
          ) : (
            <AppTable columns={catalogColumns} minWidth={760} clientPagination>
              {catalogRows.map((item) => (
                <tr key={`${item.tipo}-${item.codigo}`}>
                  <td>
                    <AppBadge>{item.tipo}</AppBadge>
                  </td>
                  <td>
                    <p className="app-table-primary font-mono">{item.codigo}</p>
                  </td>
                  <td>
                    <p className="app-table-secondary">{item.nombre}</p>
                  </td>
                </tr>
              ))}
            </AppTable>
          )}
        </>
      )}
    </SectionCard>
  );
}
