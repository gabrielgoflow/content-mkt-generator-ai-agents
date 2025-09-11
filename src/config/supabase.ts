import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Debug: verificar configurações
console.log('🔧 Configurações do Supabase:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');

// Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
});

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          name: string;
          platform: string;
          prompt: string;
          is_active: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          platform: string;
          prompt: string;
          is_active?: boolean;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          platform?: string;
          prompt?: string;
          is_active?: boolean;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contents: {
        Row: {
          id: string;
          title: string;
          content: string;
          platform: string;
          format: string;
          status: string;
          user_id: string;
          agent_id: string | null;
          prompt_used: string | null;
          metadata: any;
          created_at: string;
          approved_at: string | null;
          scheduled_for: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          platform: string;
          format: string;
          status?: string;
          user_id: string;
          agent_id?: string | null;
          prompt_used?: string | null;
          metadata?: any;
          created_at?: string;
          approved_at?: string | null;
          scheduled_for?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          platform?: string;
          format?: string;
          status?: string;
          user_id?: string;
          agent_id?: string | null;
          prompt_used?: string | null;
          metadata?: any;
          created_at?: string;
          approved_at?: string | null;
          scheduled_for?: string | null;
        };
      };
      scheduled_posts: {
        Row: {
          id: string;
          content_id: string;
          platform: string;
          scheduled_for: string;
          status: string;
          user_id: string;
          created_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          content_id: string;
          platform: string;
          scheduled_for: string;
          status?: string;
          user_id: string;
          created_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          content_id?: string;
          platform?: string;
          scheduled_for?: string;
          status?: string;
          user_id?: string;
          created_at?: string;
          published_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          content_id: string;
          reviewer_id: string;
          status: string;
          feedback: string | null;
          coherence_score: number | null;
          review_type: string;
          brand_guidelines: string | null;
          target_audience: string | null;
          overall_coherence: number | null;
          summary: string | null;
          recommendations: any;
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          content_id: string;
          reviewer_id: string;
          status?: string;
          feedback?: string | null;
          coherence_score?: number | null;
          review_type: string;
          brand_guidelines?: string | null;
          target_audience?: string | null;
          overall_coherence?: number | null;
          summary?: string | null;
          recommendations?: any;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          content_id?: string;
          reviewer_id?: string;
          status?: string;
          feedback?: string | null;
          coherence_score?: number | null;
          review_type?: string;
          brand_guidelines?: string | null;
          target_audience?: string | null;
          overall_coherence?: number | null;
          summary?: string | null;
          recommendations?: any;
          created_at?: string;
          reviewed_at?: string | null;
        };
      };
      review_results: {
        Row: {
          id: string;
          review_id: string;
          content_id: string;
          coherence_score: number | null;
          issues: any;
          suggestions: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          content_id: string;
          coherence_score?: number | null;
          issues?: any;
          suggestions?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          content_id?: string;
          coherence_score?: number | null;
          issues?: any;
          suggestions?: any;
          created_at?: string;
        };
      };
      comparison_results: {
        Row: {
          id: string;
          review_id: string;
          content_id_1: string;
          content_id_2: string;
          coherence_similarity: number | null;
          similarities: any;
          differences: any;
          recommendations: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          content_id_1: string;
          content_id_2: string;
          coherence_similarity?: number | null;
          similarities?: any;
          differences?: any;
          recommendations?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          content_id_1?: string;
          content_id_2?: string;
          coherence_similarity?: number | null;
          similarities?: any;
          differences?: any;
          recommendations?: any;
          created_at?: string;
        };
      };
      carousel_images: {
        Row: {
          id: string;
          content_id: string;
          slide_number: number;
          image_url: string | null;
          description: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          slide_number: number;
          image_url?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          slide_number?: number;
          image_url?: string | null;
          description?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          auto_scheduling: boolean;
          peak_hours: any;
          notifications: any;
          brand_guidelines: string | null;
          target_audience: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          auto_scheduling?: boolean;
          peak_hours?: any;
          notifications?: any;
          brand_guidelines?: string | null;
          target_audience?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          auto_scheduling?: boolean;
          peak_hours?: any;
          notifications?: any;
          brand_guidelines?: string | null;
          target_audience?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Funções auxiliares para autenticação
export const auth = {
  // Fazer login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Registrar usuário
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { data, error };
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Obter sessão atual
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Funções auxiliares para o banco de dados
export const db = {
  // Conteúdos
  contents: {
    async getAll() {
      console.log('supabase.ts - Buscando TODOS os conteúdos (sem filtro de usuário)');
      
      try {
        console.log('supabase.ts - Executando consulta...');
        
        // Adicionar timeout para evitar travamento
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout na consulta')), 3000); // 10 segundos
        });
        
        const queryPromise = supabase
          .from('contents')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        console.log('supabase.ts - Consulta concluída!');
        console.log('supabase.ts - Dados retornados:', data);
        console.log('supabase.ts - Erro retornado:', error);
        
        return { data, error };
      } catch (err) {
        console.error('supabase.ts - Erro na consulta:', err);
        return { data: null, error: err };
      }
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(content: Database['public']['Tables']['contents']['Insert']) {
      const { data, error } = await supabase
        .from('contents')
        .insert(content)
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Database['public']['Tables']['contents']['Update']) {
      const { data, error } = await supabase
        .from('contents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Agentes
  agents: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getByPlatform(userId: string, platform: string) {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .eq('is_active', true)
        .single();
      return { data, error };
    },

    async create(agent: Database['public']['Tables']['agents']['Insert']) {
      const { data, error } = await supabase
        .from('agents')
        .insert(agent)
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Database['public']['Tables']['agents']['Update']) {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // Posts agendados
  scheduledPosts: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          contents (
            id,
            title,
            content,
            platform,
            format,
            status
          )
        `)
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });
      return { data, error };
    },

    async create(post: Database['public']['Tables']['scheduled_posts']['Insert']) {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(post)
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Database['public']['Tables']['scheduled_posts']['Update']) {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // Revisões
  reviews: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          contents (
            id,
            title,
            content,
            platform,
            format
          )
        `)
        .eq('reviewer_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async create(review: Database['public']['Tables']['reviews']['Insert']) {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Database['public']['Tables']['reviews']['Update']) {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // Imagens de carrossel
  carouselImages: {
    async getByContentId(contentId: string) {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('content_id', contentId)
        .order('slide_number', { ascending: true });
      return { data, error };
    },

    async create(image: Database['public']['Tables']['carousel_images']['Insert']) {
      const { data, error } = await supabase
        .from('carousel_images')
        .insert(image)
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Database['public']['Tables']['carousel_images']['Update']) {
      const { data, error } = await supabase
        .from('carousel_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // Usuários
  users: {
    async get(userId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    async getByEmail(email: string) {
      console.log('supabase.ts - getByEmail chamado com email:', email);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      console.log('supabase.ts - getByEmail resultado:', { data, error });
      return { data, error };
    },

    async create(user: Database['public']['Tables']['users']['Insert']) {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      return { data, error };
    },

    async update(userId: string, updates: Database['public']['Tables']['users']['Update']) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  },

  // Configurações do usuário
  userSettings: {
    async get(userId: string) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Usa maybeSingle() em vez de single() para evitar erro quando não há dados
      return { data, error };
    },

    async create(settings: Database['public']['Tables']['user_settings']['Insert']) {
      const { data, error } = await supabase
        .from('user_settings')
        .insert(settings)
        .select()
        .single();
      return { data, error };
    },

    async update(userId: string, updates: Database['public']['Tables']['user_settings']['Update']) {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .maybeSingle(); // Usa maybeSingle() em vez de single()
      return { data, error };
    }
  }
};

export default supabase;
