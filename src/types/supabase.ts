export interface Database {
  public: {
    Tables: {
      candidatos: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string;
          linkedin_url: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone: string;
          linkedin_url?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string;
          linkedin_url?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
}