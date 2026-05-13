import type { FiscalStat } from "../types";

export function FiscalSummaryCard({
  fiscalStats,
}: {
  fiscalStats: FiscalStat[];
}) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <h2 className="">Resumen fiscal</h2>
      </div>
      <dl className="divide-y divide-slate-100">
        {fiscalStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <dt className="">{stat.label}</dt>
            <dd className="">{stat.value}</dd>
          </div>
        ))}
        {fiscalStats.length === 0 && (
          <p className="p-4">Sin periodo fiscal activo.</p>
        )}
      </dl>
    </section>
  );
}
