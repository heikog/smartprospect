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
          error_log?: Json | null;
          is_valid?: boolean;
          tracking_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          row_index?: number;
          company_url?: string;
          anrede?: string;
          vorname?: string;
          nachname?: string;
          strasse?: string;
          hausnummer?: string;
          plz?: string;
          ort?: string;
          qr_code_path?: string | null;
          flyer_pdf_path?: string | null;
          landingpage_path?: string | null;
          error_log?: Json | null;
          is_valid?: boolean;
          tracking_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: Database["public"]["Enums"]["campaign_status"];
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
          status?: Database["public"]["Enums"]["campaign_status"];
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
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          status?: Database["public"]["Enums"]["campaign_status"];
          row_count?: number;
          source_excel_path?: string;
          service_pdf_path?: string;
          debit_event_id?: number | null;
          generation_job_id?: string | null;
          send_job_id?: string | null;
          last_status_change?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      credit_events: {
        Row: {
          id: number;
          user_id: string;
          reason: Database["public"]["Enums"]["credit_reason"];
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
          reason: Database["public"]["Enums"]["credit_reason"];
          delta: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          stripe_event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          reason?: Database["public"]["Enums"]["credit_reason"];
          delta?: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          stripe_event_id?: string | null;
          created_at?: string;
        };
      };
      n8n_job_runs: {
        Row: {
          id: number;
          campaign_id: string;
          kind: Database["public"]["Enums"]["job_kind"];
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
          kind: Database["public"]["Enums"]["job_kind"];
          external_run_id?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: number;
          campaign_id?: string;
          kind?: Database["public"]["Enums"]["job_kind"];
          external_run_id?: string | null;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
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
        Update: {
          user_id?: string;
          email?: string | null;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
        Update: {
          id?: string;
          user_id?: string;
          stripe_session_id?: string;
          stripe_customer_id?: string | null;
          stripe_price_id?: string;
          credit_quantity?: number;
          status?: "open" | "complete" | "expired" | "async_payment_pending" | "async_payment_failed";
          raw_session?: Json | null;
          completed_at?: string | null;
          credit_event_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
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
        Update: {
          id?: number;
          stripe_event_id?: string;
          type?: string;
          livemode?: boolean | null;
          raw_payload?: Json;
          received_at?: string;
          processed_at?: string | null;
          error?: string | null;
        };
      };
    };
    Views: {
      user_credit_balances: {
        Row: {
          user_id: string;
          credits: number;
        };
        Insert: never;
        Update: never;
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
      campaign_status: "in_erstllg" | "bereit_zur_pruefung" | "geprueft" | "versandt";
      credit_reason: "signup_bonus" | "purchase" | "generation_debit" | "manual_adjustment" | "refund";
      job_kind: "generation" | "send";
    };
  };
};
