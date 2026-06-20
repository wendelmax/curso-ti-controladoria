# 1.4 — Trabalhando com JOINs

Na controladoria, raramente uma tabela contém toda a informação necessária. JOINs permitem **combinar dados de múltiplas tabelas** através de chaves relacionadas.

## INNER JOIN

Retorna apenas linhas com correspondência em **ambas** as tabelas:

```sql
SELECT colunas
FROM tabela_a
INNER JOIN tabela_b ON tabela_a.chave = tabela_b.chave;
```

### Exemplo 1: Lançamentos contábeis com descrição das contas

```sql
SELECT
    l.id_lancamento,
    l.data_lancamento,
    l.valor,
    l.debito_credito,
    p.descricao AS conta_contabil,
    p.codigo AS codigo_conta
FROM lancamentos_contabeis l
INNER JOIN planos_contas p ON l.id_conta = p.id_conta
LIMIT 20;
```

### Exemplo 2: Faturamento com nome do cliente

```sql
SELECT
    f.data_emissao,
    c.nome AS cliente,
    f.valor_liquido,
    f.produto_servico,
    f.status
FROM faturamento f
INNER JOIN clientes c ON f.id_cliente = c.id_cliente
ORDER BY f.data_emissao;
```

## LEFT JOIN

Retorna **todas** as linhas da tabela da esquerda, mesmo sem correspondência na direita:

```sql
SELECT colunas
FROM tabela_a
LEFT JOIN tabela_b ON tabela_a.chave = tabela_b.chave;
```

### Exemplo 3: Funcionários com folha de pagamento

```sql
SELECT
    f.nome AS funcionario,
    f.cargo,
    fp.mes,
    fp.ano,
    fp.salario_base,
    fp.valor_liquido
FROM funcionarios f
LEFT JOIN folha_pagamento fp ON f.id_funcionario = fp.id_funcionario
ORDER BY f.nome, fp.mes;
```

## JOIN com 3 tabelas

### Exemplo 4: Contas a pagar com fornecedor e centro de custo

```sql
SELECT
    cp.descricao,
    f.nome AS fornecedor,
    cc.descricao AS centro_custo,
    cp.valor,
    cp.data_vencimento,
    cp.status
FROM contas_pagar cp
INNER JOIN fornecedores f ON cp.id_fornecedor = f.id_fornecedor
INNER JOIN centros_custo cc ON cp.id_centro_custo = cc.id_centro_custo
ORDER BY cp.data_vencimento;
```

### Exemplo 5: DRE mensal com nomes das contas

```sql
SELECT
    d.ano,
    d.mes,
    p.codigo,
    p.descricao AS conta,
    SUM(d.valor) AS valor
FROM dre_mensal d
INNER JOIN planos_contas p ON d.id_conta = p.id_conta
GROUP BY d.ano, d.mes, p.codigo, p.descricao
ORDER BY d.ano, d.mes, p.codigo;
```

## Dica: Aliases de tabela

`FROM lancamentos_contabeis l` — o `l` é um alias. Use aliases curtos para escrever menos.

## Nulos em LEFT JOIN

Útil para encontrar registros "órfãos":

```sql
SELECT f.nome
FROM funcionarios f
LEFT JOIN folha_pagamento fp ON f.id_funcionario = fp.id_funcionario
WHERE fp.id_folha IS NULL;
```

## Exercícios Práticos

1. Liste todas as notas fiscais de saída com o nome do cliente e valor do imposto
2. Mostre os lançamentos contábeis de janeiro com a descrição da conta e centro de custo
3. Para cada conta a receber, mostre o nome do cliente e dias até o vencimento
4. Liste todos os clientes com suas respectivas faturas (inclusive clientes sem fatura)
5. Monte uma query que retorne: empresa, conta contábil, valor e mês — para todas as contas de despesa (código começando com '5')

import SqlExercicio from '@site/src/components/SqlExercicio'

<SqlExercicio
  id="join-1"
  prompt="Liste as notas fiscais de saída (tipo = 'saida') com o nome do cliente (use a tabela notas_fiscais com clientes via id_cliente_fornecedor = id_cliente)."
  hint="INNER JOIN clientes ON nf.id_cliente_fornecedor = c.id_cliente WHERE tipo = 'saida'"
  table="notas_fiscais"
  expectedSql="SELECT nf.numero, nf.data_emissao, c.nome AS cliente, nf.base_calculo, nf.valor_imposto FROM notas_fiscais nf INNER JOIN clientes c ON nf.id_cliente_fornecedor = c.id_cliente WHERE nf.tipo = 'saida'"
/>

<SqlExercicio
  id="join-2"
  prompt="Mostre os lançamentos contábeis com a descrição da conta e centro de custo. Limite a 15 resultados."
  hint="JOIN planos_contas e centros_custo"
  table="lancamentos_contabeis"
  expectedSql="SELECT l.id_lancamento, l.valor, l.debito_credito, p.descricao AS conta, cc.descricao AS centro_custo FROM lancamentos_contabeis l INNER JOIN planos_contas p ON l.id_conta = p.id_conta INNER JOIN centros_custo cc ON l.id_centro_custo = cc.id_centro_custo LIMIT 15"
/>
