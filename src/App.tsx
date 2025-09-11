import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ContentGeneration } from '@/components/ContentGeneration';
import { StrategicCalendar } from '@/components/StrategicCalendar';
import { ContentReview } from '@/components/ContentReview';
import { Auth } from '@/components/Auth';
import { Content } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { useSupabase } from '@/hooks/useSupabase';

function App() {
  const [currentView, setCurrentView] = useState<'generation' | 'calendar' | 'review'>('generation');
  const { 
    isAuthenticated, 
    isLoading, 
    contents, 
    createContent, 
    updateContent,
    createScheduledPost,
    signOut 
  } = useSupabase();

  // Filtrar conteúdos aprovados e agendados (conteúdos que podem ser gerenciados no calendário)
  const approvedContent = contents.filter(content => 
    content.status === 'approved' || 
    content.status === 'scheduled' || 
    content.status === 'generated' || 
    content.status === 'draft'
  );
  
  // Debug: verificar conteúdos
  console.log('App.tsx - Total de conteúdos:', contents.length);
  console.log('App.tsx - Conteúdos aprovados:', approvedContent.length);
  console.log('App.tsx - Status dos conteúdos:', contents.map(c => ({ id: c.id, title: c.title, status: c.status })));

  // Reagir às mudanças no estado de autenticação
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuário autenticado, redirecionando para dashboard');
      setCurrentView('generation');
    }
  }, [isAuthenticated]);

  const handleContentApproved = async (content: Content) => {
    try {
      const result = await createContent(content);
      if (result.success) {
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
      const content = contents.find(c => c.id === contentId);
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

  // Mostrar tela de carregamento
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Carregando...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
