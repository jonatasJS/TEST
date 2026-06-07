# Roadmap de Melhorias - CyberVapes

## Status Legend
- ✅ Concluído
- 🚧 Em Progresso
- ⏳ Planejado
- 📋 Backlog

---

## ✅ Funcionalidades Implementadas

### Sistema de E-commerce Básico
- ✅ Catálogo de produtos
- ✅ Carrinho de compras
- ✅ Sistema de pedidos
- ✅ Autenticação de usuários
- ✅ Painel administrativo
- ✅ Integração Mercado Pago (PIX e pagamento na entrega)
- ✅ Sistema de promoções/descontos
- ✅ Notificações push

### Campos de Endereço Separados
- ✅ Schema atualizado com campos separados (cep, street, number, complement, neighborhood, city, state)
- ✅ Migration criada (0002_add_address_fields.sql)
- ✅ CartPage atualizado com campos separados
- ✅ AccountPage atualizado com campos separados
- ✅ Backend atualizado para handle campos separados
- ✅ Preenchimento automático de dados do usuário no checkout

### Correções de Descontos
- ✅ Fix endpoint de promoções ativas (/promotions/active)
- ✅ Fix comparação de datas no backend (JavaScript ao invés de SQL)
- ✅ Logging para debug de promoções
- ✅ Mercado Pago items enviados separadamente com preço unitário

---

## 🚧 Prioridade Alta (Imediato - Próximos 1-2 dias)

### 1. Autocomplete de CEP (ViaCEP) ⭐⭐⭐⭐⭐
**Status:** ✅ Concluído
**Prioridade:** 1
**Impacto:** UX imediata, reduz tempo de checkout, diminui erros

**Tarefas:**
- [x] Criar serviço para buscar CEP na API ViaCEP
- [x] Integrar no CartPage (campo CEP)
- [x] Integrar no AccountPage (campo CEP)
- [x] Preencher campos automaticamente (rua, bairro, cidade, estado)
- [x] Tratar erros (CEP inválido, API offline)
- [x] Adicionar loading state

**Implementação:**
- API ViaCEP gratuita: `https://viacep.com.br/ws/${cep}/json/`
- Debounce para evitar múltiplas requests
- Fallback para preenchimento manual

---

### 2. Toast Notifications ⭐⭐⭐⭐⭐
**Status:** ✅ Concluído
**Prioridade:** 2
**Impacto:** UX profissional, menos intrusivo que alerts

**Tarefas:**
- [x] Instalar/configurar react-hot-toast (já instalado)
- [x] Substituir todos `alert()` por `toast()`
- [x] Configurar toasts de sucesso, erro, loading
- [x] Adicionar toasts customizados para ações específicas
- [x] Testar em todos os fluxos

**Locais substituídos:**
- CartPage.tsx (5 alerts)
- Account.tsx (1 alert)
- ProductDetails.tsx (1 alert)
- AdminPromotions.tsx (3 alerts)
- AdminOrders.tsx (1 alert)
- AdminClients.tsx (2 alerts)
- AdminProducts.tsx (2 alerts)
- AdminDashboard.tsx (2 alerts)
- AdminCategories.tsx (2 alerts)
- hooks/useCart.tsx (3 alerts)

---

### 3. Skeleton Loading ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 3
**Impacto:** Melhora percepção de performance

**Tarefas:**
- [ ] Criar componente Skeleton
- [ ] Implementar em Home.tsx (hero products)
- [ ] Implementar em Catalog.tsx (lista de produtos)
- [ ] Implementar em ProductDetails.tsx
- [ ] Implementar em CartPage.tsx
- [ ] Implementar em Account.tsx (pedidos)

---

## 🚧 Prioridade Alta (Curto Prazo - Próxima Semana)

### 4. Recuperação de Senha ⭐⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 4
**Impacto:** Funcionalidade crítica de segurança/UX

