import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { CalendarRange } from "lucide-react";

export const Route = createFileRoute("/_authenticated/schedule")({ component: () => (
  <div className="space-y-6">
    <PageHeader title="Agenda & Logística" description="Cronograma de eventos, separação e checklist de transporte" />
    <EmptyState icon={CalendarRange} title="Calendário em construção" description="A agenda completa com checklists de carga e retorno entra na próxima onda." />
  </div>
)});
