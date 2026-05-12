import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Criar conta — EventOS" }] }),
});

const schema = z.object({
  fullName: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setSubmitting(false);
    if (error) toast.error(error);
    else { toast.success("Conta criada! Verifique seu e-mail."); navigate({ to: "/login" }); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
            <Radio className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-lg font-semibold">EventOS</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <h1 className="text-xl font-semibold">Criar nova conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">O primeiro usuário cadastrado torna-se administrador</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="fullName">Nome completo</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
