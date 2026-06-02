import { createServerFn } from "@tanstack/react-start";
import Groq from "groq-sdk";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = "llama-3.3-70b-versatile";

const STATUS_ENUM = [
  "disponivel",
  "em_uso",
  "manutencao",
  "reservado",
  "extraviado",
  "danificado",
] as const;

const CATEGORY_ENUM = [
  "audio",
  "video",
  "iluminacao",
  "estrutura",
  "geradores",
  "informatica",
  "transporte",
  "outros",
] as const;

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

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "add_equipment",
      description:
        "Adiciona um novo equipamento ao inventário. Use IMEDIATAMENTE quando o usuário descrever qualquer equipamento para cadastrar — sem pedir confirmação.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome completo do equipamento" },
          category_slug: {
            type: "string",
            enum: [...CATEGORY_ENUM],
            description: "Categoria inferida da descrição",
          },
          quantity: { type: "integer", minimum: 1, description: "Quantidade (padrão: 1)" },
          location: { type: "string", description: "Local de armazenamento" },
          brand: { type: "string", description: "Marca/fabricante" },
          model: { type: "string", description: "Modelo" },
          notes: { type: "string", description: "Observações" },
        },
        required: ["name", "category_slug", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_equipments",
      description: "Lista equipamentos do inventário com filtros opcionais.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Busca parcial pelo nome" },
          category_slug: {
            type: "string",
            enum: [...CATEGORY_ENUM],
            description: "Filtrar por categoria",
          },
          status: {
            type: "string",
            enum: [...STATUS_ENUM],
            description: "Filtrar por status",
          },
          limit: { type: "integer", description: "Máximo de resultados (padrão 20)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_equipment",
      description: "Atualiza informações de um equipamento existente pelo nome.",
      parameters: {
        type: "object",
        properties: {
          name_search: { type: "string", description: "Trecho do nome para localizar" },
          new_name: { type: "string" },
          new_quantity: { type: "integer", minimum: 1 },
          new_location: { type: "string" },
          new_status: {
            type: "string",
            enum: [...STATUS_ENUM],
          },
          new_notes: { type: "string" },
          new_brand: { type: "string" },
        },
        required: ["name_search"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_equipment",
      description: "Remove um equipamento do inventário pelo nome.",
      parameters: {
        type: "object",
        properties: {
          name_search: { type: "string", description: "Trecho do nome para localizar" },
        },
        required: ["name_search"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_summary",
      description: "Retorna resumo do inventário: totais por status e categoria.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM = `You are the EventKit Pro Inventory Assistant — a tool for managing event production equipment.

LANGUAGE: Always respond in Brazilian Portuguese (pt-BR).

BEHAVIOR:
- Execute actions immediately without asking for confirmation.
- After executing, report the result concisely.
- Infer category from context:
  impressora/computador/tablet/monitor -> informatica
  caixa de som/microfone/mixer/amplificador/subwoofer -> audio
  camera/projetor/tela/televisao -> video
  refletor/LED/moving head/par led -> iluminacao
  palco/grade/trelica/box/tenda -> estrutura
  gerador/nobreak/cabo de forca -> geradores
  case/carrinho/embalagem -> transporte
  otherwise -> outros
- Default quantity is 1 when not mentioned.
- Extract brand and model from equipment descriptions when possible.
- For listing: call list_equipments with appropriate filters.
- For summary/overview requests: call get_summary.

RESPONSE FORMAT (Portuguese):
- After adding: confirm with item name and quantity.
- After listing: present results clearly.
- After updating: confirm what changed.
- After removing: confirm removal.
- After summary: present numbers clearly.`;

// ─── Supabase Admin Client ────────────────────────────────────────────────────

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
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
  if (toInsert.length > 0) await sb.from("categories").insert(toInsert);
  categoriesSeeded = true;
}

// ─── Tool Executor ────────────────────────────────────────────────────────────

async function executeTool(
  sb: ReturnType<typeof getAdminClient>,
  toolName: string,
  input: Record<string, unknown>
): Promise<{ raw: unknown; action?: AIAction }> {
  switch (toolName) {
    // ── add_equipment ──────────────────────────────────────────────────────────
    case "add_equipment": {
      const slug = (input.category_slug as string) ?? "outros";
      const { data: cat } = await sb
        .from("categories")
        .select("id")
        .eq("slug", slug)
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

    // ── list_equipments ────────────────────────────────────────────────────────
    case "list_equipments": {
      // Resolve category_slug → category_id before building the main query
      let categoryId: string | null = null;
      if (input.category_slug) {
        const { data: cat } = await sb
          .from("categories")
          .select("id")
          .eq("slug", input.category_slug as string)
          .single();
        categoryId = cat?.id ?? null;
      }

      let q = sb
        .from("equipments")
        .select("*, categories(name, color, slug)")
        .order("created_at", { ascending: false })
        .limit((input.limit as number) ?? 20);

      if (input.search) q = q.ilike("name", `%${input.search}%`);
      if (categoryId) q = q.eq("category_id", categoryId);
      if (input.status)
        q = q.eq("status", input.status as Database["public"]["Enums"]["equipment_status"]);

      const { data, error } = await q;
      if (error) return { raw: { error: error.message } };
      const list = (data ?? []) as EquipmentRow[];
      return { raw: list, action: { type: "listed", equipments: list, total: list.length } };
    }

    // ── update_equipment ───────────────────────────────────────────────────────
    case "update_equipment": {
      const { data: found } = await sb
        .from("equipments")
        .select("id")
        .ilike("name", `%${input.name_search as string}%`)
        .limit(1)
        .single();

      if (!found)
        return { raw: { error: `Equipamento não encontrado: "${input.name_search}"` } };

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
      if (input.new_brand) updates.brand = input.new_brand as string;

      const { data, error } = await sb
        .from("equipments")
        .update(updates)
        .eq("id", found.id)
        .select("*, categories(name, color, slug)")
        .single();

      if (error) return { raw: { error: error.message } };
      return { raw: data, action: { type: "updated", equipment: data as EquipmentRow } };
    }

    // ── remove_equipment ───────────────────────────────────────────────────────
    case "remove_equipment": {
      const { data: found } = await sb
        .from("equipments")
        .select("id, name")
        .ilike("name", `%${input.name_search as string}%`)
        .limit(1)
        .single();

      if (!found)
        return { raw: { error: `Equipamento não encontrado: "${input.name_search}"` } };

      const { error } = await sb.from("equipments").delete().eq("id", found.id);
      if (error) return { raw: { error: error.message } };
      return { raw: { ok: true }, action: { type: "removed", name: found.name } };
    }

    // ── get_summary ────────────────────────────────────────────────────────────
    case "get_summary": {
      const { data: eqs } = await sb
        .from("equipments")
        .select("status, quantity, categories(name)");

      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let total = 0;

      for (const eq of eqs ?? []) {
        const qty = eq.quantity ?? 0;
        // Count units per status (not rows)
        byStatus[eq.status] = (byStatus[eq.status] ?? 0) + qty;
        const cat = (eq.categories as { name?: string } | null)?.name ?? "Outros";
        byCategory[cat] = (byCategory[cat] ?? 0) + qty;
        total += qty;
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

// ─── Work Order Description Parser ───────────────────────────────────────────

export type ParsedWorkOrder = {
  event_name?: string;
  location?: string;
  event_date?: string;
  priority?: "baixa" | "media" | "alta" | "urgente";
  notes?: string;
};

export const parseWorkOrderDescription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { description: string })
  .handler(async (ctx): Promise<ParsedWorkOrder> => {
    const { description } = ctx.data as { description: string };
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return {};

    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0,
      max_tokens: 256,
      messages: [
        {
          role: "system",
          content: `Extract work order fields from a Brazilian Portuguese event description.
Return ONLY a valid JSON object with these optional fields:
{"event_name":"string","location":"string","event_date":"YYYY-MM-DD","priority":"baixa|media|alta|urgente","notes":"string"}
- event_date: convert relative dates (e.g. "15 de julho" → "2026-07-15")
- priority: infer from urgency words ("urgente"→urgente, "show grande"→alta, default→media)
- Return only the JSON object, no markdown, no extra text.`,
        },
        { role: "user", content: description },
      ],
    });

    try {
      const content = response.choices[0]?.message?.content ?? "{}";
      const match = content.match(/\{[\s\S]*\}/);
      return match ? (JSON.parse(match[0]) as ParsedWorkOrder) : {};
    } catch {
      return {};
    }
  });

// ─── Server Function ──────────────────────────────────────────────────────────

export const callAIAgent = createServerFn({ method: "POST" })
  .inputValidator(
    (d: unknown) => d as { history: ChatHistoryMessage[]; message: string }
  )
  .handler(async (ctx): Promise<AIResponse> => {
    const data = ctx.data as { history: ChatHistoryMessage[]; message: string };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        message:
          "GROQ_API_KEY não configurada. Adicione ao `.env` e `.dev.vars`:\n```\nGROQ_API_KEY=gsk_...\n```\nObtena gratuitamente em: https://console.groq.com",
      };
    }

    const sb = getAdminClient();
    await ensureCategories(sb);

    const groq = new Groq({ apiKey });

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      ...data.history.map((m: ChatHistoryMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: data.message },
    ];

    let response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 1024,
      temperature: 0,
    });

    let finalAction: AIAction | undefined;

    // Agentic loop — execute tool calls until the model returns a text response
    while (response.choices[0]?.finish_reason === "tool_calls") {
      const assistantMsg = response.choices[0].message;
      const toolCalls = assistantMsg.tool_calls ?? [];

      messages.push(assistantMsg);

      for (const tc of toolCalls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          // malformed JSON from model — skip with empty args
        }

        const result = await executeTool(sb, tc.function.name, args);
        if (result.action) finalAction = result.action;

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result.raw),
        });
      }

      response = await groq.chat.completions.create({
        model: MODEL,
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0,
      });
    }

    const text = response.choices[0]?.message?.content ?? "Pronto!";
    return { message: text, action: finalAction };
  });
