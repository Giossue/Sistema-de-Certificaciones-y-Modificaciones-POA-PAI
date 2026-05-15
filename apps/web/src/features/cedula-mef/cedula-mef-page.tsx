import { useState } from "react";
import { ConfirmDialog } from "@/components/app-ui";
import { PageHeader } from "@/components/saas-layout";
import { CedulaCatalogsPanel } from "./components/cedula-catalogs-panel";
import { CedulaDiffPanel } from "./components/cedula-diff-panel";
import { CedulaHistoryPanel } from "./components/cedula-history-panel";
import { CedulaImportPanel } from "./components/cedula-import-panel";
import { CedulaSubmenu } from "./components/cedula-submenu";
import { useCedulaMefPage } from "./use-cedula-mef-page";

export function CedulaMefPage() {
  const page = useCedulaMefPage();
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);

  return (
    <div className="p-6">
      <CedulaHeader />
      <CedulaSubmenu
        active={page.activeSection}
        onChange={page.setActiveSection}
        totalCambios={page.totalCambios}
      />
      <div className="space-y-5">
        {page.activeSection === "carga" && (
          <CedulaImportPanel
            selectedPeriodo={page.selectedPeriodo}
            periodoFiscalId={page.periodoFiscalId}
            periodos={page.periodos}
            periodosError={page.periodosError}
            selectedFile={page.selectedFile}
            loading={page.loading}
            progress={page.progress}
            error={page.error}
            result={page.result}
            vigenteVersion={page.vigenteVersion}
            onPeriodoChange={page.seleccionarPeriodo}
            onFileSelect={page.handleFileSelect}
            onDragOver={page.handleDragOver}
            onDrop={page.handleDrop}
            onUpload={() => setImportConfirmOpen(true)}
            onClearFile={() => page.setSelectedFile(null)}
            formatearFecha={page.formatearFecha}
          />
        )}
        {page.activeSection === "historial" && (
          <CedulaHistoryPanel
            periodoFiscalId={page.periodoFiscalId}
            loadingVersiones={page.loadingVersiones}
            versiones={page.versiones}
            versionesPage={page.versionesPage}
            totalVersiones={page.totalVersiones}
            versionesPageSize={page.versionesPageSize}
            selectedVersion={page.selectedVersion}
            onItemsPerPageChange={page.setVersionesPageSize}
            onPageChange={page.setVersionesPage}
            onOpenVersion={page.abrirVersion}
            formatearFecha={page.formatearFecha}
          />
        )}
        {page.activeSection === "diferencias" && (
          <CedulaDiffPanel
            selectedVersion={page.selectedVersion}
            loadingDiff={page.loadingDiff}
            diff={page.diff}
            totalCambios={page.totalCambios}
            diffOptions={page.diffOptions}
            diffTab={page.diffTab}
            activeDiffOption={page.activeDiffOption}
            onDiffTabChange={page.setDiffTab}
          />
        )}
        {page.activeSection === "catalogos" && (
          <CedulaCatalogsPanel
            periodoFiscalId={page.periodoFiscalId}
            loadingCatalogos={page.loadingCatalogos}
            catalogoFiltro={page.catalogoFiltro}
            catalogos={page.catalogos}
            setCatalogoFiltro={page.setCatalogoFiltro}
          />
        )}
      </div>
      <ConfirmDialog
        open={importConfirmOpen}
        title="Importar cédula MEF"
        description={
          page.selectedFile
            ? `Está por importar ${page.selectedFile.name}. Esta carga puede cambiar la cédula vigente del periodo seleccionado.`
            : "Está por importar una nueva cédula MEF."
        }
        confirmText="Importar cédula"
        cancelText="Cancelar"
        tone="warning"
        loading={page.loading}
        onConfirm={async () => {
          await page.handleUpload();
          setImportConfirmOpen(false);
        }}
        onClose={() => {
          if (!page.loading) setImportConfirmOpen(false);
        }}
      />
    </div>
  );
}

function CedulaHeader() {
  return (
    <PageHeader
      title="Cédula Presupuestaria MEF"
      description="Importe, compare y valide la cédula vigente para certificaciones POA/PAI"
    />
  );
}
