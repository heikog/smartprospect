export type CampaignStatus = "in_erstllg" | "bereit_zur_pruefung" | "geprueft" | "versandt";
export type CreditReason = "signup_bonus" | "purchase" | "generation_debit" | "manual_adjustment" | "refund";
export type JobKind = "generation" | "send";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string | null;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey",
            columns: ["user_id"],
            referencedRelation: "users",
            referencedColumns: ["id"],
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: CampaignStatus;
          row_count: number;
          source_excel_path: string;
          service_pdf_path: string;
          debit_event_id: number | null;
          generation_job_id: string | null;
          send_job_id: string | null;
          last_status_change: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          status?: CampaignStatus;
          row_count: number;
          source_excel_path: string;
          service_pdf_path: string;
          debit_event_id?: number | null;
          generation_job_id?: string | null;
          send_job_id?: string | null;
          last_status_change?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey",
            columns: ["user_id"],
            referencedRelation: "profiles",
            referencedColumns: ["user_id"],
          },
          {
            foreignKeyName: "campaigns_debit_event_id_fkey",
            columns: ["debit_event_id"],
            referencedRelation: "credit_events",
            referencedColumns: ["id"],
          },
        ];
      };
      campaign_prospects: {
        Row: {
          id: string;
          campaign_id: string;
          row_index: number;
          company_url: string;
          anrede: string;
          vorname: string;
          nachname: string;
          strasse: string;
          hausnummer: string;
          plz: string;
          ort: string;
          qr_code_path: string | null;
          flyer_pdf_path: string | null;
          landingpage_path: string | null;
          slides_url: string | null;
          video_url: string | null;
          error_log: Json | null;
          is_valid: boolean;
          tracking_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          row_index: number;
          company_url: string;
          anrede: string;
          vorname: string;
          nachname: string;
          strasse: string;
          hausnummer: string;
          plz: string;
          ort: string;
          qr_code_path?: string | null;
          flyer_pdf_path?: string | null;
          landingpage_path?: string | null;
          slides_url?: string | null;
          video_url?: string | null;
          error_log?: Json | null;
          is_valid?: boolean;
          tracking_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaign_prospects"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "campaign_prospects_campaign_id_fkey",
            columns: ["campaign_id"],
            referencedRelation: "campaigns",
            referencedColumns: ["id"],
          },
        ];
      };
      credit_events: {
        Row: {
          id: number;
          user_id: string;
          reason: CreditReason;
          delta: number;
          reference_type: string | null;
          reference_id: string | null;
          notes: string | null;
          metadata: Json | null;
          stripe_event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          reason: CreditReason;
          delta: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          stripe_event_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "credit_events_user_id_fkey",
            columns: ["user_id"],
            referencedRelation: "profiles",
            referencedColumns: ["user_id"],
          },
        ];
      };
      n8n_job_runs: {
        Row: {
          id: number;
          campaign_id: string;
          kind: JobKind;
          external_run_id: string | null;
          request_payload: Json | null;
          response_payload: Json | null;
          status: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: number;
          campaign_id: string;
          kind: JobKind;
          external_run_id?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["n8n_job_runs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "n8n_job_runs_campaign_id_fkey",
            columns: ["campaign_id"],
            referencedRelation: "campaigns",
            referencedColumns: ["id"],
          },
        ];
      };
      stripe_webhook_events: {
        Row: {
          id: number;
          stripe_event_id: string;
          type: string;
          livemode: boolean | null;
          raw_payload: Json;
          received_at: string;
          processed_at: string | null;
          error: string | null;
        };
        Insert: {
          id?: number;
          stripe_event_id: string;
          type: string;
          livemode?: boolean | null;
          raw_payload: Json;
          received_at?: string;
          processed_at?: string | null;
          error?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["stripe_webhook_events"]["Insert"]>;
        Relationships: [];
      };
      stripe_checkout_sessions: {
        Row: {
          id: string;
          user_id: string;
          stripe_session_id: string;
          stripe_customer_id: string | null;
          stripe_price_id: string;
          credit_quantity: number;
          status: "open" | "complete" | "expired" | "async_payment_pending" | "async_payment_failed";
          raw_session: Json | null;
          completed_at: string | null;
          credit_event_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_session_id: string;
          stripe_customer_id?: string | null;
          stripe_price_id: string;
          credit_quantity: number;
          status?: "open" | "complete" | "expired" | "async_payment_pending" | "async_payment_failed";
          raw_session?: Json | null;
          completed_at?: string | null;
          credit_event_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stripe_checkout_sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "stripe_checkout_sessions_user_id_fkey",
            columns: ["user_id"],
            referencedRelation: "profiles",
            referencedColumns: ["user_id"],
          },
          {
            foreignKeyName: "stripe_checkout_sessions_credit_event_id_fkey",
            columns: ["credit_event_id"],
            referencedRelation: "credit_events",
            referencedColumns: ["id"],
          },
        ];
      };
    };
    Views: {
      user_credit_balances: {
        Row: {
          user_id: string;
          credits: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      apply_checkout_credit: {
        Args: {
          p_user_id: string;
          p_stripe_session_id: string;
          p_stripe_price_id: string;
          p_credit_quantity: number;
          p_stripe_event_id: string;
          p_raw_session?: Json | null;
        };
        Returns: number;
      };
    };
    Enums: {
      campaign_status: CampaignStatus;
      credit_reason: CreditReason;
      job_kind: JobKind;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
