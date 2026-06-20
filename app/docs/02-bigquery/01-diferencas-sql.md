# Diferenças entre SQL Tradicional e BigQuery SQL

## Visão Geral

BigQuery utiliza o padrão SQL 2011 com extensões próprias para lidar com dados semiestruturados (arrays, structs) e escalar horizontalmente. A principal diferença conceitual: BigQuery é **orientado a colunas** e opera com **execução distribuída**.

## Tipos de Dados

| Tipo | SQL Tradicional | BigQuery |
|------|----------------|----------|
| Data | `DATE` | `DATE` |
| Timestamp | `TIMESTAMP` | `TIMESTAMP` (sempre UTC) |
| Precisão | `DECIMAL(18,2)` | `NUMERIC` (38,9) ou `BIGNUMERIC` (76,38) |
| Repetido | Não suporta | `ARRAY<T>` |
| Estruturado | Não suporta | `STRUCT` |

## ARRAY e UNNEST

**Problema:** Em finanças, recebemos faturas com múltiplos itens em uma única linha. No SQL tradicional, usaríamos uma tabela separada. No BigQuery, usamos `ARRAY` e `UNNEST`.

```sql
-- Dados aninhados: fatura com itens
SELECT
  fatura_id,
  cliente,
  UNNEST(itens) AS item,
  UNNEST(valores) AS valor
FROM `projeto.raw_data.faturas`;

-- Equivalente com WITH OFFSET para controle de posição
SELECT
  fatura_id,
  item,
  valor,
  posicao
FROM `projeto.raw_data.faturas`,
UNNEST(itens) AS item WITH OFFSET AS posicao;
```

## STRUCT (Registros Aninhados)

No SQL tradicional, colunas são planas. No BigQuery, podemos agrupar campos financeiros dentro de um `STRUCT`:

```sql
CREATE TABLE `projeto.dados_financeiros.lancamentos`
AS
SELECT
  STRUCT(
    'BR' AS pais,
    'SP' AS filial
  ) AS entidade,
  STRUCT(
    'Receita' AS natureza,
    'Serviços Prestados' AS classificacao
  ) AS conta_contabil,
  valor,
  data_lancamento
FROM fonte;
```

Acesso: `SELECT entidade.pais, conta_contabil.classificacao FROM ...`

## Funções de Data e Timestamp

BigQuery não tem `SYSDATE`. Use `CURRENT_DATE()` ou `CURRENT_DATETIME()`.

```sql
-- Converter timestamp America/Sao_Paulo para UTC (armazenamento padrão)
SELECT TIMESTAMP('2025-01-15 10:00:00', 'America/Sao_Paulo');

-- Extrair ano/mês para fechamento contábil
SELECT
  EXTRACT(YEAR FROM data_lancamento) AS ano,
  EXTRACT(MONTH FROM data_lancamento) AS mes,
  SUM(valor) AS total_lancado
FROM `projeto.contabilidade.razao`
GROUP BY ano, mes;
```

## Diferenças Críticas

| Situação | SQL Tradicional | BigQuery |
|----------|----------------|----------|
| Agrupar por texto | Necessário CAST | `GROUP BY 1, 2` aceito |
| LEFT JOIN | Sem restrição | Tabela da direita **deve** ter coluna `FOR SYSTEM_TIME AS OF` se for particionada |
| SELECT * | Aceito | **Evitar** — gera leitura de todas as colunas |
| Subquery correlacionada | Suportada | Limitada; preferir `JOIN` ou `WINDOW` |
| UPDATE/DELETE | Direto | Exige `WHERE` com condição de particionamento (ou `MERGE`) |
| MERGE | Padrão | `MERGE INTO` com matching obrigatório por chave de partição |

## WITH OFFSET na Prática (Conciliação Bancária)

```sql
WITH transacoes_posicionadas AS (
  SELECT
    conta_id,
    transacao,
    valor,
    POSICIONAL(ordem) AS ordem -- exemplo ilustrativo
  FROM `projeto.bancos.extrato`
)
SELECT * FROM transacoes_posicionadas;
```

## FROM com JOIN implícito (CROSS JOIN)

No BigQuery, vírgula no `FROM` equivale a `CROSS JOIN`:

```sql
-- Equivalente
SELECT * FROM tabela1, tabela2;
SELECT * FROM tabela1 CROSS JOIN tabela2;
```

> ⚠ Cuidado: BigQuery **não** converte tipos automaticamente em comparações. Use `SAFE_CAST` para evitar erros.

## FROM Items e Subconsultas

BigQuery exige `FROM` mesmo em funções escalares:

```sql
-- Válido
SELECT CURRENT_DATE();

-- Inválido no BigQuery
SELECT coluna1 FROM tabela WHERE (SELECT 1);
```

## CTE (WITH) Obrigatório em Recursão

```sql
WITH RECURSIVE hierarquia_contas AS (
  SELECT conta_id, conta_pai, nome, 1 AS nivel
  FROM `projeto.contabilidade.plano_contas`
  WHERE conta_pai IS NULL
  UNION ALL
  SELECT c.conta_id, c.conta_pai, c.nome, h.nivel + 1
  FROM `projeto.contabilidade.plano_contas` c
  JOIN hierarquia_contas h ON c.conta_pai = h.conta_id
)
SELECT * FROM hierarquia_contas;
```

## Resumo

| Conceito | SQL Tradicional | BigQuery SQL |
|----------|----------------|--------------|
| Aninhamento | Tabelas separadas | `STRUCT`, `ARRAY` |
| Desaninhar | `JOIN` | `UNNEST` |
| Posição de array | `ROW_NUMBER` | `WITH OFFSET` |
| Data/hora | `NOW()` | `CURRENT_DATETIME()` |
| Conversão | `CAST` implícito | `SAFE_CAST` explícito |
| Partição | Índices | `_PARTITIONDATE`, `_PARTITIONTIME` |
