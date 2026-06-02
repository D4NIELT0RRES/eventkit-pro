import { createServerFn } from "@tanstack/react-start";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// ─── Public Types ────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";
export type ChatHistoryMessage = { role: ChatRole; content: string };

export type EquipmentRow = Database["public"]["Tables"]["equipments"]["Row"] & {
  categories?: { name: string; color: string | null; slug: string } | null;
};

export type AIAction =
  | { type: "added"; equipment: EquipmentRow }
  | { type: "updated"; equipment: EquipmentRow }
  | { type: "removed"; name: string }
  | { type: "listed"; equipments: EquipmentRow[]; total: number }
  | {
      type: "summary";
      total: number;
      byStatus: Record<string, number>;
      byCategory: Record<string, number>;
    };

export type AIResponse = {
  message: string;
  action?: AIAction;
};

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Áudio", slug: "audio", color: "#6366f1" },
  { name: "Vídeo", slug: "video", color: "#8b5cf6" },
  { name: "Iluminação", slug: "iluminacao", color: "#f59e0b" },
  { name: "Estrutura", slug: "estrutura", color: "#10b981" },
  { name: "Geradores", slug: "geradores", color: "#ef4444" },
  { name: "Informática", slug: "informatica", color: "#3b82f6" },
  { name: "Transporte", slug: "transporte", color: "#6b7280" },
  { name: "Outros", slug: "outros", color: "#94a3b8" },
];

// ─── Tool Definitions for Claude ─────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "add_equipment",
    description:
      "Adiciona um novo equipamento ao inventário. Use IMEDIATAMENTE quando o usuário descrever qualquer equipamento para cadastrar — sem pedir confirmação.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: 'Nome completo do equipamento (ex: "Caixa de Som JBL EON615")',
        },
        category_slug: {
          type: "string",
          enum: [
            "audio",
            "video",
            "iluminacao",
            "estrutura",
            "geradores",
            "informatica",
            "transporte",
            "outros",
          ],
          description: "Categoria inferida da descrição do usuário",
        },
        quantity: {
          type: "integer",
          minimum: 1,
          description: "Quantidade de unidades. Se não mencionado, use 1.",
        },
        location: {
          type: "string",
          description: 'Local de armazenamento (ex: "Sala 10", "Depósito A", "Rack 3")',
        },
        brand: { type: "string", description: "Marca ou fabricante" },
        model: { type: "string", description: "Modelo específico" },
        notes: { type: "string", description: "Observações adicionais" },
      },
      required: ["name", "category_slug", "quantity"],
    },
  },
  {
    name: "list_equipments",
    description: "Lista equipamentos do inventário com filtros opcionais.",
    input_schema: {
      type: "object" as const,
      properties: {
        search: { type: "string", description: "Busca parcial pelo nome" },
        category_slug: { type: "string", description: "Filtrar por categoria" },
        status: {
          type: "string",
          enum: [
            "disponivel",
            "em_uso",
            "manutencao",
            "reservado",
            "extraviado",
            "danificado",
          ],
          description: "Filtrar por status",
        },
        limit: {
          type: "integer",
          default: 20,
          description: "Máximo de resultados",
        },
      },
    },
  },
  {
    name: "update_equipment",
    description: "Atualiza informações de um equipamento existente pelo nome.",
    input_schema: {
      type: "object" as const,
      properties: {
        name_search: {
          type: "string",
          description: "Trecho do nome para localizar o equipamento",
        },
        new_name: { type: "string" },
        new_quantity: { type: "integer", minimum: 0 },
        new_location: { type: "string" },
        new_status: {
          type: "string",
          enum: [
            "disponivel",
            "em_uso",
            "manutencao",
            "reservado",
            "extraviado",
            "danificado",
          ],
        },
        new_notes: { type: "string" },
      },
      required: ["name_search"],
    },
  },
  {
    name: "remove_equipment",
    description: "Remove um equipamento do inventário pelo nome.",
    input_schema: {
      type: "object" as const,
      properties: {
        name_search: {
          type: "string",
          description: "Trecho do nome para localizar o equipamento",
        },
      },
      required: ["name_search"],
    },
  },
  {
    name: "get_summary",
    description:
      "Retorna um resumo do inventário: totais por status e por categoria.",
    input_schema: { type: "object" as const, properties: {} },
  },
];

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM = `Você é o Assistente de Inventário do EventKit Pro — sistema de gestão de equipamentos para produtoras de eventos.

MISSÃO: Interpretar pedidos em linguagem natural e executar ações no inventário de forma imediata e precisa.

REGRAS ABSOLUTAS:
1. NUNCA peça confirmação antes de executar. Execute e informe o resultado.
2. Se a ação foi executada com sucesso, diga apenas o necessário (1-2 frases).
3. Infira categoria automaticamente:
   - impressora, computador, tablet, monitor, servidor → informatica
   - caixa de som, microfone, mixer, amplificador, subwoofer → audio
   - câmera, projetor, tela, televisão, monitor de vídeo → video
   - refletor, LED, moving head, par, strobo → iluminacao
   - palco, grade, treliça, box, tenda, andaime → estrutura
   - gerador, nobreak, cabo de força, estabilizador → geradores
   - case, carrinho, carro de carga, embalagem → transporte
   - qualquer outra coisa → outros
4. Se quantidade não mencionada, use 1.
5. Responda sempre em português, de forma curta e direta.

FORMATO DE RESPOSTA:
- Ao adicionar: "✅ [Nome] adicionado!"
- Ao listar: apresente os dados claramente
- Ao atualizar: "✏️ [Nome] atualizado!"
- Ao remover: "🗑️ [Nome] removido do inventário."
- Ao resumir: apresente os números de forma clara

EXEMPLOS DE INTERPRETAÇÃO:
- "adicionar impressora HP colorida na sala 10" → add_equipment(name="Impressora HP Colorida", brand="HP", category_slug="informatica", location="Sala 10", quantity=1)
- "5 caixas JBL no depósito" → add_equipment(name="Caixa de Som JBL", brand="JBL", category_slug="audio", location="Depósito", quantity=5)
- "2 refletores LED moving head" → add_equipment(name="Refletor LED Moving Head", category_slug="iluminacao", quantity=2)
- "quais equipamentos temos?" → list_equipments()
- "remover impressora HP" → remove_equipment(name_search="Impressora HP")
- "quantos equipamentos no total?" → get_summary()`;

