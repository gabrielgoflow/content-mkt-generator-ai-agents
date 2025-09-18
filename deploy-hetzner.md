# 🚀 Deploy na Hetzner Cloud - Guia Completo

## 📋 Pré-requisitos
- Conta na Hetzner Cloud
- Domínio configurado (opcional)
- Conhecimento básico de Linux/SSH

## 🛠️ Configuração do Servidor

### 1. Criar Servidor na Hetzner
```bash
# Escolha uma instância adequada:
# - CX11 (1 vCPU, 2GB RAM) - Para projetos pequenos
# - CX21 (2 vCPU, 4GB RAM) - Recomendado para produção
# - CX31 (2 vCPU, 8GB RAM) - Para projetos maiores
```

### 2. Conectar ao Servidor
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

### 3. Atualizar Sistema
```bash
apt update && apt upgrade -y
```

### 4. Instalar Node.js (versão LTS)
```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 5. Instalar Nginx
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 6. Instalar PM2 (Process Manager)
```bash
npm install -g pm2
```

## 📁 Preparação do Projeto

### 1. Clonar Repositório
```bash
# Criar diretório para o projeto
mkdir -p /var/www/content-mkt-generator
cd /var/www/content-mkt-generator

# Clonar repositório (substitua pela URL do seu repo)
git clone https://github.com/SEU_USUARIO/content-mkt-generator-ai-agents.git .

# Ou fazer upload via SCP/SFTP
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

**Configuração do .env para produção:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# OpenAI Configuration
VITE_OPENAI_API_KEY=sua-chave-openai
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_MAX_TOKENS=2000
VITE_OPENAI_TEMPERATURE=0.7

# Canva API Configuration (opcional)
VITE_CANVA_API_KEY=sua-chave-canva
VITE_CANVA_API_URL=https://api.canva.com/rest/v1

# Image Generation API Configuration (opcional)
VITE_IMAGE_API_KEY=sua-chave-imagem
VITE_IMAGE_API_URL=https://api.openai.com/v1/images/generations
```

### 4. Build do Projeto
```bash
# Build para produção
npm run build

# Verificar se o build foi criado
ls -la dist/
```

## ⚙️ Configuração do Nginx

### 1. Criar Configuração do Site
```bash
nano /etc/nginx/sites-available/content-mkt-generator
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;
    
    root /var/www/content-mkt-generator/dist;
    index index.html;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configurações de cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Configuração para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Configurações de compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

### 2. Ativar Site
```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/content-mkt-generator /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

## 🔒 Configuração SSL (Let's Encrypt)

### 1. Instalar Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 2. Obter Certificado SSL
```bash
# Substitua pelo seu domínio
certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com
```

### 3. Configurar Renovação Automática
```bash
# Testar renovação
certbot renew --dry-run

# Adicionar ao crontab para renovação automática
crontab -e

# Adicionar esta linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Deploy Automatizado com PM2

### 1. Criar Script de Deploy
```bash
nano /var/www/content-mkt-generator/deploy.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

# Ir para o diretório do projeto
cd /var/www/content-mkt-generator

# Fazer pull das últimas alterações
echo "📥 Atualizando código..."
git pull origin main

# Instalar/atualizar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "dist" ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Recarregar Nginx
    systemctl reload nginx
    
    echo "🎉 Deploy concluído!"
else
    echo "❌ Erro no build!"
    exit 1
fi
```

### 2. Tornar Script Executável
```bash
chmod +x /var/www/content-mkt-generator/deploy.sh
```

### 3. Executar Deploy
```bash
./deploy.sh
```

## 🔄 Configuração de CI/CD (Opcional)

### 1. Criar Webhook no GitHub
```bash
# Instalar webhook receiver
npm install -g github-webhook-handler

# Criar script de webhook
nano /var/www/webhook.js
```

**Conteúdo do webhook.js:**
```javascript
const http = require('http');
const exec = require('child_process').exec;
const createHandler = require('github-webhook-handler');

const handler = createHandler({ path: '/webhook', secret: 'SEU_SECRET' });

http.createServer((req, res) => {
  handler(req, res, (err) => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777);

handler.on('push', (event) => {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
  
  exec('/var/www/content-mkt-generator/deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('Deploy error:', error);
      return;
    }
    console.log('Deploy successful:', stdout);
  });
});
```

### 2. Executar Webhook
```bash
# Usar PM2 para gerenciar o webhook
pm2 start /var/www/webhook.js --name webhook
pm2 save
pm2 startup
```

## 📊 Monitoramento

### 1. Configurar Logs
```bash
# Ver logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Ver logs do sistema
journalctl -u nginx -f
```

### 2. Monitoramento de Recursos
```bash
# Instalar htop para monitoramento
apt install htop -y

# Ver uso de recursos
htop
```

## 🛡️ Configurações de Segurança

### 1. Firewall
```bash
# Instalar UFW
apt install ufw -y

# Configurar regras
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

### 2. Atualizações Automáticas
```bash
# Instalar unattended-upgrades
apt install unattended-upgrades -y

# Configurar
dpkg-reconfigure -plow unattended-upgrades
```

## 🎯 Comandos Úteis

```bash
# Ver status dos serviços
systemctl status nginx
systemctl status certbot.timer

# Reiniciar serviços
systemctl restart nginx
systemctl reload nginx

# Ver logs em tempo real
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Verificar configuração do Nginx
nginx -t

# Ver processos PM2
pm2 list
pm2 logs
pm2 restart all
```

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Erro 502 Bad Gateway**
   - Verificar se o Nginx está rodando
   - Verificar configuração do site

2. **SSL não funciona**
   - Verificar se o domínio aponta para o servidor
   - Verificar se a porta 80 está aberta

3. **Build falha**
   - Verificar variáveis de ambiente
   - Verificar dependências

4. **Site não carrega**
   - Verificar logs do Nginx
   - Verificar se os arquivos estão na pasta dist/

## 💰 Estimativa de Custos

- **CX11**: ~€3.29/mês
- **CX21**: ~€5.83/mês (recomendado)
- **CX31**: ~€11.83/mês
- **Domínio**: ~€10-15/ano
- **SSL**: Gratuito (Let's Encrypt)

**Total mensal**: ~€6-12/mês
