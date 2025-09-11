import { db, auth } from '@/config/supabase';
import { 
  Content, 
  Agent, 
  ScheduledPost, 
  CarouselImage,
  UserSettings,
  DatabaseResponse
} from '@/types';


// Serviço principal para operações de banco de dados
export class DatabaseService {
  // ===== UTILITÁRIOS =====
  static async findUserByEmail(email: string): Promise<{ data: any; error: any }> {
    try {
      console.log('Buscando usuário por email:', email);
      const { data, error } = await db.users.getByEmail(email);
      console.log('Resultado da busca por email:', { data: error ? null : data, error });
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return { data: null, error };
    }
  }

  private static async ensureUserExists(authUser: any, name?: string): Promise<{ data: any; error: any }> {
    try {
      console.log('Verificando se usuário existe na tabela users:', authUser.id);
      
      // Tentar buscar por email primeiro
      const { data: existingUser, error: emailError } = await this.findUserByEmail(authUser.email);
      
      if (existingUser && !emailError) {
        console.log('Usuário encontrado na tabela users:', existingUser.id);
        return { data: existingUser, error: null };
      }

      // Se não encontrou por email, tentar por ID
      const { data: existingUserById, error: userError } = await db.users.get(authUser.id);
      
      if (existingUserById && !userError) {
        console.log('Usuário encontrado na tabela users por ID:', existingUserById.id);
        return { data: existingUserById, error: null };
      }

      // Se não encontrou, criar novo usuário
      if ((userError && userError.code === 'PGRST116') || (emailError && emailError.code === 'PGRST116')) {
        console.log('Criando novo usuário na tabela users...');
        
        const newUser = {
          id: authUser.id,
          email: authUser.email,
          name: name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
          avatar_url: authUser.user_metadata?.avatar_url || null
        };

        const { data: createdUser, error: createError } = await db.users.create(newUser);
        
        if (createError) {
          console.error('Erro ao criar usuário:', createError);
          return { data: null, error: createError };
        }

        console.log('Usuário criado com sucesso:', createdUser.id);
        return { data: createdUser, error: null };
      }

      // Se houve outro tipo de erro
      console.error('Erro ao verificar usuário:', userError || emailError);
      return { data: null, error: userError || emailError };
    } catch (error) {
      console.error('Erro ao verificar/criar usuário:', error);
      return { data: null, error: new Error('Erro ao verificar/criar usuário') };
    }
  }
  // ===== AUTENTICAÇÃO =====
  static async signIn(email: string, password: string) {
    try {
      console.log('Fazendo login:', email);
      
      // Fazer login no Supabase Auth
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('Erro no login:', error);
        return { data: null, error };
      }

      if (data?.user) {
        console.log('Login bem-sucedido no Auth, verificando usuário na tabela users');
        
        // Verificar se usuário existe na tabela users
        const { data: userData, error: userError } = await this.ensureUserExists(data.user);
        
        if (userError) {
          console.error('Erro ao verificar/criar usuário:', userError);
          return { data: null, error: userError };
        }

        console.log('Usuário verificado/criado com sucesso:', userData.id);
        return { data: { ...data, user: userData }, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado no signIn:', error);
      return { data: null, error };
    }
  }

  static async signUp(email: string, password: string, name: string) {
    try {
      console.log('Criando conta:', email);
      
      // Criar usuário no Supabase Auth
      const { data, error } = await auth.signUp(email, password, name);
      
      if (error) {
        console.error('Erro ao criar conta:', error);
        return { data: null, error };
      }

      if (data?.user) {
        console.log('Conta criada no Auth, verificando usuário na tabela users');
        
        // Verificar se usuário existe na tabela users
        const { data: userData, error: userError } = await this.ensureUserExists(data.user, name);
        
        if (userError) {
          console.error('Erro ao verificar/criar usuário:', userError);
          return { data: null, error: userError };
        }

        console.log('Usuário verificado/criado com sucesso:', userData.id);
        return { data: { ...data, user: userData }, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado no signUp:', error);
      return { data: null, error };
    }
  }

  static async signOut() {
    return await auth.signOut();
  }

  static async getCurrentUser() {
    return await auth.getCurrentUser();
  }

  static async getCurrentSession() {
    return await auth.getCurrentSession();
  }

  // ===== CONTEÚDOS =====
  static async getContents(): Promise<DatabaseResponse<Content[]>> {
    try {
      console.log('DatabaseService.getContents() - Iniciando busca...');
      console.log('Buscando TODOS os conteúdos (sem filtro de usuário)');
      const { data, error } = await db.contents.getAll();
      
      console.log('DatabaseService.getContents() - Dados brutos do Supabase:', data);
      console.log('DatabaseService.getContents() - Erro do Supabase:', error);
      
      if (error) {
        console.error('Erro ao buscar conteúdos:', error);
        return { data: null, error };
      }
      
      if (!data) {
        console.log('Nenhum conteúdo encontrado');
        return { data: [], error: null };
      }

      // Converter dados do Supabase para o formato da aplicação
      const contents: Content[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        platform: item.platform as any,
        format: item.format as any,
        status: item.status as any,
        createdAt: new Date(item.created_at),
        approvedAt: item.approved_at ? new Date(item.approved_at) : undefined,
        scheduledFor: item.scheduled_for ? new Date(item.scheduled_for) : undefined,
        agentId: item.agent_id || '',
        prompt: item.prompt_used || undefined,
        metadata: item.metadata,
        // Campos do Supabase
        user_id: item.user_id,
        agent_id: item.agent_id,
        prompt_used: item.prompt_used,
        created_at: item.created_at,
        approved_at: item.approved_at,
        scheduled_for: item.scheduled_for
      }));

      console.log('DatabaseService.getContents() - Conteúdos carregados:', contents.length);
      console.log('DatabaseService.getContents() - Retornando:', { data: contents, error: null });
      return { data: contents, error: null };
    } catch (error) {
      console.error('DatabaseService.getContents() - Erro inesperado:', error);
      return { data: null, error };
    }
  }

  static async getContentById(id: string): Promise<DatabaseResponse<Content>> {
    try {
      const { data, error } = await db.contents.getById(id);
      
      if (error) {
        console.error('Erro ao buscar conteúdo:', error);
        return { data: null, error };
      }

      if (!data) {
        return { data: null, error: 'Conteúdo não encontrado' };
      }

      const content: Content = {
        id: data.id,
        title: data.title,
        content: data.content,
        platform: data.platform as any,
        format: data.format as any,
        status: data.status as any,
        createdAt: new Date(data.created_at),
        approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        agentId: data.agent_id || '',
        prompt: data.prompt_used || undefined,
        metadata: data.metadata,
        // Campos do Supabase
        user_id: data.user_id,
        agent_id: data.agent_id,
        prompt_used: data.prompt_used,
        created_at: data.created_at,
        approved_at: data.approved_at,
        scheduled_for: data.scheduled_for
      };

      return { data: content, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar conteúdo:', error);
      return { data: null, error };
    }
  }

  static async createContent(content: Omit<Content, 'id' | 'createdAt'>): Promise<DatabaseResponse<Content>> {
    try {
      console.log('Criando conteúdo:', content.title);
      
      const { user } = await auth.getCurrentUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Garantir que o usuário existe na tabela users
      const { data: userData, error: userError } = await this.ensureUserExists(user);
      if (userError || !userData) {
        console.error('Erro ao verificar/criar usuário:', userError);
        return { data: null, error: 'Erro ao verificar usuário' };
      }
      
      console.log('Usuário verificado:', userData.id);

      const contentData = {
        title: content.title,
        content: content.content,
        platform: content.platform,
        format: content.format,
        status: content.status,
        user_id: userData.id,
        agent_id: content.agentId,
        prompt_used: content.prompt,
        metadata: content.metadata || {},
        approved_at: content.approvedAt?.toISOString() || null,
        scheduled_for: content.scheduledFor?.toISOString() || null
      };

      const { data, error } = await db.contents.create(contentData);
      
      if (error) {
        console.error('Erro ao criar conteúdo:', error);
        return { data: null, error };
      }
      
      console.log('Conteúdo criado com sucesso:', data.id);

      const newContent: Content = {
        id: data.id,
        title: data.title,
        content: data.content,
        platform: data.platform as any,
        format: data.format as any,
        status: data.status as any,
        createdAt: new Date(data.created_at),
        approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        agentId: data.agent_id || '',
        prompt: data.prompt_used || undefined,
        metadata: data.metadata,
        // Campos do Supabase
        user_id: data.user_id,
        agent_id: data.agent_id,
        prompt_used: data.prompt_used,
        created_at: data.created_at,
        approved_at: data.approved_at,
        scheduled_for: data.scheduled_for
      };

      return { data: newContent, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar conteúdo:', error);
      return { data: null, error };
    }
  }

  static async updateContent(id: string, updates: Partial<Content>): Promise<DatabaseResponse<Content>> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.status) updateData.status = updates.status;
      if (updates.approvedAt) updateData.approved_at = updates.approvedAt.toISOString();
      if (updates.scheduledFor) updateData.scheduled_for = updates.scheduledFor.toISOString();
      if (updates.metadata) updateData.metadata = updates.metadata;

      const { data, error } = await db.contents.update(id, updateData);
      
      if (error) {
        console.error('Erro ao atualizar conteúdo:', error);
        return { data: null, error };
      }

      const updatedContent: Content = {
        id: data.id,
        title: data.title,
        content: data.content,
        platform: data.platform as any,
        format: data.format as any,
        status: data.status as any,
        createdAt: new Date(data.created_at),
        approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
        agentId: data.agent_id || '',
        prompt: data.prompt_used || undefined,
        metadata: data.metadata,
        // Campos do Supabase
        user_id: data.user_id,
        agent_id: data.agent_id,
        prompt_used: data.prompt_used,
        created_at: data.created_at,
        approved_at: data.approved_at,
        scheduled_for: data.scheduled_for
      };

      return { data: updatedContent, error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar conteúdo:', error);
      return { data: null, error };
    }
  }

  static async deleteContent(id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await db.contents.delete(id);
      
      if (error) {
        console.error('Erro ao deletar conteúdo:', error);
        return { data: null, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro inesperado ao deletar conteúdo:', error);
      return { data: null, error };
    }
  }

  // ===== AGENTES =====
  static async getAgents(userId: string): Promise<DatabaseResponse<Agent[]>> {
    try {
      const { data, error } = await db.agents.getAll(userId);
      
      if (error) {
        console.error('Erro ao buscar agentes:', error);
        return { data: null, error };
      }

      const agents: Agent[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        platform: item.platform as any,
        prompt: item.prompt,
        isActive: item.is_active,
        createdAt: new Date(item.created_at),
        // Campos do Supabase
        user_id: item.user_id,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      return { data: agents, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar agentes:', error);
      return { data: null, error };
    }
  }

  static async getAgentByPlatform(userId: string, platform: string): Promise<DatabaseResponse<Agent>> {
    try {
      const { data, error } = await db.agents.getByPlatform(userId, platform);
      
      if (error) {
        console.error('Erro ao buscar agente:', error);
        return { data: null, error };
      }

      if (!data) {
        return { data: null, error: 'Agente não encontrado' };
      }

      const agent: Agent = {
        id: data.id,
        name: data.name,
        platform: data.platform as any,
        prompt: data.prompt,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        // Campos do Supabase
        user_id: data.user_id,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { data: agent, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar agente:', error);
      return { data: null, error };
    }
  }

  static async createAgent(agent: Omit<Agent, 'id' | 'createdAt'>): Promise<DatabaseResponse<Agent>> {
    try {
      const { user } = await auth.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Garantir que o usuário existe na tabela users
      const { data: userData, error: userError } = await this.ensureUserExists(user);
      if (userError || !userData) {
        console.error('Erro ao verificar/criar usuário:', userError);
        return { data: null, error: 'Erro ao verificar usuário' };
      }

      const agentData = {
        name: agent.name,
        platform: agent.platform,
        prompt: agent.prompt,
        is_active: agent.isActive,
        user_id: userData.id // Usar o ID da tabela users, não do Auth
      };

      const { data, error } = await db.agents.create(agentData);
      
      if (error) {
        console.error('Erro ao criar agente:', error);
        return { data: null, error };
      }

      const newAgent: Agent = {
        id: data.id,
        name: data.name,
        platform: data.platform as any,
        prompt: data.prompt,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        // Campos do Supabase
        user_id: data.user_id,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { data: newAgent, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar agente:', error);
      return { data: null, error };
    }
  }

  // ===== POSTS AGENDADOS =====
  static async getScheduledPosts(userId: string): Promise<DatabaseResponse<ScheduledPost[]>> {
    try {
      const { data, error } = await db.scheduledPosts.getAll(userId);
      
      if (error) {
        console.error('Erro ao buscar posts agendados:', error);
        return { data: null, error };
      }

      const scheduledPosts: ScheduledPost[] = data?.map(item => ({
        id: item.id,
        contentId: item.content_id,
        platform: item.platform as any,
        scheduledFor: new Date(item.scheduled_for),
        status: item.status as any,
        createdAt: new Date(item.created_at),
        // Campos do Supabase
        content_id: item.content_id,
        scheduled_for: item.scheduled_for,
        user_id: item.user_id,
        created_at: item.created_at,
        published_at: item.published_at
      })) || [];

      return { data: scheduledPosts, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar posts agendados:', error);
      return { data: null, error };
    }
  }

  static async createScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt'>): Promise<DatabaseResponse<ScheduledPost>> {
    try {
      const { user } = await auth.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Garantir que o usuário existe na tabela users
      const { data: userData, error: userError } = await this.ensureUserExists(user);
      if (userError || !userData) {
        console.error('Erro ao verificar/criar usuário:', userError);
        return { data: null, error: 'Erro ao verificar usuário' };
      }

      const postData = {
        content_id: post.contentId,
        platform: post.platform,
        scheduled_for: post.scheduledFor.toISOString(),
        status: post.status,
        user_id: userData.id, // Usar o ID da tabela users, não do Auth
        published_at: post.status === 'published' ? new Date().toISOString() : null
      };

      const { data, error } = await db.scheduledPosts.create(postData);
      
      if (error) {
        console.error('Erro ao criar post agendado:', error);
        return { data: null, error };
      }

      const newPost: ScheduledPost = {
        id: data.id,
        contentId: data.content_id,
        platform: data.platform as any,
        scheduledFor: new Date(data.scheduled_for),
        status: data.status as any,
        createdAt: new Date(data.created_at),
        // Campos do Supabase
        content_id: data.content_id,
        scheduled_for: data.scheduled_for,
        user_id: data.user_id,
        created_at: data.created_at,
        published_at: data.published_at
      };

      return { data: newPost, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar post agendado:', error);
      return { data: null, error };
    }
  }

  // ===== IMAGENS DE CARROSSEL =====
  static async getCarouselImages(contentId: string): Promise<DatabaseResponse<CarouselImage[]>> {
    try {
      const { data, error } = await db.carouselImages.getByContentId(contentId);
      
      if (error) {
        console.error('Erro ao buscar imagens do carrossel:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar imagens do carrossel:', error);
      return { data: null, error };
    }
  }

  static async createCarouselImage(image: Omit<CarouselImage, 'id' | 'created_at'>): Promise<DatabaseResponse<CarouselImage>> {
    try {
      const { data, error } = await db.carouselImages.create(image);
      
      if (error) {
        console.error('Erro ao criar imagem do carrossel:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar imagem do carrossel:', error);
      return { data: null, error };
    }
  }

  // ===== CONFIGURAÇÕES DO USUÁRIO =====
  static async getUserSettings(userId: string): Promise<DatabaseResponse<UserSettings>> {
    try {
      const { data, error } = await db.userSettings.get(userId);
      
      if (error) {
        console.error('Erro ao buscar configurações do usuário:', error);
        return { data: null, error };
      }

      // Se não há configurações, criar configurações padrão
      if (!data) {
        // Primeiro verificar se o usuário existe na tabela users
        try {
          const { data: userData, error: userError } = await db.users.get(userId);
          
          if (userError || !userData) {
            console.error('Usuário não encontrado na tabela users:', userError);
            return { data: null, error: new Error('Usuário não encontrado') };
          }
        } catch (error) {
          console.error('Erro ao verificar usuário:', error);
          return { data: null, error: new Error('Erro ao verificar usuário') };
        }

        const defaultSettings = {
          user_id: userId,
          auto_scheduling: false,
          peak_hours: {},
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          brand_guidelines: '',
          target_audience: ''
        };

        const { data: newData, error: createError } = await db.userSettings.create(defaultSettings);
        
        if (createError) {
          console.error('Erro ao criar configurações padrão:', createError);
          return { data: null, error: createError };
        }

        return { data: newData, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar configurações do usuário:', error);
      return { data: null, error };
    }
  }

  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<DatabaseResponse<UserSettings>> {
    try {
      const { data, error } = await db.userSettings.update(userId, settings);
      
      if (error) {
        console.error('Erro ao atualizar configurações do usuário:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar configurações do usuário:', error);
      return { data: null, error };
    }
  }

  // ===== UTILITÁRIOS =====
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { user } = await auth.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  static async getCurrentUserId(): Promise<string | null> {
    try {
      const { user } = await auth.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
      return null;
    }
  }
}

export default DatabaseService;