**Tarefas:**
- [ ] Criar endpoint POST /auth/forgot-password
- [ ] Criar endpoint POST /auth/reset-password
- [ ] Adicionar tabela password_resets no schema
- [ ] Criar migration para password_resets
- [ ] Implementar envio de email com token
- [ ] Criar página ForgotPassword.tsx
- [ ] Criar página ResetPassword.tsx
- [ ] Adicionar link "Esqueci minha senha" no Login
- [ ] Validar token (expiração, uso único)
- [ ] Testar fluxo completo

---

### 5. Verificação de Email ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 5
**Impacto:** Segurança adicional, lista de emails válida

**Tarefas:**
- [ ] Adicionar campo emailVerified no schema
- [ ] Criar migration para emailVerified
- [ ] Criar endpoint POST /auth/verify-email
- [ ] Criar endpoint POST /auth/resend-verification
- [ ] Implementar envio de email de verificação após registro
- [ ] Criar página VerifyEmail.tsx
- [ ] Mostrar aviso se email não verificado
- [ ] Bloquear certas ações se email não verificado
- [ ] Testar fluxo completo

---

### 6. Rate Limiting ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 6
**Impacto:** Proteção contra abuso/ataques

**Tarefas:**
- [ ] Instalar express-rate-limit
- [ ] Configurar rate limiter geral
- [ ] Configurar rate limiter para login (mais restrito)
- [ ] Configurar rate limiter para registro
- [ ] Configurar rate limiter para checkout
- [ ] Adicionar headers de rate limit nas respostas
- [ ] Testar limites
- [ ] Documentar configurações

---

## 🚧 Prioridade Alta (Médio Prazo - Próximas 2 Semanas)

### 7. Favoritos/Lista de Desejos ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 7
**Impacto:** Aumenta conversão, engajamento

**Tarefas:**
- [ ] Criar tabela favorites no schema
- [ ] Criar migration para favorites
- [ ] Criar endpoints CRUD para favorites
- [ ] Adicionar botão de favoritar nos produtos
- [ ] Criar página Favorites.tsx
- [ ] Adicionar no menu de navegação
- [ ] Notificar quando produto favorito estiver em promoção
- [ ] Testar fluxo completo

---

### 8. Avaliação de Produtos ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 8
**Impacto:** Social proof, aumenta conversão

**Tarefas:**
- [ ] Criar tabela reviews no schema
- [ ] Criar migration para reviews
- [ ] Criar endpoints CRUD para reviews
- [ ] Adicionar sistema de estrelas (1-5)
- [ ] Implementar formulário de review
- [ ] Mostrar reviews na página de produto
- [ ] Mostrar média de estrelas nos cards
- [ ] Sistema de moderação (admin aprova)
- [ ] Permitir fotos nos reviews
- [ ] Testar fluxo completo

---

### 9. Sistema de Cupons ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 9
**Impacto:** Marketing, conversão

**Tarefas:**
- [ ] Criar tabela coupons no schema
- [ ] Criar migration para coupons
- [ ] Criar endpoints CRUD para coupons (admin)
- [ ] Criar endpoint para validar cupom no checkout
- [ ] Adicionar campo de cupom no CartPage
- [ ] Implementar lógica de desconto por cupom
- [ ] Limitar uso por cupom
- [ ] Limitar uso por usuário
- [ ] Analytics de uso de cupons
- [ ] Testar fluxo completo

---

### 10. Rastreamento de Pedidos ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 10
**Impacto:** UX pós-venda, reduz suporte

**Tarefas:**
- [ ] Adicionar campos de tracking no schema orders
- [ ] Criar migration para tracking fields
- [ ] Atualizar webhook para receber status de transporte
- [ ] Criar timeline visual de status
- [ ] Adicionar página de rastreamento
- [ ] Notificar usuário de mudanças de status
- [ ] Integrar com API de transportadora (opcional)
- [ ] Testar fluxo completo

---

## 📋 Backlog (Todos os 105 Pontos)

