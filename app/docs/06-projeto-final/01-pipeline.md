# 6.1 — Pipeline de Dados

## Objetivo

Criar um pipeline que extraia, limpe e prepare todos os dados necessários para as análises. Documente cada etapa com SQL.

## Etapa 1: Exploração Inicial

```sql
-- Conheça o banco de dados
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

Para cada tabela, entenda:
- Quantas linhas tem?
- Quais colunas estão disponíveis?
- Há valores nulos?
- Qual o período de dados?

```sql
SELECT 'empresas' AS tabela, COUNT(*) AS linhas FROM empresas
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'fornecedores', COUNT(*) FROM fornecedores
UNION ALL
SELECT 'faturamento', COUNT(*) FROM faturamento
UNION ALL
SELECT 'lancamentos_contabeis', COUNT(*) FROM lancamentos_contabeis
UNION ALL
SELECT 'contas_pagar', COUNT(*) FROM contas_pagar
UNION ALL
SELECT 'contas_receber', COUNT(*) FROM contas_receber
UNION ALL
SELECT 'notas_fiscais', COUNT(*) FROM notas_fiscais
UNION ALL
SELECT 'funcionarios', COUNT(*) FROM funcionarios
UNION ALL
SELECT 'dre_mensal', COUNT(*) FROM dre_mensal;
```

## Etapa 2: Views Analíticas

Crie consultas reutilizáveis como "views conceituais" (você pode salvá-las como CTEs para uso posterior):

### View: Receita Mensal

```sql
WITH view_receita_mensal AS (
    SELECT
        strftime('%Y-%m', data_emissao) AS mes,
        c.nome AS cliente,
        c.segmento,
        c.uf,
        f.produto_servico,
        f.valor_liquido,
        f.valor_total,
        f.valor_total - f.valor_liquido AS valor_imposto
    FROM faturamento f
    INNER JOIN clientes c ON f.id_cliente = c.id_cliente
)
SELECT * FROM view_receita_mensal
ORDER BY mes, cliente;
```

### View: Fluxo de Caixa

```sql
WITH view_fluxo_caixa AS (
    SELECT
        'Recebimento' AS tipo,
        cr.data_vencimento AS data_ref,
        cr.valor,
        c.nome AS contraparte
    FROM contas_receber cr
    INNER JOIN clientes c ON cr.id_cliente = c.id_cliente
    WHERE cr.status = 'recebido'
    UNION ALL
    SELECT
        'Pagamento' AS tipo,
        cp.data_vencimento,
        cp.valor,
        f.nome
    FROM contas_pagar cp
    INNER JOIN fornecedores f ON cp.id_fornecedor = f.id_fornecedor
    WHERE cp.status = 'pago'
)
SELECT * FROM view_fluxo_caixa
ORDER BY data_ref;
```

### View: Margem por Produto

```sql
WITH view_margem_produto AS (
    SELECT
        produto_servico,
        COUNT(*) AS qtd_vendas,
        SUM(valor_liquido) AS receita_liquida,
        SUM(valor_total) AS receita_bruta,
        ROUND(AVG(valor_liquido / NULLIF(valor_total, 0)), 4) AS taxa_liquidez_media,
        SUM(valor_liquido) * 1.0 / SUM(valor_total) AS taxa_liquidez_total
    FROM faturamento
    GROUP BY produto_servico
)
SELECT * FROM view_margem_produto
ORDER BY receita_liquida DESC;
```

## Entrega

Salve as 3 views como CTEs em um arquivo `pipeline.sql`. Elas serão a base das análises nos próximos módulos.

## Checklist

- [ ] Conhecer todas as tabelas do banco
- [ ] Identificar chaves primárias e estrangeiras
- [ ] Verificar períodos disponíveis
- [ ] Criar view de receita mensal
- [ ] Criar view de fluxo de caixa
- [ ] Criar view de margem por produto
