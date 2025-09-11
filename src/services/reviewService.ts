import OpenAI from 'openai';
import { OPENAI_CONFIG } from '@/config/openai';
import { Content } from '@/types';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true,
});

export interface ReviewRequest {
  contents: Content[];
  reviewType: 'coherence' | 'brand_consistency' | 'engagement_optimization' | 'comparison';
  brandGuidelines?: string;
  targetAudience?: string;
  comparisonMode?: boolean;
}

export interface ReviewResult {
  id: string;
  contentId: string;
  coherenceScore: number;
  issues: string[];
  suggestions: string[];
  status: 'approved' | 'needs_adjustment' | 'critical_issues';
  adjustedContent?: string;
}

export interface ComparisonResult {
  contentId1: string;
  contentId2: string;
  coherenceSimilarity: number;
  differences: string[];
  similarities: string[];
  recommendations: string[];
}

export interface ReviewResponse {
  overallCoherence: number;
  results: ReviewResult[];
  summary: string;
  recommendations: string[];
  needsAdjustment: boolean;
  comparisonResults?: ComparisonResult[];
}

export class ReviewService {
  // Analisar coerência comparativa entre posts
  static async analyzeCoherenceComparison(request: ReviewRequest): Promise<ReviewResponse> {
    try {
      if (request.contents.length < 2) {
        throw new Error('É necessário pelo menos 2 conteúdos para comparação');
      }

      const systemPrompt = `Você é um especialista em análise comparativa de conteúdo e coerência de marca. 
      Analise os conteúdos fornecidos e compare:
      
      1. **Coerência de Mensagem**: Como os conteúdos se relacionam entre si
      2. **Tom de Voz**: Consistência no tom e personalidade
      3. **Estratégia**: Se seguem uma estratégia coordenada
      4. **Diferenças e Similaridades**: Identifique pontos de divergência e convergência
      
      Para cada par de conteúdos, forneça:
      - Score de similaridade de coerência (0-100)
      - Principais diferenças identificadas
      - Pontos de similaridade
      - Recomendações para melhorar a coerência
      
      Retorne no formato JSON especificado.`;

      const userPrompt = `Compare os seguintes conteúdos para análise de coerência:

${request.contents.map((content, index) => `
**Conteúdo ${index + 1}:**
- ID: ${content.id}
- Título: ${content.title}
- Plataforma: ${content.platform}
- Formato: ${content.format}
- Conteúdo: ${content.content}
- Data: ${content.createdAt.toLocaleDateString('pt-BR')}
`).join('\n')}

${request.brandGuidelines ? `\n**Diretrizes da Marca:**\n${request.brandGuidelines}` : ''}
${request.targetAudience ? `\n**Público-Alvo:**\n${request.targetAudience}` : ''}

Retorne no seguinte formato JSON:
{
  "overallCoherence": 85,
  "results": [
    {
      "id": "review-1",
      "contentId": "content-id",
      "coherenceScore": 85,
      "issues": ["Problema identificado"],
      "suggestions": ["Sugestão de melhoria"],
      "status": "approved"
    }
  ],
  "comparisonResults": [
    {
      "contentId1": "content-1-id",
      "contentId2": "content-2-id",
      "coherenceSimilarity": 80,
      "differences": ["Diferença identificada"],
      "similarities": ["Similaridade identificada"],
      "recommendations": ["Recomendação para melhorar coerência"]
    }
  ],
  "summary": "Resumo geral da análise comparativa",
  "recommendations": ["Recomendação geral 1", "Recomendação geral 2"],
  "needsAdjustment": false
}`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const parsedResponse = JSON.parse(response) as ReviewResponse;
      
      return parsedResponse;
    } catch (error) {
      console.error('Erro ao analisar coerência comparativa:', error);
      throw new Error('Falha ao analisar coerência comparativa dos conteúdos');
    }
  }

