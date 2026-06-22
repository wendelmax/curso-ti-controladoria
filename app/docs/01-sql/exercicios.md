# 🧪 Laboratório de Prática — SQL

Bem-vindo ao laboratório! Aqui você encontra todos os exercícios do módulo organizados por nível de dificuldade, com correção automática e barra de progresso.

import PraticarLab from '@site/src/components/PraticarLab'

<PraticarLab
  moduleId="modulo1"
  titulo="Fundamentos e Filtros"
  nivel={1}
  exercicios={[
    { id: "fund-1", prompt: "Liste todos os fornecedores mostrando: nome, cidade e UF.", hint: "SELECT nome, cidade, uf FROM fornecedores", table: "fornecedores", expectedSql: "SELECT nome, cidade, uf FROM fornecedores" },
    { id: "fund-2", prompt: "Mostre os 5 primeiros clientes ordenados por nome.", hint: "SELECT * FROM clientes ORDER BY nome LIMIT 5", table: "clientes", expectedSql: "SELECT * FROM clientes ORDER BY nome LIMIT 5" },
    { id: "fund-3", prompt: "Liste os 10 maiores salários, mostrando nome, cargo e salário.", hint: "ORDER BY salario DESC LIMIT 10", table: "funcionarios", expectedSql: "SELECT nome, cargo, salario FROM funcionarios ORDER BY salario DESC LIMIT 10" },
    { id: "fund-4", prompt: "Selecione os cargos distintos dos funcionários.", hint: "SELECT DISTINCT cargo FROM funcionarios", table: "funcionarios", expectedSql: "SELECT DISTINCT cargo FROM funcionarios" },
    { id: "filt-1", prompt: "Funcionários do Financeiro com salário > R$ 10.000. Mostre nome, cargo, salario.", hint: "WHERE departamento = 'Financeiro' AND salario > 10000", table: "funcionarios", expectedSql: "SELECT nome, cargo, salario, departamento FROM funcionarios WHERE departamento = 'Financeiro' AND salario > 10000" },
    { id: "filt-2", prompt: "Clientes que estão em SP ou RJ. Mostre nome, cidade e UF.", hint: "WHERE uf IN ('SP', 'RJ')", table: "clientes", expectedSql: "SELECT nome, cidade, uf FROM clientes WHERE uf IN ('SP', 'RJ')" },
    { id: "filt-3", prompt: "Contas do plano que começam com código '5' (despesas). Mostre codigo e descricao.", hint: "WHERE codigo LIKE '5%'", table: "planos_contas", expectedSql: "SELECT codigo, descricao FROM planos_contas WHERE codigo LIKE '5%'" },
  ]}
/>

<PraticarLab
  moduleId="modulo1"
  titulo="Agregações"
  nivel={2}
  exercicios={[
    { id: "agr-1", prompt: "Calcule o total de vendas por cliente, do maior para o menor.", hint: "GROUP BY id_cliente com SUM(valor_liquido)", table: "faturamento", expectedSql: "SELECT id_cliente, SUM(valor_liquido) AS total_vendas FROM faturamento GROUP BY id_cliente ORDER BY total_vendas DESC" },
    { id: "agr-2", prompt: "Conte funcionários por departamento e mostre a média salarial.", hint: "GROUP BY departamento com COUNT(*) e AVG(salario)", table: "funcionarios", expectedSql: "SELECT departamento, COUNT(*) AS qtd_funcionarios, AVG(salario) AS media_salarial FROM funcionarios GROUP BY departamento" },
    { id: "agr-3", prompt: "Total de contas a receber por status (aberto vs recebido).", hint: "GROUP BY status com SUM(valor)", table: "contas_receber", expectedSql: "SELECT status, SUM(valor) AS total FROM contas_receber GROUP BY status" },
  ]}
/>

<PraticarLab
  moduleId="modulo1"
  titulo="JOINs"
  nivel={2}
  exercicios={[
    { id: "join-1", prompt: "Notas fiscais de saída com o nome do cliente.", hint: "INNER JOIN clientes ON notas_fiscais.id_cliente_fornecedor = clientes.id_cliente WHERE tipo = 'saida'", table: "notas_fiscais", expectedSql: "SELECT nf.numero, nf.data_emissao, c.nome AS cliente, nf.base_calculo, nf.valor_imposto FROM notas_fiscais nf INNER JOIN clientes c ON nf.id_cliente_fornecedor = c.id_cliente WHERE nf.tipo = 'saida'" },
    { id: "join-2", prompt: "Lançamentos contábeis com descrição da conta e centro de custo (limite 15).", hint: "JOIN planos_contas e centros_custo", table: "lancamentos_contabeis", expectedSql: "SELECT l.id_lancamento, l.valor, l.debito_credito, p.descricao AS conta, cc.descricao AS centro_custo FROM lancamentos_contabeis l INNER JOIN planos_contas p ON l.id_conta = p.id_conta INNER JOIN centros_custo cc ON l.id_centro_custo = cc.id_centro_custo LIMIT 15" },
  ]}
