import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ContentGeneration } from '@/components/ContentGeneration';
import { StrategicCalendar } from '@/components/StrategicCalendar';
import { ContentReview } from '@/components/ContentReview';
import { Auth } from '@/components/Auth';
import { Content } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { DatabaseService } from '@/services/databaseService';
import { supabase } from '@/config/supabase';

function App() {
  const [currentView, setCurrentView] = useState<'generation' | 'calendar' | 'review'>('generation');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<Content[]>([]);

  // Temporariamente mostrar todos os conteúdos para debug
  const approvedContent = contents; // Removendo filtro temporariamente
  
  // Filtrar conteúdos aprovados e agendados (conteúdos que podem ser gerenciados no calendário)
  // const approvedContent = contents.filter(content => 
  //   content.status === 'approved' || 
  //   content.status === 'scheduled' || 
  //   content.status === 'generated' || 
  //   content.status === 'draft'
  // );
  
  // Debug: verificar conteúdos
  // console.log('App.tsx - Total de conteúdos:', contents.length);
  // console.log('App.tsx - Conteúdos aprovados:', approvedContent.length);
  // console.log('App.tsx - Status dos conteúdos:', contents.map((c: Content) => ({ id: c.id, title: c.title, status: c.status })));
  // console.log('App.tsx - Todos os conteúdos:', contents);

  // Verificar autenticação e carregar conteúdos na inicialização
  useEffect(() => {
    console.log('App.tsx - useEffect executado, inicializando app...');
    
    const initializeApp = async () => {
      try {
        console.log('App.tsx - Verificando sessão inicial...');
        // Verificar se há uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sessão inicial:', session);
        
        if (session) {
          setIsAuthenticated(true);
          console.log('Usuário já autenticado:', session.user.email);
        }

        // Carregar conteúdos se autenticado
        if (session) {
          console.log('App.tsx - Carregando conteúdos...');
          // Aguardar um pouco para garantir que a conexão está pronta
          await new Promise(resolve => setTimeout(resolve, 1000));
          const result = await DatabaseService.getContents();
          console.log('App.tsx - Resultado do getContents:', result);
          if (result.data) {
            setContents(result.data);
            console.log('App.tsx - Conteúdos definidos no estado:', result.data.length);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
      } finally {
        console.log('App.tsx - Finalizando inicialização, definindo isLoading = false');
        setIsLoading(false);
      }
    };

    console.log('App.tsx - Chamando initializeApp...');
    initializeApp();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de autenticação:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          console.log('Usuário fez login:', session.user.email);
          
          // Carregar conteúdos após login
          try {
            console.log('App.tsx - Carregando conteúdos após login...');
            // Aguardar um pouco para garantir que a conexão está pronta
            await new Promise(resolve => setTimeout(resolve, 1000));
            const result = await DatabaseService.getContents();
            console.log('App.tsx - Resultado do getContents após login:', result);
            if (result.data) {
              setContents(result.data);
              console.log('App.tsx - Conteúdos definidos após login:', result.data.length);
            } else {
              console.log('App.tsx - Nenhum conteúdo retornado após login');
            }
          } catch (error) {
            console.error('Erro ao carregar conteúdos após login:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setContents([]);
          console.log('Usuário fez logout');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Debug: verificar mudanças no estado contents
  useEffect(() => {
    console.log('App.tsx - Estado contents atualizado:', contents.length, 'conteúdos');
    if (contents.length > 0) {
      console.log('App.tsx - Detalhes dos conteúdos:', contents.map(c => ({ id: c.id, title: c.title, status: c.status })));
    }
  }, [contents]);

  // Reagir às mudanças no estado de autenticação
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuário autenticado, redirecionando para dashboard');
      setCurrentView('generation');
    }
  }, [isAuthenticated]);

  const createContent = async (content: Omit<Content, 'id' | 'createdAt'>) => {
    try {
      const result = await DatabaseService.createContent(content);
      if (result.data) {
        setContents(prev => [result.data!, ...prev]);
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      return { success: false, error };
    }
  };

  const updateContent = async (id: string, updates: Partial<Content>) => {
    try {
      const result = await DatabaseService.updateContent(id, updates);
      if (result.data) {
        setContents(prev => prev.map(content => 
          content.id === id ? result.data! : content
        ));
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return { success: false, error };
    }
  };

  const createScheduledPost = async (post: any) => {
    try {
      // Implementar criação de post agendado se necessário
      console.log('Criando post agendado:', post);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar post agendado:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // O listener onAuthStateChange vai lidar com a limpeza do estado
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para criar conteúdos de teste
  const createTestContent = async () => {
    try {
      const testContents = [
        {
          title: 'Descubra o Poder das Laranjas!',
          content: '📱 **CARROSSEL - 2 SLIDES**\n\n**Slide 1:** As laranjas são um superalimento rico em vitamina C! 🍊\n\n**Slide 2:** Inclua laranjas na sua dieta diária para fortalecer a imunidade e ter mais energia! 💪\n\n#laranjas #vitaminaC #saude #alimentacao #imunidade',
          platform: 'instagram' as const,
          format: 'carousel' as const,
          status: 'approved' as const,
          agentId: null,
          prompt: 'Criar conteúdo sobre benefícios das laranjas'
        },
        {
          title: 'Receita de Suco Detox',
          content: '🥤 **RECEITA DE SUC DETOX**\n\nIngredientes:\n• 2 laranjas\n• 1 limão\n• 1 pedaço de gengibre\n• 200ml de água\n• Folhas de hortelã\n\nModo de preparo:\n1. Esprema as laranjas e o limão\n2. Rale o gengibre\n3. Misture tudo com água\n4. Adicione hortelã\n5. Sirva gelado\n\n#detox #suco #saude #receita #laranja',
          platform: 'instagram' as const,
          format: 'video_script' as const,
          status: 'generated' as const,
          agentId: null,
          prompt: 'Criar receita de suco detox com laranja'
        },
        {
          title: 'Newsletter: Benefícios da Vitamina C',
          content: '**Newsletter Semanal - Benefícios da Vitamina C**\n\nOlá!\n\nEsta semana vamos falar sobre os incríveis benefícios da vitamina C, encontrada em abundância nas laranjas.\n\n**Principais benefícios:**\n• Fortalece o sistema imunológico\n• Ajuda na absorção de ferro\n• É um poderoso antioxidante\n• Contribui para a saúde da pele\n\n**Dica da semana:**\nConsuma pelo menos uma laranja por dia para manter seus níveis de vitamina C adequados.\n\nAté a próxima semana!\n\nEquipe GoFlow',
          platform: 'email' as const,
          format: 'email_newsletter' as const,
          status: 'draft' as const,
          agentId: null,
          prompt: 'Criar newsletter sobre vitamina C'
        }
      ];

      for (const content of testContents) {
        const result = await createContent(content);
        if (result.success) {
          console.log('Conteúdo de teste criado:', content.title);
        } else {
          console.error('Erro ao criar conteúdo de teste:', content.title, result.error);
        }
      }

      // Recarregar conteúdos
      const result = await DatabaseService.getContents();
      if (result.data) {
        setContents(result.data);
      }
    } catch (error) {
      console.error('Erro ao criar conteúdos de teste:', error);
    }
  };

  const handleContentApproved = async (content: Content) => {
    try {
      const result = await createContent(content);
      if (result.success && result.data) {
        // Salvar imagens do carrossel se existirem
        if (content.carouselImages && content.carouselImages.length > 0) {
          console.log('Salvando imagens do carrossel:', content.carouselImages.length);
          
          for (const image of content.carouselImages) {
            try {
              await DatabaseService.createCarouselImage({
                content_id: result.data.id,
                slide_number: image.slideNumber,
                image_url: image.imageUrl || null,
                description: image.description || null,
                status: image.status
              });
              console.log(`Imagem do slide ${image.slideNumber} salva com sucesso`);
            } catch (imageError) {
              console.error(`Erro ao salvar imagem do slide ${image.slideNumber}:`, imageError);
            }
          }
        }
        
        // Opcionalmente, mudar para a view do calendário após aprovação
        setCurrentView('calendar');
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo aprovado:', error);
    }
  };

  const handleScheduleContent = async (contentId: string, date: Date) => {
    try {
      // Atualizar o conteúdo para status 'scheduled'
      await updateContent(contentId, { 
        status: 'scheduled', 
        scheduledFor: date 
      });

      // Criar post agendado
      const content = contents.find((c: Content) => c.id === contentId);
      if (content) {
        await createScheduledPost({
          contentId: content.id,
          platform: content.platform,
          scheduledFor: date,
          status: 'scheduled',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erro ao agendar conteúdo:', error);
    }
  };

  const handleUnscheduleContent = async (contentId: string) => {
    try {
      // Atualizar o conteúdo para status 'approved' (removendo o agendamento)
      await updateContent(contentId, { 
        status: 'approved', 
        scheduledFor: undefined 
      });
    } catch (error) {
      console.error('Erro ao desagendar conteúdo:', error);
    }
  };

  const handleUpdateContent = async (contentId: string, updates: Partial<Content>) => {
    try {
      await updateContent(contentId, updates);
      // Os conteúdos já são atualizados automaticamente no estado pela função updateContent
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  };

  // Mostrar tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Debug: verificar estado de autenticação
  console.log('App.tsx - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // Mostrar tela de autenticação se não estiver logado
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => {
      console.log('onAuthSuccess chamado');
      // Não precisamos fazer nada aqui, o useEffect vai reagir à mudança de isAuthenticated
    }} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'generation':
        return (
          <ContentGeneration 
            onContentApproved={handleContentApproved}
          />
        );
      case 'calendar':
        return (
          <StrategicCalendar 
            approvedContent={approvedContent}
            allContents={contents}
            onScheduleContent={handleScheduleContent}
            onUnscheduleContent={handleUnscheduleContent}
            onUpdateContent={handleUpdateContent}
            onCreateTestContent={createTestContent}
          />
        );
      case 'review':
        return (
          <ContentReview 
            approvedContent={approvedContent}
          />
        );
      default:
        return (
          <ContentGeneration 
            onContentApproved={handleContentApproved}
          />
        );
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onSignOut={signOut}
      >
        {renderCurrentView()}
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
