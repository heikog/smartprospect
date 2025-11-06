export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          credits: number;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          credits?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      credit_ledger: {
        Row: {
          id: number;
          profile_id: string;
          change: number;
          reason: string;
          meta: Json;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          profile_id: string;
          change: number;
          reason: string;
          meta?: Json;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['credit_ledger']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          service_pdf_path: string;
          total_prospects: number;
          status: Database['public']['Enums']['campaign_status'];
          credit_cost: number;
          last_error: string | null;
          summary: Json | null;
          approved_at: string | null;
          dispatched_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          service_pdf_path: string;
          total_prospects?: number;
          status?: Database['public']['Enums']['campaign_status'];
          credit_cost?: number;
          last_error?: string | null;
          summary?: Json | null;
          approved_at?: string | null;
          dispatched_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
      };
      prospects: {
        Row: {
          id: string;
          campaign_id: string;
          ordinal: number;
          url: string;
          anrede: string;
          vorname: string;
          nachname: string;
          strasse: string;
          hausnummer: string;
          plz: string;
          stadt: string;
          asset_status: Database['public']['Enums']['prospect_status'];
          asset_paths: Json;
          avatar_embed_url: string | null;
          presentation_embed_url: string | null;
          landing_slug: string | null;
          landing_page_path: string | null;
          pdf_path: string | null;
          qr_url: string | null;
          email_capture_status: string;
          generated_at: string | null;
          reviewed_at: string | null;
          dispatched_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          ordinal?: number;
          url: string;
          anrede: string;
          vorname: string;
          nachname: string;
          strasse: string;
          hausnummer: string;
          plz: string;
          stadt: string;
          asset_status?: Database['public']['Enums']['prospect_status'];
          asset_paths?: Json;
          avatar_embed_url?: string | null;
          presentation_embed_url?: string | null;
          landing_slug?: string | null;
          landing_page_path?: string | null;
          pdf_path?: string | null;
          qr_url?: string | null;
          email_capture_status?: string;
          generated_at?: string | null;
          reviewed_at?: string | null;
          dispatched_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['prospects']['Insert']>;
      };
      campaign_events: {
        Row: {
          id: number;
          campaign_id: string;
          profile_id: string | null;
          event_type: string;
          message: string | null;
          payload: Json | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          campaign_id: string;
          profile_id?: string | null;
          event_type: string;
          message?: string | null;
          payload?: Json | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['campaign_events']['Insert']>;
      };
    };
    Functions: {
      deduct_campaign_credits: {
        Args: {
          p_profile_id: string;
          p_campaign_id: string;
          p_total_cost: number;
          p_reason?: string;
          p_meta?: Json;
        };
        Returns: void;
      };
      refund_campaign: {
        Args: {
          p_profile_id: string;
          p_campaign_id: string;
          p_total_refund: number;
          p_reason?: string;
          p_meta?: Json;
        };
        Returns: void;
      };
      create_campaign_with_cost: {
        Args: {
          p_owner_id: string;
          p_name: string;
          p_service_pdf_path: string;
          p_total_prospects: number;
        };
        Returns: Database['public']['Tables']['campaigns']['Row'];
      };
    };
    Enums: {
      campaign_status:
        | 'created'
        | 'generating'
        | 'generation_failed'
        | 'generated'
        | 'ready_for_review'
        | 'approved'
        | 'ready_for_dispatch'
        | 'dispatched'
        | 'dispatch_failed';
      prospect_status: 'creating' | 'ready' | 'error';
    };
  };
}
