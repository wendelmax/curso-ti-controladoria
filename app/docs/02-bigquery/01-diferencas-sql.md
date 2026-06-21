# Diferenças entre SQL Tradicional e BigQuery SQL

Imagine que você sabe dirigir um carro popular (SQL tradicional). De repente, você precisa transportar uma carga enorme — tipo mudar uma empresa inteira de prédio. Dá para fazer com o carro popular? Até dá, mas você vai ter que fazer 50 viagens e pode quebrar no meio do caminho.

O BigQuery SQL é como trocar para um caminhão com motor potente, câmbio automático e GPS. Continua sendo um veículo (SQL), mas adaptado para cargas pesadas. A maioria dos comandos que você aprendeu (SELECT, WHERE, GROUP BY, JOIN) funciona igual. Mas algumas coisas mudam.

## Por que isso importa para você?

Na controladoria, seus dados financeiros crescem a cada mês. O SQL que funcionava no fechamento do mês passado pode travar ao analisar 5 anos de dados. O BigQuery mantém a essência do que você já sabe, mas com "superpoderes" para dados em grande escala.

:::tip Conceitos que parecem complicados, mas não são
- **Orientado a colunas** — em vez de ler a linha inteira (todos os campos de um lançamento), o BigQuery lê só as colunas que você pediu. É como abrir o armário de arquivos e pegar só a pasta "valor", em vez de carregar o armário inteiro.
- **Execução distribuída** — o Google divide sua consulta em pedacinhos e processa cada pedaço em um computador diferente ao mesmo tempo. É como ter 100 estagiários conferindo 100 páginas de balanço simultaneamente em vez de um só conferindo tudo.
:::

## Visão Geral

BigQuery utiliza o padrão SQL 2011 com extensões próprias para lidar com dados semiestruturados (arrays, structs) e escalar horizontalmente. A principal diferença conceitual: BigQuery é **orientado a colunas** e opera com **execução distribuída** — dois termos que acabamos de traduzir acima.

## Tipos de Dados

| Tipo | SQL Tradicional | BigQuery |
|---|---|---|
| Data | `DATE` | `DATE` |
| Timestamp | `TIMESTAMP` | `TIMESTAMP` (sempre UTC) |
| Precisão | `DECIMAL(18,2)` | `NUMERIC` (38,9) ou `BIGNUMERIC` (76,38) |
| Repetido | Não suporta | `ARRAY<T>` |
| Estruturado | Não suporta | `STRUCT` |

:::note NUMERIC vs BIGNUMERIC
No SQL tradicional, `DECIMAL(18,2)` permite até 18 dígitos no total, sendo 2 decimais. No BigQuery, `NUMERIC` permite 38 dígitos no total com 9 decimais — muito mais precisão para valores financeiros grandes. `BIGNUMERIC` vai além: 76 dígitos. Ou seja: cabe o orçamento de qualquer empresa do mundo.
:::

## ARRAY e UNNEST — Quando uma linha tem vários valores

**Problema prático:** Em finanças, você recebe faturas com vários itens em uma única linha (nota fiscal com 10 produtos). No SQL tradicional, você precisaria criar uma tabela separada para os itens. No BigQuery, você usa `ARRAY` (lista) e `UNNEST` (desempacotar a lista).

:::caution Traduzindo
- **ARRAY** = uma lista de valores dentro de uma única célula. Imagine uma caixa de ferramentas: a caixa é a linha, as ferramentas dentro são o array.
- **UNNEST** = "desaninhar", ou seja, pegar cada item da lista e transformar em uma linha separada. É como abrir a caixa de ferramentas e colocar cada ferramenta em cima da mesa.
:::

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

:::tip WITH OFFSET na prática
`WITH OFFSET` é útil quando a ordem dos itens importa — por exemplo, o primeiro item de uma nota fiscal geralmente é o principal. Com `WITH OFFSET AS posicao`, você sabe que posição cada item ocupava na lista original.
:::

## STRUCT (Registros Aninhados) — Agrupando campos dentro de um campo

No SQL tradicional, cada coluna é independente. No BigQuery, você pode agrupar campos relacionados dentro de um `STRUCT` (estrutura).

