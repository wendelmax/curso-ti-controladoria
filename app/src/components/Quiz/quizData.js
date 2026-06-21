const quizes = {
  modulo1: {
    title: 'SQL para Análise Financeira',
    questions: [
      {
        question: 'Qual cláusula SQL é usada para filtrar registros antes do agrupamento?',
        options: ['HAVING', 'WHERE', 'FILTER', 'GROUP BY'],
        correct: 1,
        explanation: 'WHERE filtra linhas antes do GROUP BY (ex: WHERE ano = 2024). HAVING filtra grupos depois do GROUP BY (ex: HAVING SUM(valor) > 1000).',
      },
      {
        question: 'Qual função de agregação conta o número de linhas?',
        options: ['TOTAL()', 'COUNT()', 'COUNTA()', 'NUM()'],
        correct: 1,
        explanation: 'COUNT(*) conta todas as linhas de um grupo. É a função mais usada para saber quantos registros existem em cada categoria.',
      },
      {
        question: 'Qual tipo de JOIN retorna todas as linhas da tabela da esquerda mesmo sem correspondência na direita?',
        options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
        correct: 2,
        explanation: 'LEFT JOIN mantém TODAS as linhas da tabela à esquerda. Para linhas sem correspondência na direita, as colunas da direita vêm como NULL. Útil para achar lançamentos sem cliente, por exemplo.',
      },
      {
        question: 'Window Functions operam em um conjunto de linhas definido por:',
        options: ['GROUP BY', 'ORDER BY', 'OVER ()', 'PARTITION BY'],
        correct: 2,
        explanation: 'A cláusula OVER() define a "janela" de linhas que a window function vai enxergar. PARTITION BY divide em grupos (como GROUP BY), mas sem colapsar as linhas.',
      },
      {
        question: 'Qual cláusula filtra grupos APÓS o GROUP BY?',
        options: ['WHERE', 'HAVING', 'FILTER', 'LIMIT'],
        correct: 1,
        explanation: 'HAVING é como um WHERE para grupos. Enquanto WHERE filtra linhas antes de agregar, HAVING filtra o resultado do GROUP BY (ex: HAVING COUNT(*) > 5).',
      },
    ],
  },
  modulo2: {
    title: 'Google BigQuery',
    questions: [
      {
        question: 'O BigQuery é um:',
        options: ['Banco relacional tradicional', 'Data warehouse serverless', 'Sistema de arquivos', 'ERP na nuvem'],
        correct: 1,
        explanation: 'BigQuery é serverless — você não gerencia servidores nem infraestrutura. Ele escala automaticamente e você paga só pelo volume de dados processado nas queries.',
      },
      {
        question: 'No BigQuery, particionar uma tabela por data:',
        options: ['Aumenta o custo', 'Reduz o volume processado em queries com filtro de data', 'É obrigatório', 'Impede o uso de clustering'],
        correct: 1,
        explanation: 'Particionamento por data faz o BigQuery ler apenas as partições relevantes. Se você filtrar WHERE data >= "2024-01-01", ele não varre a tabela inteira — reduz custo e acelera a query.',
      },
      {
        question: 'Qual destes NÃO é um tipo de dado do BigQuery?',
        options: ['ARRAY', 'STRUCT', 'CURSOR', 'GEOGRAPHY'],
        correct: 2,
        explanation: 'CURSOR é um conceito de bancos tradicionais (como SQL Server, PostgreSQL), não existe no BigQuery. ARRAY, STRUCT e GEOGRAPHY são tipos nativos do BigQuery.',
      },
      {
        question: 'No BigQuery, as consultas em cache:',
        options: ['Não são cobradas', 'Duram 7 dias', 'São mais lentas', 'Exigem permissão especial'],
        correct: 0,
        explanation: 'Resultados em cache não são cobrados, pois o BigQuery reusa resultados de queries idênticas executadas nas últimas 24h. Ótimo para dashboards que rodam a mesma query várias vezes.',
      },
      {
        question: 'Qual função do BigQuery é usada para fazer previsão de séries temporais?',
        options: ['LINEAR_REG', 'ARIMA_PLUS', 'KMEANS', 'DNN_CLASSIFIER'],
        correct: 1,
        explanation: 'ARIMA_PLUS é o modelo de séries temporais do BigQuery ML. Ideal para prever fluxo de caixa, vendas futuras ou qualquer métrica financeira ao longo do tempo.',
      },
    ],
  },
  modulo3: {
    title: 'Looker',
    questions: [
      {
        question: 'LookML é:',
        options: ['Uma linguagem de programação', 'Uma linguagem de modelagem semântica', 'Um tipo de banco de dados', 'Uma ferramenta de ETL'],
        correct: 1,
        explanation: 'LookML é uma linguagem de modelagem — você define dimensões, medidas e relações entre tabelas. O Looker traduz isso em SQL automaticamente. Não é programação tradicional.',
      },
      {
        question: 'No Looker, um Explore é equivalente a:',
        options: ['Uma tabela no banco', 'Uma view SQL', 'Um ponto de partida para consultas que pode unir várias views', 'Um dashboard'],
        correct: 2,
        explanation: 'Explore é onde o usuário começa a análise. Ele pode reunir várias views (tabelas) através de joins, permitindo explorar dados sem escrever SQL.',
      },
      {
        question: 'Para criar uma métrica calculada no Looker, usa-se:',
        options: ['dimension', 'measure', 'filter', 'parameter'],
        correct: 1,
        explanation: 'measure é o equivalente a uma medida no Tableau ou a uma agregação SQL (SUM, COUNT, AVG). dimension é para atributos categóricos.',
      },
      {
        question: 'Persistent Derived Tables (PDTs) são úteis para:',
        options: ['Criar tabelas temporárias em memória', 'Melhorar performance de consultas complexas', 'Exportar dados para CSV', 'Criar gráficos'],
        correct: 1,
        explanation: 'PDTs são tabelas derivadas que ficam salvas no banco. Elas pré-processam consultas pesadas, então dashboards e explores ficam mais rápidos.',
      },
      {
        question: 'No Looker, template filters permitem:',
        options: ['Filtrar dados no banco', 'Criar filtros dinâmicos que usuários podem modificar', 'Aplicar formatação condicional', 'Agendar relatórios'],
        correct: 1,
        explanation: 'Template filters usam variáveis Liquid no LookML que o usuário preenche na interface. Exemplo: o usuário escolhe um mês e o filtro é injetado no SQL.',
      },
    ],
  },
  modulo4: {
    title: 'Tableau',
    questions: [
      {
        question: 'No Tableau, qual a diferença entre dimensão e medida?',
        options: ['Dimensão são números, medidas são textos', 'Dimensões são discretas e categóricas; medidas são numéricas e agregáveis', 'Não há diferença', 'Medidas criam cabeçalhos, dimensões criam eixos'],
        correct: 1,
        explanation: 'Dimensões (ex: mês, centro de custo, cliente) criam cabeçalhos e agrupam dados. Medidas (ex: valor, quantidade) são números que você soma ou calcula. Azul = discreto, verde = contínuo.',
      },
      {
        question: 'Uma expressão LOD do tipo FIXED:',
        options: ['Ignora os filtros da visualização', 'Considera apenas filtros de contexto', 'Calcula no nível da visualização', 'Altera os dados de origem'],
        correct: 0,
        explanation: 'LOD FIXED calcula no nível que você definiu, ignorando os filtros da view. Útil para calcular "% do total" — você FIXA o total geral enquanto a view filtra por mês.',
      },
      {
        question: 'Qual gráfico é mais adequado para mostrar a composição da DRE?',
        options: ['Pizza', 'Barra', 'Waterfall (cascata)', 'Dispersão'],
        correct: 2,
        explanation: 'Waterfall mostra partida (receita), chegada (lucro líquido) e o que aconteceu no meio (deduções, custos, despesas). Perfeito para demonstrar a formação do resultado.',
      },
      {
        question: 'No Tableau, Table Calculations são calculados:',
        options: ['No banco de dados', 'No nível do resultado da query, no frontend', 'Apenas no Tableau Server', 'Antes da conexão com dados'],
        correct: 1,
        explanation: 'Table Calculations (como RUNNING_SUM, WINDOW_AVG) são calculados no frontend, sobre o resultado já retornado do banco. Por isso são rápidos mas dependem dos dados que chegaram.',
      },
      {
        question: 'Para criar um parâmetro de data dinâmica no Tableau, usa-se:',
        options: ['Filter action', 'Parameter', 'Set', 'Group'],
        correct: 1,
        explanation: 'Parameter permite ao usuário escolher valores (como data, número ou texto) que controlam cálculos ou filtros. Ex: "mostrar últimos N meses" onde N é um parâmetro.',
      },
    ],
  },
  modulo5: {
    title: 'IA Aplicada à Análise Financeira',
    questions: [
      {
        question: 'Qual tipo de aprendizado é mais adequado para prever o fluxo de caixa futuro?',
        options: ['Classificação', 'Regressão', 'Clusterização', 'Associação'],
        correct: 1,
        explanation: 'Regressão prevê valores numéricos contínuos (ex: R$ 500 mil em vendas). Classificação prevê categorias (ex: "inadimplente" ou "não"). Para fluxo de caixa, usamos regressão.',
      },
      {
        question: 'O que significa overfitting?',
        options: ['O modelo não aprendeu nada', 'O modelo decorou os dados de treino mas não generaliza', 'O modelo é muito simples', 'O modelo tem alta acurácia'],
        correct: 1,
        explanation: 'Overfitting é o modelo "decorar" os dados de treino. Ele vai bem nos dados conhecidos, mas falha em dados novos. Como um aluno que decora a prova mas não sabe aplicar o conteúdo.',
      },
      {
        question: 'Qual métrica avalia "das fraudes reais, quantas eu consegui identificar"?',
        options: ['Precisão', 'Acurácia', 'Recall', 'F1-Score'],
        correct: 2,
        explanation: 'Recall responde: "das fraudes que realmente existem, quantas pegamos?" Se existem 100 fraudes e pegamos 80, recall = 80%. Precisão seria "das que sinalizei, quantas eram fraude de verdade?".',
      },
      {
        question: 'No BigQuery ML, qual modelo é usado para clusterização?',
        options: ['LINEAR_REG', 'ARIMA_PLUS', 'KMEANS', 'BOOSTED_TREE'],
        correct: 2,
        explanation: 'KMEANS agrupa dados em clusters (grupos) por similaridade. Útil para segmentação de clientes ou classificação de centros de custo por perfil de gasto.',
      },
      {
        question: 'Qual método é mais eficaz para detectar pagamentos duplicados?',
        options: ['Regressão linear', 'GROUP BY com HAVING COUNT > 1', 'Análise de séries temporais', 'Clusterização'],
        correct: 1,
        explanation: 'SQL puro resolve! GROUP BY fornecedor+valor+data com HAVING COUNT(*) > 1 encontra exatamente os registros duplicados. IA não é sempre a melhor resposta.',
      },
    ],
  },
  modulo6: {
    title: 'Projeto Final',
    questions: [
      {
        question: 'Qual o primeiro passo do pipeline de dados?',
        options: ['Criar gráficos', 'Explorar e entender as tabelas disponíveis', 'Gerar certificado', 'Calcular margens'],
        correct: 1,
        explanation: 'Antes de qualquer análise, você precisa conhecer os dados: quantas tabelas existem? Quais colunas? Quais os tipos? Como as tabelas se relacionam? Sem isso, você analisa no escuro.',
      },
      {
        question: 'Na análise de concentração de receita, a classe "A" representa:',
        options: ['Clientes com menor faturamento', 'Clientes que representam até 70% da receita acumulada', 'Clientes inadimplentes', 'Clientes novos'],
        correct: 1,
        explanation: 'Na curva ABC, classe A = clientes que geram até 70% da receita. São poucos clientes que concentram a maior parte do faturamento. Perder um deles pode ser crítico.',
      },
      {
        question: 'O lucro bruto é calculado como:',
        options: ['Receita - Despesas Operacionais', 'Receita - CPV', 'Receita - Impostos', 'Ativo - Passivo'],
        correct: 1,
        explanation: 'Lucro Bruto = Receita - CPV (Custo do Produto Vendido). Mostra quanto sobra depois de pagar os custos diretos da produção ou aquisição dos produtos.',
      },
      {
        question: 'No fluxo de caixa projetado, um saldo positivo significa:',
        options: ['A empresa está devendo', 'As entradas superam as saídas no período', 'O lucro foi maior que o esperado', 'O caixa está negativo'],
        correct: 1,
        explanation: 'Saldo positivo = entradas de caixa maiores que saídas no período. A empresa está gerando caixa, não necessariamente lucro contábil.',
      },
      {
        question: 'Qual o principal indicador de inadimplência?',
        options: ['% de contas a receber vencidas sobre o total a receber', 'Valor total de vendas', 'Número de funcionários', 'Margem líquida'],
        correct: 0,
        explanation: 'Esse percentual mostra quantos clientes estão em atraso. Se 20% do seu a receber está vencido, significa que 1 em cada 5 clientes não pagou no prazo.',
      },
    ],
  },
};

export default quizes;
