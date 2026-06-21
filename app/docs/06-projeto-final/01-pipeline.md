# 6.1 — Pipeline de Dados

> 📋 **Analogia do Dia**  
> Imagine que você está fechando o balanço do mês. Antes de começar qualquer análise, você precisa:
> 1. Pegar todos os comprovantes, notas fiscais e extratos
> 2. Organizar cada documento na pasta certa
> 3. Conferir se não falta nada
> 4. Preparar tudo para o cálculo
>
> **Pipeline de dados é exatamente isso** — só que em vez de pastas físicas, você usa SQL para buscar, organizar e preparar os dados.

---

## Objetivo

Criar um **pipeline** (linha de montagem de dados) que extraia, limpe e prepare todos os dados necessários para as análises. Documente cada etapa com SQL.

:::note Por que isso importa para você?

Na sua rotina de controladoria, você gasta horas — ou dias — preparando bases antes de começar a analisar:

- Exportar relatório do sistema contábil
- Abrir no Excel e ajustar formatação
- Cruzar dados de tabelas diferentes manualmente (PROCV, XLOOKUP)
- Verificar erros, duplicatas, dados faltando

O pipeline faz tudo isso **de uma vez, com um clique**. E o melhor: se você rodar de novo no mês que vem, os dados já saem prontos. **Sem Excel. Sem retrabalho.**
:::

## 🤔 O que é "pipeline" mesmo?

**Pipeline** = "linha de montagem" ou "duto". Na tecnologia, é o nome dado ao processo que:

1. **Extrai** dados da origem (banco SQL)
2. **Transforma** (limpa, organiza, junta tabelas)
3. **Carrega** no destino (tabela final pronta para análise)

Você não precisa decorar o termo. Apenas lembre: **é o "preparo do terreno" antes de plantar a análise.**

---

## Etapa 1: Exploração Inicial — "Conhecendo o Terreno"

Antes de construir qualquer coisa, você precisa saber **quais dados existem**. É como chegar num novo cliente e pedir: "quais relatórios vocês têm?"

:::tip
Sempre comece pelo `sqlite_master` — é a "lista de arquivos" do banco de dados. Mostra todas as tabelas disponíveis.
:::

```sql
-- Conheça o banco de dados
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

Para cada tabela, descubra:
- **Quantas linhas tem?** (volume de dados)
- **Quais colunas estão disponíveis?** (que informações tenho?)
- **Há valores nulos?** (dados faltando?)
- **Qual o período de dados?** (até onde vai o histórico?)

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

:::caution Preste atenção nos nulos!
Dados nulos são como **células em branco numa planilha** — podem esconder problemas. Uma nota fiscal sem cliente, um lançamento sem valor. Se encontrar nulos, anote para tratar depois.
:::

---

## Etapa 2: Views Analíticas — "Criando Suas Pastas de Trabalho"

Agora que você conhece os dados, vai criar **consultas reutilizáveis** — como se fossem **pastas organizadoras** que você pode abrir quando precisar.

Uma **CTE** (Common Table Expression, ou "Expressão de Tabela Comum") é tipo uma **planilha auxiliar** que você cria dentro da sua consulta. Você dá um nome para ela e usa depois.

:::tip Pense assim:
CTE = **rascunho organizado**. Você cria uma "tabela temporária" com um nome (ex: `view_receita_mensal`) e depois consulta ela. É mais limpo, mais organizado, e você pode reusar.
:::

### View: Receita Mensal

**O que faz:** Junta a tabela de faturamento com a de clientes para mostrar quanto cada cliente comprou, em qual mês, em qual estado.

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

**O que faz:** Junta contas a receber (entradas) e contas a pagar (saídas) em uma única lista organizada por data.

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

**O que faz:** Calcula para cada produto: quantas unidades vendeu, quanto faturou (líquido e bruto) e qual a "taxa de liquidez" (quanto sobra depois dos impostos).

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

---

## Entrega

Salve as 3 views como CTEs em um arquivo `pipeline.sql`. Elas serão a base das análises nos próximos módulos — **como se fossem os lançamentos prévios que você prepara antes de fechar o mês**.

## Checklist

- [ ] Conhecer todas as tabelas do banco
- [ ] Identificar chaves primárias e estrangeiras (quais colunas "ligam" uma tabela à outra)
- [ ] Verificar períodos disponíveis
- [ ] Criar view de receita mensal
- [ ] Criar view de fluxo de caixa
- [ ] Criar view de margem por produto

## Resumo do Capítulo

- ✅ **Pipeline** = linha de montagem: extrair, tratar, preparar
- ✅ CTE = sua "planilha auxiliar" dentro do SQL
- ✅ Conhecer os dados antes de analisar evita retrabalho
- ✅ As 3 views criadas aqui serão a base de TODO o projeto
