import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/kits")({ component: () => (
  <div className="space-y-6">
    <PageHeader title="Kits de Eventos" description="Monte kits reutilizáveis com múltiplos equipamentos" />
    <EmptyState icon={Package} title="Em breve" description="A criação de kits será habilitada na próxima onda do EventOS." />
  </div>
)});
