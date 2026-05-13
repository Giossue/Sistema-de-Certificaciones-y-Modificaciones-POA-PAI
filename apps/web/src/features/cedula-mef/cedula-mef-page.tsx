import { useEffect, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { PageHeader } from "@/components/saas-layout";
import { CedulaCatalogsPanel } from "./components/cedula-catalogs-panel";
import { CedulaDiffPanel } from "./components/cedula-diff-panel";
import { CedulaHistoryPanel } from "./components/cedula-history-panel";
import { CedulaImportPanel } from "./components/cedula-import-panel";
import { CedulaSubmenu } from "./components/cedula-submenu";
import {
  cargarPeriodosFiscales,
  compararVersionCedula,
  importarCedulaMef,
  listarCatalogosCedula,
  listarVersionesCedula,
  obtenerCedulaVigente,
} from "./services/cedula-mef-api";
import type {
  CatalogoFiltro,
  CatalogosCedula,
  CedulaSection,
  DiffOption,
  DiffResult,
  DiffTab,
  ImportResult,
  PeriodoFiscal,
  VersionCedula,
} from "./types";

export function CedulaMefPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodosError, setPeriodosError] = useState("");
  const [versiones, setVersiones] = useState<VersionCedula[]>([]);
  const [totalVersiones, setTotalVersiones] = useState(0);
  const [versionesPage, setVersionesPage] = useState(1);
  const [versionesPageSize, setVersionesPageSize] = useState(10);
  const [loadingVersiones, setLoadingVersiones] = useState(false);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [catalogos, setCatalogos] = useState<CatalogosCedula>({
    programas: [],
    actividades: [],
    items: [],
    fuentes: [],
  });
  const [catalogoFiltro, setCatalogoFiltro] = useState<CatalogoFiltro>({
    programa: "",
    actividad: "",
    item: "",
  });
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [activeSection, setActiveSection] = useState<CedulaSection>("carga");
  const [diffTab, setDiffTab] = useState<DiffTab>("agregadas");
  const [selectedVersionId, setSelectedVersionId] = useState("");

  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        const lista = await cargarPeriodosFiscales();
        setPeriodos(lista);
        const savedPfi = localStorage.getItem("ultimo_periodo_fiscal_id");
        const savedIsValid =
          savedPfi && lista.some((periodo) => periodo.id === savedPfi);
        const activo = lista.find((periodo) => periodo.activo) || lista[0];
        if (savedIsValid) setPeriodoFiscalId(savedPfi);
        else if (activo) setPeriodoFiscalId(activo.id);
      } catch (err: any) {
        setPeriodosError(
          err.message || "No se pudieron cargar los periodos fiscales",
        );
      }
    };
    cargarPeriodos();
  }, []);

  const seleccionarPeriodo = (id: string) => {
    setPeriodoFiscalId(id);
    setVersionesPage(1);
    setResult(null);
    setError("");
    setDiff(null);
    setSelectedVersionId("");
    setActiveSection("carga");
    if (!id) {
      setVersiones([]);
      setCatalogos({ programas: [], actividades: [], items: [], fuentes: [] });
    }
    setCatalogoFiltro({ programa: "", actividad: "", item: "" });
  };

  useEffect(() => {
    if (periodoFiscalId) {
      localStorage.setItem("ultimo_periodo_fiscal_id", periodoFiscalId);
      cargarVigente(periodoFiscalId);
      cargarCatalogos(periodoFiscalId, catalogoFiltro);
    }
  }, [
    periodoFiscalId,
    result,
    catalogoFiltro.programa,
    catalogoFiltro.actividad,
    catalogoFiltro.item,
  ]);

  useEffect(() => {
    if (periodoFiscalId) cargarVersiones(periodoFiscalId);
  }, [periodoFiscalId, result, versionesPage, versionesPageSize]);

  const cargarVersiones = async (pfi: string) => {
    setLoadingVersiones(true);
    try {
      const response = await listarVersionesCedula(
        pfi,
        versionesPage,
        versionesPageSize,
      );
      if (response.ok) {
        const payload = response.data.data || {};
        setVersiones((payload.items || []) as VersionCedula[]);
        setTotalVersiones(Number(payload.totalItems || 0));
      }
    } catch {
      /* silent */
    } finally {
      setLoadingVersiones(false);
    }
  };

  const cargarVigente = async (pfi: string) => {
    try {
      const response = await obtenerCedulaVigente(pfi);
      if (response.ok && response.data.data) {
        /* versionVigente is available if needed */
      }
    } catch {
      /* silent */
    }
  };

  const cargarCatalogos = async (pfi: string, filtro = catalogoFiltro) => {
    setLoadingCatalogos(true);
    try {
      const data = await listarCatalogosCedula(pfi, filtro);
      setCatalogos(data);
    } catch {
      /* silent */
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarDiff = async (versionId: string) => {
    setLoadingDiff(true);
    try {
      const response = await compararVersionCedula(versionId);
      if (response.ok) {
        const data = response.data.data || null;
        setDiff(data);
        setDiffTab(
          data?.totalAgregadas
            ? "agregadas"
            : data?.totalModificadas
              ? "modificadas"
              : "retiradas",
        );
        setActiveSection("diferencias");
      }
    } catch {
      /* silent */
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Formato inválido. Solo se acepta Excel (.xlsx, .xls)");
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!periodoFiscalId) {
      setError("Seleccione un periodo fiscal");
      return;
    }
    setLoading(true);
    setProgress(10);
    setError("");
    try {
      setProgress(30);
      const data = await importarCedulaMef(selectedFile, periodoFiscalId, () =>
        setProgress(80),
      );
      setProgress(100);
      setResult(data);
      cargarVersiones(periodoFiscalId);
      cargarVigente(periodoFiscalId);
      if (data?.versionId) {
        setSelectedVersionId(data.versionId);
        setActiveSection("diferencias");
        cargarDiff(data.versionId);
      }
    } catch (err: any) {
      setError(err.message || "Error al importar cédula");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Formato inválido. Solo se acepta Excel (.xlsx, .xls)");
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-EC", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const totalCambios = diff
    ? diff.totalAgregadas + diff.totalModificadas + diff.totalRetiradas
    : 0;
  const selectedPeriodo = periodos.find(
    (periodo) => periodo.id === periodoFiscalId,
  );
  const vigenteVersion =
    versiones.find((version) => version.vigente) || versiones[0];
  const selectedVersion =
    versiones.find((version) => version.id === selectedVersionId) ||
    vigenteVersion;
  const diffOptions: DiffOption[] = diff
    ? [
        {
          key: "agregadas",
          label: "Agregadas",
          total: diff.totalAgregadas,
          icon: <ArrowUpRight size={14} />,
          tone: "success",
          entries: diff.agregadas,
          valueKey: "datosNuevos",
        },
        {
          key: "modificadas",
          label: "Modificadas",
          total: diff.totalModificadas,
          icon: <Minus size={14} />,
          tone: "warning",
          entries: diff.modificadas,
          valueKey: "datosNuevos",
        },
        {
          key: "retiradas",
          label: "Retiradas",
          total: diff.totalRetiradas,
          icon: <ArrowDownRight size={14} />,
          tone: "danger",
          entries: diff.retiradas,
          valueKey: "datosAnteriores",
        },
      ]
    : [];
  const activeDiffOption =
    diffOptions.find((option) => option.key === diffTab) || diffOptions[0];

  return (
    <div className="p-6">
      <PageHeader
        title="Cédula Presupuestaria MEF"
        description="Importe, compare y valide la cédula vigente para certificaciones POA/PAI"
      />
      <CedulaSubmenu
        active={activeSection}
        onChange={setActiveSection}
        totalVersiones={totalVersiones}
        totalCambios={totalCambios}
      />
      <div className="space-y-5">
        {activeSection === "carga" && (
          <CedulaImportPanel
            selectedPeriodo={selectedPeriodo}
            periodoFiscalId={periodoFiscalId}
            periodos={periodos}
            periodosError={periodosError}
            selectedFile={selectedFile}
            loading={loading}
            progress={progress}
            error={error}
            result={result}
            vigenteVersion={vigenteVersion}
            onPeriodoChange={seleccionarPeriodo}
            onFileSelect={handleFileSelect}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onUpload={handleUpload}
            onClearFile={() => setSelectedFile(null)}
            formatearFecha={formatearFecha}
          />
        )}
        {activeSection === "historial" && (
          <CedulaHistoryPanel
            periodoFiscalId={periodoFiscalId}
            loadingVersiones={loadingVersiones}
            versiones={versiones}
            versionesPage={versionesPage}
            totalVersiones={totalVersiones}
            versionesPageSize={versionesPageSize}
            selectedVersion={selectedVersion}
            onItemsPerPageChange={setVersionesPageSize}
            onPageChange={setVersionesPage}
            onOpenVersion={(versionId) => {
              setSelectedVersionId(versionId);
              setDiff(null);
              cargarDiff(versionId);
            }}
            formatearFecha={formatearFecha}
          />
        )}
        {activeSection === "diferencias" && (
          <CedulaDiffPanel
            selectedVersion={selectedVersion}
            loadingDiff={loadingDiff}
            diff={diff}
            totalCambios={totalCambios}
            diffOptions={diffOptions}
            diffTab={diffTab}
            activeDiffOption={activeDiffOption}
            onDiffTabChange={setDiffTab}
          />
        )}
        {activeSection === "catalogos" && (
          <CedulaCatalogsPanel
            periodoFiscalId={periodoFiscalId}
            loadingCatalogos={loadingCatalogos}
            catalogoFiltro={catalogoFiltro}
            catalogos={catalogos}
            setCatalogoFiltro={setCatalogoFiltro}
          />
        )}
      </div>
    </div>
  );
}