### 1. Autocomplete de CEP (ViaCEP) ⭐⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 1
**Subpontos:**
- [ ] Criar serviço para buscar CEP na API ViaCEP
- [ ] Integrar no CartPage (campo CEP)
- [ ] Integrar no AccountPage (campo CEP)
- [ ] Preencher campos automaticamente (rua, bairro, cidade, estado)
- [ ] Tratar erros (CEP inválido, API offline)
- [ ] Adicionar loading state
- [ ] Debounce para evitar múltiplas requests
- [ ] Fallback para preenchimento manual

### 2. Toast Notifications ⭐⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 2
**Subpontos:**
- [ ] Instalar/configurar react-hot-toast
- [ ] Substituir todos `alert()` por `toast()`
- [ ] Configurar toasts de sucesso, erro, loading
- [ ] Adicionar toasts customizados para ações específicas
- [ ] Testar em todos os fluxos
- [ ] Substituir em CartPage.tsx
- [ ] Substituir em Account.tsx
- [ ] Substituir em ProductDetails.tsx
- [ ] Substituir em AdminPromotions.tsx

### 3. Skeleton Loading ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 3
**Subpontos:**
- [ ] Criar componente Skeleton
- [ ] Implementar em Home.tsx (hero products)
- [ ] Implementar em Catalog.tsx (lista de produtos)
- [ ] Implementar em ProductDetails.tsx
- [ ] Implementar em CartPage.tsx
- [ ] Implementar em Account.tsx (pedidos)
- [ ] Implementar em AdminPromotions.tsx
- [ ] Implementar em AdminProducts.tsx

### 4. Recuperação de Senha ⭐⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 4
**Subpontos:**
- [ ] Criar tabela password_resets no schema
- [ ] Criar migration para password_resets
- [ ] Criar endpoint POST /auth/forgot-password
- [ ] Criar endpoint POST /auth/reset-password
- [ ] Implementar envio de email com token
- [ ] Criar página ForgotPassword.tsx
- [ ] Criar página ResetPassword.tsx
- [ ] Adicionar link "Esqueci minha senha" no Login
- [ ] Validar token (expiração, uso único)
- [ ] Testar fluxo completo

### 5. Verificação de Email ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 5
**Subpontos:**
- [ ] Adicionar campo emailVerified no schema
- [ ] Criar migration para emailVerified
- [ ] Criar endpoint POST /auth/verify-email
- [ ] Criar endpoint POST /auth/resend-verification
- [ ] Implementar envio de email de verificação após registro
- [ ] Criar página VerifyEmail.tsx
- [ ] Mostrar aviso se email não verificado
- [ ] Bloquear certas ações se email não verificado
- [ ] Testar fluxo completo

### 6. Rate Limiting ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 6
**Subpontos:**
- [ ] Instalar express-rate-limit
- [ ] Configurar rate limiter geral
- [ ] Configurar rate limiter para login (mais restrito)
- [ ] Configurar rate limiter para registro
- [ ] Configurar rate limiter para checkout
- [ ] Adicionar headers de rate limit nas respostas
- [ ] Testar limites
- [ ] Documentar configurações

### 7. Favoritos/Lista de Desejos ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 7
**Subpontos:**
- [ ] Criar tabela favorites no schema
- [ ] Criar migration para favorites
- [ ] Criar endpoints CRUD para favorites
- [ ] Adicionar botão de favoritar nos produtos
- [ ] Criar página Favorites.tsx
- [ ] Adicionar no menu de navegação
- [ ] Notificar quando produto favorito estiver em promoção
- [ ] Testar fluxo completo

### 8. Avaliação de Produtos ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 8
**Subpontos:**
- [ ] Criar tabela reviews no schema
- [ ] Criar migration para reviews
- [ ] Criar endpoints CRUD para reviews
- [ ] Adicionar sistema de estrelas (1-5)
- [ ] Implementar formulário de review
- [ ] Mostrar reviews na página de produto
- [ ] Mostrar média de estrelas nos cards
- [ ] Sistema de moderação (admin aprova)
- [ ] Permitir fotos nos reviews
- [ ] Testar fluxo completo

