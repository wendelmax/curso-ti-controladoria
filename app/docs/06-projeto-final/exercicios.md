# 🧪 Laboratório de Prática — Projeto Final

import PraticarLab from '@site/src/components/PraticarLab'

<PraticarLab
  moduleId="modulo6"
  titulo="Análise de Faturamento"
  nivel={1}
  exercicios={[
    { id: "pf-1", prompt: "Calcule o faturamento total por empresa e mês (jan-jun/2026). Exiba: empresa, mês e total. Ordene por empresa e mês.", hint: "JOIN faturamento com empresas, GROUP BY e STRFTIME para extrair mês", table: "faturamento, empresas", expectedSql: "SELECT e.nome_fantasia AS empresa, CAST(STRFTIME('%m', f.data_emissao) AS INTEGER) AS mes, SUM(f.valor_liquido) AS total_faturamento FROM faturamento f JOIN empresas e ON f.id_empresa = e.id_empresa GROUP BY e.nome_fantasia, mes ORDER BY e.nome_fantasia, mes" },
  ]}
/>

<PraticarLab
  moduleId="modulo6"
  titulo="DRE Simplificado"
  nivel={2}
  exercicios={[
    { id: "pf-2", prompt: "Calcule o lucro líquido consolidado jan-jun. Mostre: mês, receitas (crédito), despesas (débito) e lucro líquido.", hint: "CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END para receitas", table: "lancamentos_contabeis", expectedSql: "SELECT CAST(STRFTIME('%m', data_lancamento) AS INTEGER) AS mes, SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END) AS receitas, SUM(CASE WHEN debito_credito = 'debito' THEN valor ELSE 0 END) AS despesas, SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE -valor END) AS lucro_liquido FROM lancamentos_contabeis GROUP BY mes ORDER BY mes" },
  ]}
/>

<PraticarLab
  moduleId="modulo6"
  titulo="Análise de Inadimplência"
  nivel={2}
  exercicios={[
    { id: "pf-3", prompt: "Liste clientes com contas vencidas. Mostre: nome, total vencido, total geral e % inadimplência.", hint: "LEFT JOIN clientes com contas_receber, CASE WHEN data_vencimento < DATE('now')", table: "clientes, contas_receber", expectedSql: "SELECT c.nome, COALESCE(SUM(CASE WHEN cr.data_vencimento < DATE('now') THEN cr.valor ELSE 0 END), 0) AS total_vencido, COALESCE(SUM(cr.valor), 0) AS total_geral, CASE WHEN COALESCE(SUM(cr.valor), 0) > 0 THEN ROUND(COALESCE(SUM(CASE WHEN cr.data_vencimento < DATE('now') THEN cr.valor ELSE 0 END), 0) * 100.0 / SUM(cr.valor), 2) ELSE 0 END AS pct_inadimplencia FROM clientes c LEFT JOIN contas_receber cr ON c.id_cliente = cr.id_cliente GROUP BY c.nome HAVING total_vencido > 0 ORDER BY pct_inadimplencia DESC" },
  ]}
/>

<PraticarLab
  moduleId="modulo6"
  titulo="Dashboard de Indicadores"
  nivel={3}
  exercicios={[
    { id: "pf-4", prompt: "Calcule KPIs consolidados: receita total, CPV, despesas, lucro bruto e margem bruta %. Semestre 2026.", hint: "Filtre por centros de custo com departamento = 'Produção' para CPV", table: "lancamentos_contabeis, centros_custo", expectedSql: "SELECT SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END) AS receita_total, SUM(CASE WHEN debito_credito = 'debito' AND id_centro_custo IN (SELECT id_centro_custo FROM centros_custo WHERE departamento = 'Produção') THEN valor ELSE 0 END) AS cpv, SUM(CASE WHEN debito_credito = 'debito' AND id_centro_custo IN (SELECT id_centro_custo FROM centros_custo WHERE departamento IN ('Administrativo', 'Comercial', 'Operacional')) THEN valor ELSE 0 END) AS despesas_operacionais, SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END) - SUM(CASE WHEN debito_credito = 'debito' AND id_centro_custo IN (SELECT id_centro_custo FROM centros_custo WHERE departamento = 'Produção') THEN valor ELSE 0 END) AS lucro_bruto, ROUND((SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END) - SUM(CASE WHEN debito_credito = 'debito' AND id_centro_custo IN (SELECT id_centro_custo FROM centros_custo WHERE departamento = 'Produção') THEN valor ELSE 0 END)) * 100.0 / NULLIF(SUM(CASE WHEN debito_credito = 'credito' THEN valor ELSE 0 END), 0), 2) AS margem_bruta_pct FROM lancamentos_contabeis" },
  ]}
