# Dashboards Executivos no Tableau

## Conceitos Fundamentais de Dashboards

Um dashboard no Tableau é uma tela que combina múltiplas visualizações (planilhas), objetos de layout (texto, imagens, containers) e interações (filtros, ações, parâmetros).

### Princípios para Controladoria

1. **Hierarquia visual:** informação mais importante no topo/esquerda
2. **Contexto primeiro:** KPIs e totais antes dos detalhes
3. **Interatividade controlada:** filtros relevantes para o usuário final
4. **Performance:** extrair dados, limitar pontos de dados
5. **Consistência financeira:** mesmo padrão de formatação, moeda, período

## Criando seu Primeiro Dashboard

### Passo 1: Planejamento

Para o **Dashboard de Resultados Grupo Nova Era**, usaremos este layout:

```
┌──────────────────────────────────────────────────────────┐
│  HEADER: Grupo Nova Era — Dashboard de Resultados 2025   │
├────────────┬────────────┬────────────┬───────────────────┤
│ Receita    │ Despesa    │ Margem     │ EBITDA            │
│ R$ XX      │ R$ XX      │  XX%       │  R$ XX            │
├────────────┴────────────┴────────────┴───────────────────┤
│                                                          │
│  [Gráfico de Linha: Receita vs Despesa mensal]           │
│                                                          │
├────────────────────────────────────┬─────────────────────┤
│  [Treemap: Despesas por Depto]    │ [Tabela: Top 10     │
│                                    │  Clientes]           │
├────────────────────────────────────┴─────────────────────┤
│  [Waterfall: DRE Trimestral]                              │
│                                                          │
├────────────┬────────────┬────────────────────────────────┤
│ [Filtros]  │ [Legenda]  │  Atualizado: Jun/2025          │
└────────────┴────────────┴────────────────────────────────┘
```

### Passo 2: Criar as Planilhas (Worksheets)

Antes de montar o dashboard, crie cada visualização como uma planilha:

| Planilha | Tipo | Descrição |
|----------|------|-----------|
| `kpi_receita` | Texto | SUM(valor) onde categoria = "Receita" |
| `kpi_despesa` | Texto | SUM(valor) onde categoria = "Despesa" |
| `kpi_margem` | Texto | (Receita - Despesa) / Receita |
| `kpi_ebitda` | Texto | SUM(valor) onde categoria = "EBITDA" |
| `rec_desp_mensal` | Linha | Receita vs Despesa por mês |
| `treemap_despesas` | Treemap | Despesas por departamento |
| `top_clientes` | Barra | Top 10 clientes por receita |
| `waterfall_dre` | Cascata | DRE trimestral |

### Passo 3: Montar o Dashboard

```
1. Nova Planilha → Painel (Dashboard)
2. Tamanho: 1200 x 900 (Desktop), ou Automático (responsivo)
3. Arraste objetos da esquerda:
   - Container Horizontal (para os KPIs)
   - Planilhas: uma a uma
   - Container Vertical (para agrupar)
   - Objeto de Texto (título, rodapé)
```

### Passo 4: Containers

Containers são os blocos de construção do layout.

```
Container Horizontal → itens lado a lado
  │
  ├── kpi_receita
  ├── kpi_despesa
  ├── kpi_margem
  └── kpi_ebitda

Container Vertical → itens empilhados
  │
  ├── Header (texto)
  ├── Container Horizontal (KPIs)
  ├── rec_desp_mensal
  └── Container Horizontal
       ├── treemap_despesas
       └── top_clientes
```

**Dica:** Use **Container Horizontal** para KPIs lado a lado e **Container Vertical** para seções empilhadas. O aninhamento correto permite layout responsivo.

## Ações (Actions)

Ações criam interatividade entre visualizações no dashboard.

### Filter Action (Ação de Filtro)

Ao clicar em um departamento no treemap, filtra as demais visualizações.

