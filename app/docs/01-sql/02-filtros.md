# 1.2 — Filtrando Dados com WHERE

:::tip Traduzindo para o seu dia a dia
WHERE é como o **filtro automático do Excel**. Você já deve ter selecionado uma coluna, clicado no ícone de funil e marcado só "SP" e "RJ". WHERE faz exatamente isso: `WHERE uf = 'SP'` = "me mostre só as linhas onde a UF é SP". A diferença é que no SQL você escreve o filtro em vez de clicar em caixinhas.
:::

:::note Por que isso importa para você?
No dia a dia da controladoria, você raramente quer **todos** os dados de uma tabela. Quase sempre você quer filtrar: "contas a pagar em aberto", "clientes de SP", "lançamentos de janeiro", "funcionários com salário acima de R$ 10 mil". WHERE é a ferramenta que faz isso.

Sem WHERE, você teria que baixar a tabela inteira e filtrar manualmente no Excel — exatamente o que estamos tentando evitar.
:::

## WHERE — A cláusula essencial

Filtra linhas que atendem a uma condição:

```sql
SELECT colunas
FROM tabela
WHERE condição;
```

### Exemplo 1: Funcionários com salário acima de 10k

```sql
SELECT nome, cargo, salario
FROM funcionarios
WHERE salario > 10000;
```

### Exemplo 2: Contas a pagar vencidas e abertas

```sql
SELECT descricao, valor, data_vencimento
FROM contas_pagar
WHERE status = 'aberto'
  AND data_vencimento < '2026-06-15';
```

:::caution Erro clássico: esquecer as aspas
No SQL, **texto** (strings) vai entre **aspas simples**: `WHERE status = 'aberto'`. Se você esquecer as aspas, o SQL acha que `aberto` é nome de coluna e dá erro. Números não precisam de aspas: `WHERE salario > 10000` está correto.
:::

## Operadores de Comparação

| Operador | Significado |
|----------|-------------|
| `=` | Igual |
| `<>` ou `!=` | Diferente |
| `>` | Maior que |
| `<` | Menor que |
| `>=` | Maior ou igual |
| `<=` | Menor ou igual |

## Operadores Lógicos

### AND — Todas as condições verdadeiras

```sql
SELECT nome, salario, departamento
FROM funcionarios
WHERE departamento = 'Financeiro'
  AND salario >= 10000;
```

### OR — Pelo menos uma condição verdadeira

```sql
SELECT nome, departamento
FROM funcionarios
WHERE departamento = 'Comercial'
   OR departamento = 'Tecnologia';
```

### Combinando AND e OR

Use parênteses para agrupar:

```sql
SELECT nome, cargo, salario, departamento
FROM funcionarios
WHERE (departamento = 'Financeiro' OR departamento = 'Tecnologia')
  AND salario > 8000;
```

## IN — Lista de valores

```sql
SELECT nome, uf
FROM clientes
WHERE uf IN ('SP', 'RJ', 'MG');
```

Equivalente a: `WHERE uf = 'SP' OR uf = 'RJ' OR uf = 'MG'`

## BETWEEN — Intervalo de valores

```sql
SELECT nome, salario
FROM funcionarios
WHERE salario BETWEEN 8000 AND 20000;
```

Inclui os valores extremos.

## LIKE — Busca por padrão

- `%` — qualquer sequência de caracteres (o coringa)
- `_` — um único caractere

```sql
SELECT nome, cidade
FROM clientes
WHERE nome LIKE '%Distribuidora%';
```

```sql
SELECT nome, cargo
FROM funcionarios
WHERE cargo LIKE 'Analista%';
```

:::tip Dica
- `'%Distribuidora%'` = contém "Distribuidora" em qualquer posição
- `'Distribuidora%'` = começa com "Distribuidora"
- `'%Distribuidora'` = termina com "Distribuidora"
- `'Analista_'` = "Analista" + exatamente 1 caractere (ex: "Analista1", "AnalistaA")
:::

## IS NULL — Valores nulos

```sql
SELECT * FROM planos_contas
WHERE id_conta_pai IS NULL;
```

Contas de nível 0 (raiz do plano).

## IS NOT NULL — Valores não nulos

```sql
SELECT * FROM planos_contas
WHERE id_conta_pai IS NOT NULL
LIMIT 10;
```

## Para fixar

- **WHERE** = o filtro do SQL (como o ícone de funil no Excel)
- Textos vão entre **aspas simples** (`'SP'`), números **não** precisam de aspas
- Use **AND** para "e", **OR** para "ou", **IN** para listas, **BETWEEN** para intervalos
- **LIKE** + `%` = busca por pedaço de texto (tipo "contém" no Excel)
- **IS NULL** = procura células vazias

:::tip 🚀 Quer praticar?
Vá para o **[Laboratório do Módulo 1](./exercicios)** e treine filtros WHERE com exercícios interativos.
:::
