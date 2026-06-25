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
      agent_orders: {
        Row: {
          agent_count: number
          agent_tier: string
          agent_type: string
          created_at: string
          guest_email: string | null
          id: string
          intake: Json | null
          knowledge_base: string | null
          notes: string | null
          ownership_pref: string | null
          quoted_price_cents: number | null
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_count?: number
          agent_tier: string
          agent_type: string
          created_at?: string
          guest_email?: string | null
          id?: string
          intake?: Json | null
          knowledge_base?: string | null
          notes?: string | null
          ownership_pref?: string | null
          quoted_price_cents?: number | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_count?: number
          agent_tier?: string
          agent_type?: string
          created_at?: string
          guest_email?: string | null
          id?: string
          intake?: Json | null
          knowledge_base?: string | null
          notes?: string | null
          ownership_pref?: string | null
          quoted_price_cents?: number | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      autism_orders: {
        Row: {
          addons: Json
          addons_total: number
          admin_notes: string | null
          child_age: string | null
          child_first_name: string | null
          child_interests: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          delivered_at: string | null
          download_url: string | null
          gift_note: string | null
          gift_recipient: string | null
          gift_wrap: boolean
          id: string
          order_total: number
          package_name: string
          package_price: number
          package_slug: string
          provider_email: string | null
          provider_name: string | null
          scenario_focus: string
          special_requirements: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          use_case: string
          user_id: string | null
        }
        Insert: {
          addons?: Json
          addons_total?: number
          admin_notes?: string | null
          child_age?: string | null
          child_first_name?: string | null
          child_interests?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          delivered_at?: string | null
          download_url?: string | null
          gift_note?: string | null
          gift_recipient?: string | null
          gift_wrap?: boolean
          id?: string
          order_total: number
          package_name: string
          package_price: number
          package_slug: string
          provider_email?: string | null
          provider_name?: string | null
          scenario_focus: string
          special_requirements?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          use_case: string
          user_id?: string | null
        }
        Update: {
          addons?: Json
          addons_total?: number
          admin_notes?: string | null
          child_age?: string | null
          child_first_name?: string | null
          child_interests?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          delivered_at?: string | null
          download_url?: string | null
          gift_note?: string | null
          gift_recipient?: string | null
          gift_wrap?: boolean
          id?: string
          order_total?: number
          package_name?: string
          package_price?: number
          package_slug?: string
          provider_email?: string | null
          provider_name?: string | null
          scenario_focus?: string
          special_requirements?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          use_case?: string
          user_id?: string | null
        }
        Relationships: []
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
      build_inquiries: {
        Row: {
          budget_range: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          project_type: string
          source: string | null
          status: string
          stripe_session_id: string | null
          tier: string
          timeline: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          project_type: string
          source?: string | null
          status?: string
          stripe_session_id?: string | null
          tier: string
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          project_type?: string
          source?: string | null
          status?: string
          stripe_session_id?: string | null
          tier?: string
          timeline?: string | null
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
      newsletter_issues: {
        Row: {
          approval_token_hash: string | null
          created_at: string
          failed_count: number
          id: string
          issue_number: number
          play_section: string
          preview_text: string | null
          scam_alert_id: string | null
          scam_section: string
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          suppressed_count: number
          token_expires_at: string | null
          truth_section: string
          updated_at: string
        }
        Insert: {
          approval_token_hash?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          issue_number: number
          play_section: string
          preview_text?: string | null
          scam_alert_id?: string | null
          scam_section: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          suppressed_count?: number
          token_expires_at?: string | null
          truth_section: string
          updated_at?: string
        }
        Update: {
          approval_token_hash?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          issue_number?: number
          play_section?: string
          preview_text?: string | null
          scam_alert_id?: string | null
          scam_section?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          suppressed_count?: number
          token_expires_at?: string | null
          truth_section?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_issues_scam_alert_id_fkey"
            columns: ["scam_alert_id"]
            isOneToOne: false
            referencedRelation: "scam_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          beehiiv_subscription_id: string | null
          created_at: string
          email: string
          id: string
          metadata: Json
          name: string | null
          source: string | null
          synced_to_beehiiv: boolean
          updated_at: string
        }
        Insert: {
          beehiiv_subscription_id?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json
          name?: string | null
          source?: string | null
          synced_to_beehiiv?: boolean
          updated_at?: string
        }
        Update: {
          beehiiv_subscription_id?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json
          name?: string | null
          source?: string | null
          synced_to_beehiiv?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      one_time_orders: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          intake: Json | null
          order_type: string
          price_cents: number
          product_id: string
          product_name: string
          product_type: string
          status: string
          stripe_session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          intake?: Json | null
          order_type?: string
          price_cents?: number
          product_id: string
          product_name: string
          product_type?: string
          status?: string
          stripe_session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          intake?: Json | null
          order_type?: string
          price_cents?: number
          product_id?: string
          product_name?: string
          product_type?: string
          status?: string
          stripe_session_id?: string
          updated_at?: string
          user_id?: string | null
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
      scam_alerts: {
        Row: {
          action_rules: Json
          body: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          source_url: string | null
          summary: string
          threat_level: Database["public"]["Enums"]["scam_threat_level"]
          title: string
          updated_at: string
          used_in_issue_id: string | null
        }
        Insert: {
          action_rules?: Json
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          source_url?: string | null
          summary: string
          threat_level?: Database["public"]["Enums"]["scam_threat_level"]
          title: string
          updated_at?: string
          used_in_issue_id?: string | null
        }
        Update: {
          action_rules?: Json
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          source_url?: string | null
          summary?: string
          threat_level?: Database["public"]["Enums"]["scam_threat_level"]
          title?: string
          updated_at?: string
          used_in_issue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scam_alerts_used_in_issue_id_fkey"
            columns: ["used_in_issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      access_tier:
        | "free"
        | "subscriber"
        | "cohort"
        | "premium"
        | "corporate"
        | "rent_agent"
        | "reset_30"
        | "transformation_90"
      app_role: "admin" | "moderator" | "user"
      scam_threat_level: "red_flag" | "caution" | "watch" | "resolved"
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
        "reset_30",
        "transformation_90",
      ],
      app_role: ["admin", "moderator", "user"],
      scam_threat_level: ["red_flag", "caution", "watch", "resolved"],
    },
  },
} as const