/>

<PraticarLab
  moduleId="modulo1"
  titulo="Subqueries e CTEs"
  nivel={3}
  exercicios={[
    { id: "cte-1", prompt: "Funcionários que ganham acima da média salarial.", hint: "WHERE salario > (SELECT AVG(salario) FROM funcionarios)", table: "funcionarios", expectedSql: "SELECT nome, cargo, salario FROM funcionarios WHERE salario > (SELECT AVG(salario) FROM funcionarios)" },
    { id: "cte-2", prompt: "Use uma CTE para listar total de vendas por cliente.", hint: "WITH fat_por_cliente AS (SELECT ...)", table: "faturamento", expectedSql: "WITH fat_por_cliente AS (SELECT c.nome, SUM(f.valor_liquido) AS total FROM faturamento f INNER JOIN clientes c ON f.id_cliente = c.id_cliente GROUP BY c.nome) SELECT * FROM fat_por_cliente ORDER BY total DESC" },
  ]}
/>

<PraticarLab
  moduleId="modulo1"
  titulo="Window Functions"
  nivel={3}
  exercicios={[
    { id: "win-1", prompt: "Ranking de clientes por total de vendas com ROW_NUMBER.", hint: "ROW_NUMBER() OVER (ORDER BY SUM(valor_liquido) DESC)", table: "faturamento", expectedSql: "SELECT c.nome, SUM(f.valor_liquido) AS total_vendas, ROW_NUMBER() OVER (ORDER BY SUM(f.valor_liquido) DESC) AS ranking FROM faturamento f INNER JOIN clientes c ON f.id_cliente = c.id_cliente GROUP BY c.nome" },
    { id: "win-2", prompt: "Faturamento acumulado (YTD) mês a mês.", hint: "SUM(receita) OVER (ORDER BY mes) com CTE", table: "faturamento", expectedSql: "WITH fat_mensal AS (SELECT strftime('%Y-%m', data_emissao) AS mes, SUM(valor_liquido) AS receita FROM faturamento GROUP BY mes) SELECT mes, receita, SUM(receita) OVER (ORDER BY mes) AS receita_acumulada FROM fat_mensal" },
  ]}
/>

<PraticarLab
  moduleId="modulo1"
  titulo="Cases Financeiros"
  nivel={4}
  exercicios={[
    { id: "case-1", prompt: "Aging de contas a receber: cliente, valor, dias vencido e faixa. Data ref: 2026-06-30.", hint: "CASE WHEN com JULIANDAY", table: "contas_receber", expectedSql: "SELECT c.nome AS cliente, cr.valor, cr.data_vencimento, CAST(JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) AS INTEGER) AS dias_vencido, CASE WHEN JULIANDAY('2026-06-30') - JULIANDAY(cr.data_vencimento) <= 0 THEN 'A Vencer' ELSE 'Vencido' END AS faixa FROM contas_receber cr INNER JOIN clientes c ON cr.id_cliente = c.id_cliente WHERE cr.status = 'aberto' ORDER BY dias_vencido DESC" },
    { id: "case-2", prompt: "Margem bruta % de cada produto. Mostre produto, receita e margem.", hint: "AVG(valor_liquido / valor_total * 100)", table: "faturamento", expectedSql: "SELECT produto_servico, SUM(valor_liquido) AS receita_liquida, ROUND(AVG(valor_liquido * 100.0 / valor_total), 2) AS margem_percentual FROM faturamento GROUP BY produto_servico ORDER BY margem_percentual DESC" },
  ]}
/>

:::tip 🏆 Desafio Final
Depois de concluir todos os exercícios acima, tente montar uma query que retorne um **dashboard executivo** em uma única consulta: Mês, Receita total, CPV, Lucro Bruto, Margem Bruta (%), Despesas Operacionais, Resultado Líquido e Saldo de Caixa. Use o **SQL Playground** geral para testar.
:::

import Quiz from '@site/src/components/Quiz'
import quizes from '@site/src/components/Quiz/quizData'

<Quiz moduleId="modulo1" title={quizes.modulo1.title} questions={quizes.modulo1.questions} />
