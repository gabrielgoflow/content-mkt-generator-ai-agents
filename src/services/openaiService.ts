import OpenAI from 'openai';
import { OPENAI_CONFIG } from '@/config/openai';
import { Platform } from '@/types';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true, // Necessário para uso no frontend
});

export interface ContentGenerationRequest {
  prompt: string;
  platform: Platform;
  format: 'video_script' | 'carousel' | 'email_newsletter';
  tone?: string;
  targetAudience?: string;
  carouselSlides?: number;
  videoDuration?: number;
}

export interface ContentGenerationResponse {
  title: string;
  content: string | Array<{
    time?: string;
    scene?: string;
    dialogue?: string;
    text?: string;
    description?: string;
  }>;
  hashtags: string[];
  callToAction?: string;
  estimatedReach: string;
  estimatedEngagement: string;
  qualityScore: number;
}

// Prompts específicos para cada plataforma e formato
const platformPrompts: Record<Platform, Record<string, { system: string; format: string }>> = {
  instagram: {
    video_script: {
      system: `Você é um especialista em criação de roteiros para vídeos e reels do Instagram. Crie roteiros envolventes, dinâmicos e que capturem a atenção nos primeiros 3 segundos.
      Use storytelling visual, elementos de suspense, transições criativas e call-to-actions claros. Foque em engajamento e retenção de audiência.
      
      IMPORTANTE:
      - Crie um roteiro que se ajuste exatamente à duração especificada
      - Para vídeos curtos (15-30s): foco em uma ideia principal, ritmo acelerado
      - Para vídeos médios (45-90s): desenvolvimento da história, transições suaves
      - Para vídeos longos (120s+): narrativa completa, desenvolvimento de personagens
      - Sempre inclua timing preciso para cada cena`,
      format: 'Roteiro detalhado para vídeo/reel do Instagram com timing preciso, cenas e diálogos ajustados à duração especificada'
    },
    carousel: {
      system: `Você é um especialista em criação de carrosséis para Instagram. Crie conteúdo educativo, inspiracional ou informativo que funcione perfeitamente em formato de slides.
      Use storytelling sequencial, dicas práticas, dados visuais e elementos que incentivem o swipe. Foque em valor agregado e engajamento.
      
      IMPORTANTE: 
      - Crie exatamente a quantidade de slides solicitada pelo usuário
      - Para cada slide, forneça uma descrição visual concisa (máximo 2 linhas)
      - Descrição deve incluir: elementos principais, cores, estilo e atmosfera
      - Seja específico mas conciso nas descrições`,
      format: 'Conteúdo para carrossel do Instagram com a quantidade de slides especificada, cada um com texto e descrição visual concisa para geração de imagem'
    }
  },
  email: {
    email_newsletter: {
      system: `Você é um especialista em marketing por email e criação de newsletters. Crie conteúdo personalizado, relevante e que gere conversões.
      Use linguagem direta, storytelling envolvente, segmentação clara e call-to-actions estratégicos. Foque em relacionamento, valor e engajamento.`,
      format: 'Newsletter completa com assunto, pré-cabeçalho, conteúdo principal e call-to-action'
    }
  }
};

// Função para retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Se for erro 429 (Too Many Requests) e ainda temos tentativas
      if (error.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Tentativa ${attempt + 1} falhou com 429. Aguardando ${Math.round(delay)}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Se não for erro 429 ou esgotaram as tentativas, relança o erro
      throw error;
    }
  }
  
  throw new Error('Máximo de tentativas excedido');
}

// Função para reparar JSONs incompletos
function repairIncompleteJSON(jsonString: string): string {
  try {
    // Se o JSON termina abruptamente, tentar fechar as estruturas abertas
    let repaired = jsonString.trim();
    
    // Contar chaves e colchetes abertos
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Se termina com vírgula, remover
    if (repaired.endsWith(',')) {
      repaired = repaired.slice(0, -1);
    }
    
    // Se termina com aspas não fechadas, fechar
    if (repaired.match(/"[^"]*$/)) {
      repaired += '"';
    }
    
    // Fechar arrays abertos
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']';
    }
    
    // Fechar objetos abertos
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}';
    }
    
    return repaired;
  } catch (error) {
    throw new Error('Não foi possível reparar o JSON');
  }
}

