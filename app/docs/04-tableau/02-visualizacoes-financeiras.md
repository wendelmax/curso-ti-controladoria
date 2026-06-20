# Visualizações Financeiras no Tableau

Este capítulo apresenta as visualizações mais relevantes para a controladoria — cada uma resolvendo um problema de negócio específico.

## 1. Gráfico de Cascata (Waterfall) — Demonstrativo de Resultados

O waterfall chart é ideal para mostrar a composição do resultado líquido a partir da receita bruta.

### Problema
O DRE tradicional é uma tabela. Um waterfall mostra visualmente o *fluxo* de receita → custos → despesas → resultado.

### Como construir

```tableau
Passos:
1. Conecte-se à tabela dre do Grupo Nova Era
2. Crie um campo calculado para ordenação:
```

```tableau
// Ordem DRE (campo calculado)
CASE [categoria_dre]
    WHEN 'Receita Bruta' THEN 1
    WHEN 'Deduções' THEN 2
    WHEN 'Receita Líquida' THEN 3
    WHEN 'CMV' THEN 4
    WHEN 'Margem Bruta' THEN 5
    WHEN 'Despesas Operacionais' THEN 6
    WHEN 'Resultado Financeiro' THEN 7
    WHEN 'IR/CSLL' THEN 8
    WHEN 'Lucro Líquido' THEN 9
END
```

```tableau
3. Colunas: [ordem_dre] (exato, discreto)
4. Linhas: RUNNING_SUM(SUM([valor]))
5. Marcas: Gráfico de Gantt (gannt)
6. Tamanho: SUM([valor])
7. Cor: IIF(SUM([valor]) >= 0, "Positivo", "Negativo")
```

O Gantt cria o efeito "cascata": cada barra começa onde a anterior terminou, mostrando o acúmulo.

```
Visualização esperada (valores ilustrativos):
         ████ Receita Bruta (R$ 10M)
           ██ Deduções (R$ -1,5M)
         ██████ Receita Líquida (R$ 8,5M)
            ███ CMV (R$ -3M)
         ████████ Margem Bruta (R$ 5,5M)
              ████████ ...
```

## 2. Receita vs Despesa — Comparação Mês a Mês

### Problema
Comparar performance de receitas e despesas ao longo do tempo para identificar sazonalidade e desvios.

### Como construir

```tableau
1. Colunas: MONTH([data]) como Contínuo
2. Linhas: SUM([valor])
3. Cor: [categoria_dre] (filtrado para "Receita" e "Despesa")
4. Marcas: Linha com pontos
```

Para destacar o resultado líquido mensal:

```tableau
// Campo calculado: Resultado Líquido
SUM(IIF([categoria_dre] = 'Receita', [valor], 0)) -
SUM(IIF([categoria_dre] = 'Despesa', [valor], 0))
```

Adicione uma **linha de referência**:

```tableau
Análise → Linha de Referência → 
  Valor: 0 (eixo)
  Rótulo: "Ponto de Equilíbrio"
  Cor: vermelha tracejada
```

## 3. Tendências de P&L (Profit & Loss)

### Problema
A diretoria precisa ver a evolução das principais linhas do DRE nos últimos 24 meses.

### Como construir

```tableau
1. Colunas: MONTH([data]) Contínuo
2. Linhas: SUM([valor])
3. Filtro [ano]: 2024, 2025
4. Cor: [categoria_dre] (selecionar 4-5 categorias principais)
5. Marcas: Linha
6. Detalhe: [ano] como cor separada por ano
```

**Dica de formatação financeira:**

```tableau
// Números em milhares
Clique direito em SUM(valor) → Formatar → 
  Número → Personalizado: R$ #.##0,
  (a vírgula final indica milhares)
```

Adicione **previsão**:

```tableau
Análise → Previsão → Modelo Exponencial Suavizado
  Prever por: 3 meses
  Mostrar: Intervalo de Confiança (sombreado)
```

## 4. Treemap — Balanço Patrimonial

### Problema
Visualizar a composição do ativo/passivo em um único gráfico, identificando contas mais relevantes pelo tamanho.

### Como construir

```tableau
1. Marcas: Mapa de Árvore (Treemap)
2. Tamanho: SUM([valor])
3. Cor: SUM([valor]) (escala divergente — azul ativo, laranja passivo)
4. Detalhe: [conta_contabil]
5. Rótulo: [conta_contabil] + SUM([valor])
6. Filtro: [categoria_dre] contém "Ativo" ou "Passivo"
```

