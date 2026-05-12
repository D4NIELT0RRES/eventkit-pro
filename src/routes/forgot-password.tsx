import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Radio, Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) toast.error(error);
    else toast.success("Enviamos um link de recuperação para seu e-mail.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
            <Radio className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-lg font-semibold">EventOS</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">Informe seu e-mail para receber o link de redefinição</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar link
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Voltar para login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