### 9. Sistema de Cupons ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 9
**Subpontos:**
- [ ] Criar tabela coupons no schema
- [ ] Criar migration para coupons
- [ ] Criar endpoints CRUD para coupons (admin)
- [ ] Criar endpoint para validar cupom no checkout
- [ ] Adicionar campo de cupom no CartPage
- [ ] Implementar lógica de desconto por cupom
- [ ] Limitar uso por cupom
- [ ] Limitar uso por usuário
- [ ] Analytics de uso de cupons
- [ ] Testar fluxo completo

### 10. Rastreamento de Pedidos ⭐⭐⭐⭐
**Status:** ⏳ Planejado
**Prioridade:** 10
**Subpontos:**
- [ ] Adicionar campos de tracking no schema orders
- [ ] Criar migration para tracking fields
- [ ] Atualizar webhook para receber status de transporte
- [ ] Criar timeline visual de status
- [ ] Adicionar página de rastreamento
- [ ] Notificar usuário de mudanças de status
- [ ] Integrar com API de transportadora (opcional)
- [ ] Testar fluxo completo

### 11. Dark/Light Mode
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar sistema de temas
- [ ] Criar context para tema
- [ ] Adicionar toggle de tema
- [ ] Salvar preferência no localStorage
- [ ] Atualizar variáveis CSS
- [ ] Testar em todas as páginas

### 12. Responsividade Mobile (Melhorar)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Otimizar para telas pequenas
- [ ] Criar menu mobile
- [ ] Touch-friendly buttons
- [ ] Otimizar layout mobile
- [ ] Testar em diversos dispositivos

### 13. Lazy Loading de Imagens
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar lazy loading
- [ ] Adicionar placeholder enquanto carrega
- [ ] Usar Intersection Observer
- [ ] Otimizar carregamento de imagens
- [ ] Testar performance

### 14. Progress Indicator no Checkout
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar componente de steps
- [ ] Mostrar etapas do checkout
- [ ] Indicar etapa atual
- [ ] Permitir voltar etapas
- [ ] Validar por etapa

### 15. Animações e Transições
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Transições suaves entre páginas
- [ ] Micro-interações
- [ ] Feedback visual
- [ ] Framer Motion integration
- [ ] Performance optimization

### 16. Quick View de Produtos
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar modal de quick view
- [ ] Carregar dados do produto
- [ ] Adicionar ao carrinho direto do modal
- [ ] Implementar em cards de produtos
- [ ] Testar UX

### 17. Produtos Relacionados
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar lógica de produtos relacionados
- [ ] "Quem comprou também comprou"
- [ ] Produtos da mesma categoria
- [ ] Cross-sell/Up-sell
- [ ] Mostrar na página de produto

### 18. Comparação de Produtos
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar página de comparação
- [ ] Adicionar botão de comparar
- [ ] Tabela comparativa
- [ ] Comparar características
- [ ] Limitar número de produtos

### 19. Cache de Produtos (Redis)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Redis
- [ ] Implementar cache de produtos
- [ ] Configurar TTL
- [ ] Invalidar cache em updates
- [ ] Monitorar hit rate

### 20. Otimização de Imagens
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar compressão automática
- [ ] Converter para WebP
- [ ] Responsive images
- [ ] Lazy loading
- [ ] CDN integration

### 21. CDN para Assets
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar CDN (Cloudflare/Cloudinary)
- [ ] Mover assets estáticos
- [ ] Configurar cache headers
- [ ] Edge caching
- [ ] Testar performance

### 22. Webhooks para Pagamentos (Melhorar)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Melhorar tratamento de webhooks
- [ ] Processamento assíncrono
- [ ] Retry automático
- [ ] Logging de webhooks
- [ ] Dashboard de webhooks

### 23. Filas de Processamento (Bull/Agenda)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Bull/Agenda
- [ ] Criar filas de jobs
- [ ] Envio de emails em background
- [ ] Processamento de pedidos
- [ ] Monitoramento de filas