  // Analisar coerência de um conjunto de conteúdos
  static async analyzeCoherence(request: ReviewRequest): Promise<ReviewResponse> {
    try {
      // Se for modo de comparação, usar o método específico
      if (request.comparisonMode && request.contents.length >= 2) {
        return await this.analyzeCoherenceComparison(request);
      }
      const systemPrompt = `Você é um especialista em revisão de conteúdo e análise de coerência de marca. 
      Analise os conteúdos fornecidos e avalie:
      
      1. **Coerência de Mensagem**: Se os conteúdos transmitem uma mensagem consistente
      2. **Tom de Voz**: Se mantêm o mesmo tom e personalidade da marca
      3. **Qualidade**: Se atendem aos padrões de qualidade esperados
      4. **Engajamento**: Se são otimizados para gerar engajamento
      
      Para cada conteúdo, forneça:
      - Score de coerência (0-100)
      - Problemas identificados
      - Sugestões de melhoria
      - Conteúdo ajustado (se necessário)
      
      Retorne no formato JSON especificado.`;

      const userPrompt = `Analise os seguintes conteúdos para coerência e qualidade:

${request.contents.map((content, index) => `
**Conteúdo ${index + 1}:**
- Título: ${content.title}
- Plataforma: ${content.platform}
- Formato: ${content.format}
- Conteúdo: ${content.content}
- Data: ${content.createdAt.toLocaleDateString('pt-BR')}
`).join('\n')}

${request.brandGuidelines ? `\n**Diretrizes da Marca:**\n${request.brandGuidelines}` : ''}
${request.targetAudience ? `\n**Público-Alvo:**\n${request.targetAudience}` : ''}

Retorne no seguinte formato JSON:
{
  "overallCoherence": 85,
  "results": [
    {
      "id": "review-1",
      "contentId": "content-id",
      "coherenceScore": 85,
      "issues": ["Problema identificado"],
      "suggestions": ["Sugestão de melhoria"],
      "status": "approved",
      "adjustedContent": "Conteúdo ajustado (se necessário)"
    }
  ],
  "summary": "Resumo geral da análise",
  "recommendations": ["Recomendação geral 1", "Recomendação geral 2"],
  "needsAdjustment": false
}`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3, // Menor temperatura para análise mais consistente
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const parsedResponse = JSON.parse(response) as ReviewResponse;
      
      return parsedResponse;
    } catch (error) {
      console.error('Erro ao analisar coerência:', error);
      throw new Error('Falha ao analisar coerência dos conteúdos');
    }
  }

  // Aplicar ajustes sugeridos automaticamente
  static async applyAdjustments(contents: Content[], reviewResults: ReviewResult[]): Promise<Content[]> {
    try {
      const adjustedContents: Content[] = [];

      for (const content of contents) {
        const reviewResult = reviewResults.find(r => r.contentId === content.id);
        
        if (reviewResult && reviewResult.status === 'needs_adjustment' && reviewResult.adjustedContent) {
          // Aplicar ajustes sugeridos
          const adjustedContent = {
            ...content,
            content: reviewResult.adjustedContent,
            status: 'generated' as const,
            metadata: {
              ...content.metadata,
              coherenceScore: reviewResult.coherenceScore,
              adjustmentsApplied: true,
              originalContent: content.content
            }
          };
          adjustedContents.push(adjustedContent);
        } else {
          adjustedContents.push(content);
        }
      }

      return adjustedContents;
    } catch (error) {
      console.error('Erro ao aplicar ajustes:', error);
      throw new Error('Falha ao aplicar ajustes nos conteúdos');
    }
  }

  // Gerar relatório de revisão
  static generateReviewReport(reviewResponse: ReviewResponse): string {
    const { overallCoherence, results, summary, recommendations } = reviewResponse;
    
    let report = `# 📊 Relatório de Revisão Coordenada\n\n`;
    report += `## 🎯 Score Geral de Coerência: ${overallCoherence}%\n\n`;
    
    if (overallCoherence >= 85) {
      report += `✅ **Status: APROVADO**\n`;
      report += `Seus conteúdos estão com excelente coerência! Apenas algumas dicas para otimização:\n\n`;
    } else {
      report += `⚠️ **Status: NECESSITA AJUSTES**\n`;
      report += `Identificamos alguns pontos que podem ser melhorados para aumentar a coerência:\n\n`;
    }

    report += `## 📝 Resumo da Análise\n${summary}\n\n`;

    report += `## 📋 Análise Individual\n`;
    results.forEach((result, index) => {
      report += `### Conteúdo ${index + 1} (Score: ${result.coherenceScore}%)\n`;
      
      if (result.issues.length > 0) {
        report += `**Problemas identificados:**\n`;
        result.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
      }
      
      if (result.suggestions.length > 0) {
        report += `**Sugestões:**\n`;
        result.suggestions.forEach(suggestion => {
          report += `- ${suggestion}\n`;
        });
      }
      report += `\n`;
    });

    report += `## 💡 Recomendações Gerais\n`;
    recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });

    return report;
  }

  // Validar se o range de datas é válido
  static validateDateRange(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
    if (startDate > endDate) {
      return { isValid: false, error: 'Data inicial não pode ser maior que a data final' };
    }
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return { isValid: false, error: 'Range não pode ser maior que 30 dias' };
    }
    
    return { isValid: true };
  }

  // Filtrar conteúdos por range de datas
  static filterContentsByDateRange(contents: Content[], startDate: Date, endDate: Date): Content[] {
    return contents.filter(content => {
      const contentDate = new Date(content.createdAt);
      return contentDate >= startDate && contentDate <= endDate;
    });
  }
}
