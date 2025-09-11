import { Content } from '@/types';

export interface CanvaTemplate {
  id: string;
  name: string;
  type: 'video' | 'carousel' | 'post';
  url: string;
  thumbnail: string;
}

export interface CanvaProject {
  id: string;
  title: string;
  url: string;
  status: 'draft' | 'published';
  createdAt: Date;
}

// Templates pré-definidos para diferentes formatos
const canvaTemplates: Record<string, CanvaTemplate[]> = {
  video_script: [
    {
      id: 'reel-template-1',
      name: 'Reel Dinâmico - Vertical',
      type: 'video',
      url: 'https://www.canva.com/design/DAF.../edit',
      thumbnail: '/templates/reel-vertical.jpg'
    },
    {
      id: 'reel-template-2',
      name: 'Reel Educativo - Com Texto',
      type: 'video',
      url: 'https://www.canva.com/design/DAF.../edit',
      thumbnail: '/templates/reel-educational.jpg'
    },
    {
      id: 'video-template-1',
      name: 'Vídeo Tutorial - Horizontal',
      type: 'video',
      url: 'https://www.canva.com/design/DAF.../edit',
      thumbnail: '/templates/video-tutorial.jpg'
    }
  ],
  carousel: [
    {
      id: 'carousel-template-1',
      name: 'Carrossel Educativo - 5 Slides',
      type: 'carousel',
      url: 'https://www.canva.com/design/DAF.../edit',
      thumbnail: '/templates/carousel-educational.jpg'
    },
    {
      id: 'carousel-template-2',
      name: 'Carrossel Inspiracional - 7 Slides',
      type: 'carousel',
      url: 'https://www.canva.com/design/DAF.../edit',
      thumbnail: '/templates/carousel-inspirational.jpg'
    },
    {
      id: 'carousel-template-3',
      name: 'Carrossel de Dicas - 10 Slides',
      type: 'carousel',
      url: 'https://www.canva.com/design/DAF.../edit',
      thumbnail: '/templates/carousel-tips.jpg'
    }
  ]
};

export class CanvaService {
  // Obter templates disponíveis para um formato específico
  static getTemplatesForFormat(format: string): CanvaTemplate[] {
    return canvaTemplates[format] || [];
  }

  // Criar um novo projeto no Canva baseado no conteúdo gerado
  static async createProjectFromContent(content: Content): Promise<CanvaProject> {
    try {
      // Simular criação de projeto no Canva
      const templates = this.getTemplatesForFormat(content.format);
      const selectedTemplate = templates[0]; // Selecionar primeiro template disponível

      if (!selectedTemplate) {
        throw new Error(`Nenhum template disponível para o formato ${content.format}`);
      }

      // Simular chamada para API do Canva
      await new Promise(resolve => setTimeout(resolve, 1000));

      const project: CanvaProject = {
        id: `canva-${Date.now()}`,
        title: content.title,
        url: selectedTemplate.url,
        status: 'draft',
        createdAt: new Date()
      };

      return project;
    } catch (error) {
      console.error('Erro ao criar projeto no Canva:', error);
      throw new Error('Falha ao criar projeto no Canva');
    }
  }

  // Abrir template no Canva em nova aba
  static openTemplateInCanva(template: CanvaTemplate, content?: Content): void {
    let url = template.url;
    
    // Se temos conteúdo, podemos adicionar parâmetros para pré-popular o template
    if (content) {
      const params = new URLSearchParams({
        title: content.title,
        content: content.content.substring(0, 500), // Limitar tamanho
        hashtags: content.metadata?.hashtags?.join(',') || ''
      });
      url += `?${params.toString()}`;
    }

    window.open(url, '_blank');
  }

  // Gerar URL de template personalizado baseado no conteúdo
  static generateCustomTemplateUrl(content: Content): string {
    const baseUrl = 'https://www.canva.com/design/';
    const templateId = this.getBestTemplateForContent(content);
    
    const params = new URLSearchParams({
      template: templateId,
      title: content.title,
      content: content.content,
      format: content.format,
      platform: content.platform
    });

    return `${baseUrl}${templateId}/edit?${params.toString()}`;
  }

  // Selecionar melhor template baseado no conteúdo
  private static getBestTemplateForContent(content: Content): string {
    const templates = this.getTemplatesForFormat(content.format);
    
    // Lógica simples para selecionar template baseado no tipo de conteúdo
    if (content.title.toLowerCase().includes('tutorial')) {
      return templates.find(t => t.name.includes('Tutorial'))?.id || templates[0].id;
    }
    
    if (content.title.toLowerCase().includes('dica')) {
      return templates.find(t => t.name.includes('Dicas'))?.id || templates[0].id;
    }
    
    return templates[0].id;
  }

  // Obter estatísticas de uso do Canva
  static async getUsageStats(): Promise<{
    projectsCreated: number;
    templatesUsed: Record<string, number>;
    lastActivity: Date;
  }> {
    // Simular dados de uso
    return {
      projectsCreated: 12,
      templatesUsed: {
        'video_script': 5,
        'carousel': 7
      },
      lastActivity: new Date()
    };
  }
}

// Hook para usar o serviço Canva
export const useCanvaIntegration = () => {
  const createProject = async (content: Content) => {
    try {
      const project = await CanvaService.createProjectFromContent(content);
      return project;
    } catch (error) {
      console.error('Erro na integração com Canva:', error);
      throw error;
    }
  };

  const openTemplate = (template: CanvaTemplate, content?: Content) => {
    CanvaService.openTemplateInCanva(template, content);
  };

  const getTemplates = (format: string) => {
    return CanvaService.getTemplatesForFormat(format);
  };

  return {
    createProject,
    openTemplate,
    getTemplates
  };
};
