# Particionamento e Clustering no BigQuery

## Por que Particionar?

BigQuery cobra por **bytes processados**. Sem particionamento, cada consulta varre a tabela inteira. Com particionamento, apenas as partições relevantes são lidas.

### Custo: Tabela Não Particionada vs Particionada

| Cenário | Tabela de 10 TB | Consulta de 1 mês |
|---------|-----------------|-------------------|
| Sem partição | 10 TB processados | 10 TB processados |
| Particionada por mês (12 partições) | 10 TB armazenados | ~830 GB processados |
| Redução | — | **~92% menos dados** |

```text
Custo aproximado (US$ 5/TB on-demand):
  Sem partição: US$ 50,00 por consulta
  Com partição: US$ 4,15 por consulta
```

## Tipos de Particionamento

| Tipo | Coluna | Exemplo de Uso |
|------|--------|----------------|
| `DATE` / `TIMESTAMP` | Data do lançamento | Faturamento mensal |
| `INTEGER` | Ano fiscal | `2019, 2020, ...` |
| `RANGE` | Valor da transação | `0-1000, 1000-10000, ...` |
| `_PARTITIONDATE` | Pseudocoluna | Particionamento por ingestão |

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

## Clustering

Clustering **ordena os dados dentro de cada partição**, permitindo que BigQuery elimine blocos que não correspondem ao filtro.

### Como funciona

- Até **4 colunas** por tabela
- Colunas com **alta cardinalidade** (ex.: `conta_contabil`, `cnpj`)
- Ordem no `CLUSTER BY` importa: coluna mais seletiva primeiro

```sql
-- Exemplo financeiro: despesas por centro de custo
CREATE TABLE `projeto.contabilidade.despesas`
PARTITION BY DATE(data_movimento)
CLUSTER BY centro_custo, conta_contabil;
```

### Clustering vs Particionamento

| Característica | Particionamento | Clustering |
|----------------|----------------|------------|
| Redução de custo | Partições inteiras | Blocos dentro da partição |
| Limite | 10.000 partições | 4 colunas |
| Coluna recomendada | Data | Cardialidade média/alta |
| Manutenção | Automática | Automática (recluster é pago) |

## Boas Práticas para Dados Financeiros

### 1. Particione por Mês (não por dia)

Tabelas financeiras tipicamente têm consultas mensais (fechamento). Partição diária gera 365 partições/ano — desnecessário.

```sql
PARTITION BY DATE_TRUNC(data_fechamento, MONTH)
```

### 2. Clusterize por Entidade e Conta

```sql
CLUSTER BY cod_empresa, cod_conta
```

Isso faz com que consultas como `WHERE cod_empresa = '123'` leiam apenas blocos relevantes dentro da partição do mês.

### 3. Evite Partições com Poucos Dados

Partições com < 1 GB são ineficientes. Para tabelas pequenas (< 10 GB), considere não particionar.

### 4. Use _PARTITIONTIME para Dados de Ingestão

```sql
SELECT *
FROM `projeto.contabilidade.lancamentos_part`
WHERE _PARTITIONTIME BETWEEN TIMESTAMP('2025-01-01') AND TIMESTAMP('2025-01-31');
```

### 5. Cuidado com DML em Tabelas Particionadas

`UPDATE` e `DELETE` exigem filtro de partição (a menos que use `MERGE` com condição abrangente).

```sql
-- Correto: filtra pela partição
DELETE FROM `projeto.contabilidade.lancamentos_part`
WHERE data_lancamento BETWEEN '2025-01-01' AND '2025-01-31'
  AND conta_contabil = 'Erro';
```

## Tabela de Exemplo: Comparação de Planos de Custo

| Cenário | Tabela | Tamanho | Consulta típica | Custo/consulta |
|---------|--------|---------|----------------|----------------|
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

## Resumo Prático

| Situação | Ação |
|----------|------|
| Tabela > 10 GB com filtro por data | Particionar por `DATE_TRUNC(data, MONTH)` |
| Consultas frequentes por empresa/conta | Adicionar `CLUSTER BY empresa, conta` |
| Tabela < 10 GB | Não particionar (custo de metadados) |
| Dados históricos + correntes | Partição por mês + cluster por ano |
| Muitas colunas, consultas variadas | Cluster por colunas mais filtradas |
