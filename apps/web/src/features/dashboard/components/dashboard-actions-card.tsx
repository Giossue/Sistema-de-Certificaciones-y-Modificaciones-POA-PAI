import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AppCard, AppSectionHeader } from "@/components/app-ui";
import type { DashboardAction } from "../types";

export function DashboardActionsCard({
  actions,
}: {
  actions: DashboardAction[];
}) {
  return (
    <AppCard padded={false}>
      <AppSectionHeader title="Accesos de trabajo" />
      <div className="divide-y divide-slate-100">
        {actions.map(({ label, description, href, icon: Icon }) => (
          <Link key={href} to={href} className="app-list-item">
            <Icon size={17} className="" />
            <span className="min-w-0 flex-1">
              <span className="block">{label}</span>
              <span className="block">{description}</span>
            </span>
            <ArrowRight size={15} className="" />
          </Link>
        ))}
      </div>
    </AppCard>
  );
}
