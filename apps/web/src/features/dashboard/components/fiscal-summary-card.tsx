import {
  AppCard,
  AppSectionHeader,
  EmptyState,
  MetricCard,
} from "@/components/app-ui";
import type { FiscalStat } from "../types";

export function FiscalSummaryCard({
  fiscalStats,
}: {
  fiscalStats: FiscalStat[];
}) {
  return (
    <AppCard padded={false}>
      <AppSectionHeader title="Resumen fiscal" />
      {fiscalStats.length === 0 ? (
        <EmptyState title="Sin periodo fiscal activo." />
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
          {fiscalStats.map((stat) => (
            <MetricCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      )}
    </AppCard>
  );
}
