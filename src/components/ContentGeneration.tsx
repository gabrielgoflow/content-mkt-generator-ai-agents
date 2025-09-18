import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Check, 
  Edit, 
  Sparkles,
  Instagram,
  Mail,
  Video,
  Image,
  Copy,
  AlertCircle,
  Loader2,
  Palette,
  Download
} from 'lucide-react';
import { Platform, Content, ContentStatus, ContentFormat } from '@/types';
import { generateContent, ContentGenerationResponse } from '@/services/openaiService';
import { useCanvaIntegration } from '@/services/canvaService';
import { ImageService, CarouselImageGeneration } from '@/services/imageService';

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  email: Mail,
};

const formatIcons: Record<string, any> = {
  video_script: Video,
  carousel: Image,
  email_newsletter: Mail,
};

interface ContentGenerationProps {
  onContentApproved: (content: Content) => void;
}

export function ContentGeneration({ onContentApproved }: ContentGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram');
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('video_script');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Content | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [carouselSlides, setCarouselSlides] = useState(6); // Quantidade de slides do carrossel
  const [videoDuration, setVideoDuration] = useState(30); // Duração do vídeo em segundos
  const [isCreatingCanva, setIsCreatingCanva] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [carouselImages, setCarouselImages] = useState<CarouselImageGeneration[]>([]);
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0);

  const { createProject } = useCanvaIntegration();

  const platforms: Platform[] = ['instagram', 'email'];
  
  const getAvailableFormats = (platform: Platform): ContentFormat[] => {
    if (platform === 'instagram') {
      return ['video_script', 'carousel'];
    }
    return ['email_newsletter'];
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    
    // Simular progresso da geração
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Chamada real para a OpenAI
      const aiResponse: ContentGenerationResponse = await generateContent({
        prompt,
        platform: selectedPlatform,
        format: selectedFormat,
        tone: tone || undefined,
        targetAudience: targetAudience || undefined,
        carouselSlides: selectedFormat === 'carousel' ? carouselSlides : undefined,
        videoDuration: selectedFormat === 'video_script' ? videoDuration : undefined,
      });
      
      // Formatar conteúdo baseado no tipo
      let formattedContent = '';
      
      if (selectedFormat === 'video_script' && Array.isArray(aiResponse.content)) {
        // Formatar roteiro de vídeo
        formattedContent = `🎬 **ROTEIRO PARA VÍDEO/REEL**

${aiResponse.content.map((scene: any, index: number) => 
  `${index + 1}. **${scene.time}**\n   📹 ${scene.scene}\n   💬 "${scene.dialogue}"\n`
).join('\n')}`;
      } else if (selectedFormat === 'carousel' && Array.isArray(aiResponse.content)) {
        // Formatar carrossel
        formattedContent = `📱 **CARROSSEL - ${aiResponse.content.length} SLIDES**

${aiResponse.content.map((slide: any, index: number) => 
  `**Slide ${index + 1}:** ${slide.text || slide.content}\n${slide.description ? `📝 ${slide.description}\n` : ''}`
).join('\n')}`;

        // Gerar imagens para o carrossel
        setIsGeneratingImages(true);
        setImageGenerationProgress(0);
        
        try {
          const slides = aiResponse.content.map((slide: any) => ({
            text: slide.text || slide.content,
            description: slide.description || ''
          }));
          
          const images = await ImageService.generateCarouselImages(slides, 'vibrant');
          setCarouselImages(images);
          
          // Atualizar progresso
          setImageGenerationProgress(100);
        } catch (imageError) {
          console.error('Erro ao gerar imagens:', imageError);
          setError('Erro ao gerar imagens do carrossel. O conteúdo foi criado, mas as imagens falharam.');
        } finally {
          setIsGeneratingImages(false);
        }
      } else {
        // Formato padrão (email ou conteúdo simples)
        formattedContent = typeof aiResponse.content === 'string' ? aiResponse.content : JSON.stringify(aiResponse.content);
      }

      const newContent: Content = {
        id: Date.now().toString(),
        title: aiResponse.title,
        content: `${formattedContent}

${aiResponse.hashtags ? `\n${aiResponse.hashtags.join(' ')}` : ''}

${aiResponse.callToAction ? `\n\n${aiResponse.callToAction}` : ''}

📊 **Métricas esperadas:**
• Alcance: ${aiResponse.estimatedReach}
• Engajamento: ${aiResponse.estimatedEngagement}
• Score de Qualidade: ${aiResponse.qualityScore}%`,
        platform: selectedPlatform,
        format: selectedFormat,
        status: 'generated',
        createdAt: new Date(),
        agentId: null, // Sem agente específico por enquanto
        metadata: {
          hashtags: aiResponse.hashtags,
          callToAction: aiResponse.callToAction,
          estimatedReach: aiResponse.estimatedReach,
          estimatedEngagement: aiResponse.estimatedEngagement,
          qualityScore: aiResponse.qualityScore,
        }
      };

      setGenerationProgress(100);
      setGeneratedContent(newContent);
    } catch (err) {
      console.error('Erro ao gerar conteúdo:', err);
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro desconhecido ao gerar conteúdo';
      
      if (err instanceof Error) {
        if (err.message.includes('Resposta muito longa')) {
          errorMessage = 'O conteúdo gerado foi muito extenso. Tente um prompt mais específico ou divida o conteúdo em partes menores.';
        } else if (err.message.includes('formato inválido')) {
          errorMessage = 'A IA retornou uma resposta em formato inválido. Tente novamente com um prompt diferente.';
        } else if (err.message.includes('incompleta')) {
          errorMessage = 'A resposta da IA está incompleta. Tente novamente.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'Muitas requisições. Aguarde alguns segundos e tente novamente.';
        } else if (err.message.includes('API key')) {
          errorMessage = 'Erro de configuração da API. Verifique as configurações.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      clearInterval(progressInterval);
    }
  };

  const handleApprove = () => {
    if (generatedContent) {
      const approvedContent = {
        ...generatedContent,
        status: 'approved' as ContentStatus,
        approvedAt: new Date(),
        // Incluir imagens do carrossel se existirem
        carouselImages: carouselImages.length > 0 ? carouselImages : undefined,
      };
      onContentApproved(approvedContent);
      setGeneratedContent(null);
      setPrompt('');
      setCarouselImages([]); // Limpar imagens após aprovação
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCreateInCanva = async () => {
    if (!generatedContent) return;

    setIsCreatingCanva(true);
    try {
      const project = await createProject(generatedContent);
      // Abrir o projeto no Canva
      window.open(project.url, '_blank');
    } catch (error) {
      console.error('Erro ao criar projeto no Canva:', error);
      setError('Erro ao criar projeto no Canva. Tente novamente.');
    } finally {
      setIsCreatingCanva(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!generatedContent || selectedFormat !== 'carousel') return;

    setIsGeneratingImages(true);
    setImageGenerationProgress(0);
    
    try {
      // Extrair slides do conteúdo gerado
      const contentLines = generatedContent.content.split('\n');
      const slides: Array<{ text: string; description: string }> = [];
      
      let currentSlide: any = null;
      for (const line of contentLines) {
        if (line.includes('**Slide')) {
          if (currentSlide) slides.push(currentSlide);
          currentSlide = { text: line.replace(/^\*\*Slide \d+:\*\* /, ''), description: '' };
        } else if (line.startsWith('📝') && currentSlide) {
          currentSlide.description = line.replace('📝 ', '');
        }
      }
      if (currentSlide) slides.push(currentSlide);
      
      const images = await ImageService.generateCarouselImages(slides, 'vibrant');
      setCarouselImages(images);
      setImageGenerationProgress(100);
    } catch (error) {
      console.error('Erro ao gerar imagens:', error);
      setError('Erro ao gerar imagens do carrossel. Tente novamente.');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const PlatformIcon = platformIcons[selectedPlatform] || Instagram;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Geração de Conteúdo</h2>
          <p className="text-muted-foreground">Crie conteúdo personalizado com agentes IA especializados</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Sparkles className="h-3 w-3 mr-1" />
          IA Ativa
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Gerar Conteúdo</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Solicitar Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => {
                      const Icon = platformIcons[platform] || Instagram;
                      return (
                        <Button
                          key={platform}
                          variant={selectedPlatform === platform ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedPlatform(platform);
                            // Reset format when platform changes
                            const availableFormats = getAvailableFormats(platform);
                            setSelectedFormat(availableFormats[0]);
                          }}
                          className="justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {platform === 'email' ? 'Email Newsletter' : 'Instagram'}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <Label htmlFor="format">Formato</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {getAvailableFormats(selectedPlatform).map((format) => {
                      const Icon = formatIcons[format] || Video;
                      const formatLabels = {
                        video_script: 'Roteiro para Vídeo/Reels',
                        carousel: 'Carrossel',
                        email_newsletter: 'Newsletter'
                      };
                      return (
                        <Button
                          key={format}
                          variant={selectedFormat === format ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFormat(format)}
                          className="justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {formatLabels[format]}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Video Duration Selection - Only show when video_script is selected */}
                {selectedFormat === 'video_script' && (
                  <div className="space-y-2">
                    <Label htmlFor="videoDuration">Duração do vídeo (segundos)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 30, 45, 60, 90, 120, 180, 240].map((duration) => (
                        <Button
                          key={duration}
                          variant={videoDuration === duration ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVideoDuration(duration)}
                          className="justify-center"
                        >
                          {duration}s
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 15-60s para reels, 60-180s para vídeos
                    </p>
                  </div>
                )}

                {/* Carousel Slides Selection - Only show when carousel is selected */}
                {selectedFormat === 'carousel' && (
                  <div className="space-y-2">
                    <Label htmlFor="carouselSlides">Quantidade de slides</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((slides) => (
                        <Button
                          key={slides}
                          variant={carouselSlides === slides ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCarouselSlides(slides)}
                          className="justify-center"
                        >
                          {slides}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 6-8 slides para melhor engajamento
                    </p>
                  </div>
                )}

                <Separator />

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Descreva o conteúdo desejado</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ex: Crie um post sobre sustentabilidade para empresas..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Tone Input */}
                <div className="space-y-2">
                  <Label htmlFor="tone">Tom da comunicação (opcional)</Label>
                  <Textarea
                    id="tone"
                    placeholder="Ex: Profissional, descontraído, motivacional, informativo..."
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                {/* Target Audience Input */}
                <div className="space-y-2">
                  <Label htmlFor="audience">Público-alvo (opcional)</Label>
                  <Textarea
                    id="audience"
                    placeholder="Ex: Profissionais de marketing, jovens de 18-25 anos, empresários..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Erro ao gerar conteúdo</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Gerando conteúdo com IA...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Conectando com OpenAI GPT-4o Mini...</span>
                    </div>
                    {isGeneratingImages && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Conectando com OpenAI DALL-E...</span>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Conteúdo com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PlatformIcon className="h-5 w-5 mr-2" />
                    Preview do Conteúdo
                  </div>
                  {generatedContent && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Gerado
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    {/* Mockup do Post */}
                    <div className="bg-card border rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-bold">AI</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Content AI</p>
                          <p className="text-xs text-muted-foreground">Agora</p>
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <Textarea
                          value={generatedContent.content}
                          onChange={(e) => setGeneratedContent({
                            ...generatedContent,
                            content: e.target.value
                          })}
                          className="min-h-[200px]"
                        />
                      ) : (
                        <div className="text-sm whitespace-pre-line">
                          {generatedContent.content}
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>❤️ 0</span>
                        <span>💬 0</span>
                        <span>🔄 0</span>
                        <span>📤 0</span>
                      </div>
                    </div>

                    {/* Imagens do Carrossel */}
                    {selectedFormat === 'carousel' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Imagens do Carrossel</h4>
                          {isGeneratingImages && (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs text-muted-foreground">
                                Gerando imagens... {imageGenerationProgress}%
                              </span>
                            </div>
                          )}
                        </div>

                        {isGeneratingImages && (
                          <div className="space-y-2">
                            <Progress value={imageGenerationProgress} className="w-full h-1" />
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Conectando com OpenAI DALL-E...</span>
                            </div>
                          </div>
                        )}

                        {carouselImages.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {carouselImages.map((carouselImage) => (
                              <div key={carouselImage.slideNumber} className="border rounded-lg p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">Slide {carouselImage.slideNumber}</span>
                                  <Badge 
                                    variant={carouselImage.status === 'completed' ? 'default' : 'secondary'}
                                    className={`text-xs px-1 py-0 ${
                                      carouselImage.status === 'completed' 
                                        ? 'bg-green-100 text-green-700' 
                                        : carouselImage.status === 'failed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {carouselImage.status === 'completed' ? '✓' : 
                                     carouselImage.status === 'failed' ? '✗' : 
                                     carouselImage.status === 'generating' ? '⏳' : '⏸'}
                                  </Badge>
                                </div>
                                
                                {carouselImage.imageUrl ? (
                                  <div className="space-y-1">
                                    <img 
                                      src={carouselImage.imageUrl} 
                                      alt={`Slide ${carouselImage.slideNumber}`}
                                      className="w-full h-20 object-cover rounded"
                                    />
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {carouselImage.description}
                                    </p>
                                    <div className="flex space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs px-1 py-0 h-5"
                                        onClick={() => window.open(carouselImage.imageUrl, '_blank')}
                                      >
                                        <Copy className="h-2 w-2" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs px-1 py-0 h-5"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = carouselImage.imageUrl!;
                                          link.download = `slide-${carouselImage.slideNumber}.png`;
                                          link.click();
                                        }}
                                      >
                                        <Download className="h-2 w-2" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-20 bg-muted rounded flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                      <Image className="h-4 w-4 mx-auto mb-1" />
                                      <p className="text-xs">
                                        {carouselImage.status === 'generating' ? 'Gerando...' : 
                                         carouselImage.status === 'failed' ? 'Erro' : 'Pendente'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : !isGeneratingImages && (
                          <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Image className="h-6 w-6 mx-auto mb-1" />
                            <p className="text-xs">Nenhuma imagem gerada ainda</p>
                            <p className="text-xs">As imagens serão geradas automaticamente</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? 'Salvar' : 'Editar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                      {(selectedFormat === 'video_script' || selectedFormat === 'carousel') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                          onClick={handleCreateInCanva}
                          disabled={isCreatingCanva}
                        >
                          {isCreatingCanva ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Criando...
                            </>
                          ) : (
                            <>
                              <Palette className="h-4 w-4 mr-2" />
                              Criar no Canva
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Nenhum conteúdo gerado ainda</p>
                    <p className="text-sm">Digite um prompt e clique em "Gerar Conteúdo"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Preview do Conteúdo
                </div>
                {selectedFormat === 'carousel' && generatedContent && carouselImages.length === 0 && (
                  <Button
                    onClick={handleGenerateImages}
                    disabled={isGeneratingImages}
                    variant="outline"
                    size="sm"
                  >
                    {isGeneratingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando Imagens...
                      </>
                    ) : (
                      <>
                        <Palette className="h-4 w-4 mr-2" />
                        Gerar Imagens
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-6">
                  {/* Conteúdo do Post */}
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-bold">AI</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Content AI</p>
                        <p className="text-xs text-muted-foreground">Agora</p>
                      </div>
                    </div>
                    
                    <div className="text-sm whitespace-pre-line mb-3">
                      {generatedContent.content}
                    </div>
                  </div>

                  {/* Imagens do Carrossel */}
                  {selectedFormat === 'carousel' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Imagens do Carrossel</h4>
                        {isGeneratingImages && (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              Gerando imagens... {imageGenerationProgress}%
                            </span>
                          </div>
                        )}
                      </div>

                      {isGeneratingImages && (
                        <Progress value={imageGenerationProgress} className="w-full" />
                      )}

                      {carouselImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {carouselImages.map((carouselImage) => (
                            <div key={carouselImage.slideNumber} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Slide {carouselImage.slideNumber}</span>
                                <Badge 
                                  variant={carouselImage.status === 'completed' ? 'default' : 'secondary'}
                                  className={`text-xs ${
                                    carouselImage.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : carouselImage.status === 'failed'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {carouselImage.status === 'completed' ? '✓' : 
                                   carouselImage.status === 'failed' ? '✗' : 
                                   carouselImage.status === 'generating' ? '⏳' : '⏸'}
                                </Badge>
                              </div>
                              
                              {carouselImage.imageUrl ? (
                                <div className="space-y-2">
                                  <img 
                                    src={carouselImage.imageUrl} 
                                    alt={`Slide ${carouselImage.slideNumber}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {carouselImage.description}
                                  </p>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1 h-6"
                                      onClick={() => window.open(carouselImage.imageUrl, '_blank')}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1 h-6"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = carouselImage.imageUrl!;
                                        link.download = `slide-${carouselImage.slideNumber}.png`;
                                        link.click();
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                                  <div className="text-center text-muted-foreground">
                                    <Image className="h-6 w-6 mx-auto mb-1" />
                                    <p className="text-xs">
                                      {carouselImage.status === 'generating' ? 'Gerando...' : 
                                       carouselImage.status === 'failed' ? 'Erro' : 'Pendente'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Image className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Nenhuma imagem gerada ainda</p>
                          <p className="text-xs">Clique em "Gerar Imagens" para criar as imagens do carrossel</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview em Diferentes Dispositivos */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Preview em Diferentes Dispositivos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Mobile Preview */}
                      <div className="flex flex-col items-center">
                        <h5 className="font-medium mb-3 text-sm">Mobile</h5>
                        <div className="relative">
                          {/* Frame do iPhone */}
                          <div className="w-48 h-96 bg-black rounded-[2.5rem] p-2 shadow-2xl">
                            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                              {/* Notch */}
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10"></div>
                              
                              {/* Status Bar */}
                              <div className="flex justify-between items-center px-4 pt-8 pb-2 text-xs font-semibold">
                                <span>9:41</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-2 border border-black rounded-sm">
                                    <div className="w-3 h-1.5 bg-black rounded-sm m-0.5"></div>
                                  </div>
                                  <div className="w-4 h-2 border border-black rounded-sm">
                                    <div className="w-3 h-1.5 bg-black rounded-sm m-0.5"></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* App Content */}
                              <div className="px-4 py-2 h-full overflow-y-auto">
                                <div className="bg-white border-b pb-3 mb-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-primary-foreground text-xs font-bold">AI</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">Content AI</p>
                                      <p className="text-xs text-muted-foreground">Agora</p>
                                    </div>
                                  </div>
                                  
                                  {/* Carrossel Mobile */}
                                  {selectedFormat === 'carousel' && carouselImages.length > 0 ? (
                                    <div className="space-y-2">
                                      <div className="text-xs font-semibold text-muted-foreground mb-2">
                                        📱 CARROSSEL - {carouselImages.length} SLIDES
                                      </div>
                                      {carouselImages.map((carouselImage) => (
                                        <div key={carouselImage.slideNumber} className="border rounded-lg p-2">
                                          <div className="text-xs font-semibold mb-1">
                                            Slide {carouselImage.slideNumber}:
                                          </div>
                                          {carouselImage.imageUrl ? (
                                            <img 
                                              src={carouselImage.imageUrl} 
                                              alt={`Slide ${carouselImage.slideNumber}`}
                                              className="w-full h-20 object-cover rounded mb-1"
                                            />
                                          ) : (
                                            <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-1">
                                              <span className="text-xs text-muted-foreground">Imagem {carouselImage.slideNumber}</span>
                                            </div>
                                          )}
                                          <div className="text-xs text-muted-foreground">
                                            {carouselImage.description?.substring(0, 60)}...
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs whitespace-pre-line leading-relaxed">
                                      {generatedContent.content.substring(0, 200)}
                                      {generatedContent.content.length > 200 && '...'}
                                    </div>
                                  )}
                                  
                                  {/* Mobile Actions */}
                                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                      <span>👍 12</span>
                                      <span>💬 3</span>
                                      <span>🔄 1</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      📤
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Preview */}
                      <div className="flex flex-col items-center">
                        <h5 className="font-medium mb-3 text-sm">Desktop</h5>
                        <div className="relative">
                          {/* Frame do Desktop */}
                          <div className="w-80 h-64 bg-gray-800 rounded-lg p-2 shadow-2xl">
                            <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
                              {/* Browser Header */}
                              <div className="bg-gray-100 px-3 py-2 flex items-center space-x-2 border-b">
                                <div className="flex space-x-1">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="flex-1 bg-white rounded px-2 py-1 text-xs">
                                  content-ai.com/post/123
                                </div>
                              </div>
                              
                              {/* Desktop Content */}
                              <div className="p-4 h-full overflow-y-auto">
                                <div className="max-w-2xl">
                                  <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-primary-foreground text-sm font-bold">AI</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold">Content AI</p>
                                      <p className="text-sm text-muted-foreground">2 horas atrás</p>
                                    </div>
                                  </div>
                                  
                                  {/* Carrossel Desktop */}
                                  {selectedFormat === 'carousel' && carouselImages.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                      <div className="text-sm font-semibold text-muted-foreground">
                                        🖥️ CARROSSEL - {carouselImages.length} SLIDES
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {carouselImages.map((carouselImage) => (
                                          <div key={carouselImage.slideNumber} className="border rounded-lg p-2">
                                            <div className="text-xs font-semibold mb-1">
                                              Slide {carouselImage.slideNumber}:
                                            </div>
                                            {carouselImage.imageUrl ? (
                                              <img 
                                                src={carouselImage.imageUrl} 
                                                alt={`Slide ${carouselImage.slideNumber}`}
                                                className="w-full h-16 object-cover rounded mb-1"
                                              />
                                            ) : (
                                              <div className="w-full h-16 bg-muted rounded flex items-center justify-center mb-1">
                                                <span className="text-xs text-muted-foreground">Imagem {carouselImage.slideNumber}</span>
                                              </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                              {carouselImage.description?.substring(0, 40)}...
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm whitespace-pre-line leading-relaxed mb-4">
                                      {generatedContent.content.substring(0, 300)}
                                      {generatedContent.content.length > 300 && '...'}
                                    </div>
                                  )}
                                  
                                  {/* Desktop Actions */}
                                  <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                      <span className="flex items-center space-x-1">
                                        <span>👍</span>
                                        <span>24</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span>💬</span>
                                        <span>8</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span>🔄</span>
                                        <span>3</span>
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      📤 Compartilhar
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tablet Preview */}
                      <div className="flex flex-col items-center">
                        <h5 className="font-medium mb-3 text-sm">Tablet</h5>
                        <div className="relative">
                          {/* Frame do iPad */}
                          <div className="w-64 h-80 bg-gray-700 rounded-2xl p-3 shadow-2xl">
                            <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
                              {/* Home Indicator */}
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-400 rounded-full"></div>
                              
                              {/* Status Bar */}
                              <div className="flex justify-between items-center px-4 pt-4 pb-2 text-sm font-semibold">
                                <span>9:41</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-6 h-3 border border-black rounded-sm">
                                    <div className="w-5 h-2.5 bg-black rounded-sm m-0.5"></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Tablet Content */}
                              <div className="px-4 py-2 h-full overflow-y-auto">
                                <div className="bg-white">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-primary-foreground text-sm font-bold">AI</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">Content AI</p>
                                      <p className="text-xs text-muted-foreground">1 hora atrás</p>
                                    </div>
                                  </div>
                                  
                                  {/* Carrossel Tablet */}
                                  {selectedFormat === 'carousel' && carouselImages.length > 0 ? (
                                    <div className="space-y-2 mb-3">
                                      <div className="text-sm font-semibold text-muted-foreground">
                                        📱 CARROSSEL - {carouselImages.length} SLIDES
                                      </div>
                                      {carouselImages.map((carouselImage) => (
                                        <div key={carouselImage.slideNumber} className="border rounded-lg p-2">
                                          <div className="text-xs font-semibold mb-1">
                                            Slide {carouselImage.slideNumber}:
                                          </div>
                                          {carouselImage.imageUrl ? (
                                            <img 
                                              src={carouselImage.imageUrl} 
                                              alt={`Slide ${carouselImage.slideNumber}`}
                                              className="w-full h-18 object-cover rounded mb-1"
                                            />
                                          ) : (
                                            <div className="w-full h-18 bg-muted rounded flex items-center justify-center mb-1">
                                              <span className="text-xs text-muted-foreground">Imagem {carouselImage.slideNumber}</span>
                                            </div>
                                          )}
                                          <div className="text-xs text-muted-foreground">
                                            {carouselImage.description?.substring(0, 50)}...
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm whitespace-pre-line leading-relaxed mb-3">
                                      {generatedContent.content.substring(0, 250)}
                                      {generatedContent.content.length > 250 && '...'}
                                    </div>
                                  )}
                                  
                                  {/* Tablet Actions */}
                                  <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                      <span className="flex items-center space-x-1">
                                        <span>👍</span>
                                        <span>18</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span>💬</span>
                                        <span>5</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <span>🔄</span>
                                        <span>2</span>
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      📤
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Gere um conteúdo para ver o preview</p>
                  <p className="text-sm">As imagens aparecerão automaticamente para carrosséis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance - IA</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent && generatedContent.metadata ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedContent.metadata.estimatedReach}
                      </div>
                      <div className="text-sm text-muted-foreground">Alcance Esperado</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {generatedContent.metadata.estimatedEngagement}
                      </div>
                      <div className="text-sm text-muted-foreground">Taxa de Engajamento</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {generatedContent.metadata.hashtags?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Hashtags Sugeridas</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {generatedContent.metadata.qualityScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Score de Qualidade</div>
                    </div>
                  </div>

                  {generatedContent.metadata.hashtags && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Hashtags Sugeridas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.metadata.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedContent.metadata.callToAction && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Call to Action:</h4>
                      <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
                        {generatedContent.metadata.callToAction}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-700 mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">Gerado por OpenAI GPT-4o Mini</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Este conteúdo foi gerado usando inteligência artificial avançada, 
                      otimizado especificamente para {selectedPlatform} com base nas melhores práticas de marketing digital.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Gere um conteúdo com IA para ver as análises detalhadas</p>
                  <p className="text-sm">A IA fornecerá métricas precisas e hashtags otimizadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
