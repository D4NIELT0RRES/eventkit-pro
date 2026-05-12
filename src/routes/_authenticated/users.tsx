import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";
import { ROLE_LABEL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/users")({ component: UsersPage });

function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);
      const map = new Map<string, string[]>();
      (roles.data ?? []).forEach((r: any) => {
        const arr = map.get(r.user_id) ?? [];
        arr.push(r.role); map.set(r.user_id, arr);
      });
      return (profiles.data ?? []).map((p: any) => ({ ...p, roles: map.get(p.id) ?? [] }));
    },
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Usuários" description="Gerencie acessos e perfis de permissão" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {isLoading ? <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
          : (data?.length ?? 0) === 0 ? <EmptyState icon={Users} title="Sem usuários" />
          : <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Nome</th><th className="px-4 py-3 text-left">Perfis</th><th className="px-4 py-3 text-left">Telefone</th></tr>
            </thead>
            <tbody>
              {data?.map((u: any) => (
                <tr key={u.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.roles.map((r: string) => ROLE_LABEL[r] ?? r).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
}
