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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: string
          path: string | null
          properties: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          path?: string | null
          properties?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          path?: string | null
          properties?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_tokens: {
        Row: {
          audit_id: string
          claimed_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          token: string
        }
        Insert: {
          audit_id: string
          claimed_by_user_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          token: string
        }
        Update: {
          audit_id?: string
          claimed_by_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_tokens_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "business_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      book_orders: {
        Row: {
          addons: Json
          addons_total: number
          admin_notes: string | null
          book_purpose: string
          book_vision: string
          characters: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          illustration_style: string
          order_total: number
          package_name: string
          package_price: number
          package_slug: string
          referral_source: string
          special_requirements: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          addons?: Json
          addons_total?: number
          admin_notes?: string | null
          book_purpose: string
          book_vision: string
          characters?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          illustration_style: string
          order_total: number
          package_name: string
          package_price: number
          package_slug: string
          referral_source: string
          special_requirements?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          addons?: Json
          addons_total?: number
          admin_notes?: string | null
          book_purpose?: string
          book_vision?: string
          characters?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          illustration_style?: string
          order_total?: number
          package_name?: string
          package_price?: number
          package_slug?: string
          referral_source?: string
          special_requirements?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_audits: {
        Row: {
          created_at: string
          generated_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          intake: Json
          recommended_offer: string | null
          report: Json | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          generated_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          intake?: Json
          recommended_offer?: string | null
          report?: Json | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          generated_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          intake?: Json
          recommended_offer?: string | null
          report?: Json | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_enrollments: {
        Row: {
          challenge_type: string
          completed_at: string | null
          enrolled_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          challenge_type: string
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          challenge_type?: string
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_type: string
          current_day: number | null
          entries: Json | null
          id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          challenge_type: string
          current_day?: number | null
          entries?: Json | null
          id?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          challenge_type?: string
          current_day?: number | null
          entries?: Json | null
          id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clarity_sessions: {
        Row: {
          answers: Json
          created_at: string | null
          id: string
          insight_action: string | null
          insight_pattern: string | null
          insight_truth: string | null
          module_id: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string | null
          id?: string
          insight_action?: string | null
          insight_pattern?: string | null
          insight_truth?: string | null
          module_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          id?: string
          insight_action?: string | null
          insight_pattern?: string | null
          insight_truth?: string | null
          module_id?: string
          user_id?: string
        }
        Relationships: []
      }
      cohort_registrations: {
        Row: {
          cohort_name: string
          created_at: string
          email: string
          first_name: string | null
          id: string
          source: string | null
        }
        Insert: {
          cohort_name?: string
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          source?: string | null
        }
        Update: {
          cohort_name?: string
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      content_settings: {
        Row: {
          custom_tagline: string | null
          enabled: boolean
          featured: boolean
          id: string
          updated_at: string
        }
        Insert: {
          custom_tagline?: string | null
          enabled?: boolean
          featured?: boolean
          id: string
          updated_at?: string
        }
        Update: {
          custom_tagline?: string | null
          enabled?: boolean
          featured?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      mac_assessments: {
        Row: {
          ai_insight: Json | null
          answers: Json
          code: string
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          ai_insight?: Json | null
          answers: Json
          code: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          ai_insight?: Json | null
          answers?: Json
          code?: string
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      module_enrollments: {
        Row: {
          completed_at: string | null
          enrolled_at: string | null
          id: string
          module_id: string
          sessions_count: number | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          module_id: string
          sessions_count?: number | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          module_id?: string
          sessions_count?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      processed_stripe_events: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      starter_kit_reports: {
        Row: {
          bottleneck: string
          business_type: string
          created_at: string
          email: string
          id: string
          name: string | null
          report: Json
          user_id: string | null
        }
        Insert: {
          bottleneck: string
          business_type: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          report: Json
          user_id?: string | null
        }
        Update: {
          bottleneck?: string
          business_type?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          report?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_access_levels: {
        Row: {
          created_at: string | null
          id: string
          tier: Database["public"]["Enums"]["access_tier"]
        }
        Insert: {
          created_at?: string | null
          id: string
          tier?: Database["public"]["Enums"]["access_tier"]
        }
        Update: {
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["access_tier"]
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          coaching_style: string | null
          created_at: string | null
          id: string
          life_stage: string | null
          onboarding_completed: boolean | null
          primary_goal: string | null
          selected_modules: string[] | null
        }
        Insert: {
          coaching_style?: string | null
          created_at?: string | null
          id: string
          life_stage?: string | null
          onboarding_completed?: boolean | null
          primary_goal?: string | null
          selected_modules?: string[] | null
        }
        Update: {
          coaching_style?: string | null
          created_at?: string | null
          id?: string
          life_stage?: string | null
          onboarding_completed?: boolean | null
          primary_goal?: string | null
          selected_modules?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_alert_state: {
        Row: {
          last_alert_at: string
          source: string
        }
        Insert: {
          last_alert_at?: string
          source: string
        }
        Update: {
          last_alert_at?: string
          source?: string
        }
        Relationships: []
      }
      webhook_failures: {
        Row: {
          context: Json
          created_at: string
          event_id: string | null
          event_type: string | null
          id: string
          message: string | null
          reason: string
          source: string
          stage: string
        }
        Insert: {
          context?: Json
          created_at?: string
          event_id?: string | null
          event_type?: string | null
          id?: string
          message?: string | null
          reason: string
          source: string
          stage: string
        }
        Update: {
          context?: Json
          created_at?: string
          event_id?: string | null
          event_type?: string | null
          id?: string
          message?: string | null
          reason?: string
          source?: string
          stage?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_audit_token: {
        Args: { p_token: string; p_user_id: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_audit_by_token: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          generated_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          intake: Json
          recommended_offer: string | null
          report: Json | null
          stripe_session_id: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "business_audits"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["access_tier"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      access_tier:
        | "free"
        | "subscriber"
        | "cohort"
        | "premium"
        | "corporate"
        | "rent_agent"
      app_role: "admin" | "moderator" | "user"
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
      access_tier: [
        "free",
        "subscriber",
        "cohort",
        "premium",
        "corporate",
        "rent_agent",
      ],
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