// ─── Supabase Admin Client ────────────────────────────────────────────────────

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  // Service role key bypasses RLS — required for server-side writes
  // Add SUPABASE_SERVICE_ROLE_KEY to your .env (from Supabase Dashboard > Settings > API)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "";
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── Category Seeder ─────────────────────────────────────────────────────────

let categoriesSeeded = false;

async function ensureCategories(sb: ReturnType<typeof getAdminClient>) {
  if (categoriesSeeded) return;
  const { data } = await sb.from("categories").select("slug");
  const existing = new Set((data ?? []).map((c) => c.slug));
  const toInsert = CATEGORIES.filter((c) => !existing.has(c.slug));
  if (toInsert.length > 0) {
    await sb.from("categories").insert(toInsert);
  }
  categoriesSeeded = true;
}

// ─── Tool Executor ────────────────────────────────────────────────────────────

async function executeTool(
  sb: ReturnType<typeof getAdminClient>,
  toolName: string,
  input: Record<string, unknown>
): Promise<{ raw: unknown; action?: AIAction }> {
  switch (toolName) {
    case "add_equipment": {
      const { data: cat } = await sb
        .from("categories")
        .select("id")
        .eq("slug", (input.category_slug as string) ?? "outros")
        .single();

      const qty = Math.max(1, Number(input.quantity) || 1);

      const { data, error } = await sb
        .from("equipments")
        .insert({
          name: input.name as string,
          category_id: cat?.id ?? null,
          quantity: qty,
          available_qty: qty,
          location: (input.location as string) ?? null,
          brand: (input.brand as string) ?? null,
          model: (input.model as string) ?? null,
          notes: (input.notes as string) ?? null,
          status: "disponivel",
        })
        .select("*, categories(name, color, slug)")
        .single();

      if (error) return { raw: { error: error.message } };
      return { raw: data, action: { type: "added", equipment: data as EquipmentRow } };
    }

    case "list_equipments": {
      let q = sb
        .from("equipments")
        .select("*, categories(name, color, slug)")
        .order("created_at", { ascending: false })
        .limit((input.limit as number) ?? 20);

      if (input.search) q = q.ilike("name", `%${input.search}%`);
      if (input.status)
        q = q.eq("status", input.status as Database["public"]["Enums"]["equipment_status"]);

      const { data, error } = await q;
      if (error) return { raw: { error: error.message } };

      const list = (data ?? []) as EquipmentRow[];
      return {
        raw: list,
        action: { type: "listed", equipments: list, total: list.length },
      };
    }

    case "update_equipment": {
      const { data: found } = await sb
        .from("equipments")
        .select("id")
        .ilike("name", `%${input.name_search as string}%`)
        .limit(1)
        .single();

      if (!found) {
        return { raw: { error: `Equipamento não encontrado: "${input.name_search}"` } };
      }

      type EqUpdate = Database["public"]["Tables"]["equipments"]["Update"];
      const updates: EqUpdate = { updated_at: new Date().toISOString() };
      if (input.new_name) updates.name = input.new_name as string;
      if (input.new_quantity != null) {
        updates.quantity = input.new_quantity as number;
        updates.available_qty = input.new_quantity as number;
      }
      if (input.new_location) updates.location = input.new_location as string;
      if (input.new_status)
        updates.status = input.new_status as Database["public"]["Enums"]["equipment_status"];
      if (input.new_notes) updates.notes = input.new_notes as string;

      const { data, error } = await sb
        .from("equipments")
        .update(updates)
        .eq("id", found.id)
        .select("*, categories(name, color, slug)")
        .single();

      if (error) return { raw: { error: error.message } };
      return { raw: data, action: { type: "updated", equipment: data as EquipmentRow } };
    }

    case "remove_equipment": {
      const { data: found } = await sb
        .from("equipments")
        .select("id, name")
        .ilike("name", `%${input.name_search as string}%`)
        .limit(1)
        .single();

      if (!found) {
        return { raw: { error: `Equipamento não encontrado: "${input.name_search}"` } };
      }

      const { error } = await sb.from("equipments").delete().eq("id", found.id);
      if (error) return { raw: { error: error.message } };
      return { raw: { ok: true }, action: { type: "removed", name: found.name } };
    }

    case "get_summary": {
      const { data: eqs } = await sb
        .from("equipments")
        .select("status, quantity, categories(name)");

      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let total = 0;

      for (const eq of eqs ?? []) {
        byStatus[eq.status] = (byStatus[eq.status] ?? 0) + 1;
        const cat = (eq.categories as { name?: string } | null)?.name ?? "Outros";
        byCategory[cat] = (byCategory[cat] ?? 0) + (eq.quantity ?? 0);
        total += eq.quantity ?? 0;
      }

      return {
        raw: { total, byStatus, byCategory },
        action: { type: "summary", total, byStatus, byCategory },
      };
    }

    default:
      return { raw: { error: `Ferramenta desconhecida: ${toolName}` } };
  }
}

