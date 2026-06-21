# Prática com Datasets Públicos do BigQuery

Imagine que você quer praticar SQL contábil, mas não tem dados reais da sua empresa para testar. O que fazer? O Google disponibiliza **dezenas de bancos de dados públicos e gratuitos** para você explorar.

É como ter uma loja de departamentos de dados: você entra, pega o que precisa (de graça), e faz suas análises. E o melhor: são dados reais de empresas como Apple, Microsoft e Bloomberg.

## Por que isso importa para você?

Na controladoria, você muitas vezes precisa:
- Comparar indicadores da sua empresa com o mercado
- Estudar demonstrações financeiras de concorrentes
- Praticar SQL sem risco de quebrar dados de produção

Com os datasets públicos, você faz tudo isso sem custo e sem risco.

## Acessando `bigquery-public-data`

Para usar os dados públicos, basta referenciá-los no formato:

```sql
FROM `bigquery-public-data.nome_dataset.nome_tabela`;
```

:::tip É como pegar um livro na biblioteca
O prefixo `bigquery-public-data` é o "endereço" da biblioteca. O `nome_dataset` é a "estante". E `nome_tabela` é o "livro" que você quer consultar. Você não precisa criar nada — só consultar.
:::

### Datasets Relevantes para Finanças e Controladoria

| Dataset | Conteúdo | Uso na Controladoria |
|---|---|---|
| `sec_sec10k` | Demonstrações financeiras (SEC) de empresas americanas | Analisar DRE, balanço patrimonial, fluxo de caixa de gigantes como Apple, Google |
| `bloomberg_financial` | Dados de mercado da Bloomberg | Cotações de ações, índices, valuation |
| `cboe_market_data` | Dados de opções e volatilidade | Análise de risco de mercado |
| `census_bureau_usa` | Dados censitários dos EUA | Análise demográfica para expansão de negócios |
| `world_bank_wdi` | Indicadores do Banco Mundial | Cenário macroeconômico global |

## Exemplo 1: Análise de DRE de Empresas (SEC)

Vamos analisar a receita e o lucro das maiores empresas de tecnologia do mundo:

```sql
-- Extrair receita líquida e lucro líquido das 10 maiores empresas
SELECT
  company_name,
  fiscal_year,
  ROUND(SUM(CAST(value AS NUMERIC)), 2) AS valor
FROM `bigquery-public-data.sec_sec10k.sec_financial_statements`
WHERE account IN ('RevenueFromContractWithCustomerExcludingAssessedTax', 'NetIncomeLoss')
  AND fiscal_year >= 2020
  AND company_name IN ('APPLE INC', 'MICROSOFT CORP', 'AMAZON COM INC')
GROUP BY company_name, fiscal_year, account
ORDER BY company_name, fiscal_year, account;
```

```sql
-- Margem líquida por ano (Apple, Microsoft, Google)
WITH dre AS (
  SELECT
    company_name,
    fiscal_year,
    MAX(CASE WHEN account = 'RevenueFromContractWithCustomerExcludingAssessedTax'
        THEN CAST(value AS NUMERIC) END) AS receita,
    MAX(CASE WHEN account = 'NetIncomeLoss'
        THEN CAST(value AS NUMERIC) END) AS lucro_liquido
  FROM `bigquery-public-data.sec_sec10k.sec_financial_statements`
  WHERE fiscal_year BETWEEN 2020 AND 2024
    AND company_name IN ('APPLE INC', 'MICROSOFT CORP', 'ALPHABET INC')
  GROUP BY company_name, fiscal_year
)
SELECT
  company_name,
  fiscal_year,
  ROUND(receita / 1e9, 2) AS receita_bilhoes,
  ROUND(lucro_liquido / 1e9, 2) AS lucro_bilhoes,
  ROUND(lucro_liquido / NULLIF(receita, 0) * 100, 2) AS margem_liquida_pct
FROM dre
ORDER BY company_name, fiscal_year;
```

:::note O que você pode descobrir com isso?
- Qual empresa tem a maior margem líquida?
- Como a pandemia afetou a receita de cada uma?
- Quem está crescendo mais rápido?

São perguntas que você pode responder com SQL — sem precisar de planilha.
:::

## Exemplo 2: Pipeline de Fechamento Contábil

Aqui você vai simular o processo completo de fechamento contábil — desde a ingestão de lançamentos até o relatório gerencial.

