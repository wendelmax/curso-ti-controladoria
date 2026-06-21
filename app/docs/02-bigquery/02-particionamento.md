# Particionamento e Clustering no BigQuery

Imagine seu arquivo físico de lançamentos contábeis. Você tem 10 anos de papéis empilhados em uma sala. Quando o auditor pede "os lançamentos de janeiro de 2025", você tem duas opções:

1. **Opção ruim:** Revirar a pilha inteira até achar o que precisa (leva horas)
2. **Opção boa:** Ir direto à gaveta "2025", pegar a pasta "Janeiro" e pronto (leva segundos)

**Particionamento** é criar essas gavetas (partições) no BigQuery. **Clustering** é organizar os documentos dentro de cada gaveta — por exemplo, em ordem alfabética de empresa.

## Por que isso importa para você?

Na controladoria, cada centavo de custo importa. E no BigQuery, você paga pelos dados que **processa**, não pelo que armazena.

Sem particionamento, cada consulta varre a tabela INTEIRA. Com particionamento, só as gavetas (partições) relevantes são lidas. Resultado: economias de **90% a 98%** no custo das consultas.

## Como o BigQuery Cobra

BigQuery cobra por **bytes processados**. Traduzindo: cada vez que você roda uma consulta, o BigQuery mede quantos dados ele "vasculhou" e te cobra por isso.

| Cenário | Tabela de 10 TB | Consulta de 1 mês |
|---|---|---|
| Sem partição | 10 TB processados | 10 TB processados |
| Particionada por mês (12 partições) | 10 TB armazenados | ~830 GB processados |
| Redução | — | **~92% menos dados** |

```text
Custo aproximado (US$ 5/TB on-demand):
  Sem partição: US$ 50,00 por consulta
  Com partição: US$ 4,15 por consulta
```

:::note
US$ 5 por TB (terabyte) processado. Um terabyte equivale a cerca de 500 horas de música ou aproximadamente 10 milhões de lançamentos contábeis. A primeira consulta de cada mês (primeiro 1 TB) é **grátis**.
:::

## Tipos de Particionamento

| Tipo | Coluna | Exemplo de Uso |
|---|---|---|
| `DATE` / `TIMESTAMP` | Data do lançamento | Faturamento mensal |
| `INTEGER` | Ano fiscal | `2019, 2020, ...` |
| `RANGE` | Valor da transação | `0-1000, 1000-10000, ...` |
| `_PARTITIONDATE` | Pseudocoluna | Particionamento por data de chegada dos dados |

```sql
-- Criação: tabela de lançamentos contábeis particionada por mês
CREATE TABLE `projeto.contabilidade.lancamentos_part`
PARTITION BY DATE_TRUNC(data_lancamento, MONTH)
CLUSTER BY empresa, conta_contabil
OPTIONS(
  description = 'Lançamentos contábeis particionados por mês e clusterizados por empresa/conta'
)
AS
SELECT * FROM `projeto.contabilidade.lancamentos_raw`;
```

:::tip Traduzindo o SQL acima
- `PARTITION BY DATE_TRUNC(data_lancamento, MONTH)` — Cria uma gaveta para cada mês (janeiro, fevereiro...)
- `CLUSTER BY empresa, conta_contabil` — Dentro de cada gaveta, organiza por empresa e depois por conta
- `description` — Um lembrete para você (e seus colegas) do que essa tabela faz
:::

## Clustering — A organização DENTRO da gaveta

Clustering **ordena os dados dentro de cada partição**, permitindo que BigQuery elimine blocos que não correspondem ao filtro.

### Como funciona

- Até **4 colunas** por tabela
- Colunas com **alta cardinalidade** (muitos valores diferentes — ex.: `conta_contabil`, `cnpj`)
- Ordem no `CLUSTER BY` importa: coluna mais seletiva (que mais filtra) primeiro

:::caution Alta cardinalidade?
Cardinalidade = quantidade de valores diferentes. "Masculino/Feminino" tem cardinalidade baixa (2 valores). "CNPJ" tem cardinalidade alta (milhares de valores). Para clustering, prefira colunas com **média** ou **alta** cardinalidade.
:::

