# 1.3 — Agregações e Agrupamentos

:::tip Traduzindo para o seu dia a dia
GROUP BY é como a **tabela dinâmica do Excel**. Você já deve ter selecionado dados, ido em "Inserir > Tabela Dinâmica", arrastado "Mês" para as linhas e "Valor" para os valores. GROUP BY faz exatamente isso: `GROUP BY mes` + `SUM(valor)` = total agrupado por mês. A diferença é que no SQL você escreve a lógica em vez de arrastar campos.
:::

## Funções de Agregação

Funções que operam sobre **conjuntos de linhas** e retornam **um único valor**:

| Função | Retorna |
|--------|---------|
| `SUM(coluna)` | Soma dos valores |
| `AVG(coluna)` | Média dos valores |
| `COUNT(coluna)` | Número de linhas |
| `COUNT(*)` | Número total de linhas |
| `MAX(coluna)` | Valor máximo |
| `MIN(coluna)` | Valor mínimo |

### Exemplo 1: Totais financeiros

```sql
SELECT
    COUNT(*) AS total_lancamentos,
    SUM(valor) AS soma_total,
    AVG(valor) AS valor_medio,
    MIN(valor) AS menor_valor,
    MAX(valor) AS maior_valor
FROM lancamentos_contabeis;
```

## GROUP BY — Agrupando dados

Agrupa linhas que compartilham um valor e aplica agregações:

```sql
SELECT coluna_agrupamento, funcao_agregacao
FROM tabela
GROUP BY coluna_agrupamento;
```

### Exemplo 2: Total de vendas por cliente

```sql
SELECT
    id_cliente,
    COUNT(*) AS qtd_notas,
    SUM(valor_liquido) AS total_vendas
FROM faturamento
GROUP BY id_cliente
ORDER BY total_vendas DESC;
```

### Exemplo 3: Despesas por centro de custo

```sql
SELECT
    id_centro_custo,
    SUM(valor) AS total_gasto
FROM lancamentos_contabeis
WHERE debito_credito = 'debito'
GROUP BY id_centro_custo
ORDER BY total_gasto DESC;
```

## COUNT com DISTINCT

```sql
SELECT
    COUNT(*) AS total_empresas,
    COUNT(DISTINCT departamento) AS departamentos_distintos
FROM funcionarios;
```

## GROUP BY com múltiplas colunas

```sql
SELECT
    id_empresa,
    id_centro_custo,
    SUM(valor) AS total
FROM lancamentos_contabeis
GROUP BY id_empresa, id_centro_custo;
```

## HAVING — Filtrando grupos

O `HAVING` filtra **após** o `GROUP BY` (diferente do `WHERE` que filtra **antes**):

:::tip Dica
- `WHERE` = filtra **linhas originais** antes de agrupar
- `HAVING` = filtra **grupos já calculados** depois de agrupar

Pense assim: WHERE é o filtro na matéria-prima, HAVING é o filtro no produto pronto.
:::

```sql
SELECT
    id_cliente,
    COUNT(*) AS qtd_notas,
    SUM(valor_liquido) AS total_vendas
FROM faturamento
GROUP BY id_cliente
HAVING total_vendas > 80000
ORDER BY total_vendas DESC;
```

## Ordem correta dos comandos

```sql
SELECT    -- 4. colunas a exibir
FROM      -- 1. tabela
WHERE     -- 2. filtrar linhas
GROUP BY  -- 3. agrupar
HAVING    -- 5. filtrar grupos
ORDER BY  -- 6. ordenar
LIMIT;    -- 7. limitar
```

## Exercícios Práticos

1. Qual o total de contas a receber por status?
2. Qual a média salarial por departamento?
3. Quantos clientes existem por UF?
4. Qual o valor total de impostos a recolher por tipo de imposto?
5. Quais clientes tiveram mais de 2 notas fiscais emitidas?
6. Qual o total de vendas (valor líquido) por mês?

import SqlExercicio from '@site/src/components/SqlExercicio'

<SqlExercicio
  id="agr-1"
  prompt="Calcule o total de vendas (valor_liquido) por cliente, ordenando do maior para o menor."
  hint="Use GROUP BY id_cliente com SUM(valor_liquido) e ORDER BY total DESC"
  table="faturamento"
  expectedSql="SELECT id_cliente, SUM(valor_liquido) AS total_vendas FROM faturamento GROUP BY id_cliente ORDER BY total_vendas DESC"
/>

<SqlExercicio
  id="agr-2"
  prompt="Conte quantos funcionários existem em cada departamento e mostre a média salarial."
  hint="GROUP BY departamento com COUNT(*) e AVG(salario)"
  table="funcionarios"
  expectedSql="SELECT departamento, COUNT(*) AS qtd_funcionarios, AVG(salario) AS media_salarial FROM funcionarios GROUP BY departamento"
/>

<SqlExercicio
  id="agr-3"
  prompt="Qual o total de contas a receber por status (aberto vs recebido)?"
  hint="GROUP BY status com SUM(valor)"
  table="contas_receber"
  expectedSql="SELECT status, SUM(valor) AS total FROM contas_receber GROUP BY status"
/>
