# Cálculos e LOD Expressions

## Cálculos de Tabela (Table Calculations)

Os cálculos de tabela operam sobre os dados *após* a agregação. Eles são executados no resultado da consulta, não na fonte.

### Running Total (Saldo Acumulado)

Essencial para demonstrar acumulação mensal de receitas, despesas ou fluxo de caixa.

```tableau
// Running Total de Receitas
RUNNING_SUM(SUM([valor]))

// Como usar:
// 1. Arraste SUM(valor) para Linhas
// 2. Clique direito → Adicionar Cálculo de Tabela
// 3. Tipo: Running Total
// 4. Calcular usando: Mês (data)
```

**Exemplo Grupo Nova Era:**

```
Mês   | Receita | Running Total
Jan   | R$ 1,2M | R$ 1,2M
Fev   | R$ 1,5M | R$ 2,7M
Mar   | R$ 1,1M | R$ 3,8M
Abr   | R$ 1,8M | R$ 5,6M
```

### Percentual do Total

Mostra participação de cada item no total geral.

```tableau
// Percentual da Receita por Produto
SUM([valor]) / TOTAL(SUM([valor]))

// Calcular usando: Tabela (Transversal)
// ou: Centro de Custo (específico)
```

**Aplicação na controladoria:**

```tableau
// % de cada departamento nas despesas totais
SUM(IIF([categoria_dre] = 'Despesa', [valor], 0))
/
TOTAL(SUM(IIF([categoria_dre] = 'Despesa', [valor], 0)))
```

### Year-over-Year (YoY Growth)

Comparação com o mesmo período do ano anterior.

```tableau
// Crescimento YoY
(SUM([valor]) - LOOKUP(SUM([valor]), -12))
/
ABS(LOOKUP(SUM([valor]), -12))
```

O `LOOKUP` busca o valor 12 períodos atrás. Para isso, a data deve estar como dimensão contínua mês-a-mês.

**Passo a passo no Tableau:**

```
1. Colunas: MONTH([data]) Contínuo
2. Linhas: SUM([valor])
3. Cor: [ano]
4. Calcular tabela em SUM(valor) → Diferença percentual de
5. Calcular usando: Mês (data)
6. Relativo a: Anterior
```

### Diferença em Relação ao Período Anterior

```tableau
// Variação mês a mês
ZN(SUM([valor])) - LOOKUP(ZN(SUM([valor])), -1)
```

Usar `ZN()` para converter NULL em zero.

## LOD (Level of Detail) Expressions

LOD Expressions são o recurso mais poderoso do Tableau para análises financeiras. Elas permitem calcular agregados em um nível de granularidade *diferente* do nível da visualização.

### Estrutura de uma LOD

```tableau
{LOD_TYPE [dimensão] : AGREGADO([medida])}
```

Onde `LOD_TYPE` é `FIXED`, `INCLUDE` ou `EXCLUDE`.

## FIXED — Granularidade Fixa

Calcula o valor em um nível específico, ignorando os filtros da visualização (a menos que sejam contextuais).

### Exemplo 1: Market Share por Cliente

```tableau
// Market Share: Receita do Cliente / Receita Total
// Nível fixo: TODOS os clientes (Total Geral)

SUM([valor]) / {FIXED : SUM([valor])}
```

**Contexto:** Mesmo que a visualização filtre por ano = 2025, o denominador calcula o total global.

```tableau
// Se quiser market share dentro do ano filtrado:
SUM([valor]) / {FIXED [ano] : SUM([valor])}
```

### Exemplo 2: % da Despesa por Centro de Custo

```tableau
// % de cada centro de custo nas despesas totais
SUM([valor]) / {FIXED : SUM(IIF([categoria_dre] = 'Despesa', [valor], 0))}
```

### Exemplo 3: Receita Média por Cliente

```tableau
// Ticket médio: receita total / nº clientes
{FIXED : SUM([valor])} / {FIXED : COUNTD([cliente_id])}
```

### Exemplo 4: Meta Global vs Realizado por Filial

```tableau
// Meta total da empresa (fixa) vs realizado por filial
SUM([realizado]) / {FIXED : SUM([meta])}
```

## INCLUDE — Nível Mais Detalhado

Adiciona uma dimensão ao nível de detalhe da visualização.

### Exemplo: Média de Receita por Cliente (Mês a Mês)

Se a visualização está no nível de mês:

```tableau
// Receita total por mês / Número de clientes naquele mês
SUM([valor]) / {INCLUDE [cliente_id] : COUNTD([cliente_id])}
```

Sem o `INCLUDE`, `COUNTD([cliente_id])` seria contado no nível da visualização (mês). O `INCLUDE` garante que cada cliente seja contado individualmente antes da agregação.

### Exemplo: Despesa Máxima por Departamento Dentro de Cada Mês