/>

<PraticarLab
  moduleId="modulo6"
  titulo="Previsão de Fluxo de Caixa"
  nivel={3}
  exercicios={[
    { id: "pf-5", prompt: "Projete o fluxo de caixa para julho/2026: entradas (contas_receber) - saídas (contas_pagar).", hint: "Subqueries com WHERE STRFTIME('%m', data_vencimento) = '07'", table: "contas_receber, contas_pagar", expectedSql: "SELECT (SELECT COALESCE(SUM(valor), 0) FROM contas_receber WHERE STRFTIME('%m', data_vencimento) = '07') AS total_entradas, (SELECT COALESCE(SUM(valor), 0) FROM contas_pagar WHERE STRFTIME('%m', data_vencimento) = '07') AS total_saidas, (SELECT COALESCE(SUM(valor), 0) FROM contas_receber WHERE STRFTIME('%m', data_vencimento) = '07') - (SELECT COALESCE(SUM(valor), 0) FROM contas_pagar WHERE STRFTIME('%m', data_vencimento) = '07') AS saldo_projetado" },
  ]}
/>

<PraticarLab
  moduleId="modulo6"
  titulo="Análise de Performance Final"
  nivel={4}
  exercicios={[
    { id: "pf-6", prompt: "Análise completa por empresa: faturamento, despesas (contas_pagar) e saldo líquido. Do melhor ao pior.", hint: "Use CTEs para calcular as somas de faturamento e contas_pagar antes de fazer os LEFT JOINs", table: "empresas, faturamento, contas_pagar", expectedSql: "WITH fat_sum AS (SELECT id_empresa, SUM(valor_liquido) AS total_faturamento FROM faturamento GROUP BY id_empresa), pag_sum AS (SELECT id_empresa, SUM(valor) AS total_despesas FROM contas_pagar GROUP BY id_empresa) SELECT e.nome_fantasia AS empresa, COALESCE(fs.total_faturamento, 0) AS total_faturamento, COALESCE(ps.total_despesas, 0) AS total_despesas, COALESCE(fs.total_faturamento, 0) - COALESCE(ps.total_despesas, 0) AS saldo_liquido FROM empresas e LEFT JOIN fat_sum fs ON e.id_empresa = fs.id_empresa LEFT JOIN pag_sum ps ON e.id_empresa = ps.id_empresa ORDER BY saldo_liquido DESC" },
  ]}
/>


## Resumo — O Que Você Dominou

| Etapa | Habilidade | Nível |
|-------|-----------|-------|
| 1 | `JOIN` + `GROUP BY` | ⭐ Essencial |
| 2 | `CASE WHEN` em finanças | ⭐ Essencial |
| 3 | `LEFT JOIN` + inadimplência | ⭐⭐ Importante |
| 4 | KPIs + subqueries | ⭐⭐ Importante |
| 5 | Projeção de fluxo de caixa | ⭐⭐ Importante |
| 6 | Análise completa (tudo junto) | ⭐⭐⭐ Desafio Final |

**Parabéns!** Ao completar todas as etapas, você dominou SQL analítico para controladoria.

:::tip Lembre-se: você não precisa saber TUDO de SQL
Você precisa saber o suficiente para **resolver problemas reais de controladoria**. E esses 6 exercícios cobrem EXATAMENTE o que você vai usar no dia a dia. O resto você aprende quando precisar — o Google é seu amigo! 🚀
:::
