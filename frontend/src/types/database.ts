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
      campaigns: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          service_pdf_path: string;
          total_prospects: number;
          status:
            | 'created'
            | 'generating'
            | 'generation_failed'
            | 'generated'
            | 'ready_for_review'
            | 'approved'
            | 'ready_for_dispatch'
            | 'dispatched'
            | 'dispatch_failed';
          last_error: string | null;
          summary: Json | null;
          approved_at: string | null;
          dispatched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          service_pdf_path: string;
          total_prospects?: number;
          status?: Database['public']['Tables']['campaigns']['Row']['status'];
          last_error?: string | null;
          summary?: Json | null;
          approved_at?: string | null;
          dispatched_at?: string | null;
          created_at?: string;
          updated_at?: string;
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
          asset_status: 'creating' | 'ready' | 'error';
          asset_paths: Json;
          landing_slug: string | null;
          landing_page_path: string | null;
          pdf_path: string | null;
          generated_at: string | null;
          reviewed_at: string | null;
          dispatched_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
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
          asset_status?: 'creating' | 'ready' | 'error';
          asset_paths?: Json;
          landing_slug?: string | null;
          landing_page_path?: string | null;
          pdf_path?: string | null;
          generated_at?: string | null;
          reviewed_at?: string | null;
          dispatched_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['prospects']['Insert']>;
      };
    };
  };
}