```
Resultado visual:
┌──────────────────────────────────────┐
│  ████████████████                    │
│  ██ Caixa ██████ Contas a █████████  │
│  █████████ Receber ████████          │
│  ████ ████████████████               │
│  ███ Estoques ██████████████         │
│  ████████████████████████████████    │
│  ████████ Imobilizado █████████████  │
│  ──────────────────────────────────  │
│  ██████████ Fornecedores █████████   │
│  ████████████████████                │
│  ████████ Dívidas █████████████      │
└──────────────────────────────────────┘
```

## 5. Gráfico de Barras por Idade (Aging)

### Problema
Contas a receber/pagar agrupadas por faixa de atraso.

### Como construir

```tableau
1. Crie um campo calculado para faixa de aging:
```

```tableau
// Faixa de Aging
IF DATEDIFF('day', [data_vencimento], TODAY()) <= 0 THEN 'A Vencer'
ELSEIF DATEDIFF('day', [data_vencimento], TODAY()) <= 30 THEN '1-30 dias'
ELSEIF DATEDIFF('day', [data_vencimento], TODAY()) <= 60 THEN '31-60 dias'
ELSEIF DATEDIFF('day', [data_vencimento], TODAY()) <= 90 THEN '61-90 dias'
ELSE '90+ dias'
END
```

```tableau
2. Colunas: [faixa_aging] (ordenado: A Vencer, 1-30, 31-60...)
3. Linhas: SUM([saldo])
4. Cor: [faixa_aging]
5. Rótulo: SUM([saldo]) formatado como R$
```

## 6. Sparklines — Fluxo de Caixa

### Problema
Mostrar a tendência diária do saldo de caixa de forma compacta, sem eixos poluídos.

### Como construir

```tableau
1. Colunas: DAY([data]) Contínuo
2. Linhas: SUM([saldo_diario])
3. Marcas: Linha (sem marcadores, sem eixos)
4. Filtro: Últimos 30 dias
5. Ocultar eixos: botão direito → Mostrar Cabeçalhos → desmarcar
```

**Dica:** Sparklines funcionam bem em painéis (dashboard) como mini-visualizações. Use em containers com altura fixa de ~100px.

## 7. Bullet Chart — KPIs

### Problema
Comparar valor realizado vs meta vs benchmark em um único gráfico compacto.

### Como construir

```tableau
Passo 1: Estrutura de dados necessária
┌──────────────┬──────────┬───────┐
│ kpi          │ tipo     │ valor │
├──────────────┼──────────┼───────┤
│ Margem Bruta │ Real     │ 0.32  │
│ Margem Bruta │ Meta     │ 0.35  │
│ Margem Bruta │ Benchmark│ 0.30  │
└──────────────┴──────────┴───────┘
```

```tableau
2. Colunas: SUM([valor])
3. Linhas: [kpi]
4. Sobreposição: duas camadas de marcas
   - Barra fina: meta + benchmark (cor cinza)
   - Barra grossa: realizado (cor azul/verde)
5. Marcas: Barra (para realizado)
6. Adicione linha de referência para a meta
```

## 8. Heatmap — Despesas por Departamento × Mês

### Problema
Identificar padrões de gastos: quais departamentos gastam mais e em quais meses.

### Como construir

```tableau
1. Colunas: MONTH([data]) (discreto)
2. Linhas: [departamento]
3. Marcas: Quadrado (Square) — Mapa de Calor
4. Cor: SUM([valor]) — escala sequencial (branco → vermelho)
5. Tamanho: SUM([valor])
6. Rótulo: SUM([valor]) (formatado como R$)
```

```
Visualização esperada:
           Jan   Fev   Mar   Abr   Mai   Jun
Finanças   ■■■   ■■    ■■■■  ■     ■■    ■■■
RH         ■     ■■    ■     ■■■   ■     ■■
TI         ■■■■  ■■■■  ■■■■  ■■■■  ■■■■  ■■■■
Comercial  ■■    ■■    ■■    ■■    ■■    ■■
Operações  ■■■   ■     ■■    ■■    ■■■   ■

(Cor mais escura = maior despesa)
```

## Exercícios Práticos

1. **Waterfall DRE completo**
   Construa o waterfall chart para o ano de 2025 usando a tabela `dre` do Grupo Nova Era. Ordene as categorias na sequência correta do DRE.

2. **Aging de contas a pagar**
   Use a tabela `contas_pagar` para criar um aging por fornecedor. Destaque em vermelho os fornecedores com saldo acima de R$ 100 mil em atraso > 90 dias.

3. **Painel de KPIs com bullet charts**
   Crie 4 bullet charts lado a lado: Margem Bruta, Margem Líquida, EBITDA, ROIC. Use os campos `meta` e `realizado` da tabela `orcamento`.

4. **Heatmap de despesas 2025**
   Filtre despesas operacionais e crie um heatmap departamento × mês. Adicione um filtro para selecionar apenas um trimestre.

---

**Próximo: [Cálculos e LOD](03-calculos-lod.md)**
