import { useCallback, useEffect, useState } from "react";
import { InlineMessage, PageHeader } from "@/components/saas-layout";
import { useAuth } from "@/features/auth/use-auth";
import { AnulacionForm } from "./components/anulacion-form";
import { AnulacionesTable } from "./components/anulaciones-table";
import {
  aprobarAnulacion,
  cargarCertificacionesAnulacion,
  crearAnulacion,
  listarAnulaciones,
  rechazarAnulacion,
} from "./services/anulaciones-api";
import type { Anulacion, Certificacion } from "./types";

export function AnulacionesPage() {
  const { user } = useAuth();
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [anulaciones, setAnulaciones] = useState<Anulacion[]>([]);
  const [certificacionId, setCertificacionId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("poa_token");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAnulaciones, setTotalAnulaciones] = useState(0);

  const cargar = useCallback(async () => {
    if (!token) return;
    const [certs, anulacionesPayload] = await Promise.all([
      cargarCertificacionesAnulacion(),
      listarAnulaciones({ page: currentPage, pageSize }),
    ]);
    setCertificaciones(certs);
    if (anulacionesPayload) {
      setAnulaciones(anulacionesPayload.items);
      setTotalAnulaciones(anulacionesPayload.totalItems);
    }
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const totalPages = Math.max(1, Math.ceil(totalAnulaciones / pageSize));

  const enviar = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    const { res, data } = await crearAnulacion({ certificacionId, motivo });
    setLoading(false);
    if (!res.ok) setMessage(data.error || "No se pudo anular");
    else {
      setMessage("Anulación solicitada");
      setMotivo("");
      await cargar();
    }
  };

  const aprobar = async (id: string) => {
    if (!token) return;
    const { res, data } = await aprobarAnulacion(id);
    if (!res.ok) setMessage(data.error || "No se pudo aprobar");
    else {
      setMessage("Anulación aprobada");
      await cargar();
    }
  };

  const rechazar = async (id: string) => {
    if (!token) return;
    const motivoRechazo = window.prompt("Motivo de rechazo");
    if (!motivoRechazo) return;
    const { res, data } = await rechazarAnulacion(id, motivoRechazo);
    if (!res.ok) setMessage(data.error || "No se pudo rechazar");
    else {
      setMessage("Anulación rechazada");
      await cargar();
    }
  };

  const canApprove = ["admin", "director"].includes(user?.rol || "");

  return (
    <div className="p-6">
      <PageHeader
        title="Anulaciones"
        description="Solicitud y aprobación de cancelación de certificaciones sin uso"
      />
      {message && <InlineMessage>{message}</InlineMessage>}
      <div className="space-y-6">
        <AnulacionForm
          certificaciones={certificaciones}
          certificacionId={certificacionId}
          setCertificacionId={setCertificacionId}
          motivo={motivo}
          setMotivo={setMotivo}
          loading={loading}
          onEnviar={enviar}
        />
        <AnulacionesTable
          anulaciones={anulaciones}
          currentPage={currentPage}
          totalPages={totalPages}
          totalAnulaciones={totalAnulaciones}
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