### 24. Logging Estruturado (Winston)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Winston
- [ ] Definir níveis de log
- [ ] Log para arquivo
- [ ] Log para console
- [ ] Envio para serviço externo

### 25. Monitoramento e Alertas (Sentry)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Sentry
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Alertas de erro
- [ ] Dashboard de erros

### 26. Backup Automático
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar backup diário
- [ ] Backup do banco de dados
- [ ] Retention policy
- [ ] Restore rápido
- [ ] Testar restore

### 27. Health Checks
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar endpoint de health
- [ ] Verificar dependências
- [ ] Verificar banco de dados
- [ ] Load balancer integration
- [ ] Monitoramento contínuo

### 28. 2FA (Two-Factor Authentication)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar Google Authenticator
- [ ] SMS verification
- [ ] Backup codes
- [ ] QR code setup
- [ ] Testar fluxo

### 29. OAuth Social Login
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Google OAuth
- [ ] Configurar Facebook OAuth
- [ ] Configurar Apple OAuth
- [ ] Simplificar cadastro
- [ ] Link accounts

### 30. CSRF Protection
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar tokens CSRF
- [ ] Verificar em formulários
- [ ] Double submit cookie
- [ ] Testar proteção
- [ ] Documentar

### 31. XSS Protection
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Sanitizar inputs
- [ ] Content Security Policy
- [ ] Escape outputs
- [ ] DOMPurify integration
- [ ] Testar vulnerabilidades

### 32. SQL Injection Prevention
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Parameterized queries
- [ ] ORM (Drizzle já protege)
- [ ] Input validation
- [ ] SQL injection tests
- [ ] Security audit

### 33. Secure Headers (Helmet.js)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Instalar Helmet.js
- [ ] Configurar HSTS
- [ ] Configurar CSP
- [ ] Configurar X-Frame-Options
- [ ] Testar headers

### 34. Input Validation (Joi/Zod)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Instalar Joi/Zod
- [ ] Criar schemas de validação
- [ ] Validar no backend
- [ ] Mensagens de erro claras
- [ ] Testar validação

### 35. Password Strength
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar requisitos mínimos
- [ ] Hash com bcrypt/argon2
- [ ] Expiração de senha
- [ ] Indicador de força
- [ ] Testar segurança

### 36. Audit Logs
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar tabela audit_logs
- [ ] Log ações administrativas
- [ ] Rastrear mudanças
- [ ] Filtros por usuário/data
- [ ] Compliance

### 37. Google Analytics
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar GA4
- [ ] Track page views
- [ ] Event tracking
- [ ] E-commerce tracking
- [ ] Custom dimensions

### 38. Heatmaps (Hotjar)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Hotjar
- [ ] Comportamento do usuário
- [ ] Otimizar layout
- [ ] Session recordings
- [ ] Form analytics

### 39. A/B Testing
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar ferramenta de A/B
- [ ] Testar variações
- [ ] Medir conversão
- [ ] Otimizar funil
- [ ] Statistical significance

### 40. Dashboard de Vendas
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar dashboard admin
- [ ] Gráficos de receita
- [ ] Produtos mais vendidos
- [ ] Métricas em tempo real
- [ ] Exportar dados

### 41. Customer Segmentation
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Segmentar por comportamento
- [ ] Campanhas personalizadas
- [ ] Retargeting
- [ ] LTV calculation
- [ ] Churn prediction

### 42. Funnel Analysis
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Taxa de conversão
- [ ] Abandono de carrinho
- [ ] Otimizar etapas
- [ ] Drop-off points
- [ ] Improvement suggestions

### 43. Product Analytics
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Track visualizações
- [ ] Track adições ao carrinho
- [ ] Taxa de conversão por produto
- [ ] Popular products
- [ ] Search analytics

### 44. User Behavior
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Session recording
- [ ] Click tracking
- [ ] Scroll depth
- [ ] Time on page
- [ ] User flows

### 45. Attribution
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Origem do tráfego
- [ ] ROI por canal
- [ ] UTM parameters
- [ ] Multi-touch attribution
- [ ] Otimizar marketing

