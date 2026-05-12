import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABEL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, roles } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Preferências da conta" />
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-semibold">Perfil</h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Nome</dt><dd className="mt-0.5 font-medium">{user?.user_metadata?.full_name ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground">E-mail</dt><dd className="mt-0.5 font-medium">{user?.email}</dd></div>
          <div><dt className="text-muted-foreground">Perfis</dt><dd className="mt-0.5 font-medium">{roles.map((r) => ROLE_LABEL[r] ?? r).join(", ") || "—"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
