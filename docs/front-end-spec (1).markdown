# Front-End Spec

## 1. Visão de UX/UI
**Descrição Geral:** A interface deve ser moderna, limpa e focada em fluxos de trabalho eficientes para criadores de conteúdo. Use um design responsivo (mobile-first) com paleta de cores neutra (azul e branco como no screenshot), tipografia clara e ícones intuitivos. O foco é simplicidade: navegação lateral para agentes/plataformas, área central para geração/aprovação e menu superior para "Pauta Estratégica".  
**Princípios de Design:** User-centric, acessível (WCAG 2.1), com loading states suaves para chamadas de IA e feedback visual imediato (ex.: botões de aprovação com animações).  
**Público-Alvo:** Usuários de marketing digital, familiarizados com ferramentas como Canva ou Buffer, mas não necessariamente experts em IA.

## 2. Requisitos de Interface
- **Feature 1: Geração e Aprovação de Conteúdo**  
  - **Layout:** Tela principal com campo de entrada de texto ("Crie um post sobre..."), botão "Gerar" e área de visualização do conteúdo gerado.  
  - **Componentes:** Botão "Aprovar" com animação de confirmação (verde), opção de editar o prompt do agente.  
  - **Comportamento:** Feedback em tempo real durante a geração (ex.: spinner), exibição do conteúdo em formato simulado (ex.: mockup de post Instagram).  
- **Feature 2: Pauta Estratégica e Calendário**  
  - **Layout:** Menu superior com dropdown de meses/anos e calendário interativo (baseado no screenshot, com dia destacado em azul e fundo branco).  
  - **Componentes:** Botão "Agendar" após aprovação, tooltip com detalhes da publicação (plataforma, formato), e marcadores visuais para datas agendadas.  
  - **Comportamento:** Seleção de data abre modal para confirmação, com opção de editar ou cancelar.  
- **Feature 3: Revisão Coordenada**  
  - **Layout:** Seção lateral com lista de conteúdos aprovados e área central para revisão (comparação com range configurável).  
  - **Componentes:** Botões "Aprovar Revisão" e "Sugerir Ajustes" com comentários editáveis, indicador de coerência (ex.: barra de progresso).  
  - **Comportamento:** Exibe histórico de conteúdos no range escolhido, com alertas se a coerência for baixa.

## 3. Wireframes Conceituais
- **Tela Principal (Feature 1):** Campo de texto no topo, área de preview ao centro, botão "Aprovar" à direita.  
- **Pauta Estratégica (Feature 2):** Calendário à esquerda, lista de publicações à direita, com design baseado no screenshot (azul para data selecionada, cinza para dias sem publicação).  
- **Revisão (Feature 3):** Lista vertical de conteúdos, área de comparação com histórico e botões de ação ao fundo.

## 4. Diretrizes de Acessibilidade
- Contraste mínimo de 4.5:1 para texto e 3:1 para ícones.  
- Teclado navegável com foco visível.  
- Alternativas de texto para todos os elementos visuais.

## 5. Cronograma Preliminar
- **10 de setembro a 30 de setembro de 2025:** Design inicial de wireframes e protótipos para Features 1 e 2.  
- **1 de outubro a 15 de outubro de 2025:** Desenvolvimento de Feature 3 e testes de usabilidade.  
- **16 de outubro a 31 de outubro de 2025:** Revisão final e entrega de especificações.