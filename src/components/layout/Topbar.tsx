import { useNavigate } from "@tanstack/react-router";
import { LogOut, Search, Sun, Moon, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABEL } from "@/lib/format";

export function Topbar() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const isDark = !document.documentElement.classList.contains("light");
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
  };

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Pesquisar equipamentos, ordens, kits..."
          className="h-9 border-border/60 bg-muted/40 pl-9 focus-visible:ring-1"
        />
      </div>

      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm hover:bg-accent/40">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-xs font-medium text-foreground">{user?.user_metadata?.full_name ?? user?.email}</p>
              <p className="text-[10px] text-muted-foreground">
                {roles.map((r) => ROLE_LABEL[r] ?? r).join(", ") || "Usuário"}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <UserIcon className="mr-2 h-4 w-4" /> Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
