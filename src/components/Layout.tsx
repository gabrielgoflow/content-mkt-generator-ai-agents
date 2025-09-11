import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Plus, Settings, BarChart3, User, LogOut, Bell, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'generation' | 'calendar' | 'review';
  onViewChange: (view: 'generation' | 'calendar' | 'review') => void;
  onSignOut?: () => void;
}

const platforms = [
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'email', name: 'Email', color: 'bg-blue-600' },

];

export function Layout({ children, currentView, onViewChange, onSignOut }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold">Content AI</h1>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Agentes IA
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Configurações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Novo Agente</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-card border-r">
            <div className="flex flex-col flex-grow px-4 pb-4">
              <nav className="flex-1 space-y-1">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Navegação
                </h2>
                <Button
                  variant={currentView === 'generation' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onViewChange('generation')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Geração de Conteúdo
                </Button>
                <Button
                  variant={currentView === 'calendar' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onViewChange('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Pauta Estratégica
                </Button>
                <Button
                  variant={currentView === 'review' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onViewChange('review')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Revisão Coordenada
                </Button>
              </nav>

              <Separator className="my-4" />

              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Plataformas
                </h3>
                <div className="space-y-1">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                      <span className="text-sm">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
