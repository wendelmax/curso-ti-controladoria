# 1.1 — Fundamentos do SQL

## SELECT e FROM

O comando mais básico do SQL: **selecionar** colunas **de** uma tabela.

```sql
SELECT coluna1, coluna2
FROM nome_da_tabela;
```

### Exemplo 1: Ver todas as empresas

```sql
SELECT id_empresa, razao_social, cnpj, regime_tributario
FROM empresas;
```

### Exemplo 2: Ver o plano de contas

```sql
SELECT codigo, descricao, tipo_conta, natureza
FROM planos_contas
LIMIT 20;
```

## LIMIT — Limitando resultados

Para tabelas grandes, use `LIMIT` para ver apenas as primeiras linhas:

```sql
SELECT * FROM lancamentos_contabeis LIMIT 10;
```

## SELECT * — Todas as colunas (com cuidado)

```sql
SELECT * FROM clientes LIMIT 5;
```

## Aliases com AS

Renomeie colunas na saída para ficar mais legível:

```sql
SELECT 
    nome_fantasia AS empresa,
    cnpj AS documento
FROM empresas;
```

## DISTINCT — Valores únicos

```sql
SELECT DISTINCT departamento FROM centros_custo;
```

## Ordenação com ORDER BY

```sql
SELECT nome, salario
FROM funcionarios
ORDER BY salario DESC;
```

`ASC` = crescente (padrão), `DESC` = decrescente.

## Comentários

```sql
-- Isto é um comentário de linha
SELECT * FROM empresas;  -- comentário no final

/*
  Comentário
  de múltiplas
  linhas
*/
```

## Exercícios Práticos

Antes de prosseguir, pratique os conceitos abaixo no editor interativo.

import SqlExercicio from '@site/src/components/SqlExercicio'

<SqlExercicio
  id="fund-1"
  prompt="Liste todos os fornecedores mostrando as colunas: nome, cidade e UF."
  hint="Use SELECT nome, cidade, uf FROM fornecedores"
  table="fornecedores"
  expectedSql="SELECT nome, cidade, uf FROM fornecedores"
/>

<SqlExercicio
  id="fund-2"
  prompt="Mostre os 5 primeiros clientes ordenados por nome (ordem alfabética)."
  hint="SELECT * FROM clientes ORDER BY nome LIMIT 5"
  table="clientes"
  expectedSql="SELECT * FROM clientes ORDER BY nome LIMIT 5"
/>

<SqlExercicio
  id="fund-3"
  prompt="Liste os 10 maiores salários do banco, mostrando nome, cargo e salário."
  hint="Use ORDER BY salario DESC e LIMIT 10"
  table="funcionarios"
  expectedSql="SELECT nome, cargo, salario FROM funcionarios ORDER BY salario DESC LIMIT 10"
/>

<SqlExercicio
  id="fund-4"
  prompt="Selecione os cargos distintos dos funcionários (sem repetições)."
  hint="Use SELECT DISTINCT cargo FROM funcionarios"
  table="funcionarios"
  expectedSql="SELECT DISTINCT cargo FROM funcionarios"
/>

Desafio extra (sem verificação automática — teste no SQL Playground geral):
1. Selecione o código e descrição do plano de contas de nível 3 (analíticas)
2. Mostre o nome fantasia e CNPJ de todas as empresas
