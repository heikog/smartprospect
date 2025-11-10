export type CampaignStatus = 'draft' | 'generating' | 'review' | 'approved' | 'sent';

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
          id: string;
          email: string | null;
          full_name: string | null;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: CampaignStatus;
          excel_path: string;
          pdf_path: string;
          n8n_job_id: string | null;
          prospect_count: number;
          credits_spent: number;
          progress: number;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          status?: CampaignStatus;
          excel_path: string;
          pdf_path: string;
          n8n_job_id?: string | null;
          prospect_count?: number;
          credits_spent?: number;
          progress?: number;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          status?: CampaignStatus;
          excel_path?: string;
          pdf_path?: string;
          n8n_job_id?: string | null;
          prospect_count?: number;
          credits_spent?: number;
          progress?: number;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      prospects: {
        Row: {
          id: string;
          campaign_id: string;
          company_name: string | null;
          contact: Json;
          status: string;
          landing_page_url: string | null;
          video_url: string | null;
          audio_url: string | null;
          presentation_url: string | null;
          flyer_url: string | null;
          assets: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          company_name?: string | null;
          contact?: Json;
          status?: string;
          landing_page_url?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          presentation_url?: string | null;
          flyer_url?: string | null;
          assets?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          company_name?: string | null;
          contact?: Json;
          status?: string;
          landing_page_url?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          presentation_url?: string | null;
          flyer_url?: string | null;
          assets?: Json;
          created_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string | null;
          type: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          campaign_id?: string | null;
          type: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          campaign_id?: string | null;
          type?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      spend_credits: {
        Args: { p_amount: number };
        Returns: void;
      };
      add_credits_to_user: {
        Args: { p_user: string; p_amount: number };
        Returns: void;
      };
      deduct_credits_from_user: {
        Args: { p_user: string; p_amount: number };
        Returns: void;
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type Prospect = Database['public']['Tables']['prospects']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
