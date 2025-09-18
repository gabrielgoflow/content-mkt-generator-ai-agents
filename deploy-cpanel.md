# 🚀 Deploy no cPanel - Guia Completo

## 📋 Pré-requisitos
- Hospedagem com cPanel
- Acesso ao cPanel
- Node.js disponível (verificar com provedor)
- Domínio configurado

## ⚠️ Limitações do cPanel

### **Desvantagens:**
- ❌ Controle limitado do servidor
- ❌ Pode não ter Node.js disponível
- ❌ Performance limitada
- ❌ Configurações restritas
- ❌ Dependência do provedor

### **Alternativas Recomendadas:**
- ✅ **Netlify** (gratuito para projetos pequenos)
- ✅ **Vercel** (gratuito para projetos pequenos)
- ✅ **GitHub Pages** (gratuito)
- ✅ **Firebase Hosting** (gratuito)

## 🛠️ Deploy no cPanel (Método 1: Upload Manual)

### 1. Preparar Build Local
```bash
# No seu computador local
npm install
npm run build

# Verificar se a pasta dist/ foi criada
ls -la dist/
```

### 2. Compactar Arquivos
```bash
# Criar arquivo ZIP com o conteúdo da pasta dist/
cd dist/
zip -r ../build.zip .
cd ..
```

### 3. Upload via cPanel
1. Acesse seu cPanel
2. Vá em **File Manager**
3. Navegue até a pasta `public_html`
4. Faça upload do arquivo `build.zip`
5. Extraia o arquivo ZIP
6. Mova todos os arquivos da pasta extraída para `public_html`
7. Delete a pasta vazia e o arquivo ZIP

### 4. Configurar .htaccess
Crie um arquivo `.htaccess` na pasta `public_html`:

```apache
# Configuração para SPA (Single Page Application)
RewriteEngine On

# Redirecionar todas as requisições para index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Configurações de cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Configurações de compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Configurações de segurança
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
```

## 🚀 Deploy no cPanel (Método 2: Git)

### 1. Verificar se Git está disponível
```bash
# No terminal do cPanel (se disponível)
git --version
```

### 2. Clonar Repositório
```bash
# Navegar para public_html
cd public_html

# Clonar repositório
git clone https://github.com/SEU_USUARIO/content-mkt-generator-ai-agents.git .

# Instalar dependências (se Node.js estiver disponível)
npm install

# Build do projeto
npm run build

# Mover arquivos do build para public_html
mv dist/* .
rm -rf dist/
```

## ⚙️ Configuração de Variáveis de Ambiente

### 1. Criar arquivo de configuração
Como o cPanel não suporta variáveis de ambiente `.env`, você precisa criar um arquivo de configuração:

```javascript
// config.js
const config = {
  supabase: {
    url: 'https://seu-projeto.supabase.co',
    anonKey: 'sua-chave-anonima'
  },
  openai: {
    apiKey: 'sua-chave-openai',
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7
  },
  canva: {
    apiKey: 'sua-chave-canva',
    apiUrl: 'https://api.canva.com/rest/v1'
  },
  image: {
    apiKey: 'sua-chave-imagem',
    apiUrl: 'https://api.openai.com/v1/images/generations'
  }
};

export default config;
```

### 2. Atualizar imports no código
```javascript
// Em vez de import.meta.env.VITE_SUPABASE_URL
import config from './config.js';
const supabaseUrl = config.supabase.url;
```

## 🔒 Configuração SSL

### 1. SSL Gratuito (Let's Encrypt)
1. Acesse cPanel
2. Vá em **SSL/TLS**
3. Clique em **Let's Encrypt**
4. Selecione seu domínio
5. Clique em **Issue**

### 2. Forçar HTTPS
Adicione ao `.htaccess`:
```apache
# Forçar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🚨 Problemas Comuns no cPanel

### 1. **Erro 404 em rotas**
- Verificar se o `.htaccess` está configurado corretamente
- Verificar se o mod_rewrite está habilitado

### 2. **Variáveis de ambiente não funcionam**
- Usar arquivo de configuração JavaScript
- Verificar se as variáveis estão sendo importadas corretamente

### 3. **Build não funciona**
- Verificar se Node.js está disponível
- Fazer build local e fazer upload dos arquivos

### 4. **Performance lenta**
- Otimizar imagens
- Usar CDN
- Configurar cache no `.htaccess`

## 🎯 Alternativas Recomendadas

### **1. Netlify (Recomendado)**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build do projeto
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Vantagens:**
- ✅ Gratuito para projetos pequenos
- ✅ Deploy automático via Git
- ✅ SSL automático
- ✅ CDN global
- ✅ Formulários e funções serverless

### **2. Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Vantagens:**
- ✅ Gratuito para projetos pequenos
- ✅ Deploy automático via Git
- ✅ SSL automático
- ✅ CDN global
- ✅ Funções serverless

### **3. GitHub Pages**
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar script no package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

**Vantagens:**
- ✅ Completamente gratuito
- ✅ Integração com GitHub
- ✅ SSL automático
- ✅ CDN global

## 📊 Comparação de Custos

| Opção | Custo Mensal | SSL | CDN | Deploy Automático |
|-------|--------------|-----|-----|-------------------|
| cPanel | €5-20 | ✅ | ❌ | ❌ |
| Netlify | Gratuito* | ✅ | ✅ | ✅ |
| Vercel | Gratuito* | ✅ | ✅ | ✅ |
| GitHub Pages | Gratuito | ✅ | ✅ | ✅ |
| Hetzner | €3-12 | ✅ | ❌ | ✅ |

*Gratuito para projetos pequenos

## 🎯 Recomendação Final

**Para seu projeto, recomendo:**

1. **🥇 Netlify** - Melhor opção gratuita
2. **🥈 Vercel** - Alternativa excelente
3. **🥉 Hetzner** - Se precisar de mais controle
4. **❌ cPanel** - Apenas se for obrigatório

### **Por que Netlify?**
- ✅ Deploy em 1 comando
- ✅ SSL automático
- ✅ CDN global
- ✅ Formulários para contato
- ✅ Funções serverless para APIs
- ✅ Preview de branches
- ✅ Rollback fácil

### **Comando de Deploy no Netlify:**
```bash
# Build
npm run build

# Deploy
npx netlify deploy --prod --dir=dist
```

## 🚀 Deploy Rápido no Netlify

### 1. Preparar Projeto
```bash
# Instalar dependências
npm install

# Build
npm run build
```

### 2. Deploy
```bash
# Deploy direto
npx netlify deploy --prod --dir=dist

# Ou conectar com GitHub para deploy automático
npx netlify init
```

### 3. Configurar Variáveis de Ambiente
1. Acesse o dashboard do Netlify
2. Vá em **Site settings** > **Environment variables**
3. Adicione suas variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
   - etc.

### 4. Configurar Domínio
1. Vá em **Domain management**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

**Pronto! Seu site estará online em minutos! 🎉**
