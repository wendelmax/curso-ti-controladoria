# 1.4 — Trabalhando com JOINs

:::tip Traduzindo para o seu dia a dia
JOIN é como o **PROCV do Excel**, mas muito mais poderoso.

No Excel, para trazer o nome do cliente para uma planilha de vendas, você usava PROCV: procura o ID do cliente na tabela de clientes e traz o nome. No SQL, você faz a mesma coisa com JOIN:

- `INNER JOIN` = PROCV que **só traz quando acha correspondência** (se não achar o cliente, a linha não aparece)
- `LEFT JOIN` = PROCV que **mantém tudo da planilha original**, mesmo sem correspondência (o nome do cliente fica em branco)

A vantagem do SQL? Você pode juntar 3, 5, 10 tabelas de uma vez — algo que no Excel viraria uma loucura de PROCVs aninhados.
:::

:::note Por que isso importa para você?
Pense na última vez que você precisou de um relatório com: nome do cliente + valor da venda + centro de custo. No ERP, essas informações estão em tabelas diferentes. No Excel, você usaria PROCV para juntar tudo.

JOIN é o PROCV do SQL — mas infinitamente mais rápido e sem o risco de arrastar a fórmula errada. Você vai usar JOIN em **todo relatório minimamente complexo** da controladoria.
:::

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

`FROM lancamentos_contabeis l` — o `l` é um alias (apelido). Use aliases curtos para não precisar digitar o nome inteiro da tabela toda vez.

:::tip Dica
Aliases comuns que você vai ver na prática:
- `l` para `lancamentos_contabeis`
- `p` para `planos_contas`
- `f` para `faturamento` ou `funcionarios`
- `c` para `clientes` ou `centros_custo`
- `cp` para `contas_pagar`
- `cr` para `contas_receber`

Escolha o sentido que fizer mais claro para você.
:::

## Nulos em LEFT JOIN

Útil para encontrar registros "órfãos" — aqueles que não têm correspondência na outra tabela:

:::caution Cuidado com CROSS JOIN acidental
Se você fizer um JOIN **sem a condição ON**, o SQL combina **cada** linha de uma tabela com **todas** as linhas da outra. Se a tabela A tem 1.000 linhas e a B tem 500, o resultado terá 500.000 linhas. Isso se chama **CROSS JOIN** (produto cartesiano) e quase nunca é o que você quer. **Sempre verifique se o ON está correto.**
:::

```sql
SELECT f.nome
FROM funcionarios f
LEFT JOIN folha_pagamento fp ON f.id_funcionario = fp.id_funcionario
WHERE fp.id_folha IS NULL;
```

## Para fixar

- **INNER JOIN** = só traz quando tem correspondência (como PROCV com `FALSO`)
- **LEFT JOIN** = mantém tudo da esquerda, mesmo sem match (como PROCV com `VERDADEIRO`)
- **Sempre** use a cláusula **ON** para dizer como as tabelas se relacionam
- Use **aliases** (`FROM faturamento f`) para não repetir nome de tabela

:::tip 🚀 Quer praticar?
Vá para o **[Laboratório do Módulo 1](./exercicios)** e treine JOINs com exercícios interativos.
:::
