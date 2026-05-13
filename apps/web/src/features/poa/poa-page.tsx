import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/saas-layout";
import { PoaActivitiesSection } from "./components/poa-activities-section";
import { PoaFiltersPanel } from "./components/poa-filters-panel";
import { PoaSummaryCards } from "./components/poa-summary-cards";
import {
  cargarPeriodosPoa,
  consultarPoaResumen,
  importarPoaBase,
  listarActividadesPoa,
  listarCatalogosPoa,
} from "./services/poa-api";
import type {
  ActividadPoa,
  CatalogosPoa,
  Filtro,
  PeriodoFiscal,
  PoaImportResult,
  PoaInfo,
  SortDirection,
  SortKey,
} from "./types";

export function PoaPage() {
  const [periodoFiscalId, setPeriodoFiscalId] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoFiscal[]>([]);
  const [periodosError, setPeriodosError] = useState("");
  const [poaInfo, setPoaInfo] = useState<PoaInfo | null>(null);
  const [actividades, setActividades] = useState<ActividadPoa[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<PoaImportResult | null>(
    null,
  );
  const [importError, setImportError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("programa");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [debouncedTexto, setDebouncedTexto] = useState("");
  const [catalogos, setCatalogos] = useState<CatalogosPoa>({
    programas: [],
    actividades: [],
    items: [],
    fuentes: [],
  });
  const [filtro, setFiltro] = useState<Filtro>({
    texto: "",
    programa: "",
    actividad: "",
    item: "",
    fuente: "",
    verSoloConSaldo: false,
  });

  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        const lista = await cargarPeriodosPoa();
        setPeriodos(lista);
        const saved = localStorage.getItem("ultimo_periodo_fiscal_id");
        const savedIsValid =
          saved && lista.some((periodo) => periodo.id === saved);
        const activo = lista.find((periodo) => periodo.activo) || lista[0];
        if (savedIsValid) setPeriodoFiscalId(saved);
        else if (activo) setPeriodoFiscalId(activo.id);
      } catch (err: any) {
        setPeriodosError(
          err.message || "No se pudieron cargar los periodos fiscales",
        );
      }
    };
    cargarPeriodos();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTexto(filtro.texto), 250);
    return () => window.clearTimeout(timer);
  }, [filtro.texto]);

  const cargarResumen = useCallback(async (pfi: string) => {
    try {
      const resumen = await consultarPoaResumen(pfi);
      setPoaInfo(resumen);
    } catch {
      setPoaInfo(null);
    }
  }, []);

  const cargarCatalogos = useCallback(
    async (pfi: string, currentFiltro: Filtro) => {
      try {
        const data = await listarCatalogosPoa(pfi, currentFiltro);
        setCatalogos(data);
      } catch {
        setCatalogos({
          programas: [],
          actividades: [],
          items: [],
          fuentes: [],
        });
      }
    },
    [],
  );

  const cargarActividades = useCallback(
    async (pfi: string, signal?: AbortSignal) => {
      setLoading(true);
      try {
        const data = await listarActividadesPoa({
          periodoFiscalId: pfi,
          currentPage,
          pageSize,
          sortKey,
          sortDirection,
          debouncedTexto,
          filtro,
          signal,
        });
        setActividades(data.actividades);
        setTotalItems(data.totalItems);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setActividades([]);
        setTotalItems(0);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [
      currentPage,
      debouncedTexto,
      filtro,
      pageSize,
      sortDirection,
      sortKey,
    ],
  );

  useEffect(() => {
    if (periodoFiscalId) {
      localStorage.setItem("ultimo_periodo_fiscal_id", periodoFiscalId);
      cargarResumen(periodoFiscalId);
    }
  }, [periodoFiscalId, cargarResumen]);

  useEffect(() => {
    if (periodoFiscalId) cargarCatalogos(periodoFiscalId, filtro);
  }, [
    periodoFiscalId,
    filtro.programa,
    filtro.actividad,
    filtro.item,
    cargarCatalogos,
  ]);

  useEffect(() => {
    if (!periodoFiscalId) return;
    const controller = new AbortController();
    cargarActividades(periodoFiscalId, controller.signal);
    return () => controller.abort();
  }, [periodoFiscalId, cargarActividades]);

  const handleImport = async () => {
    if (!selectedFile || !periodoFiscalId) return;
    const token = localStorage.getItem("poa_token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await importarPoaBase(selectedFile, periodoFiscalId);
      setImportResult(data);
      cargarResumen(periodoFiscalId);
      cargarCatalogos(periodoFiscalId, filtro);
      cargarActividades(periodoFiscalId);
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actividadesPaginadas = actividades;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  /* Resetear página cuando cambian los filtros */ useEffect(() => {
    setCurrentPage(1);
  }, [filtro, pageSize, sortDirection, sortKey]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(
      ["planificado", "certificado", "bloqueado", "saldo"].includes(key)
        ? "desc"
        : "asc",
    );
  };

  const handleCertificar = (actividad: ActividadPoa, saldo: number) => {
    localStorage.setItem(
      "certificacion_prefill",
      JSON.stringify({
        periodoFiscalId,
        programaCodigo: actividad.programaCodigo,
        actividadCodigo: actividad.actividadCodigo,
        itemCodigo: actividad.itemCodigo,
        fuenteCodigo: actividad.fuenteCodigo,
        saldoDisponible: saldo,
      }),
    );
    window.location.href = "/certificaciones";
  };

  return (
    <div className="p-6">
      <PageHeader
        title="POA - Plan Operativo Anual"
        description="Busque actividades, consulte saldos y solicite certificaciones"
      />
      <PoaSummaryCards poaInfo={poaInfo} />
      <PoaFiltersPanel
        filtro={filtro}
        setFiltro={setFiltro}
        periodoFiscalId={periodoFiscalId}
        periodos={periodos}
        periodosError={periodosError}
        catalogos={catalogos}
        actividadesLength={actividadesPaginadas.length}
        totalItems={totalItems}
        onPeriodoChange={(id) => {
          setPeriodoFiscalId(id);
          setImportError("");
          setImportResult(null);
        }}
      />
      <PoaActivitiesSection
        periodoFiscalId={periodoFiscalId}
        loading={loading}
        pageSize={pageSize}
        poaInfo={poaInfo}
        selectedFile={selectedFile}
        importError={importError}
        importResult={importResult}
        totalItems={totalItems}
        actividadesPaginadas={actividadesPaginadas}
        sortKey={sortKey}
        sortDirection={sortDirection}
        currentPage={currentPage}
        totalPages={totalPages}
        onFileChange={setSelectedFile}
        onImport={handleImport}
        onSort={handleSort}
        onPageSizeChange={setPageSize}
        onPageChange={setCurrentPage}
        onCertificar={handleCertificar}
      />
    </div>
  );
}
