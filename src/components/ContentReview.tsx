import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Target,
  Download,
  ThumbsUp,
  ThumbsDown,
  Bot,
  Loader2,
  CalendarDays,
  FileText,
  Sparkles
} from 'lucide-react';
import { Content } from '@/types';
import { ReviewService, ReviewResponse } from '@/services/reviewService';

interface ContentReviewProps {
  approvedContent: Content[];
}

export function ContentReview({ approvedContent }: ContentReviewProps) {
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [adjustedContents, setAdjustedContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedContents, setSelectedContents] = useState<Content[]>([]);
  const [reviewMode, setReviewMode] = useState<'range' | 'single' | 'comparison'>('range');

  const getContentInRange = () => {
    return ReviewService.filterContentsByDateRange(approvedContent, startDate, endDate);
  };

  const handleRequestReview = async () => {
    let contentsToReview: Content[];
    
    if (reviewMode === 'single') {
      if (!selectedContent) {
        setError('Selecione um conteúdo para revisar');
        return;
      }
      contentsToReview = [selectedContent];
    } else if (reviewMode === 'comparison') {
      if (selectedContents.length < 2) {
        setError('Selecione pelo menos 2 conteúdos para comparação');
        return;
      }
      contentsToReview = selectedContents;
    } else {
      contentsToReview = getContentInRange();
      
      if (contentsToReview.length === 0) {
        setError('Nenhum conteúdo encontrado no período selecionado');
        return;
      }

      // Validar range de datas
      const validation = ReviewService.validateDateRange(startDate, endDate);
      if (!validation.isValid) {
        setError(validation.error || 'Range de datas inválido');
        return;
      }
    }

    setIsReviewing(true);
    setError(null);

    try {
      const response = await ReviewService.analyzeCoherence({
        contents: contentsToReview,
        reviewType: reviewMode === 'comparison' ? 'comparison' : 'coherence',
        brandGuidelines: brandGuidelines || undefined,
        targetAudience: targetAudience || undefined,
        comparisonMode: reviewMode === 'comparison',
      });

      setReviewResponse(response);
      
      // Se precisa de ajustes, aplicar automaticamente
      if (response.needsAdjustment) {
        const adjusted = await ReviewService.applyAdjustments(contentsToReview, response.results);
        setAdjustedContents(adjusted);
        setShowAdjustments(true);
      }
    } catch (err) {
      console.error('Erro na revisão:', err);
      setError(err instanceof Error ? err.message : 'Erro ao realizar revisão');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApproveAdjustments = () => {
    // Aplicar ajustes aprovados
    setShowAdjustments(false);
    setReviewResponse(null);
    setAdjustedContents([]);
  };

  const handleRejectAdjustments = () => {
    // Rejeitar ajustes
    setShowAdjustments(false);
    setAdjustedContents([]);
  };

  const contentInRange = getContentInRange();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revisão Coordenada</h2>
          <p className="text-muted-foreground">Agente IA especializado em análise de coerência</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Bot className="h-3 w-3 mr-1" />
            Agente Revisor IA
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="review">Revisar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{contentInRange.length}</p>
                    <p className="text-sm text-muted-foreground">Conteúdos no Período</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">IA</p>
                    <p className="text-sm text-muted-foreground">Agente Revisor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-muted-foreground">Dias Selecionados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {reviewResponse ? reviewResponse.overallCoherence : '--'}%
                    </p>
                    <p className="text-sm text-muted-foreground">Última Coerência</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                Como Funciona a Revisão Coordenada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">1️⃣</div>
                    <h4 className="font-semibold mb-2">Escolha o Modo</h4>
                    <p className="text-sm text-muted-foreground">
                      Período, post específico ou comparação entre posts
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">2️⃣</div>
                    <h4 className="font-semibold mb-2">IA Analisa</h4>
                    <p className="text-sm text-muted-foreground">
                      Agente especializado analisa coerência e compara posts
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">3️⃣</div>
                    <h4 className="font-semibold mb-2">Revise Resultados</h4>
                    <p className="text-sm text-muted-foreground">
                      Veja análise individual e comparativa com recomendações
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {/* Review Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                Modo de Revisão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={reviewMode === 'range' ? 'default' : 'outline'}
                  onClick={() => setReviewMode('range')}
                  className="justify-start"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Revisão por Período
                </Button>
                <Button
                  variant={reviewMode === 'single' ? 'default' : 'outline'}
                  onClick={() => setReviewMode('single')}
                  className="justify-start"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Revisão de Post Específico
                </Button>
                <Button
                  variant={reviewMode === 'comparison' ? 'default' : 'outline'}
                  onClick={() => setReviewMode('comparison')}
                  className="justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparação de Posts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Range Selection */}
          {reviewMode === 'range' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Selecionar Período para Revisão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate.toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdos no Período</Label>
                    <div className="p-2 bg-muted rounded-md text-center">
                      <span className="text-2xl font-bold">{contentInRange.length}</span>
                      <p className="text-sm text-muted-foreground">conteúdos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Single Post Selection */}
          {reviewMode === 'single' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Selecionar Post para Revisão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Filtrar por Período (Opcional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="w-full p-2 border rounded-md"
                        placeholder="Data inicial"
                      />
                      <input
                        type="date"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="w-full p-2 border rounded-md"
                        placeholder="Data final"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Conteúdos Disponíveis ({contentInRange.length})</Label>
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {contentInRange.length > 0 ? (
                        <div className="space-y-1 p-2">
                          {contentInRange.map((content) => (
                            <div
                              key={content.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedContent?.id === content.id 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => setSelectedContent(content)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{content.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {content.content.substring(0, 100)}...
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {content.platform}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {content.format}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {content.createdAt.toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                                {selectedContent?.id === content.id && (
                                  <div className="ml-2">
                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Nenhum conteúdo encontrado no período selecionado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Mode Selection */}
          {reviewMode === 'comparison' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Selecionar Posts para Comparação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Filtrar por Período (Opcional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="w-full p-2 border rounded-md"
                        placeholder="Data inicial"
                      />
                      <input
                        type="date"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="w-full p-2 border rounded-md"
                        placeholder="Data final"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Conteúdos Disponíveis ({contentInRange.length})</Label>
                    <p className="text-sm text-muted-foreground">
                      Selecione pelo menos 2 posts para comparar coerência
                    </p>
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {contentInRange.length > 0 ? (
                        <div className="space-y-1 p-2">
                          {contentInRange.map((content) => {
                            const isSelected = selectedContents.some(c => c.id === content.id);
                            return (
                              <div
                                key={content.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedContents(prev => prev.filter(c => c.id !== content.id));
                                  } else {
                                    setSelectedContents(prev => [...prev, content]);
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{content.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {content.content.substring(0, 100)}...
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {content.platform}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {content.format}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {content.createdAt.toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="ml-2">
                                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Nenhum conteúdo encontrado no período selecionado</p>
                        </div>
                      )}
                    </div>
                    {selectedContents.length > 0 && (
                      <div className="mt-2 p-2 bg-muted rounded-lg">
                        <p className="text-sm font-medium">
                          {selectedContents.length} post(s) selecionado(s) para comparação
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes da Marca (Opcional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandGuidelines">Diretrizes da Marca</Label>
                  <Textarea
                    id="brandGuidelines"
                    placeholder="Ex: Tom profissional, foco em sustentabilidade, linguagem jovem..."
                    value={brandGuidelines}
                    onChange={(e) => setBrandGuidelines(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Público-Alvo</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="Ex: Profissionais de marketing, jovens de 18-25 anos..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Erro</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* Review Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleRequestReview}
              disabled={isReviewing || (
                reviewMode === 'range' ? contentInRange.length === 0 : 
                reviewMode === 'single' ? !selectedContent :
                reviewMode === 'comparison' ? selectedContents.length < 2 : false
              )}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  {reviewMode === 'single' ? 'Revisar Post Selecionado' : 
                   reviewMode === 'comparison' ? 'Comparar Posts Selecionados' : 
                   'Solicitar Revisão'}
                </>
              )}
            </Button>
          </div>

          {/* Review Results */}
          {reviewResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Resultado da Análise IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-4xl font-bold mb-2">
                      {reviewResponse.overallCoherence}%
                    </div>
                    <div className="text-lg font-medium mb-2">
                      {reviewResponse.overallCoherence >= 85 ? '✅ APROVADO' : '⚠️ NECESSITA AJUSTES'}
                    </div>
                    <p className="text-muted-foreground">{reviewResponse.summary}</p>
                    {reviewMode === 'single' && selectedContent && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <h4 className="font-semibold text-sm mb-2">Post Analisado:</h4>
                        <p className="text-sm text-muted-foreground">{selectedContent.title}</p>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedContent.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selectedContent.format}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {selectedContent.createdAt.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Individual Results */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Análise Individual</h4>
                    {reviewResponse.results.map((result, index) => {
                      const content = contentInRange.find(c => c.id === result.contentId);
                      return (
                        <div key={result.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{content?.title || `Conteúdo ${index + 1}`}</h5>
                            <Badge 
                              variant={result.coherenceScore >= 85 ? 'default' : 'destructive'}
                              className={result.coherenceScore >= 85 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                            >
                              {result.coherenceScore}%
                            </Badge>
                          </div>
                          
                          {result.issues.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-red-600">Problemas:</p>
                              <ul className="text-sm text-red-600 list-disc list-inside">
                                {result.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {result.suggestions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-blue-600">Sugestões:</p>
                              <ul className="text-sm text-blue-600 list-disc list-inside">
                                {result.suggestions.map((suggestion, i) => (
                                  <li key={i}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Comparison Results */}
                  {reviewResponse.comparisonResults && reviewResponse.comparisonResults.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Análise Comparativa</h4>
                      {reviewResponse.comparisonResults.map((comparison, index) => {
                        const content1 = selectedContents.find(c => c.id === comparison.contentId1);
                        const content2 = selectedContents.find(c => c.id === comparison.contentId2);
                        return (
                          <div key={index} className="p-4 border rounded-lg bg-blue-50">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-blue-800">
                                Comparação: {content1?.title} ↔ {content2?.title}
                              </h5>
                              <Badge 
                                variant={comparison.coherenceSimilarity >= 80 ? 'default' : 'destructive'}
                                className={comparison.coherenceSimilarity >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                              >
                                {comparison.coherenceSimilarity}% Similaridade
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-green-700 mb-2">✅ Similaridades:</h6>
                                <ul className="text-sm text-green-600 list-disc list-inside space-y-1">
                                  {comparison.similarities.map((similarity, i) => (
                                    <li key={i}>{similarity}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-orange-700 mb-2">⚠️ Diferenças:</h6>
                                <ul className="text-sm text-orange-600 list-disc list-inside space-y-1">
                                  {comparison.differences.map((difference, i) => (
                                    <li key={i}>{difference}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            {comparison.recommendations.length > 0 && (
                              <div className="mt-3">
                                <h6 className="font-medium text-blue-700 mb-2">💡 Recomendações:</h6>
                                <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                                  {comparison.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recomendações Gerais</h4>
                    <ul className="space-y-1">
                      {reviewResponse.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adjustments Approval */}
          {showAdjustments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                  Ajustes Sugeridos pela IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    A IA identificou conteúdos que precisam de ajustes para melhorar a coerência. 
                    Você pode aprovar ou rejeitar os ajustes sugeridos.
                  </p>
                  
                  <div className="space-y-3">
                    {adjustedContents.map((content) => (
                      <div key={content.id} className="p-3 border rounded-lg">
                        <h5 className="font-medium mb-2">{content.title}</h5>
                        <div className="text-sm bg-green-50 p-2 rounded">
                          <strong>Conteúdo ajustado:</strong>
                          <p className="mt-1">{content.content.substring(0, 200)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleRejectAdjustments}
                      variant="outline"
                      className="flex-1"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Rejeitar Ajustes
                    </Button>
                    <Button
                      onClick={handleApproveAdjustments}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Aprovar Ajustes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewResponse ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reviewResponse.overallCoherence}%</div>
                    <div className="text-sm text-muted-foreground">Coerência Geral</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {reviewResponse.results.filter(r => r.coherenceScore >= 85).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Aprovados</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {reviewResponse.results.filter(r => r.coherenceScore < 85).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Precisam Ajustes</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {reviewResponse.comparisonResults ? reviewResponse.comparisonResults.length : contentInRange.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reviewResponse.comparisonResults ? 'Comparações' : 'Total Analisados'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Execute uma revisão para ver os analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewResponse ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Relatório de Análise IA</h4>
                    <div className="text-sm bg-muted p-3 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">
                        {ReviewService.generateReviewReport(reviewResponse)}
                      </pre>
                    </div>
                    <Button variant="outline" className="mt-3">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Execute uma revisão para gerar relatórios</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}