# 3.6 — Exercícios de Looker / LookML

import LookMLEditor from '@site/src/components/LookMLEditor';

Os exercícios abaixo usam um editor de LookML simplificado. Clique em cada desafio e valide sua resposta.

<LookMLEditor />

## Exercícios Conceituais

1. **Qual a diferença entre uma `dimension` e uma `measure` no LookML?**
   - *Resposta:* Dimension é um campo categórico (discreto), usado para agrupar/filtrar. Measure é um campo numérico agregado (SUM, COUNT, AVG).

2. **O que é um `Explore` no Looker?**
   - *Resposta:* É o ponto de partida para consultas, equivalente a uma tabela fato que pode fazer JOIN com outras views.

3. **Para que serve o parâmetro `sql_on` em um JOIN?**
   - *Resposta:* Define a condição de JOIN entre duas tabelas, similar ao ON do SQL.

4. **Qual a diferença entre `sql_table_name` e `derived_table`?**
   - *Resposta:* `sql_table_name` aponta para uma tabela existente no banco. `derived_table` define uma tabela derivada (CTE ou PDT) calculada a partir de uma query SQL.

5. **O que são Persistent Derived Tables (PDTs)?**
   - *Resposta:* Tabelas derivadas que são materializadas no banco e podem ser reutilizadas, melhorando performance de queries complexas.

## Prática com o Editor de LookML

Abra cada desafio no editor acima, estude o código, e clique em "Validar LookML" para verificar a sintaxe.

| Desafio | Objetivo |
|---------|----------|
| 1 | View clientes com dimensões e measure count |
| 2 | Measure de soma e média |
| 3 | Explore com JOIN many_to_one |