```tableau
Dashboard → Ações → Adicionar Ação → Filtrar

Nome: "Filtrar por Departamento"
Planilha(s) de Origem: treemap_despesas
Planilha(s) de Destino: rec_desp_mensal, top_clientes, waterfall_dre
Executar ao: Selecionar
Limpar a seleção após: Mostrar todos os valores
```

**Aplicação na controladoria:** Diretor clica em "TI" no treemap e vê a evolução mensal das despesas de TI.

### Highlight Action (Ação de Destaque)

Destaca visualmente um item nas outras visualizações sem filtrar.

```tableau
Dashboard → Ações → Adicionar Ação → Destacar

Nome: "Destacar Cliente"
Origem: top_clientes
Destino: rec_desp_mensal
Executar ao: Passar o mouse
```

### URL Action (Ação de URL)

Abre um relatório externo ao clicar em um elemento.

```tableau
Dashboard → Ações → Adicionar Ação → URL

Nome: "Abrir Detalhamento"
URL: https://bi.gruponovaera.com/detalhes?conta=<conta_contabil>
Executar ao: Menu
```

## Parâmetros

Parâmetros permitem que o usuário controle valores dinamicamente.

### Exemplo: Período Dinâmico

```tableau
1. Criar Parâmetro:
   Nome: "Período de Análise"
   Tipo: Inteiro
   Valores: 1, 3, 6, 12
   Valor padrão: 12

2. Campo Calculado:
   // Data Máxima com Parâmetro
   DATEADD('month', -[Período de Análise], {MAX([data])})
```

### Exemplo: Meta Móvel (What-If)

```tableau
1. Criar Parâmetro:
   Nome: "Meta de Margem"
   Tipo: Float
   Mínimo: 0, Máximo: 1, Incremento: 0.01
   Valor padrão: 0.20

2. Campo Calculado (condicional):
   // Status vs Meta
   IF ([Margem Realizada]) >= [Meta de Margem]
   THEN 'Atingiu Meta' ELSE 'Abaixo da Meta'
   END

3. Exiba como controle deslizante no dashboard:
   Painel → Parâmetros → Mostrar Parâmetro → "Meta de Margem"
```

## Filtros no Dashboard

### Tipos de Filtro

| Tipo | Uso | Exemplo |
|------|-----|---------|
| **Filtro de Planilha Única** | Afeta apenas 1 visualização | Ano no topo do waterfall |
| **Filtro de Painel** (contextual) | Afeta todas do painel | Selecionar ano no topo |
| **Filtro de Fonte de Dados** | Afeta todas as fontes | Período global |
| **Filtro com Parâmetro** | Controle deslizante/lista | Meta dinâmica |

### Boas Práticas de Filtros

1. Coloque filtros no topo ou em um container lateral
2. Use **Mostrar Filtro** apenas para filtros relevantes ao usuário
3. Prefira **filtros de lista** a **filtros deslizantes** para categorias
4. Use **Aplicar ao Painel** para filtros globais
5. Esconda filtros administrativos (campos calculados auxiliares)

## Design e Formatação Financeira

### Paleta de Cores Recomendada

```tableau
Receita:   Azul (#1A73E8)
Despesa:   Vermelho (#D93025)
Lucro:     Verde (#1E8E3E)
Meta:      Cinza (#5F6368)
Alerta:    Laranja (#F9AB00)
Benchmark: Roxo (#9334E6)
```

### Formatação de Números

```
Valores monetários: R$ #.##0,00 (ou R$ #.##0, para milhares)
Percentuais: 0,00%
Datas: mmm/aaaa ou mmm/yy
```

### Layout Limpo

