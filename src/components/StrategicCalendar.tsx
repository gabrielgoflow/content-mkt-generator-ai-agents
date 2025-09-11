import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  Instagram,
  Mail,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Content, Platform, ScheduledPost, CarouselImage } from '@/types';
import { DatabaseService } from '@/services/databaseService';

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  email: Mail,
};

// Componente para exibir imagens do carrossel
interface CarouselImagesDisplayProps {
  contentId: string;
  format: string;
}

function CarouselImagesDisplay({ contentId, format }: CarouselImagesDisplayProps) {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      if (format !== 'carousel') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await DatabaseService.getCarouselImages(contentId);
        
        if (error) {
          console.error('Erro ao carregar imagens do carrossel:', error);
          setError('Erro ao carregar imagens');
        } else {
          setImages(data || []);
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar imagens:', err);
        setError('Erro inesperado');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [contentId, format]);

  if (format !== 'carousel') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Carregando imagens...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma imagem encontrada para este carrossel</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <ImageIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Imagens do Carrossel ({images.length})</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
              {image.image_url ? (
                <img
                  src={image.image_url}
                  alt={`Slide ${image.slide_number}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Placeholder quando não há imagem ou erro no carregamento */}
              <div className={`w-full h-full flex items-center justify-center ${image.image_url ? 'hidden' : ''}`}>
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    {image.status === 'generating' ? 'Gerando...' : 
                     image.status === 'failed' ? 'Erro' : 'Sem imagem'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Badge com número do slide */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {image.slide_number}
            </div>
            
            {/* Status badge */}
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  image.status === 'completed' ? 'bg-green-100 text-green-700' :
                  image.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                  image.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {image.status === 'completed' ? '✓' :
                 image.status === 'generating' ? '⏳' :
                 image.status === 'failed' ? '✗' : '⏸'}
              </Badge>
            </div>
            
            {/* Descrição no hover */}
            {image.description && (
              <div className="absolute inset-0 bg-black/80 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <p className="text-xs">{image.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StrategicCalendarProps {
  approvedContent: Content[];
  allContents?: Content[]; // Adicionar todos os conteúdos para debug
  onScheduleContent: (contentId: string, date: Date) => void;
  onUnscheduleContent: (contentId: string) => void;
  onUpdateContent?: (contentId: string, updates: Partial<Content>) => Promise<void>;
  onCreateTestContent?: () => Promise<void>;
}

export function StrategicCalendar({ approvedContent, allContents, onScheduleContent, onUnscheduleContent, onUpdateContent, onCreateTestContent }: StrategicCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [calendarView, setCalendarView] = useState<'general' | 'platform'>('general');
  
  // Estados para o diálogo de visualização/edição
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<Partial<Content>>({});

  // Debug: verificar conteúdos recebidos
  console.log('StrategicCalendar - Conteúdos aprovados recebidos:', approvedContent.length);
  console.log('StrategicCalendar - Detalhes dos conteúdos:', approvedContent.map(c => ({ id: c.id, title: c.title, status: c.status, platform: c.platform })));

  const handleSchedule = (contentId: string) => {
    if (selectedDate) {
      const newScheduledPost: ScheduledPost = {
        id: Date.now().toString(),
        contentId,
        platform: approvedContent.find(c => c.id === contentId)?.platform || 'instagram',
        scheduledFor: selectedDate,
        status: 'scheduled',
        createdAt: new Date(),
      };
      setScheduledPosts([...scheduledPosts, newScheduledPost]);
      onScheduleContent(contentId, selectedDate);
    }
  };

  // Funções para visualização e edição
  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setEditedContent({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditContent = (content: Content) => {
    setSelectedContent(content);
    setEditedContent({
      title: content.title,
      content: content.content,
      platform: content.platform,
      format: content.format,
      status: content.status,
      scheduledFor: content.scheduledFor
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveContent = async () => {
    if (!selectedContent || !editedContent || !onUpdateContent) return;

    try {
      await onUpdateContent(selectedContent.id, editedContent);
      console.log('Conteúdo salvo com sucesso:', selectedContent.id, editedContent);
      setIsDialogOpen(false);
      setSelectedContent(null);
      setEditedContent({});
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleCancelEdit = () => {
    setEditedContent({});
    setIsEditing(false);
    if (selectedContent) {
      setIsDialogOpen(false);
      setSelectedContent(null);
    }
  };

  const getContentForDate = (date: Date, platform?: Platform | 'all') => {
    // Primeiro, obter todos os conteúdos com status 'scheduled' que têm scheduledFor definido
    const scheduledFromContent = approvedContent.filter(content => {
      if (content.status !== 'scheduled' || !content.scheduledFor) return false;
      const isDateMatch = content.scheduledFor.toDateString() === date.toDateString();
      const isPlatformMatch = platform === 'all' || !platform ? true : content.platform === platform;
      return isDateMatch && isPlatformMatch;
    });

    // Converter conteúdos agendados para o formato de ScheduledPost
    const scheduledFromContentAsPosts = scheduledFromContent.map(content => ({
      id: `content-${content.id}`,
      contentId: content.id,
      platform: content.platform,
      scheduledFor: content.scheduledFor!,
      status: 'scheduled' as const,
      createdAt: content.createdAt
    }));

    // Incluir posts agendados da tabela scheduled_posts que NÃO estão no approvedContent
    const scheduledFromTable = scheduledPosts.filter(post => {
      const isDateMatch = post.scheduledFor.toDateString() === date.toDateString();
      const isPlatformMatch = platform === 'all' || !platform ? true : post.platform === platform;
      // Verificar se este post não está já representado no approvedContent
      const isNotInApprovedContent = !approvedContent.some(content => 
        content.id === post.contentId && content.status === 'scheduled'
      );
      return isDateMatch && isPlatformMatch && isNotInApprovedContent;
    });

    return [...scheduledFromContentAsPosts, ...scheduledFromTable];
  };

  const getApprovedContentForDate = (_date: Date, platform?: Platform | 'all') => {
    return approvedContent.filter(content => {
      // Incluir apenas conteúdos que NÃO estão agendados
      // (status 'approved', 'generated', 'draft' ou 'scheduled' sem data específica)
      const isNotScheduled = content.status !== 'scheduled' || !content.scheduledFor;
      const isPlatformMatch = platform === 'all' || !platform ? true : content.platform === platform;
      return isNotScheduled && isPlatformMatch;
    });
  };

  const getPlatforms = () => {
    const platforms = [...new Set(approvedContent.map(content => content.platform))];
    return platforms;
  };

  // Função para obter todos os conteúdos agendados (unificando approvedContent + scheduledPosts)
  const getAllScheduledPosts = (platform?: Platform | 'all') => {
    // Obter conteúdos com status 'scheduled' do approvedContent
    const scheduledFromContent = approvedContent.filter(content => {
      if (content.status !== 'scheduled' || !content.scheduledFor) return false;
      const isPlatformMatch = platform === 'all' || !platform ? true : content.platform === platform;
      return isPlatformMatch;
    });

    // Converter para formato ScheduledPost
    const scheduledFromContentAsPosts = scheduledFromContent.map(content => ({
      id: `content-${content.id}`,
      contentId: content.id,
      platform: content.platform,
      scheduledFor: content.scheduledFor!,
      status: 'scheduled' as const,
      createdAt: content.createdAt
    }));

    // Obter posts do estado local que não estão no approvedContent
    const scheduledFromTable = scheduledPosts.filter(post => {
      const isPlatformMatch = platform === 'all' || !platform ? true : post.platform === platform;
      const isNotInApprovedContent = !approvedContent.some(content => 
        content.id === post.contentId && content.status === 'scheduled'
      );
      return isPlatformMatch && isNotInApprovedContent;
    });

    return [...scheduledFromContentAsPosts, ...scheduledFromTable];
  };

  const getCalendarModifiers = (platform?: Platform | 'all') => {
    return {
      hasPosts: (date: Date) => getContentForDate(date, platform).length > 0,
      hasApproved: (date: Date) => getApprovedContentForDate(date, platform).length > 0,
    };
  };

  const PlatformIcon = ({ platform }: { platform: Platform }) => {
    const Icon = platformIcons[platform] || Instagram;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Total de conteúdos recebidos: {approvedContent.length}</p>
            <p>Conteúdos por status:</p>
            <ul className="ml-4">
              {allContents && Object.entries(allContents.reduce((acc, content) => {
                acc[content.status] = (acc[content.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([status, count]) => (
                <li key={status}>- {status}: {count}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Conteúdos agendados: {approvedContent.filter(c => c.status === 'scheduled').length}
            </p>
            <p className="text-xs">
              Conteúdos disponíveis: {approvedContent.filter(c => c.status !== 'scheduled').length}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pauta Estratégica</h2>
          <p className="text-muted-foreground">Gerencie e agende suas publicações</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Badge>
          {/* <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Publicação
          </Button> */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (onCreateTestContent) {
                  onCreateTestContent();
                }
              }}
            >
              Criar Conteúdos de Teste
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Calendar View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Visualização:</span>
              <Button
                variant={calendarView === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('general')}
              >
                Geral
              </Button>
              <Button
                variant={calendarView === 'platform' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCalendarView('platform')}
              >
                Por Plataforma
              </Button>
            </div>
          </div>
          
          {calendarView === 'platform' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Plataforma:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('all')}
                >
                  Todas
                </Button>
                {getPlatforms().map((platform) => {
                  const Icon = platformIcons[platform] || Instagram;
                  return (
                    <Button
                      key={platform}
                      variant={selectedPlatform === platform ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPlatform(platform)}
                      className="flex items-center space-x-1"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="capitalize">{platform}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <TabsContent value="calendar" className="space-y-6">
          {calendarView === 'general' ? (
            /* General Calendar View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Calendário Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={getCalendarModifiers()}
                    modifiersStyles={{
                      hasPosts: {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                      },
                      hasApproved: {
                        backgroundColor: '#10b981',
                        color: 'white',
                      },
                    }}
                  />
                  
                  <Separator className="my-4" />
                  
                  {/* Legend */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Publicações agendadas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Conteúdo aprovado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Platform Calendar View */
            <div className="space-y-6">
              {selectedPlatform === 'all' ? (
                /* All Platforms Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPlatforms().map((platform) => {
                    const Icon = platformIcons[platform] || Instagram;
                    return (
                      <Card key={platform}>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Icon className="h-5 w-5 mr-2" />
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            modifiers={getCalendarModifiers(platform)}
                            modifiersStyles={{
                              hasPosts: {
                                backgroundColor: '#3b82f6',
                                color: 'white',
                              },
                              hasApproved: {
                                backgroundColor: '#10b981',
                                color: 'white',
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* Single Platform View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {(() => {
                          const Icon = platformIcons[selectedPlatform] || Instagram;
                          return <Icon className="h-5 w-5 mr-2" />;
                        })()}
                        Calendário - {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={getCalendarModifiers(selectedPlatform)}
                        modifiersStyles={{
                          hasPosts: {
                            backgroundColor: '#3b82f6',
                            color: 'white',
                          },
                          hasApproved: {
                            backgroundColor: '#10b981',
                            color: 'white',
                          },
                        }}
                      />
                      
                      <Separator className="my-4" />
                      
                      {/* Legend */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Publicações agendadas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Conteúdo aprovado</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sidebar - Selected Date Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && (
                  <>
                    {/* Scheduled Posts for Selected Date */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Publicações Agendadas
                        {calendarView === 'platform' && selectedPlatform !== 'all' && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({selectedPlatform})
                          </span>
                        )}
                      </h4>
                      {getContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).length > 0 ? (
                        <div className="space-y-2">
                          {getContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).map((post) => {
                            const content = approvedContent.find(c => c.id === post.contentId);
                            return content ? (
                              <div key={post.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex-shrink-0">
                                    <PlatformIcon platform={content.platform} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                                    <p className="text-xs text-gray-500 capitalize">{content.platform}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-end space-x-2">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                    Agendado
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onUnscheduleContent(content.id)}
                                    className="text-xs h-7 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  >
                                    Desagendar
                                  </Button>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma publicação agendada</p>
                      )}
                    </div>

                    <Separator />

                    {/* Available Content to Schedule */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Conteúdo Disponível
                        {calendarView === 'platform' && selectedPlatform !== 'all' && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({selectedPlatform})
                          </span>
                        )}
                      </h4>
                      {getApprovedContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).length > 0 ? (
                        <div className="space-y-2">
                          {getApprovedContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).slice(0, 3).map((content) => (
                            <div key={content.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex-shrink-0">
                                  <PlatformIcon platform={content.platform} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                                  <p className="text-xs text-gray-500 capitalize">{content.platform}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSchedule(content.id)}
                                  className="text-xs h-7 px-3 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300"
                                >
                                  Agendar
                                </Button>
                              </div>
                            </div>
                          ))}
                          {getApprovedContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{getApprovedContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).length - 3} mais
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total de conteúdos aprovados: {approvedContent.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Publicações Agendadas</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Filtrar por plataforma:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPlatform('all')}
                    >
                      Todas
                    </Button>
                    {getPlatforms().map((platform) => {
                      const Icon = platformIcons[platform] || Instagram;
                      return (
                        <Button
                          key={platform}
                          variant={selectedPlatform === platform ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedPlatform(platform)}
                          className="flex items-center space-x-1"
                        >
                          <Icon className="h-3 w-3" />
                          <span className="capitalize">{platform}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getAllScheduledPosts(selectedPlatform).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getAllScheduledPosts(selectedPlatform)
                      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
                      .map((post) => {
                        const content = approvedContent.find(c => c.id === post.contentId);
                        return content ? (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{content.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {content.content.substring(0, 60)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <PlatformIcon platform={content.platform} />
                                <span className="capitalize">{content.platform}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{post.scheduledFor.toLocaleDateString('pt-BR')}</div>
                                <div className="text-muted-foreground">
                                  {post.scheduledFor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                Agendado
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewContent(content)}
                                  title="Visualizar conteúdo"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditContent(content)}
                                  title="Editar conteúdo"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => onUnscheduleContent(content.id)}
                                  title="Desagendar conteúdo"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Nenhuma publicação agendada</p>
                  <p className="text-sm">
                    {selectedPlatform === 'all' 
                      ? 'Aprove conteúdo e agende para o calendário'
                      : `Nenhuma publicação agendada para ${selectedPlatform}`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{getAllScheduledPosts().length}</div>
                  <div className="text-sm text-muted-foreground">Total Agendados</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{approvedContent.length}</div>
                  <div className="text-sm text-muted-foreground">Conteúdos Aprovados</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {approvedContent.length > 0 ? Math.round((getAllScheduledPosts().length / approvedContent.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Agendamento</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {approvedContent.length - getAllScheduledPosts().length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Auto-agendamento</h4>
                    <p className="text-sm text-muted-foreground">Agendar automaticamente conteúdo aprovado</p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Horários de Pico</h4>
                    <p className="text-sm text-muted-foreground">Definir melhores horários para cada plataforma</p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Notificações</h4>
                    <p className="text-sm text-muted-foreground">Receber alertas sobre publicações</p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Visualização/Edição de Conteúdo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {isEditing ? 'Editar Conteúdo' : 'Visualizar Conteúdo'}
              </span>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveContent}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => selectedContent && handleEditContent(selectedContent)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-6">
              {/* Informações do Conteúdo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={editedContent.title || ''}
                      onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do conteúdo"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {selectedContent.title}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  {isEditing ? (
                    <Select
                      value={editedContent.platform || ''}
                      onValueChange={(value) => setEditedContent(prev => ({ ...prev, platform: value as Platform }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border flex items-center space-x-2">
                      <PlatformIcon platform={selectedContent.platform} />
                      <span className="capitalize">{selectedContent.platform}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Formato</Label>
                  {isEditing ? (
                    <Select
                      value={editedContent.format || ''}
                      onValueChange={(value) => setEditedContent(prev => ({ ...prev, format: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video_script">Roteiro de Vídeo</SelectItem>
                        <SelectItem value="carousel">Carrossel</SelectItem>
                        <SelectItem value="email_newsletter">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {selectedContent.format === 'video_script' && 'Roteiro de Vídeo'}
                      {selectedContent.format === 'carousel' && 'Carrossel'}
                      {selectedContent.format === 'email_newsletter' && 'Newsletter'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editedContent.status || ''}
                      onValueChange={(value) => setEditedContent(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="generated">Gerado</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <Badge 
                        variant="outline" 
                        className={
                          selectedContent.status === 'approved' ? 'bg-green-100 text-green-700' :
                          selectedContent.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          selectedContent.status === 'published' ? 'bg-purple-100 text-purple-700' :
                          selectedContent.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {selectedContent.status === 'draft' && 'Rascunho'}
                        {selectedContent.status === 'generated' && 'Gerado'}
                        {selectedContent.status === 'approved' && 'Aprovado'}
                        {selectedContent.status === 'scheduled' && 'Agendado'}
                        {selectedContent.status === 'published' && 'Publicado'}
                        {selectedContent.status === 'rejected' && 'Rejeitado'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                {isEditing ? (
                  <Textarea
                    id="content"
                    value={editedContent.content || ''}
                    onChange={(e) => setEditedContent(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Digite o conteúdo"
                    rows={10}
                    className="resize-none"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedContent.content}
                    </pre>
                  </div>
                )}
              </div>

              {/* Imagens do Carrossel */}
              {selectedContent.format === 'carousel' && (
                <div className="space-y-2">
                  <CarouselImagesDisplay 
                    contentId={selectedContent.id} 
                    format={selectedContent.format} 
                  />
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Criado em:</strong> {selectedContent.createdAt.toLocaleDateString('pt-BR')}
                </div>
                {selectedContent.approvedAt && (
                  <div>
                    <strong>Aprovado em:</strong> {selectedContent.approvedAt.toLocaleDateString('pt-BR')}
                  </div>
                )}
                {selectedContent.scheduledFor && (
                  <div>
                    <strong>Agendado para:</strong> {selectedContent.scheduledFor.toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              {/* Metadata */}
              {selectedContent.metadata && (
                <div className="space-y-2">
                  <Label>Metadados</Label>
                  <div className="p-4 bg-gray-50 rounded-md border">
                    <pre className="text-sm">
                      {JSON.stringify(selectedContent.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
