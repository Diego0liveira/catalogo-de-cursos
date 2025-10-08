<p align="center">
  <img src="frontend/src/assets/logo-technova.svg" alt="TechNova Academy" width="140" />
</p>

# <img src="frontend/src/assets/logo-technova.svg" alt="TechNova Academy" width="32" /> Catálogo de Cursos 🎓📚

Aplicação de catálogo de cursos com backend Spring Boot (Java 17) e frontend Angular 19 em modo Standalone (sem NgModule), com suporte opcional a SSR.

## Estrutura do Projeto 🧱

- `backend/` — API Spring Boot
- `frontend/` — Aplicação Angular (Standalone + SSR opcional)

## Pré‑requisitos ⚙️

- Java 17 (JDK)
- Node.js 18+ (recomendado 18 ou 20)
- npm 9+
- Angular CLI 19+ (opcional, você pode usar os scripts do `package.json`)

## Backend (Spring Boot) 🧰

- Instalação/Execução (Windows):
  - Na pasta `backend`: `.\mvnw.cmd spring-boot:run`
- Instalação/Execução (Linux/macOS):
  - Na pasta `backend`: `./mvnw spring-boot:run`
- URL: `http://localhost:8080`
- Testes:
  - Windows: `.\mvnw.cmd test`
  - Linux/macOS: `./mvnw test`

### API REST (principais endpoints) 🔗

- `GET /api/courses` — Lista todos os cursos
- `GET /api/courses?titulo={termo}` — Busca cursos por título
- `POST /api/courses` — Cria um novo curso
- `GET /api/events` — Lista eventos de criação de cursos

## Frontend (Angular) 💻

- Instalação:

  - Na pasta `frontend`: `npm install`

- Execução (Dev):

  - Na pasta `frontend`: `npm start`
  - Padrão em `http://localhost:4200`
  - Proxy configurado em `frontend/proxy.conf.json`:
    - Rota `/api` → `http://localhost:8080`
    - `pathRewrite` remove o prefixo `/api`
  - Se precisar mudar a porta: `ng serve --proxy-config proxy.conf.json --port 4300`

- SSR (opcional):

  - Dev SSR: `npm run dev:ssr`
  - Build SSR: `npm run build:ssr`
  - Serve SSR: `npm run serve:ssr`

- Testes unitários:

  - `ng test --no-watch --browsers=ChromeHeadless`

- Testes E2E (Cypress):
  - Base URL configurada em `frontend/cypress.config.ts`: `http://localhost:4200`
  - Headless: `npm run e2e:headless` (garanta o frontend rodando antes)
  - Interativo: `npm run e2e` ou `npm run e2e:open`

## Rodando tudo junto (Dev) 🏃

1. Inicie o backend:
   - Windows: `.\mvnw.cmd spring-boot:run`
   - Linux/macOS: `./mvnw spring-boot:run`
2. Inicie o frontend:
   - `cd frontend && npm start`
3. Acesse `http://localhost:4200` (frontend) com chamadas ao backend via proxy `/api`.

## Notas de Arquitetura (Frontend Standalone) 🏗️

- `AppComponent` é `standalone: true` (sem `AppModule`).
- Bootstrap do cliente em `src/main.ts` com `bootstrapApplication(AppComponent, appConfig)`.
- Rotas em `src/app/app.routes.ts` (lista, cadastro e detalhes de cursos).
- Provedores em `src/app/app.config.ts`:
  - `provideRouter(routes)` (routing)
  - `provideClientHydration()` (hidratação no cliente)
  - `provideHttpClient()` (HTTP)
  - `provideAnimations()` (animações)

## Scripts úteis (frontend) 📜

- `npm start` — `ng serve --proxy-config proxy.conf.json`
- `npm run build` — Build de produção
- `npm run dev:ssr` — Dev server com SSR
- `npm run build:ssr` — Build SSR
- `npm run serve:ssr` — Servir build SSR
- `npm run test` — Testes unitários (Karma/Jasmine)
- `npm run e2e:headless` — Cypress em modo headless
- `npm run e2e` / `npm run e2e:open` — Cypress interativo

## Solução de Problemas 🧯

- `NullInjectorError: No provider for HttpClient`:
  - Verifique se `provideHttpClient()` está em `app.config.ts`.
- Erros `NG6008`/`NG6009` (Standalone vs NgModule):
  - Remova `AppModule` e garanta que `AppComponent` seja `standalone`.
- Conflito de portas:
  - Use `--port` no `ng serve` (ex.: `--port 4300`).
- Falhas de E2E por URL:
  - Certifique-se de que o frontend está em `http://localhost:4200` conforme `cypress.config.ts`.

## Decisões Técnicas e Trade‑offs 🧠

- Backend em Spring Boot 3.2 (Java 21) para compatibilidade e melhorias da plataforma; requisito pedia Java 17, adotamos 21 por ser 17+ e suportado no stack atual.
- Persistência H2 em memória no perfil de desenvolvimento para rapidez; trade‑off: dados são voláteis entre execuções.
- Evento de domínio `CourseCreated` publicado com `ApplicationEventPublisher` (in‑memory) para simplicidade; trade‑off: sem entrega garantida ou persistência — em produção migraria para mensageria (ex.: Kafka/RabbitMQ).
- OpenAPI/Swagger habilitado via `springdoc-openapi` para documentação rápida dos endpoints.
- Frontend Angular Standalone (sem NgModule) por redução de boilerplate e inicialização direta com `bootstrapApplication`; trade‑off: exige atenção à migração de providers e rotas.
- Busca imediata no frontend chamando `GET /api/courses?q=...` a cada alteração; trade‑off: maior número de requisições em digitação rápida. Alternativa: `debounceTime + switchMap` (diferencial opcional).
- Proxy do Angular (`/api` → `http://localhost:8080`) com `pathRewrite` para separar camadas e simular API Gateway em dev.
- Testes unitários cobrindo serviços e componentes críticos; priorizamos correções que mantêm feedback de `loading/sucesso/erro` no formulário.

## Proxy do Angular (API Gateway simulado) 🔁

- Arquivo: `frontend/proxy.conf.json`.
- Mapeamento: requisições para `'/api'` são direcionadas para `http://localhost:8080`.
- `pathRewrite`: remove o prefixo `'/api'`, então `GET /api/courses` vira `GET /courses` no backend.
- Execução: `ng serve --proxy-config proxy.conf.json` (já encapsulado em `npm start`).
- Benefício: evita CORS em dev e espelha roteamento de um API Gateway.

## OpenAPI/Swagger (opcional) 📖

- Dependência: `springdoc-openapi-starter-webmvc-ui`.
- Acesso em dev: `http://localhost:8080/swagger-ui/index.html`.
- Especificação: `http://localhost:8080/v3/api-docs`.

## Uso de IA 🤖

- Ferramenta: assistente de IA integrado ao IDE (Trae AI).
- Onde ajudou:
  - Ajustes no `CourseFormComponent` para estados `loading/sucesso/erro` e correção de testes.
  - Tratamento de ID inválido em `CourseDetailsComponent` e mensagem de erro consistente.
  - Revisão e atualização deste `README` (passo a passo, scripts e proxy).
  - Organização de testes e validação com preview local.
- Tipo de auxílio: geração/edição de trechos de código (Reactive Forms, RxJS), diagnóstico de falhas de teste e documentação.