### Etapa 1 — Ingestão de Lançamentos

```sql
-- Simular ingestão de lançamentos do dia
CREATE OR REPLACE TABLE `projeto.contabilidade.lancamentos_diarios`
PARTITION BY data_lancamento
CLUSTER BY empresa, conta_contabil
AS
SELECT
  CURRENT_DATE() AS data_lancamento,
  'EMPRESA_A' AS empresa,
  '1.1.1' AS conta_contabil,
  'Receita de Serviços' AS descricao_conta,
  150000.00 AS valor,
  'FAT-2025-001' AS documento
UNION ALL
SELECT CURRENT_DATE(), 'EMPRESA_B', '2.1.1', 'Fornecedores', -45000.00, 'NF-2025-001';
```

### Etapa 2 — Conciliação e Validação

```sql
-- Identificar lançamentos sem contrapartida (validação de partida dobra)
WITH lancamentos_agregados AS (
  SELECT
    data_lancamento,
    empresa,
    ROUND(SUM(valor), 2) AS soma_diaria
  FROM `projeto.contabilidade.lancamentos_diarios`
  GROUP BY data_lancamento, empresa
)
SELECT
  data_lancamento,
  empresa,
  soma_diaria,
  CASE WHEN ABS(soma_diaria) > 0.01
    THEN 'INCONSISTENTE — partidas não fecham'
    ELSE 'OK'
  END AS status
FROM lancamentos_agregados;
```

### Etapa 3 — Fechamento Mensal (Materializado)

```sql
-- Saldo final por conta contábil no mês
CREATE OR REPLACE TABLE `projeto.contabilidade.fechamento_mensal`
PARTITION BY mes_competencia
CLUSTER BY empresa
AS
SELECT
  empresa,
  conta_contabil,
  DATE_TRUNC(data_lancamento, MONTH) AS mes_competencia,
  SUM(valor) AS saldo_periodo,
  COUNT(DISTINCT documento) AS qtd_documentos
FROM `projeto.contabilidade.lancamentos_diarios`
GROUP BY empresa, conta_contabil, mes_competencia;
```

## Exemplo 3: Análise de Mercado (Bloomberg)

```sql
-- Variação de índices de ações nos últimos 5 anos
SELECT
  ticker,
  EXTRACT(YEAR FROM date) AS ano,
  AVG(close_price) AS preco_medio,
  MIN(low_price) AS minima_ano,
  MAX(high_price) AS maxima_ano,
  ROUND(STDDEV(close_price), 2) AS volatilidade
FROM `bigquery-public-data.bloomberg_financial.market_data`
WHERE ticker IN ('SPX INDEX', 'NDX INDEX')
  AND date >= '2020-01-01'
GROUP BY ticker, ano
ORDER BY ticker, ano;
```

## 4. Agendando Consultas (Fechamento Automático)

BigQuery permite programar consultas para rodar automaticamente — tipo um "timer" do SQL. Útil para fechamentos mensais que rodam todo dia 1º.

```sql
-- Exemplo: consulta programada para o 1º dia de cada mês às 08:00
DECLARE mes_fechamento DATE;
SET mes_fechamento = DATE_SUB(DATE_TRUNC(CURRENT_DATE(), MONTH), INTERVAL 1 MONTH);

CREATE OR REPLACE TABLE `projeto.contabilidade.historico_fechamentos`
PARTITION BY mes_competencia
AS
SELECT
  mes_fechamento AS mes_competencia,
  empresa,
  conta_contabil,
  SUM(valor) AS saldo
FROM `projeto.contabilidade.lancamentos_diarios`
WHERE DATE_TRUNC(data_lancamento, MONTH) = mes_fechamento
GROUP BY empresa, conta_contabil;
```

### Configuração no Console

```
1. BigQuery → Scheduled Queries → Create Scheduled Query
2. Query: (código acima)
3. Schedule: 1st day of month at 08:00
4. Destination: projeto.contabilidade.historico_fechamentos
5. Write preference: Append to table
```

## 5. Exportando Resultados

### Para Google Sheets

```
Opção 1: Console (Results → Save to Google Sheets)
Opção 2: AppScript ou APIs (para automação)
Opção 3: bq CLI (linha de comando)
```

```bash
# Via bq command-line
bq query --format=csv \
  'SELECT mes, SUM(valor) AS total FROM projeto.contabilidade.lancamentos GROUP BY mes' \
  > fechamento_mensal.csv
```

