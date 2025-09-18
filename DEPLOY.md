# 🚀 Guia de Deploy - Content Marketing Generator

## 📋 Opções de Deploy

### 🥇 **Recomendado: Netlify (Gratuito)**
```bash
# 1. Build do projeto
npm run build

# 2. Deploy
npm run deploy:netlify
```

### 🥈 **Alternativa: Vercel (Gratuito)**
```bash
# 1. Build do projeto
npm run build

# 2. Deploy
npm run deploy:vercel
```

### 🥉 **Controle Total: Hetzner Cloud**
```bash
# Siga o guia completo em deploy-hetzner.md
```

### ❌ **Não Recomendado: cPanel**
```bash
# Siga o guia em deploy-cpanel.md (apenas se obrigatório)
```

## ⚙️ Configuração Pré-Deploy

### 1. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.production.example .env

# Editar com suas credenciais
nano .env
```

### 2. Testar Build Local
```bash
# Build para produção
npm run build:prod

# Testar localmente
npm run preview
```

### 3. Verificar Tamanho do Build
```bash
# Analisar bundle
npm run analyze
```

## 🎯 Deploy Rápido no Netlify

### Método 1: Deploy Manual
```bash
# 1. Build
npm run build

# 2. Deploy
npx netlify deploy --prod --dir=dist
```

### Método 2: Deploy Automático via Git
1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push!

### Configurações no Netlify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` ou `20`

## 🔒 Variáveis de Ambiente Necessárias

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_OPENAI_API_KEY=sua-chave-openai
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_MAX_TOKENS=2000
VITE_OPENAI_TEMPERATURE=0.7
```

## 🚨 Troubleshooting

### Build Falha
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Build novamente
npm run build
```

### Erro de Variáveis de Ambiente
- Verificar se todas as variáveis estão configuradas
- Verificar se começam com `VITE_`
- Verificar se não há espaços extras

### Erro 404 em Rotas
- Configurar redirects para SPA
- Verificar configuração do servidor

## 📊 Comparação de Opções

| Opção | Custo | SSL | CDN | Deploy Auto | Controle |
|-------|-------|-----|-----|-------------|----------|
| Netlify | Gratuito* | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| Vercel | Gratuito* | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| Hetzner | €3-12/mês | ✅ | ❌ | ✅ | ⭐⭐⭐⭐⭐ |
| cPanel | €5-20/mês | ✅ | ❌ | ❌ | ⭐ |

*Gratuito para projetos pequenos

## 🎉 Próximos Passos

1. **Escolha uma opção** de deploy
2. **Configure as variáveis** de ambiente
3. **Faça o deploy**
4. **Configure seu domínio** personalizado
5. **Teste todas as funcionalidades**

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build
2. Verifique as variáveis de ambiente
3. Teste localmente primeiro
4. Consulte os guias detalhados

**Boa sorte com seu deploy! 🚀**
