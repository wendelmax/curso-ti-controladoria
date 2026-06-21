# Cálculos e LOD Expressions — A "Matemática" do Tableau

> Imagine que você precisa calcular dois números no mesmo relatório:
> 1. **Quanto cada filial vendeu** (visão por filial)
> 2. **Quanto a empresa inteira vendeu** (visão geral)
>
> Sem LOD, você teria que fazer duas tabelas separadas. Com LOD, você calcula os dois níveis **na mesma célula**. É como se seu Excel pudesse ter fórmulas que "enxergam" tanto a linha atual quanto o total da planilha ao mesmo tempo.

## Cálculos de Tabela (Table Calculations) — A "Calculadora Pós-Gráfico"

Diferente de criar uma fórmula no Excel (que opera nas células), os cálculos de tabela no Tableau operam **depois** que o gráfico já foi montado. Pense neles como uma calculadora que recebe o resultado do gráfico e faz contas em cima.

### Running Total (Saldo Acumulado) — "Quanto Acumulamos até Aqui?"

Essencial para mostrar a acumulação mensal de receitas, despesas ou fluxo de caixa.

```tableau
// Running Total de Receitas
RUNNING_SUM(SUM([valor]))

// Como aplicar no Tableau:
// 1. Arraste SUM(valor) para Linhas (cria o gráfico base)
// 2. Clique DIREITO em cima do SUM(valor) na prateleira
// 3. Escolha: Adicionar Cálculo de Tabela
// 4. Tipo: Running Total
// 5. Calcular usando: Mês (data)
```

**Exemplo visual — Grupo Nova Era:**

```
Mês   | Receita | Running Total (acumulado)
Jan   | R$ 1,2M | R$ 1,2M
Fev   | R$ 1,5M | R$ 2,7M ← soma de janeiro + fevereiro
Mar   | R$ 1,1M | R$ 3,8M
Abr   | R$ 1,8M | R$ 5,6M
```

### Percentual do Total — "Qual Minha Fatia no Bolo?"

Mostra quanto cada item representa do total geral. Útil para ver concentração.

```tableau
// Exemplo: percentual da receita de cada produto
SUM([valor]) / TOTAL(SUM([valor]))

// Calcular usando: Tabela (transversal) ou Centro de Custo
```

:::note Na prática da controladoria
Quer saber quanto cada departamento gasta do total de despesas?

```tableau
// % de cada departamento nas despesas totais
SUM(IIF([categoria_dre] = 'Despesa', [valor], 0))
/
TOTAL(SUM(IIF([categoria_dre] = 'Despesa', [valor], 0)))
```
Resultado: "Financeiro = 35% das despesas, TI = 20%, RH = 15%..."
:::

### Year-over-Year (YoY Growth) — "Cresceu Quanto vs Ano Passado?"

A comparação mais clássica da controladoria: quanto faturou esse mês comparado ao mesmo mês do ano passado?

```tableau
// Fórmula de crescimento YoY
(SUM([valor]) - LOOKUP(SUM([valor]), -12))
/
ABS(LOOKUP(SUM([valor]), -12))
```

:::tip Jargão traduzido
**LOOKUP** = "olhe para trás". `LOOKUP(SUM([valor]), -12)` significa: "pegue o valor de 12 meses atrás". É como um `PROCV` no Excel, mas que busca na posição relativa.
:::

**Passo a passo completo no Tableau:**

```
1. Colunas: MONTH([data]) como Contínuo
2. Linhas: SUM([valor])
3. Cor: [ano] (cada ano de uma cor)
4. Clique direito em SUM(valor) → Cálculo de Tabela
5. Tipo: Diferença percentual de
6. Calcular usando: Mês (data)
7. Relativo a: Anterior
```

### Diferença em Relação ao Mês Anterior — "Varou Quanto de um Mês pro Outro?"

```tableau
// Variação mês a mês
ZN(SUM([valor])) - LOOKUP(ZN(SUM([valor])), -1)
```

:::caution O ZN() faz o quê?
`ZN()` significa **Zero if Null** — "zero se for nulo". Se um mês não teve movimento, o Tableau retorna NULL (em branco). O `ZN()` converte isso em ZERO para a conta não quebrar.
:::

## LOD (Level of Detail) Expressions — O "Superpoder" do Tableau

LOD é o recurso mais poderoso (e assustador) do Tableau. Vamos descomplicar.

### A Grande Ideia — "Dois Níveis na Mesma Conta"

Suponha que você tem um gráfico que mostra a receita por **cliente** (cada barra é um cliente). Agora você quer mostrar **também** a receita total da empresa (uma linha horizontal fixa).

