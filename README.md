# Content AI - Gerador de Conteúdo com Agentes IA

Uma plataforma full-stack para geração automatizada de conteúdo em múltiplas plataformas sociais utilizando agentes IA especializados.

## 🚀 Funcionalidades

### ✨ Feature 1: Geração e Aprovação de Conteúdo
- Interface intuitiva para solicitar conteúdo personalizado
- Agentes IA especializados por plataforma (Instagram, LinkedIn, Twitter, etc.)
- Preview em tempo real do conteúdo gerado
- Sistema de aprovação com edição inline
- Suporte a múltiplos formatos (feed, carrossel, stories, etc.)

### 📅 Feature 2: Pauta Estratégica e Calendário
- Calendário interativo para agendamento de publicações
- Visualização de conteúdo aprovado e agendado
- Interface baseada no design especificado (azul e branco)
- Agendamento inteligente com validação de datas
- Histórico de publicações e métricas

### 🔍 Feature 3: Revisão Coordenada
- Análise de coerência entre conteúdos
- Revisão por range configurável (semanal, mensal, trimestral)
- Sistema de feedback e sugestões de ajustes
- Métricas de qualidade e alinhamento estratégico
- Dashboard com estatísticas de revisão

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **UI Components**: SHADCN/UI + Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Tailwind CSS com tema customizado

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd content-mkt-generator-ai-agents
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Acesse a aplicação em `http://localhost:5173`

## 🎨 Design System

O sistema segue as especificações de design definidas nos documentos:

- **Paleta de Cores**: Azul (#3b82f6) e branco como cores principais
- **Tipografia**: Clara e legível com hierarquia bem definida
- **Layout**: Responsivo com navegação lateral e área central
- **Acessibilidade**: Contraste mínimo de 4.5:1 e navegação por teclado

## 🏗️ Arquitetura

### Estrutura de Componentes
```
src/
├── components/
│   ├── ui/                 # Componentes SHADCN/UI
│   ├── Layout.tsx          # Layout principal
│   ├── ContentGeneration.tsx
│   ├── StrategicCalendar.tsx
│   └── ContentReview.tsx
├── types/
│   └── index.ts           # Definições TypeScript
├── lib/
│   └── utils.ts           # Utilitários
└── App.tsx                # Componente principal
```

### Fluxo de Dados
1. **Geração**: Usuário → Prompt → Agente IA → Preview → Aprovação
2. **Agendamento**: Conteúdo Aprovado → Calendário → Agendamento
3. **Revisão**: Conteúdo → Análise de Coerência → Feedback → Aprovação Final

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📋 Próximos Passos

- [ ] Integração com OpenAI API
- [ ] Backend com Node.js/Express
- [ ] Banco de dados Supabase
- [ ] Sistema de autenticação
- [ ] Métricas e analytics
- [ ] Testes automatizados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através dos issues do GitHub.
