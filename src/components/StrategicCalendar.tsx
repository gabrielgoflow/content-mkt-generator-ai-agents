import { useState } from 'react';
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
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  AlertCircle,
  Instagram,
  Mail,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Content, Platform, ScheduledPost } from '@/types';

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  email: Mail,
};

interface StrategicCalendarProps {
  approvedContent: Content[];
  onScheduleContent: (contentId: string, date: Date) => void;
}

export function StrategicCalendar({ approvedContent, onScheduleContent }: StrategicCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [calendarView, setCalendarView] = useState<'general' | 'platform'>('general');

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

  const getContentForDate = (date: Date, platform?: Platform | 'all') => {
    return scheduledPosts.filter(post => {
      const isDateMatch = post.scheduledFor.toDateString() === date.toDateString();
      const isPlatformMatch = platform === 'all' || !platform ? true : post.platform === platform;
      return isDateMatch && isPlatformMatch;
    });
  };

  const getApprovedContentForDate = (_date: Date, platform?: Platform | 'all') => {
    return approvedContent.filter(content => {
      const isNotScheduled = !scheduledPosts.some(post => post.contentId === content.id);
      const isPlatformMatch = platform === 'all' || !platform ? true : content.platform === platform;
      return isNotScheduled && isPlatformMatch;
    });
  };

  const getPlatforms = () => {
    const platforms = [...new Set(approvedContent.map(content => content.platform))];
    return platforms;
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Publicação
          </Button>
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
                              <div key={post.id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                <PlatformIcon platform={content.platform} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{content.title}</p>
                                  <p className="text-xs text-muted-foreground">{content.platform}</p>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  Agendado
                                </Badge>
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
                            <div key={content.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                              <PlatformIcon platform={content.platform} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{content.title}</p>
                                <p className="text-xs text-muted-foreground">{content.platform}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSchedule(content.id)}
                                className="text-xs"
                              >
                                Agendar
                              </Button>
                            </div>
                          ))}
                          {getApprovedContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{getApprovedContentForDate(selectedDate, calendarView === 'platform' ? selectedPlatform : undefined).length - 3} mais
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível</p>
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
              {scheduledPosts.filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform).length > 0 ? (
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
                    {scheduledPosts
                      .filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform)
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
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
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
                  <div className="text-2xl font-bold text-blue-600">{scheduledPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Agendados</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{approvedContent.length}</div>
                  <div className="text-sm text-muted-foreground">Conteúdos Aprovados</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((scheduledPosts.length / approvedContent.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Agendamento</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {approvedContent.length - scheduledPosts.length}
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
    </div>
  );
}