**Problema:** O Tableau normalmente trabalha no nível da visualização (cliente). Para calcular o total geral, você precisa "escapar" desse nível.

**Solução:** LOD. É como se você dissesse: *"Tableau, ignora o nível atual e calcula ISSO aqui num nível diferente."*

### Estrutura — Parece Difícil, mas é Só um "Template"

```tableau
{TIPO_LOD [dimensão] : AGREGADO([medida])}
```

Onde `TIPO_LOD` pode ser:

| Tipo | Traduzindo | Quando usar |
|------|------------|-------------|
| **FIXED** | Fixo — "calcula neste nível exato, ignorando o resto" | Total geral, meta global |
| **INCLUDE** | Inclui — "adianta uma dimensão ao cálculo" | Média por cliente dentro de cada mês |
| **EXCLUDE** | Exclui — "tira uma dimensão do cálculo" | Comparar item com total |

## FIXED — "Calcula Neste Nível Exato e Ignora o Resto"

O `FIXED` calcula no nível que você escolher, mesmo que a visualização esteja em outro nível.

### Exemplo 1: Market Share por Cliente

"Quanto este cliente representa do total **de todos os clientes**?"

```tableau
// Market Share = Receita do Cliente / Receita Total (ignorando filtros)
SUM([valor]) / {FIXED : SUM([valor])}
```

:::tip O truque aqui
Mesmo que o gráfico mostre só **2025**, o `{FIXED : SUM([valor])}` calcula o **total de todos os anos**. Se você quiser o market share **dentro do ano filtrado apenas**, faça:

```tableau
SUM([valor]) / {FIXED [ano] : SUM([valor])}
```
Agora o denominador "congela" no ano — sem ignorar o filtro.
:::

### Exemplo 2: % da Despesa por Centro de Custo

"Quanto cada centro de custo representa do total de despesas?"

```tableau
SUM([valor]) / {FIXED : SUM(IIF([categoria_dre] = 'Despesa', [valor], 0))}
```

### Exemplo 3: Ticket Médio por Cliente

"Qual o valor médio gasto por cliente?"

```tableau
// Receita total / Número de clientes (sem duplicar)
{FIXED : SUM([valor])} / {FIXED : COUNTD([cliente_id])}
```

### Exemplo 4: Meta Global vs Realizado por Filial

"Quanto cada filial realizou da meta total da empresa?"

```tableau
SUM([realizado]) / {FIXED : SUM([meta])}
```

## INCLUDE — "Adiciona uma Dimensão ao Nível Atual"

Usado quando você quer calcular algo em um nível **mais detalhado** que o da visualização.

### Exemplo: Média de Receita por Cliente (Mês a Mês)

Seu gráfico está no nível de **mês**, mas você quer saber a média de receita **por cliente** dentro de cada mês:

```tableau
// Receita total do mês / Número de clientes naquele mês
SUM([valor]) / {INCLUDE [cliente_id] : COUNTD([cliente_id])}
```

:::note Por que não usar COUNTD direto?
Sem o `INCLUDE`, o `COUNTD([cliente_id])` contaria no nível da visualização (mês). Com `INCLUDE`, ele conta **dentro de cada mês, por cliente** — que é o que você realmente quer.
:::

### Exemplo: Despesa Máxima por Departamento Dentro de Cada Mês

```tableau
{INCLUDE [departamento], MONTH([data]) : MAX(SUM([valor]))}
```

## EXCLUDE — "Remove uma Dimensão do Nível Atual"

Útil para comparar o valor detalhado com o valor total.

### Exemplo: Diferença entre o Departamento e o Total

"Quanto este departamento representa a menos (ou a mais) que o total?"

```tableau
// Valor do departamento - Total geral (excluindo departamento)
SUM([valor]) - {EXCLUDE [departamento] : SUM([valor])}
```

### Exemplo: Saldo por Conta vs Total

```tableau
// Quanto cada conta difere do total (excluindo ela mesma)
SUM([saldo]) - {EXCLUDE [conta_contabil] : SUM([saldo])}
```

## Running Balance com LOD — "Saldo Acumulado Sem Buracos"

**Problema clássico:** Se uma conta não teve transação em fevereiro, um running total simples "pula" esse mês. O resultado fica errado.

**Solução com FIXED:**

```tableau
// Garante que TODAS as contas apareçam em TODOS os meses
RUNNING_SUM({FIXED [mes], [conta_contabil] : SUM([valor])})
```