:::note Traduzindo STRUCT
STRUCT é como criar uma "pastinha" dentro de uma coluna. Em vez de ter colunas separadas `pais` e `filial`, você cria uma coluna `entidade` que contém `pais` e `filial` dentro dela. É como um envelope que guarda vários documentos.
:::

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

No BigQuery, não existe `SYSDATE` como no SQL tradicional. Você usa `CURRENT_DATE()` ou `CURRENT_DATETIME()`.

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

:::caution Atenção com TIMEZONE
BigQuery armazena timestamps sempre em **UTC** (o horário de Londres sem horário de verão). Se você está no Brasil (UTC-3), meio-dia no Brasil vira 15:00 no BigQuery. Sempre use `TIMESTAMP(data, 'America/Sao_Paulo')` para garantir a conversão correta.
:::

## Diferenças Críticas no Dia a Dia

| Situação | SQL Tradicional | BigQuery |
|---|---|---|
| Agrupar por texto | Necessário CAST | `GROUP BY 1, 2` aceito |
| LEFT JOIN | Sem restrição | Tabela da direita **deve** ter coluna `FOR SYSTEM_TIME AS OF` se for particionada |
| SELECT * | Aceito | **Evitar** — gera leitura de todas as colunas |
| Subquery correlacionada | Suportada | Limitada; preferir `JOIN` ou `WINDOW` |
| UPDATE/DELETE | Direto | Exige `WHERE` com condição de particionamento (ou `MERGE`) |
| MERGE | Padrão | `MERGE INTO` com matching obrigatório por chave de partição |

## FROM com JOIN implícito (CROSS JOIN)

No BigQuery, usar vírgula no `FROM` equivale a `CROSS JOIN`:

```sql
-- Equivalente
SELECT * FROM tabela1, tabela2;
SELECT * FROM tabela1 CROSS JOIN tabela2;
```

> ⚠ **Cuidado:** BigQuery **não** converte tipos automaticamente em comparações. Use `SAFE_CAST` para evitar erros. Exemplo: `SAFE_CAST(valor AS NUMERIC)` em vez de `CAST(valor AS NUMERIC)` — se der erro, `SAFE_CAST` retorna nulo em vez de quebrar a consulta.

## FROM Items e Subconsultas

BigQuery exige `FROM` mesmo em funções escalares:

```sql
-- Válido
SELECT CURRENT_DATE();

-- Inválido no BigQuery
SELECT coluna1 FROM tabela WHERE (SELECT 1);
```

:::tip Por que isso é importante?
Se você tentar fazer `WHERE (SELECT 1)` para testar algo, o BigQuery vai dar erro. Sempre use uma tabela ou CTE como referência. É uma diferença sutil que pega muita gente.
:::

## CTE (WITH) Obrigatório em Recursão — Hierarquia de Contas

Para montar hierarquias (plano de contas, centros de custo), o BigQuery exige `WITH RECURSIVE`:

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

:::note Para que serve isso na prática?
Na contabilidade, o plano de contas tem uma hierarquia: Ativo → Circulante → Caixa. Com `WITH RECURSIVE`, você consegue listar TODOS os níveis da hierarquia em uma única consulta, incluindo o "nível" de cada conta. Isso é essencial para:
- Montar balanços consolidados
- Identificar contas analíticas vs sintéticas
- Criar relatórios gerenciais com drill-down
:::

## Resumo

| Conceito | SQL Tradicional | BigQuery SQL | Tradução |
|---|---|---|---|
| Aninhamento | Tabelas separadas | `STRUCT`, `ARRAY` | "Guardar dentro" |
| Desaninhar | `JOIN` | `UNNEST` | "Desempacotar" |
| Posição de array | `ROW_NUMBER` | `WITH OFFSET` | "Qual é a posição?" |
| Data/hora | `NOW()` | `CURRENT_DATETIME()` | — |
| Conversão | `CAST` implícito | `SAFE_CAST` explícito | "Converte ou devolve nulo" |
| Partição | Índices | `_PARTITIONDATE`, `_PARTITIONTIME` | — |
