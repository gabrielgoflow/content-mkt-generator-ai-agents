// Configurações da OpenAI
export const OPENAI_CONFIG = {
  // API Key - deve ser definida nas variáveis de ambiente
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  
  // Modelo padrão para geração de conteúdo
  model: 'gpt-4o-mini',
  
  // Configurações de geração
  maxTokens: 2000,
  temperature: 0.7,
  
  // Configurações de timeout
  timeout: 30000, // 30 segundos
  
  // Configurações de retry
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
};

// Log das variáveis de ambiente para debug
console.log('🔧 Configurações de Ambiente:');
console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('API Key (primeiros 10 chars):', import.meta.env.VITE_OPENAI_API_KEY ? import.meta.env.VITE_OPENAI_API_KEY.substring(0, 10) + '...' : 'N/A');
console.log('Modo:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);

// Validação da configuração
export function validateOpenAIConfig(): { isValid: boolean; error?: string } {
  if (!OPENAI_CONFIG.apiKey) {
    return {
      isValid: false,
      error: 'API Key da OpenAI não configurada. Defina VITE_OPENAI_API_KEY nas variáveis de ambiente.'
    };
  }
  
  if (OPENAI_CONFIG.apiKey.length < 20) {
    return {
      isValid: false,
      error: 'API Key da OpenAI parece inválida (muito curta).'
    };
  }
  
  return { isValid: true };
}

// Função para obter configuração segura (sem expor a API key)
export function getSafeConfig() {
  return {
    model: OPENAI_CONFIG.model,
    maxTokens: OPENAI_CONFIG.maxTokens,
    temperature: OPENAI_CONFIG.temperature,
    timeout: OPENAI_CONFIG.timeout,
    maxRetries: OPENAI_CONFIG.maxRetries,
    retryDelay: OPENAI_CONFIG.retryDelay,
    hasApiKey: !!OPENAI_CONFIG.apiKey
  };
}
