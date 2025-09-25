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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      code_math_extractions: {
        Row: {
          content: string | null
          extracted_at: string | null
          extraction_type: string | null
          id: string
          research_result_id: string | null
        }
        Insert: {
          content?: string | null
          extracted_at?: string | null
          extraction_type?: string | null
          id?: string
          research_result_id?: string | null
        }
        Update: {
          content?: string | null
          extracted_at?: string | null
          extraction_type?: string | null
          id?: string
          research_result_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_math_extractions_research_result_id_fkey"
            columns: ["research_result_id"]
            isOneToOne: false
            referencedRelation: "research_results"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          id: string
          permission: string | null
          research_result_id: string | null
          shared_at: string | null
          shared_with_user_id: string | null
        }
        Insert: {
          id?: string
          permission?: string | null
          research_result_id?: string | null
          shared_at?: string | null
          shared_with_user_id?: string | null
        }
        Update: {
          id?: string
          permission?: string | null
          research_result_id?: string | null
          shared_at?: string | null
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_research_result_id_fkey"
            columns: ["research_result_id"]
            isOneToOne: false
            referencedRelation: "research_results"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          export_type: string | null
          exported_at: string | null
          file_url: string | null
          id: string
          research_result_id: string | null
          user_id: string | null
        }
        Insert: {
          export_type?: string | null
          exported_at?: string | null
          file_url?: string | null
          id?: string
          research_result_id?: string | null
          user_id?: string | null
        }
        Update: {
          export_type?: string | null
          exported_at?: string | null
          file_url?: string | null
          id?: string
          research_result_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_research_result_id_fkey"
            columns: ["research_result_id"]
            isOneToOne: false
            referencedRelation: "research_results"
            referencedColumns: ["id"]
          },
        ]
      }
      outlines: {
        Row: {
          conclusion: string | null
          created_at: string | null
          future_scope: string | null
          id: string
          introduction: string | null
          literature_review: string | null
          methodology: string | null
          research_result_id: string | null
          results: string | null
        }
        Insert: {
          conclusion?: string | null
          created_at?: string | null
          future_scope?: string | null
          id?: string
          introduction?: string | null
          literature_review?: string | null
          methodology?: string | null
          research_result_id?: string | null
          results?: string | null
        }
        Update: {
          conclusion?: string | null
          created_at?: string | null
          future_scope?: string | null
          id?: string
          introduction?: string | null
          literature_review?: string | null
          methodology?: string | null
          research_result_id?: string | null
          results?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outlines_research_result_id_fkey"
            columns: ["research_result_id"]
            isOneToOne: false
            referencedRelation: "research_results"
            referencedColumns: ["id"]
          },
        ]
      }
      queries: {
        Row: {
          created_at: string | null
          id: string
          query_text: string
          query_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query_text: string
          query_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query_text?: string
          query_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      research_results: {
        Row: {
          abstract: string | null
          authors: string | null
          created_at: string | null
          id: string
          query_id: string | null
          source: string | null
          title: string | null
          url: string | null
          venue: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          authors?: string | null
          created_at?: string | null
          id?: string
          query_id?: string | null
          source?: string | null
          title?: string | null
          url?: string | null
          venue?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string | null
          created_at?: string | null
          id?: string
          query_id?: string | null
          source?: string | null
          title?: string | null
          url?: string | null
          venue?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "research_results_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          generated_at: string | null
          id: string
          research_result_id: string | null
          summary: string | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          research_result_id?: string | null
          summary?: string | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          research_result_id?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "summaries_research_result_id_fkey"
            columns: ["research_result_id"]
            isOneToOne: false
            referencedRelation: "research_results"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          id: string
          language: string | null
          research_result_id: string | null
          translated_at: string | null
          translated_text: string | null
        }
        Insert: {
          id?: string
          language?: string | null
          research_result_id?: string | null
          translated_at?: string | null
          translated_text?: string | null
        }
        Update: {
          id?: string
          language?: string | null
          research_result_id?: string | null
          translated_at?: string | null
          translated_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translations_research_result_id_fkey"
            columns: ["research_result_id"]
            isOneToOne: false
            referencedRelation: "research_results"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_keywords: {
        Row: {
          detected_at: string | null
          frequency: number | null
          id: string
          keyword: string | null
          query_id: string | null
        }
        Insert: {
          detected_at?: string | null
          frequency?: number | null
          id?: string
          keyword?: string | null
          query_id?: string | null
        }
        Update: {
          detected_at?: string | null
          frequency?: number | null
          id?: string
          keyword?: string | null
          query_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trending_keywords_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          query_id: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          query_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          query_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_tasks: {
        Row: {
          associated_query_id: string | null
          created_at: string | null
          id: string
          status: string | null
          task_name: string | null
          task_order: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          associated_query_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string | null
          task_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          associated_query_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string | null
          task_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tasks_associated_query_id_fkey"
            columns: ["associated_query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
