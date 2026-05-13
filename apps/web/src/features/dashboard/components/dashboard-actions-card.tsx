import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { DashboardAction } from "../types";

export function DashboardActionsCard({
  actions,
}: {
  actions: DashboardAction[];
}) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <h2 className="">Accesos de trabajo</h2>
      </div>
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
    </section>
  );
}