### 46. Cohort Analysis
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Retenção de usuários
- [ ] LTV (Lifetime Value)
- [ ] Churn prediction
- [ ] Cohort grouping
- [ ] Retention curves

### 47. Email Marketing
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar SendGrid/Mailgun
- [ ] Newsletter
- [ ] Abandono de carrinho
- [ ] Recomendações personalizadas
- [ ] Templates

### 48. WhatsApp Integration
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar WhatsApp Business API
- [ ] Notificações via WhatsApp
- [ ] Chat de suporte
- [ ] Compartilhamento
- [ ] Bot automático

### 49. Programa de Fidelidade
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar sistema de pontos
- [ ] Pontos por compra
- [ ] Níveis de cliente
- [ ] Recompensas
- [ ] Gamification

### 50. Sistema de Indicação
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar sistema de referral
- [ ] Indicar amigos
- [ ] Ganhar desconto
- [ ] Rastrear indicações
- [ ] Payout

### 51. Countdown Timer
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar componente timer
- [ ] Urgência em promoções
- [ ] Timer de oferta
- [ ] Aumentar conversão
- [ ] Design atraente

### 52. Scarcity
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Mostrar estoque limitado
- [ ] "Últimas unidades"
- [ ] Aumentar conversão
- [ ] Honestidade no estoque
- [ ] Alertas de estoque baixo

### 53. Social Proof
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] "X pessoas comprando"
- [ ] Reviews visíveis
- [ ] Trust badges
- [ ] Testimonials
- [ ] Social media mentions

### 54. Upsell e Cross-sell
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Produtos complementares
- [ ] "Frequentemente comprado junto"
- [ ] Aumentar ticket médio
- [ ] Algoritmo de recomendação
- [ ] A/B testing

### 55. Dynamic Pricing
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Preços baseados em demanda
- [ ] Descontos progressivos
- [ ] Maximizar revenue
- [ ] Regras de pricing
- [ ] Analytics

### 56. Flash Sales
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Promoções relâmpago
- [ ] Ofertas por tempo limitado
- [ ] Gerar urgência
- [ ] Banner promocional
- [ ] Notificações

### 57. Dashboard Avançado
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] KPIs principais
- [ ] Gráficos interativos
- [ ] Exportar dados
- [ ] Real-time updates
- [ ] Customização

### 58. Gestão de Estoque
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Alertas de estoque baixo
- [ ] Previsão de demanda
- [ ] Reabastecimento automático
- [ ] Multi-warehouse
- [ ] Inventory sync

### 59. Relatórios Detalhados
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Vendas por período
- [ ] Performance de produtos
- [ ] Análise de clientes
- [ ] Exportar CSV/PDF
- [ ] Agendamento

### 60. Gestão de Pedidos (Melhorar)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Filtros avançados
- [ ] Ações em lote
- [ ] Exportar CSV
- [ ] Status customizáveis
- [ ] Notificações

### 61. Gestão de Clientes
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Ver histórico de compras
- [ ] Segmentar clientes
- [ ] Notas sobre cliente
- [ ] LTV calculation
- [ ] Communication history

### 62. Gestão de Promoções (Melhorar)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar promoções complexas
- [ ] Regras avançadas
- [ ] Analytics de promoções
- [ ] A/B testing
- [ ] Automatização

### 63. Bulk Operations
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Editar produtos em lote
- [ ] Atualizar preços
- [ ] Alterar categorias
- [ ] Import/Export
- [ ] Validation

### 64. Import/Export
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Importar produtos CSV
- [ ] Exportar dados
- [ ] Sincronizar com ERP
- [ ] Validation
- [ ] Error handling

### 65. Permissões e Roles
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Roles customizáveis
- [ ] Permissões granulares
- [ ] Audit trail
- [ ] Role hierarchy
- [ ] Dynamic permissions

### 66. Activity Log
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Log de ações
- [ ] Filtros por usuário/data
- [ ] Reverter ações
- [ ] Search logs
- [ ] Export logs

