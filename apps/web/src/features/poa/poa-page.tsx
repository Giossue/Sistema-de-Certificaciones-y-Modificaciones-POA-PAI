import { useState } from "react";
import { ConfirmDialog } from "@/components/app-ui";
import { PageHeader } from "@/components/saas-layout";
import { PoaActivitiesSection } from "./components/poa-activities-section";
import { PoaFiltersPanel } from "./components/poa-filters-panel";
import { PoaSummaryCards } from "./components/poa-summary-cards";
import type { ActividadPoa } from "./types";
import { usePoaPage } from "./use-poa-page";

export function PoaPage() {
  const page = usePoaPage();
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [certificacionPendiente, setCertificacionPendiente] = useState<{
    actividad: ActividadPoa;
    saldo: number;
  } | null>(null);

  return (
    <div className="p-6">
      <PoaHeader />
      <PoaSummaryCards poaInfo={page.poaInfo} />
      <PoaFiltersPanel
        filtro={page.filtro}
        setFiltro={page.setFiltro}
        periodoFiscalId={page.periodoFiscalId}
        periodos={page.periodos}
        periodosError={page.periodosError}
        catalogos={page.catalogos}
        actividadesLength={page.actividadesPaginadas.length}
        totalItems={page.totalItems}
        onPeriodoChange={page.handlePeriodoChange}
      />
      <PoaActivitiesSection
        periodoFiscalId={page.periodoFiscalId}
        loading={page.loading}
        pageSize={page.pageSize}
        poaInfo={page.poaInfo}
        selectedFile={page.selectedFile}
        importError={page.importError}
        importResult={page.importResult}
        totalItems={page.totalItems}
        actividadesPaginadas={page.actividadesPaginadas}
        sortKey={page.sortKey}
        sortDirection={page.sortDirection}
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        onFileChange={page.setSelectedFile}
        onImport={() => setImportConfirmOpen(true)}
        onSort={page.handleSort}
        onPageSizeChange={page.setPageSize}
        onPageChange={page.setCurrentPage}
        onCertificar={(actividad, saldo) =>
          setCertificacionPendiente({ actividad, saldo })
        }
      />
      <ConfirmDialog
        open={importConfirmOpen}
        title="Importar POA"
        description="Está por importar un POA base para el periodo seleccionado. Revise que el archivo corresponda al POA definitivo antes de continuar."
        confirmText="Importar POA"
        cancelText="Cancelar"
        tone="warning"
        loading={page.loading}
        onConfirm={async () => {
          await page.handleImport();
          setImportConfirmOpen(false);
        }}
        onClose={() => {
          if (!page.loading) setImportConfirmOpen(false);
        }}
      />
      <ConfirmDialog
        open={Boolean(certificacionPendiente)}
        title="Crear certificación desde POA"
        description={
          certificacionPendiente
            ? `Está por preparar una certificación para ${certificacionPendiente.actividad.actividadCodigo} con saldo disponible de $${certificacionPendiente.saldo.toLocaleString("es-EC", { minimumFractionDigits: 2 })}.`
            : undefined
        }
        confirmText="Continuar"
        cancelText="Cancelar"
        tone="info"
        onConfirm={() => {
          if (!certificacionPendiente) return;
          page.handleCertificar(
            certificacionPendiente.actividad,
            certificacionPendiente.saldo,
          );
        }}
        onClose={() => setCertificacionPendiente(null)}
      />
    </div>
  );
}

function PoaHeader() {
  return (
    <PageHeader
      title="POA - Plan Operativo Anual"
      description="Busque actividades, consulte saldos y solicite certificaciones"
    />
  );
}
