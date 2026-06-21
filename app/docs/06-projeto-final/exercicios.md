# 6.7 — Projeto Final: Exercícios Práticos

import SqlExercicio from '@site/src/components/SqlExercicio';

> ✍️ **Analogia do Dia**  
> Lembra quando você estava aprendendo a fechar o balanço e fazia exercícios com casos fictícios antes de pegar um balanço real?
>
> **Estes exercícios são a mesma coisa.** São 6 desafios que testam tudo que você aprendeu — do SQL básico à análise financeira completa.
>
> É o "simulado" antes da prova. Mas a prova aqui é a vida real.

---

Este projeto integra todos os módulos do curso em um case real de análise financeira.

:::note Como usar este material
Cada exercício tem um **editor SQL interativo**. Você digita a query, executa e vê o resultado na hora. Se travar, use a dica (`hint`). Se quiser conferir, veja a resposta esperada (`expectedSql`).

**Não copie a resposta de cara.** Tente fazer sozinho primeiro. Errar faz parte do aprendizado!
:::

---

## Etapa 1: Análise de Faturamento

**O que testa:** `JOIN`, `GROUP BY`, `STRFTIME`

Calcule o faturamento total por empresa e por mês, ordenado por empresa e mês. É como fazer um "total por empresa e mês" no Excel, mas em SQL.

<SqlExercicio
  id="pf-1"
  prompt="**Query:** Calcule o faturamento total por empresa e mês (janeiro a junho de 2026). Exiba: nome da empresa, mês (número) e total de faturamento. Ordene por empresa e mês."
  hint="Use STRFTIME para extrair o mês e GROUP BY para agregar."
  expectedSql="SELECT e.nome AS empresa, CAST(STRFTIME('%m', f.data) AS INTEGER) AS mes, SUM(f.valor) AS total_faturamento FROM faturamento f JOIN empresas e ON f.empresa_id = e.id GROUP BY e.nome, mes ORDER BY e.nome, mes"
  table="faturamento, empresas"
/>

:::tip
Se está travando, lembre: primeiro faça o JOIN entre faturamento e empresas, depois agrupe por empresa e mês.
:::

---

## Etapa 2: DRE Simplificado

**O que testa:** `CASE WHEN`, agregação condicional

Monte a DRE (Demonstração do Resultado) consolidada de todas as empresas. Você já sabe fazer DRE — agora faz em SQL.

<SqlExercicio
  id="pf-2"
  prompt="**Query:** Calcule o lucro líquido consolidado de janeiro a junho. Para cada mês, mostre: mês, total de receitas (lançamentos crédito), total de despesas (lançamentos débito) e lucro líquido (receitas - despesas). Ordene por mês."
  hint="Filtre lancamentos_contabeis por tipo 'Crédito' para receitas e 'Débito' para despesas. Use STRFTIME para o mês."
  expectedSql="SELECT CAST(STRFTIME('%m', data_lancamento) AS INTEGER) AS mes, SUM(CASE WHEN tipo = 'Crédito' THEN valor ELSE 0 END) AS receitas, SUM(CASE WHEN tipo = 'Débito' THEN valor ELSE 0 END) AS despesas, SUM(CASE WHEN tipo = 'Crédito' THEN valor ELSE -valor END) AS lucro_liquido FROM lancamentos_contabeis GROUP BY mes ORDER BY mes"
  table="lancamentos_contabeis"
/>

---

## Etapa 3: Análise de Inadimplência

**O que testa:** `LEFT JOIN`, `COALESCE`, `HAVING`

Identifique clientes inadimplentes e calcule o percentual de contas vencidas. **Informação crítica para a diretoria.**

<SqlExercicio
  id="pf-3"
  prompt="**Query:** Liste os clientes com contas a receber vencidas (vencimento anterior a hoje). Mostre: nome do cliente, total vencido, total geral, e percentual de inadimplência (total vencido / total geral * 100). Ordene do maior percentual para o menor."
  hint="Use LEFT JOIN de clientes com contas_receber, filtre vencimento < DATE('now') para vencidas."
  expectedSql="SELECT c.nome, COALESCE(SUM(CASE WHEN cr.vencimento < DATE('now') THEN cr.valor ELSE 0 END), 0) AS total_vencido, COALESCE(SUM(cr.valor), 0) AS total_geral, CASE WHEN COALESCE(SUM(cr.valor), 0) > 0 THEN ROUND(COALESCE(SUM(CASE WHEN cr.vencimento < DATE('now') THEN cr.valor ELSE 0 END), 0) * 100.0 / SUM(cr.valor), 2) ELSE 0 END AS pct_inadimplencia FROM clientes c LEFT JOIN contas_receber cr ON c.id = cr.cliente_id GROUP BY c.nome HAVING total_vencido > 0 ORDER BY pct_inadimplencia DESC"
  table="clientes, contas_receber"
/>

---

## Etapa 4: Dashboard de Indicadores

**O que testa:** Subqueries, `CASE WHEN` avançado, KPIs financeiros

Calcule indicadores-chave para o dashboard executivo. **É a base do painel que a diretoria vai usar.**

