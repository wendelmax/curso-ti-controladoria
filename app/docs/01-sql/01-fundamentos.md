# 1.1 — Fundamentos do SQL

:::tip Traduzindo para o seu dia a dia
Pense no SQL como **pedir um relatório** para seu estagiário. SELECT é você dizendo "me mostre as colunas X, Y, Z". FROM é você dizendo "da pasta tal". ORDER BY é "ordenado por tal coluna". LIMIT é "só os 10 primeiros". O banco de dados é o estagiário que busca a informação para você.
:::

:::note Por que isso importa para você?
Na prática da controladoria, você vai usar SELECT e FROM o tempo todo. Quer ver o plano de contas? SELECT + FROM. Quer conferir os lançamentos do dia? SELECT + FROM. Quer listar os fornecedores ativos? SELECT + FROM. É como **abrir uma pasta no Windows** — você precisa saber onde as coisas estão e querer ver o que tem dentro.

Sem esses comandos, você não consegue fazer absolutamente nada no SQL. Por isso vamos começar por eles: são a porta de entrada.
:::

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

:::caution Cuidado com SELECT *
Usar `SELECT *` é como **imprimir uma pasta inteira sem saber quantas páginas tem**. Em tabelas pequenas (`clientes`, `empresas`) não tem problema. Mas em tabelas gigantes (`lancamentos_contabeis` com milhões de linhas), pode travar o banco ou trazer milhares de colunas que você nem precisa. **Sempre prefira listar só as colunas que você realmente precisa.**
:::

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

:::note Lembre-se
Se você não escrever `ORDER BY`, o banco devolve os registros **em qualquer ordem** — geralmente na ordem em que foram inseridos, mas sem garantia. Se a ordem importa, use `ORDER BY`.
:::

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

## Para fixar

- **SELECT** = escolha as colunas que você quer ver (como marcar colunas no Excel)
- **FROM** = de qual tabela os dados vêm
- **LIMIT** = quantas linhas você quer ver (seu controle de "só os primeiros")
- **ORDER BY** = em que ordem mostrar
- **DISTINCT** = sem repetições, tipo "resumir" no Excel

:::tip 🚀 Quer praticar?
Vá para o **[Laboratório do Módulo 1](./exercicios)** e treine esses conceitos com exercícios interativos com correção automática.
:::

Desafio extra (sem verificação automática — teste no SQL Playground geral):
1. Selecione o código e descrição do plano de contas de nível 3 (analíticas)
2. Mostre o nome fantasia e CNPJ de todas as empresas
