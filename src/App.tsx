import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ContentGeneration } from '@/components/ContentGeneration';
import { StrategicCalendar } from '@/components/StrategicCalendar';
import { ContentReview } from '@/components/ContentReview';
import { Content } from '@/types';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [currentView, setCurrentView] = useState<'generation' | 'calendar' | 'review'>('generation');
  const [approvedContent, setApprovedContent] = useState<Content[]>([]);

  const handleContentApproved = (content: Content) => {
    setApprovedContent(prev => [...prev, content]);
    // Opcionalmente, mudar para a view do calendário após aprovação
    setCurrentView('calendar');
  };

  const handleScheduleContent = (contentId: string, date: Date) => {
    setApprovedContent(prev => 
      prev.map(content => 
        content.id === contentId 
          ? { ...content, scheduledFor: date, status: 'scheduled' as const }
          : content
      )
    );
  };

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
            onScheduleContent={handleScheduleContent}
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
      >
        {renderCurrentView()}
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
