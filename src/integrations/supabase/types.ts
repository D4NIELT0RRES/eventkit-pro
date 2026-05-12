export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      equipment_movements: {
        Row: {
          created_at: string
          equipment_id: string
          from_location: string | null
          id: string
          notes: string | null
          quantity: number
          to_location: string | null
          type: Database["public"]["Enums"]["movement_type"]
          user_id: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string
          equipment_id: string
          from_location?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          to_location?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string
          from_location?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          to_location?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_movements_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_movement_wo"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      equipments: {
        Row: {
          available_qty: number
          brand: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          internal_code: string | null
          location: string | null
          model: string | null
          name: string
          notes: string | null
          patrimony_no: string | null
          qr_code: string | null
          quantity: number
          serial_no: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          updated_at: string
        }
        Insert: {
          available_qty?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          internal_code?: string | null
          location?: string | null
          model?: string | null
          name: string
          notes?: string | null
          patrimony_no?: string | null
          qr_code?: string | null
          quantity?: number
          serial_no?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          updated_at?: string
        }
        Update: {
          available_qty?: number
          brand?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          internal_code?: string | null
          location?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          patrimony_no?: string | null
          qr_code?: string | null
          quantity?: number
          serial_no?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedule: {
        Row: {
          checklist: Json | null
          created_at: string
          id: string
          notes: string | null
          responsible_id: string | null
          scheduled_at: string
          status: string | null
          type: Database["public"]["Enums"]["schedule_type"]
          work_order_id: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          responsible_id?: string | null
          scheduled_at: string
          status?: string | null
          type: Database["public"]["Enums"]["schedule_type"]
          work_order_id?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          responsible_id?: string | null
          scheduled_at?: string
          status?: string | null
          type?: Database["public"]["Enums"]["schedule_type"]
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_schedule_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_items: {
        Row: {
          equipment_id: string
          id: string
          kit_id: string
          quantity: number
        }
        Insert: {
          equipment_id: string
          id?: string
          kit_id: string
          quantity?: number
        }
        Update: {
          equipment_id?: string
          id?: string
          kit_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "kit_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["kit_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["kit_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["kit_status"]
          updated_at?: string
        }
        Relationships: []
      }
      maintenance: {
        Row: {
          attachments: Json | null
          closed_at: string | null
          cost: number | null
          created_at: string
          equipment_id: string
          id: string
          opened_at: string
          report: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          technician_id: string | null
        }
        Insert: {
          attachments?: Json | null
          closed_at?: string | null
          cost?: number | null
          created_at?: string
          equipment_id: string
          id?: string
          opened_at?: string
          report?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          technician_id?: string | null
        }
        Update: {
          attachments?: Json | null
          closed_at?: string | null
          cost?: number | null
          created_at?: string
          equipment_id?: string
          id?: string
          opened_at?: string
          report?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_order_items: {
        Row: {
          checked_in: boolean | null
          checked_out: boolean | null
          equipment_id: string
          id: string
          quantity: number
          work_order_id: string
        }
        Insert: {
          checked_in?: boolean | null
          checked_out?: boolean | null
          equipment_id: string
          id?: string
          quantity?: number
          work_order_id: string
        }
        Update: {
          checked_in?: boolean | null
          checked_out?: boolean | null
          equipment_id?: string
          id?: string
          quantity?: number
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_items_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          client_id: string | null
          code: string
          created_at: string
          created_by: string | null
          end_date: string | null
          event_date: string | null
          event_name: string
          id: string
          location: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["wo_priority"]
          start_date: string | null
          status: Database["public"]["Enums"]["wo_status"]
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          event_date?: string | null
          event_name: string
          id?: string
          location?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["wo_priority"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["wo_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          event_date?: string | null
          event_name?: string
          id?: string
          location?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["wo_priority"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["wo_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "tecnico" | "operador" | "estoquista"
      equipment_status:
        | "disponivel"
        | "em_uso"
        | "manutencao"
        | "reservado"
        | "extraviado"
        | "danificado"
      kit_status:
        | "rascunho"
        | "reservado"
        | "em_uso"
        | "finalizado"
        | "cancelado"
      maintenance_status: "aberta" | "em_andamento" | "concluida" | "cancelada"
      movement_type: "saida" | "retorno" | "transferencia"
      schedule_type:
        | "preparacao"
        | "carregamento"
        | "evento"
        | "desmontagem"
        | "retorno"
      wo_priority: "baixa" | "media" | "alta" | "urgente"
      wo_status:
        | "aberta"
        | "em_andamento"
        | "aguardando"
        | "finalizada"
        | "cancelada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "tecnico", "operador", "estoquista"],
      equipment_status: [
        "disponivel",
        "em_uso",
        "manutencao",
        "reservado",
        "extraviado",
        "danificado",
      ],
      kit_status: [
        "rascunho",
        "reservado",
        "em_uso",
        "finalizado",
        "cancelado",
      ],
      maintenance_status: ["aberta", "em_andamento", "concluida", "cancelada"],
      movement_type: ["saida", "retorno", "transferencia"],
      schedule_type: [
        "preparacao",
        "carregamento",
        "evento",
        "desmontagem",
        "retorno",
      ],
      wo_priority: ["baixa", "media", "alta", "urgente"],
      wo_status: [
        "aberta",
        "em_andamento",
        "aguardando",
        "finalizada",
        "cancelada",
      ],
    },
  },
} as const