// ─── Server Function ──────────────────────────────────────────────────────────

export const callAIAgent = createServerFn({ method: "POST" })
  .inputValidator(
    (d: unknown) => d as { history: ChatHistoryMessage[]; message: string }
  )
  .handler(async (ctx): Promise<AIResponse> => {
    const data = ctx.data as { history: ChatHistoryMessage[]; message: string };
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        message:
          "⚠️ **ANTHROPIC_API_KEY não configurada.**\n\nAdicione ao arquivo `.env`:\n```\nANTHROPIC_API_KEY=sk-ant-...\n```\nEm seguida, reinicie o servidor com `npm run dev`.",
      };
    }

    const sb = getAdminClient();
    await ensureCategories(sb);

    const anthropic = new Anthropic({ apiKey });

    const msgs: Anthropic.MessageParam[] = [
      ...data.history.map((m: ChatHistoryMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: data.message },
    ];

    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      tools: TOOLS,
      messages: msgs,
    });

    let finalAction: AIAction | undefined;

    // Agentic loop — keep processing until no more tool calls
    while (response.stop_reason === "tool_use") {
      const toolBlock = response.content.find(
        (b) => b.type === "tool_use"
      ) as Anthropic.ToolUseBlock | undefined;
      if (!toolBlock) break;

      const result = await executeTool(
        sb,
        toolBlock.name,
        toolBlock.input as Record<string, unknown>
      );
      if (result.action) finalAction = result.action;

      msgs.push({ role: "assistant", content: response.content });
      msgs.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolBlock.id,
            content: JSON.stringify(result.raw),
          },
        ],
      });

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM,
        tools: TOOLS,
        messages: msgs,
      });
    }

    const text = (
      response.content.find((b) => b.type === "text") as
        | Anthropic.TextBlock
        | undefined
    )?.text ?? "Pronto!";

    return { message: text, action: finalAction };
  });