```tableau
{INCLUDE [departamento], MONTH([data]) : MAX(SUM([valor]))}
```

## EXCLUDE — Remove Granularidade

Remove uma dimensão do nível de detalhe. Útil para comparar o valor agregado com o valor por item.

### Exemplo: Diferença entre o Total e cada Departamento

```tableau
// Valor do departamento vs Total geral (excluindo departamento)
SUM([valor]) - {EXCLUDE [departamento] : SUM([valor])}
```

### Exemplo: Saldo Total vs Saldo por Conta

```tableau
// Quanto cada conta representa do total, excluindo a própria conta
SUM([saldo]) - {EXCLUDE [conta_contabil] : SUM([saldo])}
```

## Running Balance com LOD

Para calcular saldo acumulado considerando transações, mesmo quando algumas contas não têm movimento no período:

```tableau
// Saldo Acumulado com FIXED + RUNNING SUM
RUNNING_SUM({FIXED [mes], [conta_contabil] : SUM([valor])})
```

**Problema resolvido:** Se uma conta não tem transação em fevereiro, um running total simples daria salto. O FIXED garante que o valor seja calculado e carregado para todos os meses.

## Exemplo Prático Completo: Análise de Rentabilidade por Cliente

Dados: tabela `faturamento` com `cliente_id`, `mes`, `receita`, `custo_total`

### Nível 1: Margem Bruta por Cliente

```tableau
// Visualização por cliente
SUM([receita]) - SUM([custo_total])
```

### Nível 2: % da Margem em Relação ao Total

```tableau
// Margem do cliente vs margem total da empresa
(SUM([receita]) - SUM([custo_total])) / 
{FIXED : (SUM([receita]) - SUM([custo_total]))}
```

### Nível 3: Rentabilidade Relativa (Benchmark)

```tableau
// Diferença da margem do cliente para a média de todos os clientes
(SUM([receita]) - SUM([custo_total])) - 
{FIXED : AVG({INCLUDE [cliente_id] : SUM([receita]) - SUM([custo_total])})}
```

### Nível 4: Classificação ABC (80/20)

```tableau
// Receita Acumulada % (base para classificação ABC)
RUNNING_SUM(SUM([receita]) / {FIXED : SUM([receita])})
```

Regra de negócio na controladoria:

```tableau
// Classificação ABC
IF RUNNING_SUM(SUM([receita]) / {FIXED : SUM([receita])}) <= 0.8 THEN 'A'
ELSEIF RUNNING_SUM(SUM([receita]) / {FIXED : SUM([receita])}) <= 0.95 THEN 'B'
ELSE 'C'
END
```

## Comparação: Cálculo de Tabela vs LOD

| Situação | Cálculo de Tabela | LOD |
|----------|------------------|-----|
| % do total dentro da visualização | `TOTAL(SUM(x))` | `&#123;FIXED : SUM(x)&#125;` |
| % do total ignorando filtros | ❌ Não pode | ✅ `&#123;FIXED : SUM(x)&#125;` |
| YoY mensal | ✅ `LOOKUP(..., -12)` | ✅ `SUM([valor]) - SUM(&#123;FIXED [ano-1]: [valor]&#125;)` |
| Running total | ✅ `RUNNING_SUM` | ✅ `RUNNING_SUM(&#123;FIXED...&#125;)` |
| Performance em grandes volumes | Rápido | Pode ser lento com muitos níveis |
| Legibilidade | Simples | Mais verboso |

## Dicas de Performance com LOD

1. Prefira `FIXED` a `INCLUDE`/`EXCLUDE` quando possível — é mais eficiente
2. Crie campos calculados com LOD na fonte de dados (Data Source), não na planilha
3. Extraia dados (.hyper) ao usar múltiplas LODs complexas
4. Teste com subconjunto de dados antes de aplicar ao dataset completo

## Exercícios Práticos

1. **Market Share por Cliente (2025)**
   Calcule o market share de cada cliente usando `FIXED`. Crie um gráfico de barras com os top 10 clientes. Adicione uma linha de referência em 50%.

2. **% das Despesas por Departamento vs Total Global**
   Use `FIXED` para calcular o percentual que cada departamento representa do total de despesas. Ignore filtros de ano.

3. **Running Balance de Contas a Pagar**
   Crie um running total do saldo de contas a pagar. Use `FIXED [data]` para garantir que todas as contas apareçam em todos os meses.

4. **Classificação ABC de Clientes**
   Implemente a classificação ABC usando `RUNNING_SUM` + `FIXED`. Destaque clientes A em verde, B em amarelo, C em vermelho.

5. **Variação YoY da Margem Líquida**
   Calcule o crescimento YoY da margem líquida usando `LOOKUP`. Filtre apenas 2025 e 2026 para comparação direta.

---

**Próximo: [Dashboards Executivos](04-dashboards.md)**