```sql
-- Exemplo financeiro: despesas por centro de custo
CREATE TABLE `projeto.contabilidade.despesas`
PARTITION BY DATE(data_movimento)
CLUSTER BY centro_custo, conta_contabil;
```

### Clustering vs Particionamento

| Característica | Particionamento | Clustering |
|---|---|---|
| Redução de custo | Elimina partições inteiras | Elimina blocos dentro da partição |
| Limite | 10.000 partições | 4 colunas |
| Melhor para | Colunas de data | Colunas de alta cardinalidade |
| Manutenção | Automática | Automática (recluster é pago) |

## Boas Práticas para Dados Financeiros

### 1. Particione por Mês (não por dia)

Na controladoria, suas consultas típicas são mensais (fechamento). Partição diária gera 365 pastinhas por ano — desnecessário.

```sql
PARTITION BY DATE_TRUNC(data_fechamento, MONTH)
```

### 2. Clusterize por Entidade e Conta

```sql
CLUSTER BY cod_empresa, cod_conta
```

Isso faz com que consultas como `WHERE cod_empresa = '123'` leiam apenas blocos relevantes dentro da partição do mês.

### 3. Evite Partições com Poucos Dados

Partições com menos de 1 GB são ineficientes. Se sua tabela tem menos de 10 GB no total, talvez nem precise particionar.

### 4. Use _PARTITIONTIME para Dados de Ingestão

Quando o BigQuery ingere dados automaticamente, ele usa `_PARTITIONTIME` como carimbo de data/hora de chegada:

```sql
SELECT *
FROM `projeto.contabilidade.lancamentos_part`
WHERE _PARTITIONTIME BETWEEN TIMESTAMP('2025-01-01') AND TIMESTAMP('2025-01-31');
```

### 5. Cuidado com UPDATE e DELETE em Tabelas Particionadas

`UPDATE` e `DELETE` **exigem** filtro de partição (a menos que use `MERGE`). Isso é uma proteção: o BigQuery impede que você apague acidentalmente tudo.

```sql
-- Correto: filtra pela partição
DELETE FROM `projeto.contabilidade.lancamentos_part`
WHERE data_lancamento BETWEEN '2025-01-01' AND '2025-01-31'
  AND conta_contabil = 'Erro';
```

:::warning
Se você tentar um `DELETE` sem filtro de partição, o BigQuery vai recusar. É como um cadeado de segurança: você precisa provar que sabe qual gaveta quer limpar.
:::

## Comparação de Planos de Custo

| Cenário | Tabela | Tamanho | Consulta típica | Custo/consulta |
|---|---|---|---|---|
| Sem partição | `lancamentos_raw` | 5 TB | Fechamento mensal | US$ 25,00 |
| Particionada | `lancamentos_part` | 5 TB | Fechamento mensal | ~US$ 2,10 |
| Particionada + clusterizada | `lancamentos_part` | 5 TB | Fechamento + empresa X | ~US$ 0,50 |

## Visualizando Partições

```sql
-- Listar partições de uma tabela
SELECT table_name, partition_id, total_rows, total_logical_bytes
FROM `projeto.INFORMATION_SCHEMA.PARTITIONS`
WHERE table_name = 'lancamentos_part';
```

## Resumo Prático — O que fazer em cada situação

| Situação | Ação | Por quê? |
|---|---|---|
| Tabela > 10 GB com filtro por data | Particionar por `DATE_TRUNC(data, MONTH)` | Reduz custo em 90%+ |
| Consultas frequentes por empresa/conta | Adicionar `CLUSTER BY empresa, conta` | Acelera filtros específicos |
| Tabela < 10 GB | Não particionar | Custo de metadados > benefício |
| Dados históricos + correntes | Partição por mês + cluster por ano | Equilíbrio entre custo e performance |
| Muitas colunas, consultas variadas | Cluster por colunas mais filtradas | Máximo benefício com mínimo esforço |
