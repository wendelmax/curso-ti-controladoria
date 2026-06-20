# Curso de TI para Controladoria

SQL, BigQuery, Looker, Tableau e IA aplicados à análise financeira e operacional.

## Para Quem é Este Curso

Profissionais de **controladoria, fiscal e contabilidade** que precisam das habilidades técnicas exigidas pelo mercado.

## O Curso Inclui

- **58 aulas** em 6 módulos + projeto final
- **SQL Playground interativo** com Monaco Editor (autocomplete, intellisense)
- **Banco de dados financeiro fictício** (Grupo Nova Era S.A.) com 15+ tabelas
- **Docker** — deploy em qualquer servidor, zero instalação para o aluno

## Módulos

| Módulo | Carga | Tópicos |
|--------|-------|---------|
| 1 — SQL | 16h | SELECT, WHERE, GROUP BY, JOINs, CTEs, Window Functions, Casos Financeiros |
| 2 — BigQuery | 10h | BQ SQL, Particionamento, Funções Analíticas, Otimização, Datasets Públicos |
| 3 — Looker | 8h | LookML, Dimensões/Medidas, Dashboards, Integração BigQuery |
| 4 — Tableau | 8h | Fundamentos, Visualizações Financeiras, LOD, Dashboards |
| 5 — IA | 10h | ML, Previsão Caixa, Anomalias, Classificação, BigQuery ML, Ferramentas |
| 6 — Projeto | 6h | Pipeline, Análise Vendas, DRE, Previsão, Dashboard, Apresentação |

## Como Executar

### Com Docker (recomendado)

```bash
docker compose up -d
```

Acesse: http://localhost:3000

### Sem Docker (desenvolvimento)

```bash
cd app
npm install
node scripts/build-db.js
npm start
```

## Estrutura do Projeto

```
curso-ti-controladoria/
├── docker-compose.yml
├── app/
│   ├── Dockerfile
│   ├── docusaurus.config.js
│   ├── package.json
│   ├── sidebars.js
│   ├── docs/               # Conteúdo do curso (58 arquivos .md)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SqlPlayground/    # Editor SQL com Monaco + SQL.js
│   │   │   └── SchemaExplorer/    # Explorador de esquema do BD
│   │   ├── pages/
│   │   │   └── playground.jsx     # Página do SQL Playground
│   │   └── css/
│   ├── static/db/          # Banco de dados SQLite
│   ├── scripts/
│   │   └── build-db.js     # Script para gerar o .sqlite
│   └── public/
└── README.md
```

## Tecnologias

- **Docusaurus 3** — Framework de documentação
- **Monaco Editor** — Editor VS Code no navegador
- **SQL.js** — SQLite via WebAssembly (tudo no browser)
- **Docker** — Containerização

## Licença

MIT
