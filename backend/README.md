# Psicologo Backend (Projeto 2)

API REST para clinica psicologica com Node.js + Express, incluindo:
- CRUD de pacientes
- CRUD de agendamentos (com preco automatico por faixa de horario)
- CRUD de regras de precificacao
- CRUD de custos fixos e variaveis
- Dashboard e relatorios financeiros por periodo
- Transcricao de audio com AssemblyAI

## Stack
- Node.js
- Express
- CORS
- dotenv
- multer
- axios
- fs (nativo)
- Nodemon
- Persistencia JSON (MVP)

## Estrutura

```text
/backend
|-- src
|   |-- app.js
|   |-- server.js
|   |-- routes
|   |   |-- patient.routes.js
|   |   |-- appointment.routes.js
|   |   |-- pricing.routes.js
|   |   |-- cost.routes.js
|   |   |-- report.routes.js
|   |   |-- transcription.routes.js
|   |-- controllers
|   |   |-- patient.controller.js
|   |   |-- appointment.controller.js
|   |   |-- pricing.controller.js
|   |   |-- cost.controller.js
|   |   |-- report.controller.js
|   |   |-- transcription.controller.js
|   |-- services
|   |   |-- storage.service.js
|   |   |-- pricing.service.js
|   |   |-- finance.service.js
|   |   |-- assemblyai.service.js
|   |-- middlewares
|   |   |-- error.middleware.js
|   |-- utils
|   |   |-- appError.js
|   |   |-- date.utils.js
|   |   |-- validation.utils.js
|   |-- config
|   |   |-- env.js
|-- data
|   |-- db.json
|-- uploads
|-- .env.example
|-- package.json
|-- README.md
```

## Como rodar local

1. Entre na pasta do backend:

```bash
cd backend
```

2. Instale as dependencias:

```bash
npm install
```

3. Crie seu arquivo .env com base no exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Execute em modo desenvolvimento:

```bash
npm run dev
```

API local padrao: `http://localhost:3000`

## Configuracao do .env

Use este modelo:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,https://seu-frontend.vercel.app
ASSEMBLYAI_API_KEY=sua_chave_aqui
ASSEMBLYAI_BASE_URL=https://api.assemblyai.com/v2
```

Observacoes:
- Nunca exponha `ASSEMBLYAI_API_KEY` no frontend.
- Configure `CORS_ORIGIN` com os dominios do frontend (Vercel).
- Para analise pos-transcricao via n8n, configure `N8N_ANALYSIS_WEBHOOK_URL`.
- Em producao, use URL de webhook publicada no n8n. URLs com `/webhook-test/` funcionam apenas em modo de teste.

## Endpoints obrigatorios

### Pacientes
- POST `/patients`
- GET `/patients`
- GET `/patients/:id`
- PUT `/patients/:id`
- DELETE `/patients/:id`

### Agendamentos
- POST `/appointments`
- GET `/appointments`
- GET `/appointments/:id`
- PUT `/appointments/:id`
- DELETE `/appointments/:id`

### Precificacao
- POST `/pricing-rules`
- GET `/pricing-rules`
- GET `/pricing-rules/:id`
- PUT `/pricing-rules/:id`
- DELETE `/pricing-rules/:id`

### Custos
- POST `/costs`
- GET `/costs`
- GET `/costs/:id`
- PUT `/costs/:id`
- DELETE `/costs/:id`

### Dashboard e relatorios
- GET `/dashboard`
- GET `/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Transcricao
- POST `/transcribe` (multipart/form-data com campo `audio`)
  - Retorna `text`, `summary` e, quando configurado, `analysis` com a resposta do n8n.

## Regras de negocio implementadas

1. Agendamento exige `patientId`, `date`, `time` e calcula `value` automaticamente.
2. Se nao existir faixa de preco para o horario, retorna erro 400.
3. Custos suportam `type: fixed | variable`, `name`, `amount`, `referenceMonth` (opcional).
4. Financeiro:
   - lucro bruto = soma de agendamentos
   - custos totais = soma de custos
   - lucro liquido = lucro bruto - custos totais

## Exemplos de teste (curl)

### 1) Criar paciente

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Souza",
    "email": "ana@exemplo.com",
    "phone": "11999990000"
  }'
```

### 2) Criar regra de preco

```bash
curl -X POST http://localhost:3000/pricing-rules \
  -H "Content-Type: application/json" \
  -d '{
    "startHour": "08:00",
    "endHour": "12:00",
    "price": 100
  }'
```

### 3) Criar agendamento

```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "date": "2026-04-20",
    "time": "09:30",
    "notes": "Sessao inicial"
  }'
```

### 4) Criar custo

```bash
curl -X POST http://localhost:3000/costs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fixed",
    "name": "Aluguel",
    "amount": 1500,
    "referenceMonth": "2026-04"
  }'
```

### 5) Dashboard

```bash
curl http://localhost:3000/dashboard
```

### 6) Relatorio por periodo

```bash
curl "http://localhost:3000/reports?startDate=2026-04-01&endDate=2026-04-30"
```

### 7) Transcrever audio

```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@/caminho/para/audio.wav"
```

Resposta de sucesso esperada:

```json
{
  "text": "conteudo transcrito",
  "summary": "resumo da reuniao"
}
```

## Fluxo AssemblyAI (implementado)

1. Upload local com multer (campo `audio`)
2. Upload do binario para `/upload` na AssemblyAI
3. Criacao da transcricao em `/transcript` com sumarizacao habilitada
4. Polling ate `completed` ou `error`
5. Retorno de `text` e `summary`
6. Remocao do arquivo temporario em `uploads` com `fs.unlink`

## Deploy no Render

### 1) Criar Web Service
- Conecte o repositorio.
- Runtime: Node

Configuracao recomendada:
- Root Directory: `backend`

Alternativa (se Root Directory ficar vazio na raiz do repositorio):
- O projeto raiz ja possui scripts que encaminham para `backend`, entao tambem funciona.

### 2) Build e Start command
- Build Command:

```bash
npm run build
```

- Start Command:

```bash
npm start
```

### 3) Variaveis de ambiente no painel do Render
Cadastre:
- `PORT` (opcional, Render geralmente injeta automaticamente)
- `NODE_ENV=production`
- `CORS_ORIGIN=https://seu-frontend.vercel.app`
- `ASSEMBLYAI_API_KEY=<sua-chave>`
- `ASSEMBLYAI_BASE_URL=https://api.assemblyai.com/v2`

## Seguranca e boas praticas aplicadas
- Validacao de entradas em todos os endpoints
- Sanitizacao minima de strings
- Middleware global de erro
- Sem stack trace em producao
- Segredos protegidos via `.env`
- CORS configuravel para frontend na Vercel

## Persistencia atual e migracao recomendada (PostgreSQL + Prisma)

Este MVP usa JSON local (`data/db.json`) para acelerar validacao de negocio.

Para producao SaaS, recomendacao:
1. Adicionar Prisma + PostgreSQL.
2. Criar modelos: Patient, Appointment, PricingRule, Cost.
3. Substituir `storage.service.js` por repositorios Prisma.
4. Manter controllers/services atuais e trocar apenas camada de persistencia.
5. Adicionar migracoes e indices (especialmente em `date`, `referenceMonth`, `patientId`).