### 67. Gateway de Pagamento Alternativo (Stripe)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Stripe
- [ ] Credit card processing
- [ ] Subscriptions
- [ ] Webhooks
- [ ] Fallback

### 68. Apple Pay/Google Pay
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Apple Pay
- [ ] Configurar Google Pay
- [ ] Pagamento mobile
- [ ] One-click checkout
- [ ] Aumentar conversão

### 69. Integração com Correios
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Cálculo de frete
- [ ] Rastreamento
- [ ] Etiquetas
- [ ] Coleta
- [ ] API integration

### 70. Integração com Transportadoras
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Jadlog integration
- [ ] Sedex integration
- [ ] Cotação em tempo real
- [ ] Seleção automática
- [ ] Tracking

### 71. ERP Integration
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Sincronizar estoque
- [ ] Sincronizar pedidos
- [ ] Contabilidade
- [ ] Financial sync
- [ ] Real-time sync

### 72. CRM Integration
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] HubSpot integration
- [ ] Salesforce integration
- [ ] Sincronizar clientes
- [ ] Marketing automation
- [ ] Data mapping

### 73. Social Media
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Auto-post produtos
- [ ] Social login
- [ ] Social sharing
- [ ] Social feed
- [ ] Analytics

### 74. Analytics Tools
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Google Analytics 4
- [ ] Facebook Pixel
- [ ] TikTok Pixel
- [ ] Custom events
- [ ] Conversion tracking

### 75. Email Service (SendGrid)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar SendGrid
- [ ] Templates
- [ ] Analytics de emails
- [ ] Bounce handling
- [ ] Spam protection

### 76. SMS Service (Twilio)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Twilio
- [ ] Notificações SMS
- [ ] 2FA via SMS
- [ ] Templates
- [ ] Cost optimization

### 77. PWA (Progressive Web App)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Offline mode
- [ ] Push notifications
- [ ] Install prompt

### 78. Service Worker
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Cache offline
- [ ] Background sync
- [ ] Update strategy
- [ ] Cache management
- [ ] Fallback pages

### 79. Mobile App (React Native)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] App nativo iOS
- [ ] App nativo Android
- [ ] Push notifications
- [ ] Biometria
- [ ] Deep linking

### 80. Deep Linking
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Links diretos para produtos
- [ ] Universal links
- [ ] App links
- [ ] Attribution
- [ ] Testing

### 81. Biometric Authentication
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Face ID integration
- [ ] Touch ID integration
- [ ] Login rápido
- [ ] Pagamento seguro
- [ ] Fallback

### 82. SEO Otimizado
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Meta tags dinâmicas
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Structured data
- [ ] Open Graph

### 83. Blog/Conteúdo
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar tabela de posts
- [ ] CMS para blog
- [ ] Artigos sobre produtos
- [ ] Tutoriais
- [ ] SEO content

### 84. FAQ Dinâmico
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar tabela de FAQs
- [ ] Perguntas frequentes
- [ ] Buscável
- [ ] Categorizado
- [ ] Searchable

### 85. Página de Produto Detalhada
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Descrição rica
- [ ] Especificações técnicas
- [ ] Galeria de fotos
- [ ] Videos
- [ ] Reviews

### 86. Canonical URLs
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Evitar duplicate content
- [ ] Estrutura de URLs
- [ ] Breadcrumbs
- [ ] Redirects
- [ ] Sitemap

### 87. TypeScript Strict Mode
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Habilitar strict
- [ ] Corrigir tipos
- [ ] Melhor type safety
- [ ] No implicit any
- [ ] Strict null checks

### 88. Testes Automatizados
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Coverage reports
- [ ] CI integration

### 89. CI/CD Pipeline
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] GitHub Actions
- [ ] Auto-deploy
- [ ] Testes automáticos
- [ ] Build optimization
- [ ] Rollback

### 90. Code Quality
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] ESLint strict
- [ ] Prettier
- [ ] Pre-commit hooks (Husky)
- [ ] Lint-staged
- [ ] Commit lint