:::caution Por que isso funciona?
O `FIXED` força o Tableau a calcular o valor para **cada mês + cada conta**, mesmo quando não há transação (neste caso, o valor é zero). Assim o running total não tem "saltos" — ele fica contínuo e correto.
:::

## Exemplo Prático Completo: Análise de Rentabilidade por Cliente — "Colocando Tudo Junto"

Vamos usar dados da tabela `faturamento` (`cliente_id`, `mes`, `receita`, `custo_total`) para construir uma análise de rentabilidade em 4 níveis — cada nível mais sofisticado que o anterior.

### Nível 1: Margem Bruta por Cliente — "Quanto Cada Cliente Gera de Lucro?"

```tableau
// Visualização: cada barra é um cliente
SUM([receita]) - SUM([custo_total])
```

### Nível 2: % da Margem em Relação ao Total — "Qual a Participação de Cada Um?"

```tableau
// Margem do cliente dividida pela margem total da empresa
(SUM([receita]) - SUM([custo_total])) / 
{FIXED : (SUM([receita]) - SUM([custo_total]))}
```

### Nível 3: Rentabilidade Relativa (Benchmark) — "Esse Cliente Está Acima ou Abaixo da Média?"

```tableau
// Diferença da margem do cliente para a média de TODOS os clientes
(SUM([receita]) - SUM([custo_total])) - 
{FIXED : AVG({INCLUDE [cliente_id] : SUM([receita]) - SUM([custo_total])})}
```

### Nível 4: Classificação ABC (Curva 80/20) — "Quem São os Clientes que Mais Importam?"

Aplicando a regra de Pareto (80% da receita vem de 20% dos clientes):

```tableau
// Receita Acumulada em % (base da classificação ABC)
RUNNING_SUM(SUM([receita]) / {FIXED : SUM([receita])})

// Classificação final:
IF RUNNING_SUM(SUM([receita]) / {FIXED : SUM([receita])}) <= 0.8 THEN 'A'
ELSEIF RUNNING_SUM(SUM([receita]) / {FIXED : SUM([receita])}) <= 0.95 THEN 'B'
ELSE 'C'
END
```

:::tip Na prática da controladoria
Com essa classificação, você descobre rapidamente: "Classe A = 20% dos clientes que geram 80% da receita. Classe C = 50% dos clientes que geram só 5%." Isso guia decisões de onde focar esforços comerciais.
:::

## Comparação: Cálculo de Tabela vs LOD — "Qual Usar em Cada Situação?"

| Situação | Cálculo de Tabela | LOD |
|----------|------------------|-----|
| % do total dentro do gráfico | ✅ `TOTAL(SUM(x))` | ✅ `{FIXED : SUM(x)}` |
| % do total **ignorando** filtros da tela | ❌ Não consegue | ✅ `{FIXED : SUM(x)}` |
| Comparação com ano passado (YoY) | ✅ `LOOKUP(..., -12)` | ✅ também funciona |
| Saldo acumulado (running total) | ✅ `RUNNING_SUM` | ✅ `RUNNING_SUM({FIXED...})` |
| Performance com muitos dados | ✅ Mais rápido | ⚠️ Pode ficar lento |
| Facilidade de entender | ✅ Simples | ⚠️ Mais complicado |

## Dicas de Performance com LOD — "Não Deixe o Tableau Engasgar"

1. **Prefira `FIXED`** a `INCLUDE`/`EXCLUDE` sempre que possível — é o mais eficiente
2. Crie campos LOD na **fonte de dados** (Data Source), não na planilha — rende mais
3. **Extraia dados** (.hyper) se estiver usando várias LODs complexas
4. **Teste com poucos dados** antes de aplicar no dataset completo — evite surpresas

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

## Resumo rápido — Cálculos e LOD

| Conceito | Traduzindo | Quando usar |
|----------|------------|-------------|
| **Running Total** | Saldo acumulado | Receita acumulada no ano |
| **Percentual do Total** | Fatia do bolo | % de cada departamento |
| **YoY** | Vs ano passado | Crescimento anual |
| **FIXED** | "Calcula neste nível, ponto final" | Market share, meta global |
| **INCLUDE** | "Adiciona este detalhe ao cálculo" | Média por cliente dentro do mês |
| **EXCLUDE** | "Tira esta dimensão do cálculo" | Item vs total |

> 💡 **Lembrete:** Se você quer um número que **não muda** quando você aplica filtros, use `FIXED`. Se quer comparar o detalhe com o total, use `EXCLUDE`. Se quer adicionar um nível de detalhe, use `INCLUDE`.

**Próximo: [Dashboards Executivos](04-dashboards.md)**