<SqlExercicio
  id="pf-4"
  prompt="**Query:** Calcule os seguintes KPIs consolidados para o primeiro semestre de 2026: receita total, CPV (custos), despesas operacionais, lucro bruto e margem bruta percentual."
  hint="Use dados de lancamentos_contabeis. Receitas são Crédito, Custos e Despesas são Débito. Você pode agrupar por centro de custo ou usar CASE."
  expectedSql="SELECT SUM(CASE WHEN tipo = 'Crédito' THEN valor ELSE 0 END) AS receita_total, SUM(CASE WHEN tipo = 'Débito' AND centro_custo_id IN (SELECT id FROM centros_custo WHERE nome LIKE '%Custo%') THEN valor ELSE 0 END) AS cpv, SUM(CASE WHEN tipo = 'Débito' AND centro_custo_id IN (SELECT id FROM centros_custo WHERE nome LIKE '%Despesa%' OR nome LIKE '%Administrativo%' OR nome LIKE '%Comercial%') THEN valor ELSE 0 END) AS despesas_operacionais, SUM(CASE WHEN tipo = 'Crédito' THEN valor ELSE 0 END) - SUM(CASE WHEN tipo = 'Débito' AND centro_custo_id IN (SELECT id FROM centros_custo WHERE nome LIKE '%Custo%') THEN valor ELSE 0 END) AS lucro_bruto, ROUND((SUM(CASE WHEN tipo = 'Crédito' THEN valor ELSE 0 END) - SUM(CASE WHEN tipo = 'Débito' AND centro_custo_id IN (SELECT id FROM centros_custo WHERE nome LIKE '%Custo%') THEN valor ELSE 0 END)) * 100.0 / NULLIF(SUM(CASE WHEN tipo = 'Crédito' THEN valor ELSE 0 END), 0), 2) AS margem_bruta_pct FROM lancamentos_contabeis"
  table="lancamentos_contabeis, centros_custo"
/>

---

## Etapa 5: Previsão de Fluxo de Caixa

**O que testa:** Subqueries correlacionadas, `COALESCE`

Use os dados de contas a pagar e receber para projetar o fluxo de caixa. Você já faz isso no Excel — agora faz em SQL.

<SqlExercicio
  id="pf-5"
  prompt="**Query:** Projete o fluxo de caixa para julho de 2026. Some todas as contas a receber previstas com vencimento em julho e subtraia as contas a pagar com vencimento em julho. Mostre: total_entradas, total_saidas e saldo_projetado."
  hint="Filtre contas_receber e contas_pagar WHERE STRFTIME('%m', vencimento) = '07'."
  expectedSql="SELECT (SELECT COALESCE(SUM(valor), 0) FROM contas_receber WHERE STRFTIME('%m', vencimento) = '07') AS total_entradas, (SELECT COALESCE(SUM(valor), 0) FROM contas_pagar WHERE STRFTIME('%m', vencimento) = '07') AS total_saidas, (SELECT COALESCE(SUM(valor), 0) FROM contas_receber WHERE STRFTIME('%m', vencimento) = '07') - (SELECT COALESCE(SUM(valor), 0) FROM contas_pagar WHERE STRFTIME('%m', vencimento) = '07') AS saldo_projetado"
  table="contas_receber, contas_pagar"
/>

---

## Etapa 6: Análise de Performance Final

**O que testa:** TUDO — JOIN, GROUP BY, COALESCE, ordenação

Combine todos os dados em uma única análise de performance. **O "fechamento" do projeto.**

<SqlExercicio
  id="pf-6"
  prompt="**Query:** Crie uma análise completa por empresa: nome da empresa, total de faturamento, total de despesas (contas a pagar), e saldo líquido (faturamento - despesas). Ordene do melhor saldo para o pior."
  hint="LEFT JOIN faturamento e contas_pagar com empresas. Agregue por empresa."
  expectedSql="SELECT e.nome AS empresa, COALESCE(SUM(f.valor), 0) AS total_faturamento, COALESCE(SUM(cp.valor), 0) AS total_despesas, COALESCE(SUM(f.valor), 0) - COALESCE(SUM(cp.valor), 0) AS saldo_liquido FROM empresas e LEFT JOIN faturamento f ON e.id = f.empresa_id LEFT JOIN contas_pagar cp ON e.id = cp.empresa_id GROUP BY e.nome ORDER BY saldo_liquido DESC"
  table="empresas, faturamento, contas_pagar"
/>

---

## Resumo — O Que Você Dominou

| Etapa | Habilidade | Nível |
|-------|-----------|-------|
| 1 | `JOIN` + `GROUP BY` | ⭐ Essencial |
| 2 | `CASE WHEN` em finanças | ⭐ Essencial |
| 3 | `LEFT JOIN` + inadimplência | ⭐⭐ Importante |
| 4 | KPIs + subqueries | ⭐⭐ Importante |
| 5 | Projeção de fluxo de caixa | ⭐⭐ Importante |
| 6 | Análise completa (tudo junto) | ⭐⭐⭐ Desafio Final |

**Parabéns!** Ao completar todas as etapas, você dominou:

- SQL analítico com JOINs, agregações e subqueries
- Modelagem de dados e KPIs financeiros
- Construção de pipelines de análise
- Preparação para dashboards em Looker e Tableau
- Fundamentos de ML para previsão financeira

:::tip Lembre-se: você não precisa saber TUDO de SQL
Você precisa saber o suficiente para **resolver problemas reais de controladoria**. E esses 6 exercícios cobrem EXATAMENTE o que você vai usar no dia a dia.

O resto você aprende quando precisar — o Google é seu amigo! 🚀
:::

Agora você está pronto para aplicar esses conhecimentos em situações reais de análise financeira e controladoria!