### 91. Documentation
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] API docs (Swagger)
- [ ] Component docs (Storybook)
- [ ] Architecture docs
- [ ] README updates
- [ ] Onboarding docs

### 92. Error Tracking (Sentry)
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Configurar Sentry
- [ ] Error boundaries
- [ ] User-friendly errors
- [ ] Source maps
- [ ] Release tracking

### 93. Performance Monitoring
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Lighthouse CI
- [ ] Web Vitals
- [ ] Performance budgets
- [ ] RUM (Real User Monitoring)
- [ ] Alerts

### 94. Bundle Optimization
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Lazy loading
- [ ] Bundle analysis
- [ ] Minification

### 95. Database Indexes
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Índices em colunas frequentes
- [ ] Query optimization
- [ ] Explain analyze
- [ ] Composite indexes
- [ ] Index maintenance

### 96. Refactoring
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Organizar components
- [ ] Extract hooks
- [ ] DRY principle
- [ ] SOLID principles
- [ ] Code review

### 97. Verificação de Idade
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Popup de confirmação
- [ ] LGPD compliance
- [ ] Produtos restritos
- [ ] Cookie de confirmação
- [ ] Log de confirmação

### 98. Informações de Nicotina
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Mostrar mg/ml
- [ ] Classificação por força
- [ ] Avisos de saúde
- [ ] Comparação de nicotina
- [ ] Educational content

### 99. Comparador de Sabores
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Perfil de sabor
- [ ] Recomendações
- [ ] Reviews de sabor
- [ ] Tags de sabor
- [ ] Similarity algorithm

### 100. Guia de Iniciantes
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Como usar pods
- [ ] Diferença entre tipos
- [ ] FAQ específico
- [ ] Vídeos tutoriais
- [ ] Glossário

### 101. Programa de Reciclagem
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Pontos por devolução
- [ ] Locais de coleta
- [ ] Sustentabilidade
- [ ] Parcerias
- [ ] Tracking

### 102. Guest Checkout
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Permitir compra sem cadastro
- [ ] Opção de criar conta após compra
- [ ] Validação de email
- [ ] Session management
- [ ] Conversion tracking

### 103. Busca Avançada
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Filtros por preço
- [ ] Filtros por categoria
- [ ] Filtros por sabor
- [ ] Ordenação por relevância
- [ ] Ordenação por preço
- [ ] Ordenação por popularidade
- [ ] Sugestões de busca
- [ ] Search analytics

### 104. Endereços Múltiplos
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar tabela addresses
- [ ] Salvar vários endereços
- [ ] Selecionar endereço no checkout
- [ ] Endereço padrão
- [ ] CRUD de endereços

### 105. Multi-idioma
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar i18n
- [ ] Traduzir interface
- [ ] Traduzir produtos
- [ ] Seleção de idioma
- [ ] SEO multilíngue

### 106. Moedas Múltiplas
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Implementar multi-currency
- [ ] Conversão em tempo real
- [ ] Seleção de moeda
- [ ] Formatação local
- [ ] Payment processing

### 107. One-click Checkout
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Salvar dados de pagamento
- [ ] Tokenização
- [ ] Checkout rápido
- [ ] Security (PCI DSS)
- [ ] Mobile optimization

### 108. Lista de Presentes
**Status:** ⏳ Planejado
**Subpontos:**
- [ ] Criar wishlist pública
- [ ] Compartilhar lista
- [ ] Comprar para alguém
- [ ] Notificação de compra
- [ ] Privacy settings

---

## Notas

- Este roadmap é dinâmico e pode ser atualizado conforme necessidades
- Prioridades podem mudar baseado em feedback de usuários e necessidades do negócio
- Itens marcados como "Planejado" podem ser movidos para "Em Progresso" quando iniciados
- Sempre documentar decisões técnicas e razões para prioridades

---

**Última atualização:** 07/06/2026
**Próxima revisão:** Semanal