### Para Looker Studio (Dashboards)

1. Execute a consulta no BigQuery
2. Clique em **Explore with Looker Studio**
3. Selecione métricas e dimensões para criar seu dashboard

### Exemplo de Dashboard

| Componente | Fonte | Métrica |
|---|---|---|
| Receita mensal | `fechamento_mensal` | Soma de `saldo` por `mes_competencia` |
| Top 10 despesas | `lancamentos_diarios` | Soma de `valor` por `conta_contabil` |
| Fluxo de caixa acumulado | `caixa_diario` | Running total de saldo |
| Comparativo anual | `historico_fechamentos` | LAG de saldo em relação ao ano anterior |

## 6. Script de Configuração Completa

Este script monta o pipeline inteiro de fechamento contábil no BigQuery — da ingestão ao relatório:

```sql
-- Pipeline completo de fechamento contábil no BigQuery

-- 1. Tabela de lançamentos
CREATE OR REPLACE TABLE `projeto.contabilidade.lancamentos`
PARTITION BY DATE_TRUNC(data_lancamento, MONTH)
CLUSTER BY empresa, conta_contabil
OPTIONS(description = 'Tabela de lançamentos contábeis diários') AS
SELECT * FROM `projeto.raw_data.lancamentos_fonte`;

-- 2. Validação de partida dobra
CREATE OR REPLACE VIEW `projeto.contabilidade.vw_validacao_partidas` AS
SELECT
  data_lancamento,
  empresa,
  ROUND(SUM(valor), 2) AS saldo_diario,
  CASE WHEN ROUND(SUM(valor), 2) = 0 THEN 'OK' ELSE 'INCONSISTENTE' END AS status
FROM `projeto.contabilidade.lancamentos`
GROUP BY data_lancamento, empresa
HAVING status = 'INCONSISTENTE';

-- 3. Fechamento mensal automático (para scheduled query)
CREATE OR REPLACE TABLE `projeto.contabilidade.fechamento_mensal`
PARTITION BY mes_competencia
AS
SELECT
  empresa,
  conta_contabil,
  DATE_TRUNC(data_lancamento, MONTH) AS mes_competencia,
  SUM(valor) AS saldo_periodo
FROM `projeto.contabilidade.lancamentos`
WHERE data_lancamento >= DATE_SUB(CURRENT_DATE(), INTERVAL 13 MONTH)
GROUP BY empresa, conta_contabil, mes_competencia;

-- 4. Relatório gerencial (DRE resumido)
SELECT
  mes_competencia,
  CASE
    WHEN conta_contabil LIKE '1.%' THEN 'Receita'
    WHEN conta_contabil LIKE '2.%' THEN 'Custo'
    WHEN conta_contabil LIKE '3.%' THEN 'Despesa'
  END AS classificacao,
  SUM(saldo_periodo) AS total
FROM `projeto.contabilidade.fechamento_mensal`
GROUP BY mes_competencia, classificacao
ORDER BY mes_competencia, classificacao;
```

## 7. Dicas para Uso em Controladoria

| Tarefa | Como Fazer | Dica |
|---|---|---|
| Fechamento mensal automatizado | Scheduled Query no 1º dia do mês | Economiza horas de trabalho manual |
| Conciliação bancária | CTE com `LAG` para saldo acumulado | Detecta divergências automaticamente |
| Relatório gerencial | Consulta SQL + Looker Studio | Dashboard atualizado em tempo real |
| Auditoria de dados | `INFORMATION_SCHEMA` para rastrear jobs | Sabe quem rodou o que e quando |
| Exportação para contabilidade | CSV via `bq` ou Google Sheets | Dados prontos para importar no ERP |
| DRE comparativa | `PIVOT` (ou `SUM(CASE)`) por mês/ano | Comparação direta entre períodos |

## Resumo — O que você aprendeu

| Dataset Público | Para que serve |
|---|---|
| `sec_sec10k` | Analisar demonstrações financeiras de gigantes globais |
| `bloomberg_financial` | Dados de mercado e cotações |
| `world_bank_wdi` | Indicadores macroeconômicos |

> **Lembre-se:** Você pode consultar TODOS esses datasets sem pagar nada (dentro do nível gratuito). É a melhor forma de praticar SQL contábil com dados reais.

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo2" title={quizes.modulo2.title} questions={quizes.modulo2.questions} />