export async function generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
  try {
    const platformConfig = platformPrompts[request.platform][request.format];
    
    const systemPrompt = `${platformConfig.system}

    Formato: ${platformConfig.format}
    
    Retorne o conteúdo no seguinte formato JSON:
    ${request.format === 'video_script' ? `{
      "title": "Título atrativo do vídeo",
      "content": [
        {
          "time": "0:00 - 0:03",
          "scene": "Descrição da cena visual",
          "dialogue": "Texto que será falado"
        },
        {
          "time": "0:03 - 0:08",
          "scene": "Próxima cena",
          "dialogue": "Continuação do diálogo"
        }
      ],
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
      "callToAction": "Chamada para ação",
      "estimatedReach": "1.5K - 3.0K",
      "estimatedEngagement": "4.0% - 7.0%",
      "qualityScore": 90
    }` : request.format === 'carousel' ? `{
      "title": "Título do carrossel",
      "content": [
        {
          "text": "Texto do slide 1",
          "description": "Descrição concisa da imagem: elementos principais, cores, estilo"
        }
      ],
      "hashtags": ["#hashtag1", "#hashtag2"],
      "callToAction": "Chamada para ação",
      "estimatedReach": "2.0K - 4.0K",
      "estimatedEngagement": "5.0% - 8.0%",
      "qualityScore": 85
    }` : `{
      "title": "Assunto do email",
      "content": "Conteúdo da newsletter formatado",
      "hashtags": [],
      "callToAction": "Chamada para ação",
      "estimatedReach": "500 - 1.2K",
      "estimatedEngagement": "15% - 25%",
      "qualityScore": 88
    }`}`;

    const userPrompt = `Crie um conteúdo sobre: "${request.prompt}"
    
    Plataforma: ${request.platform}
    Formato: ${request.format}
    ${request.tone ? `Tom: ${request.tone}` : ''}
    ${request.targetAudience ? `Público-alvo: ${request.targetAudience}` : ''}
    ${request.format === 'carousel' && request.carouselSlides ? `Quantidade de slides: ${request.carouselSlides}` : ''}
    ${request.format === 'video_script' && request.videoDuration ? `Duração do vídeo: ${request.videoDuration} segundos` : ''}
    
    Certifique-se de que o conteúdo seja:
    - Otimizado para ${request.platform} no formato ${request.format}
    - Engajante e relevante
    - Com hashtags apropriadas (se aplicável)
    - Com métricas realistas de performance
    ${request.format === 'carousel' ? `- Exatamente ${request.carouselSlides || 6} slides com descrições visuais concisas` : ''}
    ${request.format === 'video_script' ? `- Roteiro ajustado para exatamente ${request.videoDuration || 30} segundos com timing preciso` : ''}`;

    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
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
        max_tokens: request.format === 'carousel' ? 3000 : OPENAI_CONFIG.maxTokens, // Mais tokens para carrossel
        temperature: OPENAI_CONFIG.temperature,
        response_format: { type: "json_object" }
      });
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Verificar se a resposta foi cortada
    if (completion.choices[0]?.finish_reason === 'length') {
      throw new Error('Resposta muito longa. Tente um prompt mais específico ou divida o conteúdo.');
    }

    // Validar se é um JSON válido
    let parsedResponse: ContentGenerationResponse;
    try {
      parsedResponse = JSON.parse(response) as ContentGenerationResponse;
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Resposta recebida:', response);
      
      // Tentar reparar JSON incompleto
      try {
        const repairedResponse = repairIncompleteJSON(response);
        parsedResponse = JSON.parse(repairedResponse) as ContentGenerationResponse;
        console.log('JSON reparado com sucesso');
      } catch (repairError) {
        throw new Error('Resposta da IA em formato inválido. Tente novamente.');
      }
    }

    // Validar estrutura básica da resposta
    if (!parsedResponse.title || !parsedResponse.content) {
      throw new Error('Resposta da IA incompleta. Tente novamente.');
    }
    
    return parsedResponse;
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo com OpenAI:', error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error.status === 429) {
      throw new Error('Limite de requisições da OpenAI atingido. Aguarde alguns minutos e tente novamente.');
    } else if (error.status === 401) {
      throw new Error('Chave da API da OpenAI inválida. Verifique suas configurações.');
    } else if (error.status === 403) {
      throw new Error('Acesso negado à API da OpenAI. Verifique suas permissões.');
    } else if (error.status === 500) {
      throw new Error('Erro interno da OpenAI. Tente novamente em alguns minutos.');
    } else if (error.message?.includes('Máximo de tentativas excedido')) {
      throw new Error('Muitas tentativas falharam. Aguarde alguns minutos e tente novamente.');
    }
    
    throw new Error('Falha ao gerar conteúdo. Tente novamente.');
  }
}

// Função para gerar múltiplos conteúdos
export async function generateMultipleContent(
  request: ContentGenerationRequest,
  count: number = 3
): Promise<ContentGenerationResponse[]> {
  const promises = Array.from({ length: count }, () => generateContent(request));
  return Promise.all(promises);
}

// Função para otimizar conteúdo existente
export async function optimizeContent(
  content: string,
  platform: Platform,
  optimizationType: 'engagement' | 'reach' | 'conversion' = 'engagement'
): Promise<string> {
  try {
    const optimizationPrompts = {
      engagement: 'Otimize este conteúdo para maximizar engajamento (likes, comentários, compartilhamentos)',
      reach: 'Otimize este conteúdo para maximizar alcance e visibilidade',
      conversion: 'Otimize este conteúdo para maximizar conversões e ações desejadas'
    };

    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em otimização de conteúdo para ${platform}. ${optimizationPrompts[optimizationType]}.`
          },
          {
            role: 'user',
            content: `Otimize este conteúdo para ${platform}:\n\n${content}`
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature
      });
    });

    return completion.choices[0]?.message?.content || content;
  } catch (error) {
    console.error('Erro ao otimizar conteúdo:', error);
    return content; // Retorna o conteúdo original em caso de erro
  }
}