- **Margens:** 10px entre os objetos
- **Título:** Negrito, 16pt, azul escuro
- **Subtítulo:** 11pt, cinza
- **Fundo:** Branco ou cinza muito claro (#F8F9FA)
- **Grade:** Remover linhas de grade desnecessárias

## Boas Práticas para Financeiros

### 1. Mostre o Contexto Sempre

```tableau
// Indicador de performance vs período anterior (header do KPI)
IIF(SUM([valor]) > LOOKUP(SUM([valor]), -1), '▲', '▼')
```

Use triângulos (▲/▼) para indicar direção da tendência.

### 2. Hierarquia de Informação

```
Nível 1 (Topo):   KPIs consolidados do período
Nível 2 (Centro): Tendências e comparações
Nível 3 (Base):   Detalhamento (tabelas, drill-down)
```

### 3. Tooltips Enriquecedoras

Tooltips não devem apenas repetir o valor — devem adicionar contexto.

```tableau
// Tooltip personalizada
<departamento> | <mes>
Receita: <SUM(receita)>
Crescimento vs Mês Anterior: <VARIAÇÃO>
% do Total: <PERCENTUAL>
```

**Dashboard → Tooltip → Inserir → Campos**

### 4. Alerta Visual por Condição

```tableau
// Cor condicional no KPI
IF [Margem Realizada] < 0.15 THEN 'Vermelho'
ELSEIF [Margem Realizada] < 0.20 THEN 'Amarelo'
ELSE 'Verde'
END
```

## Performance Otimização

### Tabela de Decisão de Performance

| Problema | Causa | Solução |
|----------|-------|---------|
| Dashboard lento | Consulta live | Extrair dados (.hyper) |
| LOD lento | Muitos níveis | Simplificar LOD, pré-agregar |
| Muitos pontos | Dados diários | Agregar por mês |
| Filtro lento | Cardinalidade alta | Filtro contextual |
| Múltiplas fontes | Cross-database | Join na fonte de dados |

### Checklist de Performance

- [ ] Extrair dados em vez de conexão live (para dashboards compartilhados)
- [ ] Limitar filtros a itens relevantes (máximo 10-15 valores)
- [ ] Remover campos não utilizados da fonte de dados
- [ ] Usar `COUNTD` com moderação (é computacionalmente caro)
- [ ] Preferir `FIXED` a `INCLUDE`/`EXCLUDE`
- [ ] Agregar dados na origem (SQL) antes de trazer ao Tableau

## Publicação e Compartilhamento

### Tableau Public

```tableau
Arquivo → Exportar → Tableau Public como...

1. Crie uma conta em public.tableau.com
2. Arquivo → Salvar no Tableau Public
3. Defina permissões (público/não listado)
4. Compartilhe o link
```

**Limitação:** Dados ficam visíveis publicamente. Use apenas com dados sintéticos.

### Tableau Server/Cloud

```tableau
Arquivo → Publicar → Tableau Server

1. Servidor: tableau.gruponovaera.com
2. Projeto: Controladoria → Dashboards
3. Permissões: 
   - Visualização: Diretoria, Gerência
   - Edição: Analistas de Controladoria
4. Agendar Extract: Diário às 06:00
```

### Programação de Atualização

```
Servidor → Agendar → 
  Nome: "Atualização Grupo Nova Era"
  Frequência: Diária
  Horário: 06:00 BRT
  Prioridade: Alta
  Notificar: analistas@gruponovaera.com
```

## Exercícios Práticos

1. **Dashboard de Resultados (completo)**
   Monte o dashboard completo do Grupo Nova Era conforme o layout proposto. Inclua os 4 KPIs, gráfico de linha, treemap, top clientes e waterfall.

2. **Ações de Filtro**
   Adicione filter actions para que clicar em um departamento no treemap filtre todo o dashboard. Teste o comportamento.

3. **Parâmetro de Período**
   Crie um parâmetro para selecionar o período de análise (3, 6, 12 meses). Use no gráfico de linha de receita vs despesa.

4. **Tooltips Personalizadas**
   Enriqueça as tooltips de todas as visualizações com variação percentual, valor acumulado no ano e comparação com meta.

5. **Publicação**
   Exporte o dashboard para Tableau Public e compartilhe o link de visualização.

---

**Fim do Módulo: Tableau para Controladoria**

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo4" title={quizes.modulo4.title} questions={quizes.modulo4.questions} />
