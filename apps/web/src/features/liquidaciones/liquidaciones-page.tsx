import { useCallback, useEffect, useState } from "react";
import { InlineMessage, PageHeader } from "@/components/saas-layout";
import { useAuth } from "@/features/auth/use-auth";
import { LiquidacionForm } from "./components/liquidacion-form";
import { LiquidacionesTable } from "./components/liquidaciones-table";
import {
  aprobarLiquidacion,
  cargarCertificacionesLiquidacion,
  crearLiquidacion,
  listarLiquidaciones,
  rechazarLiquidacion,
} from "./services/liquidaciones-api";
import type { Certificacion, Liquidacion } from "./types";

export function LiquidacionesPage() {
  const { user } = useAuth();
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [certificacionId, setCertificacionId] = useState("");
  const [tipo, setTipo] = useState("total");
  const [modo, setModo] = useState("A");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLiquidaciones, setTotalLiquidaciones] = useState(0);
  const token = localStorage.getItem("poa_token");

  const cargar = useCallback(async () => {
    if (!token) return;
    const [certs, liquidacionesPayload] = await Promise.all([
      cargarCertificacionesLiquidacion(),
      listarLiquidaciones({ page: currentPage, pageSize }),
    ]);
    setCertificaciones(certs);
    if (liquidacionesPayload) {
      setLiquidaciones(liquidacionesPayload.items);
      setTotalLiquidaciones(liquidacionesPayload.totalItems);
    }
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const totalPages = Math.max(1, Math.ceil(totalLiquidaciones / pageSize));

  const enviar = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    const { res, data } = await crearLiquidacion({
      certificacionId,
      tipo,
      modo,
      monto,
      motivo,
    });
    setLoading(false);
    if (!res.ok) setMessage(data.error || "No se pudo liquidar");
    else {
      setMessage("Liquidación solicitada");
      setMonto("");
      setMotivo("");
      await cargar();
    }
  };

  const aprobar = async (id: string) => {
    if (!token) return;
    const { res, data } = await aprobarLiquidacion(id);
    if (!res.ok) setMessage(data.error || "No se pudo aprobar");
    else {
      setMessage("Liquidación aprobada");
      await cargar();
    }
  };

  const rechazar = async (id: string) => {
    if (!token) return;
    const motivoRechazo = window.prompt("Motivo de rechazo");
    if (!motivoRechazo) return;
    const { res, data } = await rechazarLiquidacion(id, motivoRechazo);
    if (!res.ok) setMessage(data.error || "No se pudo rechazar");
    else {
      setMessage("Liquidación rechazada");
      await cargar();
    }
  };

  const canApprove = ["admin", "director", "analista"].includes(
    user?.rol || "",
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Liquidaciones"
        description="Solicitud y aprobación de liberación total o parcial de certificaciones"
      />
      {message && <InlineMessage>{message}</InlineMessage>}
      <div className="space-y-6">
        <LiquidacionForm
          certificaciones={certificaciones}
          certificacionId={certificacionId}
          setCertificacionId={setCertificacionId}
          tipo={tipo}
          setTipo={setTipo}
          modo={modo}
          setModo={setModo}
          monto={monto}
          setMonto={setMonto}
          motivo={motivo}
          setMotivo={setMotivo}
          loading={loading}
          onEnviar={enviar}
        />
        <LiquidacionesTable
          liquidaciones={liquidaciones}
          currentPage={currentPage}
          totalPages={totalPages}
          totalLiquidaciones={totalLiquidaciones}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
          canApprove={canApprove}
          onAprobar={aprobar}
          onRechazar={rechazar}
        />
      </div>
    </div>
  );
}
