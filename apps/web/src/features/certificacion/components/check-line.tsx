import { CheckCircle, FileText } from "lucide-react";

export function CheckLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={`flex items-center gap-2 ${ok ? "" : ""}`}>
      {ok ? <CheckCircle size={14} /> : <FileText size={14} />} {text}
    </p>
  );
}
