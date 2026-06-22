# 1.3 — Agregações e Agrupamentos

:::tip Traduzindo para o seu dia a dia
GROUP BY é como a **tabela dinâmica do Excel**. Você já deve ter selecionado dados, ido em "Inserir > Tabela Dinâmica", arrastado "Mês" para as linhas e "Valor" para os valores. GROUP BY faz exatamente isso: `GROUP BY mes` + `SUM(valor)` = total agrupado por mês. A diferença é que no SQL você escreve a lógica em vez de arrastar campos.
:::

:::note Por que isso importa para você?
Na controladoria, você vive fazendo contas como: "qual o total de vendas do mês?", "qual a média salarial por departamento?", "quantos clientes temos por estado?". Essas são **perguntas de agregação**: você pega muitos dados e resume em um número só.

No Excel, você faria isso com fórmula =SOMASE ou tabela dinâmica. No SQL, as funções de agregação (SUM, AVG, COUNT) fazem o mesmo trabalho — mas sem limites de tamanho de planilha.
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

## Para fixar

- **GROUP BY** = tabela dinâmica do SQL: agrupa linhas iguais e aplica contas
- **SUM** = soma, **AVG** = média, **COUNT** = contagem, **MAX/MIN** = maior/menor
- **WHERE** filtra **antes** de agrupar; **HAVING** filtra **depois** de agrupar

:::tip 🚀 Quer praticar?
Vá para o **[Laboratório do Módulo 1](./exercicios)** e treine GROUP BY com exercícios interativos.
:::
