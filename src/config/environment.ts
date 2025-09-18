// Configurações de ambiente
export const ENV = {
  // Informações da aplicação
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Content Marketing Generator',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  
  // URLs e endpoints
  BASE_URL: import.meta.env.BASE_URL || '/',
  
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // OpenAI
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_MAX_TOKENS: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '2000'),
  OPENAI_TEMPERATURE: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.7'),
  
  // Canva (opcional)
  CANVA_API_KEY: import.meta.env.VITE_CANVA_API_KEY || '',
  CANVA_API_URL: import.meta.env.VITE_CANVA_API_URL || 'https://api.canva.com/rest/v1',
  
  // Image Generation (opcional)
  IMAGE_API_KEY: import.meta.env.VITE_IMAGE_API_KEY || '',
  IMAGE_API_URL: import.meta.env.VITE_IMAGE_API_URL || 'https://api.openai.com/v1/images/generations',
} as const;

// Validação das configurações
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar configurações obrigatórias
  if (!ENV.SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL não configurada');
  }
  
  if (!ENV.SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY não configurada');
  }
  
  if (!ENV.OPENAI_API_KEY) {
    errors.push('VITE_OPENAI_API_KEY não configurada');
  }
  
  // Verificar formato das URLs
  if (ENV.SUPABASE_URL && !ENV.SUPABASE_URL.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL deve começar com https://');
  }
  
  if (ENV.OPENAI_API_KEY && ENV.OPENAI_API_KEY.length < 20) {
    errors.push('VITE_OPENAI_API_KEY parece inválida (muito curta)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Função para obter configuração segura (sem expor chaves)
export function getSafeConfig() {
  return {
    appName: ENV.APP_NAME,
    appVersion: ENV.APP_VERSION,
    appEnv: ENV.APP_ENV,
    baseUrl: ENV.BASE_URL,
    hasSupabase: !!ENV.SUPABASE_URL,
    hasOpenAI: !!ENV.OPENAI_API_KEY,
    hasCanva: !!ENV.CANVA_API_KEY,
    hasImageAPI: !!ENV.IMAGE_API_KEY,
    openaiModel: ENV.OPENAI_MODEL,
    openaiMaxTokens: ENV.OPENAI_MAX_TOKENS,
    openaiTemperature: ENV.OPENAI_TEMPERATURE,
  };
}

// Log das configurações (apenas em desenvolvimento)
if (ENV.APP_ENV === 'development') {
  console.log('🔧 Configurações de Ambiente:', getSafeConfig());
  
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.warn('⚠️ Configurações inválidas:', validation.errors);
  } else {
    console.log('✅ Todas as configurações estão válidas');
  }
}

export default ENV;
