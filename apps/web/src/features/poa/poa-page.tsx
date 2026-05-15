import { PageHeader } from "@/components/saas-layout";
import { PoaActivitiesSection } from "./components/poa-activities-section";
import { PoaFiltersPanel } from "./components/poa-filters-panel";
import { PoaSummaryCards } from "./components/poa-summary-cards";
import { usePoaPage } from "./use-poa-page";

export function PoaPage() {
  const page = usePoaPage();

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
        onImport={page.handleImport}
        onSort={page.handleSort}
        onPageSizeChange={page.setPageSize}
        onPageChange={page.setCurrentPage}
        onCertificar={page.handleCertificar}
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
