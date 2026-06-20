-- ============================================================
-- BANCO DE DADOS FINANCEIRO FICTÍCIO
-- Curso: TI para Controladoria
-- Empresa: Grupo Nova Era S.A. (indústria/comércio)
-- Período: Janeiro a Junho de 2026
-- ============================================================

-- --------------------------------------------------
-- 1. EMPRESAS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
  id_empresa INTEGER PRIMARY KEY,
  cnpj TEXT UNIQUE,
  razao_social TEXT,
  nome_fantasia TEXT,
  regime_tributario TEXT
);

INSERT INTO empresas VALUES (1, '12.345.678/0001-90', 'Grupo Nova Era S.A.', 'Nova Era', 'Lucro Real');
INSERT INTO empresas VALUES (2, '12.345.678/0002-70', 'Nova Era Distribuidora Ltda.', 'Nova Era Distribution', 'Lucro Presumido');
INSERT INTO empresas VALUES (3, '12.345.678/0003-51', 'Nova Era Serviços Ltda.', 'Nova Era Serv', 'Simples Nacional');

-- --------------------------------------------------
-- 2. PLANOS DE CONTAS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS planos_contas (
  id_conta INTEGER PRIMARY KEY,
  codigo TEXT,
  descricao TEXT,
  tipo_conta TEXT,
  natureza TEXT,
  nivel INTEGER,
  id_conta_pai INTEGER
);

INSERT INTO planos_contas VALUES (1, '1', 'ATIVO', 'sintetica', 'devedora', 0, NULL);
INSERT INTO planos_contas VALUES (2, '1.1', 'Ativo Circulante', 'sintetica', 'devedora', 1, 1);
INSERT INTO planos_contas VALUES (3, '1.1.1', 'Caixa e Equivalentes', 'sintetica', 'devedora', 2, 2);
INSERT INTO planos_contas VALUES (4, '1.1.1.01', 'Caixa Geral', 'analitica', 'devedora', 3, 3);
INSERT INTO planos_contas VALUES (5, '1.1.1.02', 'Banco Conta Movimento', 'analitica', 'devedora', 3, 3);
INSERT INTO planos_contas VALUES (6, '1.1.1.03', 'Aplicações Financeiras', 'analitica', 'devedora', 3, 3);
INSERT INTO planos_contas VALUES (7, '1.1.2', 'Contas a Receber', 'sintetica', 'devedora', 2, 2);
INSERT INTO planos_contas VALUES (8, '1.1.2.01', 'Clientes Nacionais', 'analitica', 'devedora', 3, 7);
INSERT INTO planos_contas VALUES (9, '1.1.2.02', 'Clientes Exterior', 'analitica', 'devedora', 3, 7);
INSERT INTO planos_contas VALUES (10, '1.1.3', 'Estoques', 'sintetica', 'devedora', 2, 2);
INSERT INTO planos_contas VALUES (11, '1.1.3.01', 'Matéria-Prima', 'analitica', 'devedora', 3, 10);
INSERT INTO planos_contas VALUES (12, '1.1.3.02', 'Produtos Acabados', 'analitica', 'devedora', 3, 10);
INSERT INTO planos_contas VALUES (13, '1.1.3.03', 'Mercadorias para Revenda', 'analitica', 'devedora', 3, 10);
INSERT INTO planos_contas VALUES (14, '1.2', 'Ativo Não Circulante', 'sintetica', 'devedora', 1, 1);
INSERT INTO planos_contas VALUES (15, '1.2.1', 'Imobilizado', 'sintetica', 'devedora', 2, 14);
INSERT INTO planos_contas VALUES (16, '1.2.1.01', 'Máquinas e Equipamentos', 'analitica', 'devedora', 3, 15);
INSERT INTO planos_contas VALUES (17, '1.2.1.02', 'Veículos', 'analitica', 'devedora', 3, 15);
INSERT INTO planos_contas VALUES (18, '1.2.1.03', 'Depreciação Acumulada', 'analitica', 'credora', 3, 15);
INSERT INTO planos_contas VALUES (19, '2', 'PASSIVO', 'sintetica', 'credora', 0, NULL);
INSERT INTO planos_contas VALUES (20, '2.1', 'Passivo Circulante', 'sintetica', 'credora', 1, 19);
INSERT INTO planos_contas VALUES (21, '2.1.1', 'Fornecedores', 'sintetica', 'credora', 2, 20);
INSERT INTO planos_contas VALUES (22, '2.1.1.01', 'Fornecedores Nacionais', 'analitica', 'credora', 3, 21);
INSERT INTO planos_contas VALUES (23, '2.1.2', 'Obrigações Tributárias', 'sintetica', 'credora', 2, 20);
INSERT INTO planos_contas VALUES (24, '2.1.2.01', 'ICMS a Recolher', 'analitica', 'credora', 3, 23);
INSERT INTO planos_contas VALUES (25, '2.1.2.02', 'PIS a Recolher', 'analitica', 'credora', 3, 23);
INSERT INTO planos_contas VALUES (26, '2.1.2.03', 'COFINS a Recolher', 'analitica', 'credora', 3, 23);
INSERT INTO planos_contas VALUES (27, '2.1.2.04', 'IRPJ a Recolher', 'analitica', 'credora', 3, 23);
INSERT INTO planos_contas VALUES (28, '2.1.2.05', 'CSLL a Recolher', 'analitica', 'credora', 3, 23);
INSERT INTO planos_contas VALUES (29, '2.1.3', 'Obrigações Trabalhistas', 'sintetica', 'credora', 2, 20);
INSERT INTO planos_contas VALUES (30, '2.1.3.01', 'Salários a Pagar', 'analitica', 'credora', 3, 29);
INSERT INTO planos_contas VALUES (31, '2.1.3.02', 'FGTS a Recolher', 'analitica', 'credora', 3, 29);
INSERT INTO planos_contas VALUES (32, '2.1.3.03', 'INSS a Recolher', 'analitica', 'credora', 3, 29);
INSERT INTO planos_contas VALUES (33, '3', 'RECEITAS', 'sintetica', 'credora', 0, NULL);
INSERT INTO planos_contas VALUES (34, '3.1', 'Receita Operacional Líquida', 'sintetica', 'credora', 1, 33);
INSERT INTO planos_contas VALUES (35, '3.1.1', 'Vendas de Produtos', 'analitica', 'credora', 2, 34);
INSERT INTO planos_contas VALUES (36, '3.1.2', 'Prestação de Serviços', 'analitica', 'credora', 2, 34);
INSERT INTO planos_contas VALUES (37, '4', 'CUSTOS', 'sintetica', 'devedora', 0, NULL);
INSERT INTO planos_contas VALUES (38, '4.1', 'Custos dos Produtos Vendidos', 'sintetica', 'devedora', 1, 37);
INSERT INTO planos_contas VALUES (39, '4.1.1', 'Matéria-Prima Consumida', 'analitica', 'devedora', 2, 38);
INSERT INTO planos_contas VALUES (40, '4.1.2', 'Mão de Obra Direta', 'analitica', 'devedora', 2, 38);
INSERT INTO planos_contas VALUES (41, '4.1.3', 'Custos Indiretos Fabricação', 'analitica', 'devedora', 2, 38);
INSERT INTO planos_contas VALUES (42, '5', 'DESPESAS', 'sintetica', 'devedora', 0, NULL);
INSERT INTO planos_contas VALUES (43, '5.1', 'Despesas Operacionais', 'sintetica', 'devedora', 1, 42);
INSERT INTO planos_contas VALUES (44, '5.1.1', 'Despesas com Vendas', 'sintetica', 'devedora', 2, 43);
INSERT INTO planos_contas VALUES (45, '5.1.1.01', 'Comissões de Vendedores', 'analitica', 'devedora', 3, 44);
INSERT INTO planos_contas VALUES (46, '5.1.1.02', 'Propaganda e Publicidade', 'analitica', 'devedora', 3, 44);
INSERT INTO planos_contas VALUES (47, '5.1.1.03', 'Frete e Entrega', 'analitica', 'devedora', 3, 44);
INSERT INTO planos_contas VALUES (48, '5.1.2', 'Despesas Administrativas', 'sintetica', 'devedora', 2, 43);
INSERT INTO planos_contas VALUES (49, '5.1.2.01', 'Salários Administrativos', 'analitica', 'devedora', 3, 48);
INSERT INTO planos_contas VALUES (50, '5.1.2.02', 'Aluguel', 'analitica', 'devedora', 3, 48);
INSERT INTO planos_contas VALUES (51, '5.1.2.03', 'Material de Escritório', 'analitica', 'devedora', 3, 48);
INSERT INTO planos_contas VALUES (52, '5.1.2.04', 'Serviços de Terceiros', 'analitica', 'devedora', 3, 48);
INSERT INTO planos_contas VALUES (53, '5.1.2.05', 'Depreciação', 'analitica', 'devedora', 3, 48);
INSERT INTO planos_contas VALUES (54, '5.1.3', 'Despesas Tributárias', 'sintetica', 'devedora', 2, 43);
INSERT INTO planos_contas VALUES (55, '5.1.3.01', 'PIS sobre Faturamento', 'analitica', 'devedora', 3, 54);
INSERT INTO planos_contas VALUES (56, '5.1.3.02', 'COFINS sobre Faturamento', 'analitica', 'devedora', 3, 54);
INSERT INTO planos_contas VALUES (57, '5.1.3.03', 'IRPJ', 'analitica', 'devedora', 3, 54);
INSERT INTO planos_contas VALUES (58, '5.1.3.04', 'CSLL', 'analitica', 'devedora', 3, 54);
INSERT INTO planos_contas VALUES (59, '5.1.4', 'Despesas Financeiras', 'sintetica', 'devedora', 2, 43);
INSERT INTO planos_contas VALUES (60, '5.1.4.01', 'Juros Passivos', 'analitica', 'devedora', 3, 59);
INSERT INTO planos_contas VALUES (61, '5.1.4.02', 'Despesas Bancárias', 'analitica', 'devedora', 3, 59);
INSERT INTO planos_contas VALUES (62, '5.1.5', 'Outras Receitas Operacionais', 'analitica', 'credora', 2, 43);

-- --------------------------------------------------
-- 3. CENTROS DE CUSTO
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS centros_custo (
  id_centro_custo INTEGER PRIMARY KEY,
  codigo TEXT,
  descricao TEXT,
  departamento TEXT
);

INSERT INTO centros_custo VALUES (1, 'CC-ADM', 'Administração Central', 'Administrativo');
INSERT INTO centros_custo VALUES (2, 'CC-FIN', 'Financeiro', 'Administrativo');
INSERT INTO centros_custo VALUES (3, 'CC-COM', 'Comercial', 'Comercial');
INSERT INTO centros_custo VALUES (4, 'CC-PROD', 'Produção', 'Produção');
INSERT INTO centros_custo VALUES (5, 'CC-LOG', 'Logística', 'Operacional');
INSERT INTO centros_custo VALUES (6, 'CC-TI', 'Tecnologia da Informação', 'Administrativo');
INSERT INTO centros_custo VALUES (7, 'CC-RH', 'Recursos Humanos', 'Administrativo');
INSERT INTO centros_custo VALUES (8, 'CC-JUR', 'Jurídico', 'Administrativo');
INSERT INTO centros_custo VALUES (9, 'CC-VEND', 'Vendas - SP', 'Comercial');
INSERT INTO centros_custo VALUES (10, 'CC-VEND-RJ', 'Vendas - RJ', 'Comercial');

-- --------------------------------------------------
-- 4. CLIENTES
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INTEGER PRIMARY KEY,
  cnpj_cpf TEXT,
  nome TEXT,
  cidade TEXT,
  uf TEXT,
  segmento TEXT
);

INSERT INTO clientes VALUES (1, '11.111.111/0001-01', 'Mega Distribuidora S.A.', 'São Paulo', 'SP', 'Comércio Atacadista');
INSERT INTO clientes VALUES (2, '22.222.222/0001-02', 'Tech Solutions Ltda.', 'São Paulo', 'SP', 'Tecnologia');
INSERT INTO clientes VALUES (3, '33.333.333/0001-03', 'Construtora Planalto S.A.', 'Belo Horizonte', 'MG', 'Construção Civil');
INSERT INTO clientes VALUES (4, '44.444.444/0001-04', 'Farmácia Saúde Popular Ltda.', 'Rio de Janeiro', 'RJ', 'Farmacêutico');
INSERT INTO clientes VALUES (5, '55.555.555/0001-05', 'Supermercados Economia Ltda.', 'Campinas', 'SP', 'Varejo');
INSERT INTO clientes VALUES (6, '66.666.666/0001-06', 'Auto Peças Rápidas Ltda.', 'Curitiba', 'PR', 'Automotivo');
INSERT INTO clientes VALUES (7, '77.777.777/0001-07', 'Hospital São Lucas S.A.', 'Porto Alegre', 'RS', 'Saúde');
INSERT INTO clientes VALUES (8, '88.888.888/0001-08', 'Escola Primeiro Mundo Ltda.', 'Brasília', 'DF', 'Educação');
INSERT INTO clientes VALUES (9, '99.999.999/0001-09', 'Indústria MetalTech S.A.', 'São Bernardo do Campo', 'SP', 'Indústria Metalúrgica');
INSERT INTO clientes VALUES (10, '10.101.010/0001-10', 'Companhia de Alimentos S.A.', 'Ribeirão Preto', 'SP', 'Alimentício');

-- --------------------------------------------------
-- 5. FORNECEDORES
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS fornecedores (
  id_fornecedor INTEGER PRIMARY KEY,
  cnpj_cpf TEXT,
  nome TEXT,
  tipo TEXT,
  cidade TEXT,
  uf TEXT
);

INSERT INTO fornecedores VALUES (1, '11.111.111/0001-11', 'Aço Brasil S.A.', 'Matéria-Prima', 'São Paulo', 'SP');
INSERT INTO fornecedores VALUES (2, '22.222.222/0002-22', 'Embalagem Total Ltda.', 'Embalagens', 'São Paulo', 'SP');
INSERT INTO fornecedores VALUES (3, '33.333.333/0003-33', 'Transportadora Rápida Ltda.', 'Logística', 'Guarulhos', 'SP');
INSERT INTO fornecedores VALUES (4, '44.444.444/0004-44', 'Energia Elétrica Paulista S.A.', 'Utilidade Pública', 'São Paulo', 'SP');
INSERT INTO fornecedores VALUES (5, '55.555.555/0005-55', 'Telecomunicações Brasil S.A.', 'Telecom', 'São Paulo', 'SP');
INSERT INTO fornecedores VALUES (6, '66.666.666/0006-66', 'Materiais Químicos Ltda.', 'Matéria-Prima', 'Campinas', 'SP');
INSERT INTO fornecedores VALUES (7, '77.777.777/0007-77', 'Software Sistemas S.A.', 'Tecnologia', 'São Paulo', 'SP');
INSERT INTO fornecedores VALUES (8, '88.888.888/0008-88', 'Manutenção Industrial Ltda.', 'Serviços', 'São Paulo', 'SP');
INSERT INTO fornecedores VALUES (9, '99.999.999/0009-99', 'Condomínio Edifício Corporativo', 'Serviços', 'São Paulo', 'SP');

-- --------------------------------------------------
-- 6. FUNCIONÁRIOS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS funcionarios (
  id_funcionario INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  nome TEXT,
  cargo TEXT,
  departamento TEXT,
  salario REAL,
  data_admissao TEXT
);

INSERT INTO funcionarios VALUES (1, 1, 'Carlos Alberto Silva', 'CEO', 'Administrativo', 45000.00, '2018-03-15');
INSERT INTO funcionarios VALUES (2, 1, 'Ana Beatriz Costa', 'CFO', 'Financeiro', 32000.00, '2019-06-01');
INSERT INTO funcionarios VALUES (3, 1, 'Pedro Henrique Oliveira', 'Controller', 'Financeiro', 22000.00, '2020-01-10');
INSERT INTO funcionarios VALUES (4, 1, 'Maria Aparecida Santos', 'Analista Contábil Sr', 'Financeiro', 12000.00, '2020-02-05');
INSERT INTO funcionarios VALUES (5, 1, 'José Luiz Pereira', 'Analista Fiscal Sr', 'Financeiro', 12500.00, '2021-03-20');
INSERT INTO funcionarios VALUES (6, 1, 'Renata Oliveira Lima', 'Analista de TI', 'Tecnologia', 9500.00, '2022-07-11');
INSERT INTO funcionarios VALUES (7, 1, 'Marcos Vinicius Souza', 'Gerente Comercial', 'Comercial', 18000.00, '2019-08-25');
INSERT INTO funcionarios VALUES (8, 1, 'Fernanda Cristina Rocha', 'Analista de Vendas', 'Comercial', 7500.00, '2023-01-15');
INSERT INTO funcionarios VALUES (9, 1, 'Roberto Almeida Junior', 'Supervisor de Produção', 'Produção', 11000.00, '2020-11-01');
INSERT INTO funcionarios VALUES (10, 1, 'Juliana Carvalho Martins', 'Analista de Logística', 'Operacional', 7200.00, '2023-04-05');
INSERT INTO funcionarios VALUES (11, 1, 'Luciana Ferreira Gomes', 'Assistente Administrativo', 'Administrativo', 4200.00, '2024-02-01');
INSERT INTO funcionarios VALUES (12, 1, 'Gustavo Henrique Dias', 'Analista Financeiro Jr', 'Financeiro', 5800.00, '2024-06-10');
INSERT INTO funcionarios VALUES (13, 1, 'Aline Pereira Barbosa', 'Assistente Contábil', 'Financeiro', 3800.00, '2025-01-08');
INSERT INTO funcionarios VALUES (14, 2, 'Thiago Moreira Silva', 'Gerente de Distribuição', 'Operacional', 15000.00, '2021-05-17');
INSERT INTO funcionarios VALUES (15, 3, 'Patrícia Neves Santos', 'Gerente de Serviços', 'Operacional', 13000.00, '2022-09-12');

-- --------------------------------------------------
-- 7. CONTAS A RECEBER (faturamento a prazo)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS contas_receber (
  id_conta_receber INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  id_cliente INTEGER,
  data_emissao TEXT,
  data_vencimento TEXT,
  valor REAL,
  status TEXT
);

INSERT INTO contas_receber VALUES (1, 1, 1, '2026-01-05', '2026-02-05', 45000.00, 'recebido');
INSERT INTO contas_receber VALUES (2, 1, 2, '2026-01-08', '2026-02-08', 28500.00, 'recebido');
INSERT INTO contas_receber VALUES (3, 1, 3, '2026-01-10', '2026-02-10', 52000.00, 'recebido');
INSERT INTO contas_receber VALUES (4, 1, 4, '2026-01-12', '2026-02-12', 18700.00, 'recebido');
INSERT INTO contas_receber VALUES (5, 1, 5, '2026-01-15', '2026-02-15', 63500.00, 'recebido');
INSERT INTO contas_receber VALUES (6, 1, 1, '2026-02-02', '2026-03-02', 48000.00, 'recebido');
INSERT INTO contas_receber VALUES (7, 1, 6, '2026-02-05', '2026-03-05', 22400.00, 'recebido');
INSERT INTO contas_receber VALUES (8, 1, 7, '2026-02-10', '2026-03-10', 78000.00, 'recebido');
INSERT INTO contas_receber VALUES (9, 1, 2, '2026-02-12', '2026-03-12', 31200.00, 'recebido');
INSERT INTO contas_receber VALUES (10, 1, 3, '2026-02-15', '2026-03-15', 49500.00, 'recebido');
INSERT INTO contas_receber VALUES (11, 1, 8, '2026-02-18', '2026-03-18', 15200.00, 'recebido');
INSERT INTO contas_receber VALUES (12, 1, 9, '2026-03-01', '2026-04-01', 89000.00, 'recebido');
INSERT INTO contas_receber VALUES (13, 1, 5, '2026-03-03', '2026-04-03', 71000.00, 'recebido');
INSERT INTO contas_receber VALUES (14, 1, 10, '2026-03-08', '2026-04-08', 43000.00, 'recebido');
INSERT INTO contas_receber VALUES (15, 1, 4, '2026-03-10', '2026-04-10', 25600.00, 'recebido');
INSERT INTO contas_receber VALUES (16, 1, 1, '2026-03-12', '2026-04-12', 51000.00, 'recebido');
INSERT INTO contas_receber VALUES (17, 1, 6, '2026-03-15', '2026-04-15', 19800.00, 'recebido');
INSERT INTO contas_receber VALUES (18, 1, 7, '2026-04-01', '2026-05-01', 82000.00, 'recebido');
INSERT INTO contas_receber VALUES (19, 1, 2, '2026-04-05', '2026-05-05', 34000.00, 'recebido');
INSERT INTO contas_receber VALUES (20, 1, 3, '2026-04-08', '2026-05-08', 56000.00, 'recebido');
INSERT INTO contas_receber VALUES (21, 1, 9, '2026-04-10', '2026-05-10', 92000.00, 'recebido');
INSERT INTO contas_receber VALUES (22, 1, 8, '2026-04-15', '2026-05-15', 17400.00, 'recebido');
INSERT INTO contas_receber VALUES (23, 1, 10, '2026-04-20', '2026-05-20', 38500.00, 'recebido');
INSERT INTO contas_receber VALUES (24, 1, 5, '2026-05-04', '2026-06-04', 68000.00, 'recebido');
INSERT INTO contas_receber VALUES (25, 1, 1, '2026-05-06', '2026-06-06', 54000.00, 'recebido');
INSERT INTO contas_receber VALUES (26, 1, 4, '2026-05-11', '2026-06-11', 27800.00, 'recebido');
INSERT INTO contas_receber VALUES (27, 1, 7, '2026-05-14', '2026-06-14', 75000.00, 'recebido');
INSERT INTO contas_receber VALUES (28, 1, 6, '2026-05-18', '2026-06-18', 21000.00, 'recebido');
INSERT INTO contas_receber VALUES (29, 1, 2, '2026-05-20', '2026-06-20', 36500.00, 'recebido');
INSERT INTO contas_receber VALUES (30, 1, 3, '2026-06-01', '2026-07-01', 61000.00, 'aberto');
INSERT INTO contas_receber VALUES (31, 1, 9, '2026-06-03', '2026-07-03', 87000.00, 'aberto');
INSERT INTO contas_receber VALUES (32, 1, 10, '2026-06-05', '2026-07-05', 42000.00, 'aberto');
INSERT INTO contas_receber VALUES (33, 1, 8, '2026-06-08', '2026-07-08', 16300.00, 'aberto');
INSERT INTO contas_receber VALUES (34, 1, 5, '2026-06-10', '2026-07-10', 72000.00, 'aberto');
INSERT INTO contas_receber VALUES (35, 1, 1, '2026-06-12', '2026-07-12', 49000.00, 'aberto');

-- --------------------------------------------------
-- 8. FATURAMENTO (vendas de produtos e serviços)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS faturamento (
  id_faturamento INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  id_cliente INTEGER,
  data_emissao TEXT,
  data_vencimento TEXT,
  valor_total REAL,
  valor_liquido REAL,
  status TEXT,
  produto_servico TEXT
);

INSERT INTO faturamento VALUES (1, 1, 1, '2026-01-05', '2026-02-05', 53550.00, 45000.00, 'faturado', 'Produtos Linha Industrial');
INSERT INTO faturamento VALUES (2, 1, 2, '2026-01-08', '2026-02-08', 33915.00, 28500.00, 'faturado', 'Licenciamento Software');
INSERT INTO faturamento VALUES (3, 1, 3, '2026-01-10', '2026-02-10', 61880.00, 52000.00, 'faturado', 'Materiais de Construção');
INSERT INTO faturamento VALUES (4, 1, 4, '2026-01-12', '2026-02-12', 21000.00, 18700.00, 'faturado', 'Produtos Farmacêuticos');
INSERT INTO faturamento VALUES (5, 1, 5, '2026-01-15', '2026-02-15', 75000.00, 63500.00, 'faturado', 'Alimentos e Bebidas');
INSERT INTO faturamento VALUES (6, 1, 1, '2026-02-02', '2026-03-02', 57120.00, 48000.00, 'faturado', 'Produtos Linha Industrial');
INSERT INTO faturamento VALUES (7, 1, 6, '2026-02-05', '2026-03-05', 26656.00, 22400.00, 'faturado', 'Componentes Automotivos');
INSERT INTO faturamento VALUES (8, 1, 7, '2026-02-10', '2026-03-10', 92820.00, 78000.00, 'faturado', 'Equipamentos Hospitalares');
INSERT INTO faturamento VALUES (9, 1, 2, '2026-02-12', '2026-03-12', 37128.00, 31200.00, 'faturado', 'Suporte Técnico Premium');
INSERT INTO faturamento VALUES (10, 1, 3, '2026-02-15', '2026-03-15', 58905.00, 49500.00, 'faturado', 'Materiais de Construção');
INSERT INTO faturamento VALUES (11, 1, 8, '2026-02-18', '2026-03-18', 18088.00, 15200.00, 'faturado', 'Materiais Didáticos');
INSERT INTO faturamento VALUES (12, 1, 9, '2026-03-01', '2026-04-01', 105910.00, 89000.00, 'faturado', 'Peças Metalúrgicas');
INSERT INTO faturamento VALUES (13, 1, 5, '2026-03-03', '2026-04-03', 84490.00, 71000.00, 'faturado', 'Alimentos e Bebidas');
INSERT INTO faturamento VALUES (14, 1, 10, '2026-03-08', '2026-04-08', 51170.00, 43000.00, 'faturado', 'Matérias-Primas Alimentícias');
INSERT INTO faturamento VALUES (15, 1, 4, '2026-03-10', '2026-04-10', 30464.00, 25600.00, 'faturado', 'Produtos Farmacêuticos');
INSERT INTO faturamento VALUES (16, 1, 1, '2026-03-12', '2026-04-12', 60690.00, 51000.00, 'faturado', 'Produtos Linha Industrial');
INSERT INTO faturamento VALUES (17, 1, 6, '2026-03-15', '2026-04-15', 23562.00, 19800.00, 'faturado', 'Componentes Automotivos');
INSERT INTO faturamento VALUES (18, 1, 7, '2026-04-01', '2026-05-01', 97580.00, 82000.00, 'faturado', 'Equipamentos Hospitalares');
INSERT INTO faturamento VALUES (19, 1, 2, '2026-04-05', '2026-05-05', 40460.00, 34000.00, 'faturado', 'Consultoria em TI');
INSERT INTO faturamento VALUES (20, 1, 3, '2026-04-08', '2026-05-08', 66640.00, 56000.00, 'faturado', 'Materiais de Construção');
INSERT INTO faturamento VALUES (21, 1, 9, '2026-04-10', '2026-05-10', 109480.00, 92000.00, 'faturado', 'Peças Metalúrgicas');
INSERT INTO faturamento VALUES (22, 1, 8, '2026-04-15', '2026-05-15', 20706.00, 17400.00, 'faturado', 'Equipamentos Educacionais');
INSERT INTO faturamento VALUES (23, 1, 10, '2026-04-20', '2026-05-20', 45815.00, 38500.00, 'faturado', 'Matérias-Primas Alimentícias');
INSERT INTO faturamento VALUES (24, 1, 5, '2026-05-04', '2026-06-04', 80920.00, 68000.00, 'faturado', 'Alimentos e Bebidas');
INSERT INTO faturamento VALUES (25, 1, 1, '2026-05-06', '2026-06-06', 64260.00, 54000.00, 'faturado', 'Produtos Linha Industrial');
INSERT INTO faturamento VALUES (26, 1, 4, '2026-05-11', '2026-06-11', 33082.00, 27800.00, 'faturado', 'Produtos Farmacêuticos');
INSERT INTO faturamento VALUES (27, 1, 7, '2026-05-14', '2026-06-14', 89250.00, 75000.00, 'faturado', 'Equipamentos Hospitalares');
INSERT INTO faturamento VALUES (28, 1, 6, '2026-05-18', '2026-06-18', 24990.00, 21000.00, 'faturado', 'Componentes Automotivos');
INSERT INTO faturamento VALUES (29, 1, 2, '2026-05-20', '2026-06-20', 43435.00, 36500.00, 'faturado', 'Licenciamento Software');
INSERT INTO faturamento VALUES (30, 1, 3, '2026-06-01', '2026-07-01', 72590.00, 61000.00, 'faturado', 'Materiais de Construção');
INSERT INTO faturamento VALUES (31, 1, 9, '2026-06-03', '2026-07-03', 103530.00, 87000.00, 'faturado', 'Peças Metalúrgicas');
INSERT INTO faturamento VALUES (32, 1, 10, '2026-06-05', '2026-07-05', 49980.00, 42000.00, 'faturado', 'Matérias-Primas Alimentícias');
INSERT INTO faturamento VALUES (33, 1, 8, '2026-06-08', '2026-07-08', 19397.00, 16300.00, 'faturado', 'Materiais Didáticos');
INSERT INTO faturamento VALUES (34, 1, 5, '2026-06-10', '2026-07-10', 85680.00, 72000.00, 'faturado', 'Alimentos e Bebidas');
INSERT INTO faturamento VALUES (35, 1, 1, '2026-06-12', '2026-07-12', 58310.00, 49000.00, 'faturado', 'Produtos Linha Industrial');

-- --------------------------------------------------
-- 9. CONTAS A PAGAR
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS contas_pagar (
  id_conta_pagar INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  id_fornecedor INTEGER,
  id_centro_custo INTEGER,
  descricao TEXT,
  data_emissao TEXT,
  data_vencimento TEXT,
  valor REAL,
  status TEXT
);

INSERT INTO contas_pagar VALUES (1, 1, 1, 4, 'Compra de Aço Carbono', '2026-01-03', '2026-01-25', 85000.00, 'pago');
INSERT INTO contas_pagar VALUES (2, 1, 6, 4, 'Insumos Químicos', '2026-01-05', '2026-01-28', 34000.00, 'pago');
INSERT INTO contas_pagar VALUES (3, 1, 2, 4, 'Embalagens Plásticas', '2026-01-08', '2026-02-05', 12500.00, 'pago');
INSERT INTO contas_pagar VALUES (4, 1, 4, 1, 'Energia Elétrica - Janeiro', '2026-01-10', '2026-02-10', 18500.00, 'pago');
INSERT INTO contas_pagar VALUES (5, 1, 5, 6, 'Telefonia e Internet', '2026-01-15', '2026-02-15', 4200.00, 'pago');
INSERT INTO contas_pagar VALUES (6, 1, 7, 6, 'Licenças de Software', '2026-01-20', '2026-02-20', 15000.00, 'pago');
INSERT INTO contas_pagar VALUES (7, 1, 1, 4, 'Compra de Aço Inox', '2026-02-01', '2026-02-22', 72000.00, 'pago');
INSERT INTO contas_pagar VALUES (8, 1, 6, 4, 'Solventes e Aditivos', '2026-02-05', '2026-03-05', 28000.00, 'pago');
INSERT INTO contas_pagar VALUES (9, 1, 2, 4, 'Caixas e Rótulos', '2026-02-10', '2026-03-10', 11000.00, 'pago');
INSERT INTO contas_pagar VALUES (10, 1, 4, 1, 'Energia Elétrica - Fevereiro', '2026-02-10', '2026-03-10', 19200.00, 'pago');
INSERT INTO contas_pagar VALUES (11, 1, 3, 5, 'Frete - Carga Fechada', '2026-02-15', '2026-03-05', 8900.00, 'pago');
INSERT INTO contas_pagar VALUES (12, 1, 8, 4, 'Manutenção Máquinas', '2026-02-20', '2026-03-20', 9500.00, 'pago');
INSERT INTO contas_pagar VALUES (13, 1, 9, 1, 'Aluguel Mensal - Março', '2026-03-01', '2026-03-15', 22000.00, 'pago');
INSERT INTO contas_pagar VALUES (14, 1, 1, 4, 'Compra de Aço Carbono', '2026-03-01', '2026-03-22', 78000.00, 'pago');
INSERT INTO contas_pagar VALUES (15, 1, 6, 4, 'Matérias-Primas Químicas', '2026-03-05', '2026-03-28', 36000.00, 'pago');
INSERT INTO contas_pagar VALUES (16, 1, 2, 4, 'Embalagens Especiais', '2026-03-10', '2026-04-05', 14000.00, 'pago');
INSERT INTO contas_pagar VALUES (17, 1, 4, 1, 'Energia Elétrica - Março', '2026-03-10', '2026-04-10', 17800.00, 'pago');
INSERT INTO contas_pagar VALUES (18, 1, 5, 6, 'Telefonia e Internet', '2026-03-15', '2026-04-15', 4200.00, 'pago');
INSERT INTO contas_pagar VALUES (19, 1, 7, 6, 'Suporte Sistemas', '2026-03-20', '2026-04-20', 8000.00, 'pago');
INSERT INTO contas_pagar VALUES (20, 1, 3, 5, 'Frete - Distribuição', '2026-03-25', '2026-04-10', 10200.00, 'pago');
INSERT INTO contas_pagar VALUES (21, 1, 1, 4, 'Compra de Aço Inox', '2026-04-01', '2026-04-22', 82000.00, 'pago');
INSERT INTO contas_pagar VALUES (22, 1, 6, 4, 'Corantes e Conservantes', '2026-04-05', '2026-04-28', 22000.00, 'pago');
INSERT INTO contas_pagar VALUES (23, 1, 9, 1, 'Aluguel Mensal - Abril', '2026-04-01', '2026-04-15', 22000.00, 'pago');
INSERT INTO contas_pagar VALUES (24, 1, 4, 1, 'Energia Elétrica - Abril', '2026-04-10', '2026-05-10', 19500.00, 'pago');
INSERT INTO contas_pagar VALUES (25, 1, 8, 4, 'Manutenção Preventiva', '2026-04-15', '2026-05-10', 7500.00, 'pago');
INSERT INTO contas_pagar VALUES (26, 1, 2, 4, 'Embalagens Plásticas', '2026-04-20', '2026-05-15', 13500.00, 'pago');
INSERT INTO contas_pagar VALUES (27, 1, 1, 4, 'Compra de Aço Carbono', '2026-05-01', '2026-05-22', 90000.00, 'pago');
INSERT INTO contas_pagar VALUES (28, 1, 6, 4, 'Insumos Químicos', '2026-05-05', '2026-05-28', 31000.00, 'pago');
INSERT INTO contas_pagar VALUES (29, 1, 5, 6, 'Telefonia e Internet', '2026-05-10', '2026-06-10', 4200.00, 'aberto');
INSERT INTO contas_pagar VALUES (30, 1, 4, 1, 'Energia Elétrica - Maio', '2026-05-10', '2026-06-10', 20100.00, 'aberto');
INSERT INTO contas_pagar VALUES (31, 1, 9, 1, 'Aluguel Mensal - Maio', '2026-05-01', '2026-05-15', 22000.00, 'pago');
INSERT INTO contas_pagar VALUES (32, 1, 3, 5, 'Frete - Carga Rateada', '2026-05-15', '2026-06-05', 11500.00, 'aberto');
INSERT INTO contas_pagar VALUES (33, 1, 7, 6, 'Licenças de Software', '2026-05-20', '2026-06-20', 15000.00, 'aberto');
INSERT INTO contas_pagar VALUES (34, 1, 1, 4, 'Compra de Aço Inox', '2026-06-01', '2026-06-22', 75000.00, 'aberto');
INSERT INTO contas_pagar VALUES (35, 1, 2, 4, 'Embalagens Especiais', '2026-06-05', '2026-06-28', 14800.00, 'aberto');
INSERT INTO contas_pagar VALUES (36, 1, 4, 1, 'Energia Elétrica - Junho', '2026-06-10', '2026-07-10', 18800.00, 'aberto');
INSERT INTO contas_pagar VALUES (37, 1, 9, 1, 'Aluguel Mensal - Junho', '2026-06-01', '2026-06-15', 22000.00, 'aberto');

-- --------------------------------------------------
-- 10. NOTAS FISCAIS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id_nota_fiscal INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  numero TEXT,
  tipo TEXT,
  data_emissao TEXT,
  id_cliente_fornecedor INTEGER,
  tipo_pessoa TEXT,
  base_calculo REAL,
  valor_imposto REAL
);

INSERT INTO notas_fiscais VALUES (1, 1, 'NF-0001', 'saida', '2026-01-05', 1, 'cliente', 45000.00, 8550.00);
INSERT INTO notas_fiscais VALUES (2, 1, 'NF-0002', 'saida', '2026-01-08', 2, 'cliente', 28500.00, 5415.00);
INSERT INTO notas_fiscais VALUES (3, 1, 'NF-0003', 'saida', '2026-01-10', 3, 'cliente', 52000.00, 9880.00);
INSERT INTO notas_fiscais VALUES (4, 1, 'NF-0004', 'saida', '2026-01-12', 4, 'cliente', 22900.00, 4100.00);
INSERT INTO notas_fiscais VALUES (5, 1, 'NF-0005', 'saida', '2026-01-15', 1, 'fornecedor', 85000.00, 11900.00);
INSERT INTO notas_fiscais VALUES (6, 1, 'NF-0006', 'entrada', '2026-01-05', 1, 'fornecedor', 85000.00, 11900.00);
INSERT INTO notas_fiscais VALUES (7, 1, 'NF-0007', 'entrada', '2026-01-08', 6, 'fornecedor', 34000.00, 4760.00);
INSERT INTO notas_fiscais VALUES (8, 1, 'NF-0008', 'saida', '2026-02-02', 1, 'cliente', 48000.00, 9120.00);
INSERT INTO notas_fiscais VALUES (9, 1, 'NF-0009', 'saida', '2026-02-05', 6, 'cliente', 22400.00, 4256.00);
INSERT INTO notas_fiscais VALUES (10, 1, 'NF-0010', 'saida', '2026-02-10', 7, 'cliente', 78000.00, 14820.00);
INSERT INTO notas_fiscais VALUES (11, 1, 'NF-0011', 'entrada', '2026-02-01', 1, 'fornecedor', 72000.00, 10080.00);
INSERT INTO notas_fiscais VALUES (12, 1, 'NF-0012', 'entrada', '2026-02-05', 6, 'fornecedor', 28000.00, 3920.00);
INSERT INTO notas_fiscais VALUES (13, 1, 'NF-0013', 'saida', '2026-03-01', 9, 'cliente', 89000.00, 16910.00);
INSERT INTO notas_fiscais VALUES (14, 1, 'NF-0014', 'saida', '2026-03-03', 5, 'cliente', 71000.00, 13490.00);
INSERT INTO notas_fiscais VALUES (15, 1, 'NF-0015', 'entrada', '2026-03-01', 1, 'fornecedor', 78000.00, 10920.00);
INSERT INTO notas_fiscais VALUES (16, 1, 'NF-0016', 'entrada', '2026-03-05', 6, 'fornecedor', 36000.00, 5040.00);
INSERT INTO notas_fiscais VALUES (17, 1, 'NF-0017', 'saida', '2026-04-01', 7, 'cliente', 82000.00, 15580.00);
INSERT INTO notas_fiscais VALUES (18, 1, 'NF-0018', 'saida', '2026-04-05', 2, 'cliente', 34000.00, 6460.00);
INSERT INTO notas_fiscais VALUES (19, 1, 'NF-0019', 'entrada', '2026-04-01', 1, 'fornecedor', 82000.00, 11480.00);
INSERT INTO notas_fiscais VALUES (20, 1, 'NF-0020', 'entrada', '2026-04-05', 6, 'fornecedor', 22000.00, 3080.00);
INSERT INTO notas_fiscais VALUES (21, 1, 'NF-0021', 'saida', '2026-05-04', 5, 'cliente', 68000.00, 12920.00);
INSERT INTO notas_fiscais VALUES (22, 1, 'NF-0022', 'saida', '2026-05-06', 1, 'cliente', 54000.00, 10260.00);
INSERT INTO notas_fiscais VALUES (23, 1, 'NF-0023', 'entrada', '2026-05-01', 1, 'fornecedor', 90000.00, 12600.00);
INSERT INTO notas_fiscais VALUES (24, 1, 'NF-0024', 'entrada', '2026-05-05', 6, 'fornecedor', 31000.00, 4340.00);
INSERT INTO notas_fiscais VALUES (25, 1, 'NF-0025', 'saida', '2026-06-01', 3, 'cliente', 61000.00, 11590.00);
INSERT INTO notas_fiscais VALUES (26, 1, 'NF-0026', 'saida', '2026-06-03', 9, 'cliente', 87000.00, 16530.00);
INSERT INTO notas_fiscais VALUES (27, 1, 'NF-0027', 'entrada', '2026-06-01', 1, 'fornecedor', 75000.00, 10500.00);
INSERT INTO notas_fiscais VALUES (28, 1, 'NF-0028', 'entrada', '2026-06-05', 2, 'fornecedor', 14800.00, 2072.00);

-- --------------------------------------------------
-- 11. LANÇAMENTOS CONTÁBEIS
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS lancamentos_contabeis (
  id_lancamento INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  id_conta INTEGER,
  id_centro_custo INTEGER,
  data_lancamento TEXT,
  valor REAL,
  debito_credito TEXT,
  historico TEXT,
  id_documento TEXT,
  data_competencia TEXT
);

-- Janeiro/2026
INSERT INTO lancamentos_contabeis VALUES (1, 1, 35, 3, '2026-01-31', 45000.00, 'credito', 'Venda Mega Distribuidora', 'NF-0001', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (2, 1, 8, 3, '2026-01-31', 45000.00, 'debito', 'Venda Mega Distribuidora', 'NF-0001', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (3, 1, 35, 3, '2026-01-31', 28500.00, 'credito', 'Venda Tech Solutions', 'NF-0002', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (4, 1, 8, 3, '2026-01-31', 28500.00, 'debito', 'Venda Tech Solutions', 'NF-0002', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (5, 1, 35, 3, '2026-01-31', 52000.00, 'credito', 'Venda Construtora Planalto', 'NF-0003', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (6, 1, 8, 3, '2026-01-31', 52000.00, 'debito', 'Venda Construtora Planalto', 'NF-0003', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (7, 1, 35, 3, '2026-01-31', 18700.00, 'credito', 'Venda Farmácia Saúde', 'NF-0004', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (8, 1, 8, 3, '2026-01-31', 18700.00, 'debito', 'Venda Farmácia Saúde', 'NF-0004', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (9, 1, 39, 4, '2026-01-31', 62000.00, 'debito', 'Consumo MP Aço Carbono', 'CT-001', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (10, 1, 11, 4, '2026-01-31', 62000.00, 'credito', 'Consumo MP Aço Carbono', 'CT-001', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (11, 1, 39, 4, '2026-01-31', 24000.00, 'debito', 'Consumo Insumos Químicos', 'CT-002', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (12, 1, 11, 4, '2026-01-31', 24000.00, 'credito', 'Consumo Insumos Químicos', 'CT-002', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (13, 1, 40, 4, '2026-01-31', 35000.00, 'debito', 'Folha MOD Produção', 'FP-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (14, 1, 30, 4, '2026-01-31', 35000.00, 'credito', 'Folha MOD Produção', 'FP-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (15, 1, 41, 4, '2026-01-31', 18500.00, 'debito', 'Rateio CIF Energia Elétrica', 'EE-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (16, 1, 24, 4, '2026-01-31', 18500.00, 'credito', 'Rateio CIF Energia Elétrica', 'EE-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (17, 1, 49, 1, '2026-01-31', 42000.00, 'debito', 'Folha Administrativo', 'FP-02', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (18, 1, 30, 1, '2026-01-31', 42000.00, 'credito', 'Folha Administrativo', 'FP-02', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (19, 1, 50, 1, '2026-01-31', 22000.00, 'debito', 'Aluguel Matriz', 'AL-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (20, 1, 32, 1, '2026-01-31', 22000.00, 'credito', 'Aluguel Matriz', 'AL-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (21, 1, 52, 1, '2026-01-31', 8500.00, 'debito', 'Serviços Terceiros ADM', 'ST-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (22, 1, 22, 1, '2026-01-31', 8500.00, 'credito', 'Serviços Terceiros ADM', 'ST-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (23, 1, 55, 1, '2026-01-31', 2175.00, 'debito', 'PIS sobre Faturamento', 'AP-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (24, 1, 25, 1, '2026-01-31', 2175.00, 'credito', 'PIS sobre Faturamento', 'AP-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (25, 1, 56, 1, '2026-01-31', 10020.00, 'debito', 'COFINS sobre Faturamento', 'AP-02', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (26, 1, 26, 1, '2026-01-31', 10020.00, 'credito', 'COFINS sobre Faturamento', 'AP-02', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (27, 1, 61, 1, '2026-01-31', 1800.00, 'debito', 'Tarifas Bancárias', 'TB-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (28, 1, 5, 1, '2026-01-31', 1800.00, 'credito', 'Tarifas Bancárias', 'TB-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (29, 1, 60, 1, '2026-01-31', 3200.00, 'debito', 'Juros Pagos', 'JP-01', '2026-01');
INSERT INTO lancamentos_contabeis VALUES (30, 1, 5, 1, '2026-01-31', 3200.00, 'credito', 'Juros Pagos', 'JP-01', '2026-01');

-- Fevereiro/2026
INSERT INTO lancamentos_contabeis VALUES (31, 1, 35, 3, '2026-02-28', 48000.00, 'credito', 'Venda Mega Distribuidora', 'NF-0008', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (32, 1, 8, 3, '2026-02-28', 48000.00, 'debito', 'Venda Mega Distribuidora', 'NF-0008', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (33, 1, 35, 3, '2026-02-28', 22400.00, 'credito', 'Venda Auto Peças', 'NF-0009', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (34, 1, 8, 3, '2026-02-28', 22400.00, 'debito', 'Venda Auto Peças', 'NF-0009', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (35, 1, 35, 3, '2026-02-28', 78000.00, 'credito', 'Venda Hospital São Lucas', 'NF-0010', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (36, 1, 8, 3, '2026-02-28', 78000.00, 'debito', 'Venda Hospital São Lucas', 'NF-0010', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (37, 1, 36, 3, '2026-02-28', 31200.00, 'credito', 'Serviço Suporte Técnico', 'NF-0011', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (38, 1, 8, 3, '2026-02-28', 31200.00, 'debito', 'Serviço Suporte Técnico', 'NF-0011', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (39, 1, 35, 3, '2026-02-28', 49500.00, 'credito', 'Venda Construtora Planalto', 'NF-0012', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (40, 1, 8, 3, '2026-02-28', 49500.00, 'debito', 'Venda Construtora Planalto', 'NF-0012', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (41, 1, 39, 4, '2026-02-28', 52000.00, 'debito', 'Consumo MP Aço Inox', 'CT-003', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (42, 1, 11, 4, '2026-02-28', 52000.00, 'credito', 'Consumo MP Aço Inox', 'CT-003', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (43, 1, 39, 4, '2026-02-28', 20000.00, 'debito', 'Consumo Solventes', 'CT-004', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (44, 1, 11, 4, '2026-02-28', 20000.00, 'credito', 'Consumo Solventes', 'CT-004', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (45, 1, 40, 4, '2026-02-28', 35000.00, 'debito', 'Folha MOD Produção', 'FP-03', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (46, 1, 30, 4, '2026-02-28', 35000.00, 'credito', 'Folha MOD Produção', 'FP-03', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (47, 1, 41, 4, '2026-02-28', 19200.00, 'debito', 'Rateio CIF Energia Elétrica', 'EE-02', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (48, 1, 24, 4, '2026-02-28', 19200.00, 'credito', 'Rateio CIF Energia Elétrica', 'EE-02', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (49, 1, 45, 3, '2026-02-28', 8500.00, 'debito', 'Comissão Vendas Jan/Fev', 'CV-01', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (50, 1, 30, 3, '2026-02-28', 8500.00, 'credito', 'Comissão Vendas Jan/Fev', 'CV-01', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (51, 1, 47, 5, '2026-02-28', 8900.00, 'debito', 'Frete sobre Vendas', 'FR-01', '2026-02');
INSERT INTO lancamentos_contabeis VALUES (52, 1, 22, 5, '2026-02-28', 8900.00, 'credito', 'Frete sobre Vendas', 'FR-01', '2026-02');

-- Março/2026
INSERT INTO lancamentos_contabeis VALUES (53, 1, 35, 3, '2026-03-31', 89000.00, 'credito', 'Venda MetalTech', 'NF-0013', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (54, 1, 8, 3, '2026-03-31', 89000.00, 'debito', 'Venda MetalTech', 'NF-0013', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (55, 1, 35, 3, '2026-03-31', 71000.00, 'credito', 'Venda Supermercados Economia', 'NF-0014', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (56, 1, 8, 3, '2026-03-31', 71000.00, 'debito', 'Venda Supermercados Economia', 'NF-0014', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (57, 1, 35, 3, '2026-03-31', 43000.00, 'credito', 'Venda Cia Alimentos', 'NF-0015', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (58, 1, 8, 3, '2026-03-31', 43000.00, 'debito', 'Venda Cia Alimentos', 'NF-0015', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (59, 1, 35, 3, '2026-03-31', 25600.00, 'credito', 'Venda Farmácia Saúde', 'NF-0016', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (60, 1, 8, 3, '2026-03-31', 25600.00, 'debito', 'Venda Farmácia Saúde', 'NF-0016', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (61, 1, 35, 3, '2026-03-31', 19800.00, 'credito', 'Venda Auto Peças', 'NF-0017', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (62, 1, 8, 3, '2026-03-31', 19800.00, 'debito', 'Venda Auto Peças', 'NF-0017', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (63, 1, 39, 4, '2026-03-31', 58000.00, 'debito', 'Consumo MP Aço Carbono', 'CT-005', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (64, 1, 11, 4, '2026-03-31', 58000.00, 'credito', 'Consumo MP Aço Carbono', 'CT-005', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (65, 1, 39, 4, '2026-03-31', 26000.00, 'debito', 'Consumo Matérias-Primas', 'CT-006', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (66, 1, 11, 4, '2026-03-31', 26000.00, 'credito', 'Consumo Matérias-Primas', 'CT-006', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (67, 1, 40, 4, '2026-03-31', 35000.00, 'debito', 'Folha MOD Produção', 'FP-04', '2026-03');
INSERT INTO lancamentos_contabeis VALUES (68, 1, 30, 4, '2026-03-31', 35000.00, 'credito', 'Folha MOD Produção', 'FP-04', '2026-03');

-- Abril/2026
INSERT INTO lancamentos_contabeis VALUES (69, 1, 35, 3, '2026-04-30', 82000.00, 'credito', 'Venda Hospital São Lucas', 'NF-0018', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (70, 1, 8, 3, '2026-04-30', 82000.00, 'debito', 'Venda Hospital São Lucas', 'NF-0018', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (71, 1, 36, 3, '2026-04-30', 34000.00, 'credito', 'Consultoria em TI', 'NF-0019', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (72, 1, 8, 3, '2026-04-30', 34000.00, 'debito', 'Consultoria em TI', 'NF-0019', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (73, 1, 35, 3, '2026-04-30', 56000.00, 'credito', 'Venda Construtora Planalto', 'NF-0020', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (74, 1, 8, 3, '2026-04-30', 56000.00, 'debito', 'Venda Construtora Planalto', 'NF-0020', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (75, 1, 35, 3, '2026-04-30', 92000.00, 'credito', 'Venda MetalTech', 'NF-0021', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (76, 1, 8, 3, '2026-04-30', 92000.00, 'debito', 'Venda MetalTech', 'NF-0021', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (77, 1, 39, 4, '2026-04-30', 60000.00, 'debito', 'Consumo MP Aço Inox', 'CT-007', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (78, 1, 11, 4, '2026-04-30', 60000.00, 'credito', 'Consumo MP Aço Inox', 'CT-007', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (79, 1, 39, 4, '2026-04-30', 16000.00, 'debito', 'Consumo Corantes', 'CT-008', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (80, 1, 11, 4, '2026-04-30', 16000.00, 'credito', 'Consumo Corantes', 'CT-008', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (81, 1, 40, 4, '2026-04-30', 35000.00, 'debito', 'Folha MOD Produção', 'FP-05', '2026-04');
INSERT INTO lancamentos_contabeis VALUES (82, 1, 30, 4, '2026-04-30', 35000.00, 'credito', 'Folha MOD Produção', 'FP-05', '2026-04');

-- Maio/2026
INSERT INTO lancamentos_contabeis VALUES (83, 1, 35, 3, '2026-05-31', 68000.00, 'credito', 'Venda Supermercados Economia', 'NF-0022', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (84, 1, 8, 3, '2026-05-31', 68000.00, 'debito', 'Venda Supermercados Economia', 'NF-0022', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (85, 1, 35, 3, '2026-05-31', 54000.00, 'credito', 'Venda Mega Distribuidora', 'NF-0023', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (86, 1, 8, 3, '2026-05-31', 54000.00, 'debito', 'Venda Mega Distribuidora', 'NF-0023', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (87, 1, 35, 3, '2026-05-31', 27800.00, 'credito', 'Venda Farmácia Saúde', 'NF-0024', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (88, 1, 8, 3, '2026-05-31', 27800.00, 'debito', 'Venda Farmácia Saúde', 'NF-0024', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (89, 1, 35, 3, '2026-05-31', 75000.00, 'credito', 'Venda Hospital São Lucas', 'NF-0025', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (90, 1, 8, 3, '2026-05-31', 75000.00, 'debito', 'Venda Hospital São Lucas', 'NF-0025', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (91, 1, 36, 3, '2026-05-31', 36500.00, 'credito', 'Licenciamento Software', 'NF-0026', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (92, 1, 8, 3, '2026-05-31', 36500.00, 'debito', 'Licenciamento Software', 'NF-0026', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (93, 1, 39, 4, '2026-05-31', 65000.00, 'debito', 'Consumo MP Aço Carbono', 'CT-009', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (94, 1, 11, 4, '2026-05-31', 65000.00, 'credito', 'Consumo MP Aço Carbono', 'CT-009', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (95, 1, 39, 4, '2026-05-31', 22000.00, 'debito', 'Consumo Insumos Químicos', 'CT-010', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (96, 1, 11, 4, '2026-05-31', 22000.00, 'credito', 'Consumo Insumos Químicos', 'CT-010', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (97, 1, 40, 4, '2026-05-31', 35000.00, 'debito', 'Folha MOD Produção', 'FP-06', '2026-05');
INSERT INTO lancamentos_contabeis VALUES (98, 1, 30, 4, '2026-05-31', 35000.00, 'credito', 'Folha MOD Produção', 'FP-06', '2026-05');

-- Junho/2026
INSERT INTO lancamentos_contabeis VALUES (99, 1, 35, 3, '2026-06-30', 61000.00, 'credito', 'Venda Construtora Planalto', 'NF-0027', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (100, 1, 8, 3, '2026-06-30', 61000.00, 'debito', 'Venda Construtora Planalto', 'NF-0027', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (101, 1, 35, 3, '2026-06-30', 87000.00, 'credito', 'Venda MetalTech', 'NF-0028', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (102, 1, 8, 3, '2026-06-30', 87000.00, 'debito', 'Venda MetalTech', 'NF-0028', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (103, 1, 35, 3, '2026-06-30', 42000.00, 'credito', 'Venda Cia Alimentos', 'NF-0029', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (104, 1, 8, 3, '2026-06-30', 42000.00, 'debito', 'Venda Cia Alimentos', 'NF-0029', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (105, 1, 35, 3, '2026-06-30', 49000.00, 'credito', 'Venda Mega Distribuidora', 'NF-0030', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (106, 1, 8, 3, '2026-06-30', 49000.00, 'debito', 'Venda Mega Distribuidora', 'NF-0030', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (107, 1, 39, 4, '2026-06-30', 55000.00, 'debito', 'Consumo MP Aço Inox', 'CT-011', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (108, 1, 11, 4, '2026-06-30', 55000.00, 'credito', 'Consumo MP Aço Inox', 'CT-011', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (109, 1, 39, 4, '2026-06-30', 10000.00, 'debito', 'Consumo Embalagens', 'CT-012', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (110, 1, 12, 4, '2026-06-30', 10000.00, 'credito', 'Consumo Embalagens', 'CT-012', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (111, 1, 40, 4, '2026-06-30', 35000.00, 'debito', 'Folha MOD Produção', 'FP-07', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (112, 1, 30, 4, '2026-06-30', 35000.00, 'credito', 'Folha MOD Produção', 'FP-07', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (113, 1, 49, 1, '2026-06-30', 42000.00, 'debito', 'Folha Administrativo', 'FP-08', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (114, 1, 30, 1, '2026-06-30', 42000.00, 'credito', 'Folha Administrativo', 'FP-08', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (115, 1, 45, 3, '2026-06-30', 9500.00, 'debito', 'Comissão Vendas', 'CV-02', '2026-06');
INSERT INTO lancamentos_contabeis VALUES (116, 1, 30, 3, '2026-06-30', 9500.00, 'credito', 'Comissão Vendas', 'CV-02', '2026-06');

-- --------------------------------------------------
-- 12. DRE MENSAL (Demonstração do Resultado)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS dre_mensal (
  id_dre INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  ano INTEGER,
  mes INTEGER,
  id_conta INTEGER,
  valor REAL
);

INSERT INTO dre_mensal VALUES (1, 1, 2026, 1, 35, 144200.00);
INSERT INTO dre_mensal VALUES (2, 1, 2026, 1, 39, 86000.00);
INSERT INTO dre_mensal VALUES (3, 1, 2026, 1, 40, 35000.00);
INSERT INTO dre_mensal VALUES (4, 1, 2026, 1, 41, 18500.00);
INSERT INTO dre_mensal VALUES (5, 1, 2026, 1, 49, 42000.00);
INSERT INTO dre_mensal VALUES (6, 1, 2026, 1, 50, 22000.00);
INSERT INTO dre_mensal VALUES (7, 1, 2026, 1, 52, 8500.00);
INSERT INTO dre_mensal VALUES (8, 1, 2026, 1, 55, 2175.00);
INSERT INTO dre_mensal VALUES (9, 1, 2026, 1, 56, 10020.00);
INSERT INTO dre_mensal VALUES (10, 1, 2026, 1, 61, 1800.00);
INSERT INTO dre_mensal VALUES (11, 1, 2026, 1, 60, 3200.00);
INSERT INTO dre_mensal VALUES (12, 1, 2026, 2, 35, 175500.00);
INSERT INTO dre_mensal VALUES (13, 1, 2026, 2, 36, 31200.00);
INSERT INTO dre_mensal VALUES (14, 1, 2026, 2, 39, 72000.00);
INSERT INTO dre_mensal VALUES (15, 1, 2026, 2, 40, 35000.00);
INSERT INTO dre_mensal VALUES (16, 1, 2026, 2, 41, 19200.00);
INSERT INTO dre_mensal VALUES (17, 1, 2026, 2, 45, 8500.00);
INSERT INTO dre_mensal VALUES (18, 1, 2026, 2, 47, 8900.00);
INSERT INTO dre_mensal VALUES (19, 1, 2026, 2, 49, 42000.00);
INSERT INTO dre_mensal VALUES (20, 1, 2026, 2, 50, 22000.00);
INSERT INTO dre_mensal VALUES (21, 1, 2026, 3, 35, 248400.00);
INSERT INTO dre_mensal VALUES (22, 1, 2026, 3, 39, 84000.00);
INSERT INTO dre_mensal VALUES (23, 1, 2026, 3, 40, 35000.00);
INSERT INTO dre_mensal VALUES (24, 1, 2026, 3, 41, 17800.00);
INSERT INTO dre_mensal VALUES (25, 1, 2026, 3, 49, 42000.00);
INSERT INTO dre_mensal VALUES (26, 1, 2026, 3, 50, 22000.00);
INSERT INTO dre_mensal VALUES (27, 1, 2026, 3, 51, 4500.00);
INSERT INTO dre_mensal VALUES (28, 1, 2026, 4, 35, 230000.00);
INSERT INTO dre_mensal VALUES (29, 1, 2026, 4, 36, 34000.00);
INSERT INTO dre_mensal VALUES (30, 1, 2026, 4, 39, 76000.00);
INSERT INTO dre_mensal VALUES (31, 1, 2026, 4, 40, 35000.00);
INSERT INTO dre_mensal VALUES (32, 1, 2026, 4, 41, 19500.00);
INSERT INTO dre_mensal VALUES (33, 1, 2026, 4, 49, 42000.00);
INSERT INTO dre_mensal VALUES (34, 1, 2026, 4, 50, 22000.00);
INSERT INTO dre_mensal VALUES (35, 1, 2026, 4, 52, 7500.00);
INSERT INTO dre_mensal VALUES (36, 1, 2026, 5, 35, 224800.00);
INSERT INTO dre_mensal VALUES (37, 1, 2026, 5, 36, 36500.00);
INSERT INTO dre_mensal VALUES (38, 1, 2026, 5, 39, 87000.00);
INSERT INTO dre_mensal VALUES (39, 1, 2026, 5, 40, 35000.00);
INSERT INTO dre_mensal VALUES (40, 1, 2026, 5, 41, 20100.00);
INSERT INTO dre_mensal VALUES (41, 1, 2026, 5, 49, 42000.00);
INSERT INTO dre_mensal VALUES (42, 1, 2026, 5, 50, 22000.00);
INSERT INTO dre_mensal VALUES (43, 1, 2026, 6, 35, 239000.00);
INSERT INTO dre_mensal VALUES (44, 1, 2026, 6, 36, 16300.00);
INSERT INTO dre_mensal VALUES (45, 1, 2026, 6, 39, 65000.00);
INSERT INTO dre_mensal VALUES (46, 1, 2026, 6, 40, 35000.00);
INSERT INTO dre_mensal VALUES (47, 1, 2026, 6, 41, 18800.00);
INSERT INTO dre_mensal VALUES (48, 1, 2026, 6, 49, 42000.00);
INSERT INTO dre_mensal VALUES (49, 1, 2026, 6, 50, 22000.00);
INSERT INTO dre_mensal VALUES (50, 1, 2026, 6, 45, 9500.00);
INSERT INTO dre_mensal VALUES (51, 1, 2026, 6, 55, 3800.00);
INSERT INTO dre_mensal VALUES (52, 1, 2026, 6, 56, 17800.00);

-- --------------------------------------------------
-- 13. IMPOSTOS A RECOLHER
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS impostos_recolher (
  id_imposto INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  tipo_imposto TEXT,
  periodo TEXT,
  base_calculo REAL,
  valor_imposto REAL,
  data_vencimento TEXT,
  status TEXT
);

INSERT INTO impostos_recolher VALUES (1, 1, 'PIS', '2026-01', 144200.00, 2175.00, '2026-02-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (2, 1, 'COFINS', '2026-01', 144200.00, 10020.00, '2026-02-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (3, 1, 'ICMS', '2026-01', 144200.00, 21630.00, '2026-02-20', 'recolhido');
INSERT INTO impostos_recolher VALUES (4, 1, 'PIS', '2026-02', 206700.00, 3118.00, '2026-03-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (5, 1, 'COFINS', '2026-02', 206700.00, 14365.00, '2026-03-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (6, 1, 'ICMS', '2026-02', 206700.00, 31005.00, '2026-03-20', 'recolhido');
INSERT INTO impostos_recolher VALUES (7, 1, 'PIS', '2026-03', 248400.00, 3748.00, '2026-04-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (8, 1, 'COFINS', '2026-03', 248400.00, 17263.00, '2026-04-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (9, 1, 'ICMS', '2026-03', 248400.00, 37260.00, '2026-04-20', 'recolhido');
INSERT INTO impostos_recolher VALUES (10, 1, 'PIS', '2026-04', 264000.00, 3982.00, '2026-05-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (11, 1, 'COFINS', '2026-04', 264000.00, 18348.00, '2026-05-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (12, 1, 'ICMS', '2026-04', 264000.00, 39600.00, '2026-05-20', 'recolhido');
INSERT INTO impostos_recolher VALUES (13, 1, 'PIS', '2026-05', 261300.00, 3940.00, '2026-06-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (14, 1, 'COFINS', '2026-05', 261300.00, 18163.00, '2026-06-25', 'recolhido');
INSERT INTO impostos_recolher VALUES (15, 1, 'ICMS', '2026-05', 261300.00, 39195.00, '2026-06-20', 'recolhido');
INSERT INTO impostos_recolher VALUES (16, 1, 'PIS', '2026-06', 255300.00, 3850.00, '2026-07-25', 'aberto');
INSERT INTO impostos_recolher VALUES (17, 1, 'COFINS', '2026-06', 255300.00, 17728.00, '2026-07-25', 'aberto');
INSERT INTO impostos_recolher VALUES (18, 1, 'ICMS', '2026-06', 255300.00, 38295.00, '2026-07-20', 'aberto');

-- --------------------------------------------------
-- 14. FOLHA DE PAGAMENTO
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS folha_pagamento (
  id_folha INTEGER PRIMARY KEY,
  id_empresa INTEGER,
  id_funcionario INTEGER,
  mes INTEGER,
  ano INTEGER,
  salario_base REAL,
  descontos REAL,
  valor_liquido REAL,
  data_pagamento TEXT
);

INSERT INTO folha_pagamento VALUES (1, 1, 1, 1, 2026, 45000.00, 11250.00, 33750.00, '2026-01-30');
INSERT INTO folha_pagamento VALUES (2, 1, 2, 1, 2026, 32000.00, 8000.00, 24000.00, '2026-01-30');
INSERT INTO folha_pagamento VALUES (3, 1, 3, 1, 2026, 22000.00, 5500.00, 16500.00, '2026-01-30');
INSERT INTO folha_pagamento VALUES (4, 1, 4, 1, 2026, 12000.00, 3000.00, 9000.00, '2026-01-30');
INSERT INTO folha_pagamento VALUES (5, 1, 5, 1, 2026, 12500.00, 3125.00, 9375.00, '2026-01-30');
INSERT INTO folha_pagamento VALUES (6, 1, 9, 1, 2026, 11000.00, 2750.00, 8250.00, '2026-01-30');
INSERT INTO folha_pagamento VALUES (7, 1, 1, 2, 2026, 45000.00, 11250.00, 33750.00, '2026-02-27');
INSERT INTO folha_pagamento VALUES (8, 1, 2, 2, 2026, 32000.00, 8000.00, 24000.00, '2026-02-27');
INSERT INTO folha_pagamento VALUES (9, 1, 3, 2, 2026, 22000.00, 5500.00, 16500.00, '2026-02-27');
INSERT INTO folha_pagamento VALUES (10, 1, 4, 2, 2026, 12000.00, 3000.00, 9000.00, '2026-02-27');
INSERT INTO folha_pagamento VALUES (11, 1, 5, 2, 2026, 12500.00, 3125.00, 9375.00, '2026-02-27');
INSERT INTO folha_pagamento VALUES (12, 1, 9, 2, 2026, 11000.00, 2750.00, 8250.00, '2026-02-27');
INSERT INTO folha_pagamento VALUES (13, 1, 1, 3, 2026, 45000.00, 11250.00, 33750.00, '2026-03-30');
INSERT INTO folha_pagamento VALUES (14, 1, 2, 3, 2026, 32000.00, 8000.00, 24000.00, '2026-03-30');
INSERT INTO folha_pagamento VALUES (15, 1, 3, 3, 2026, 22000.00, 5500.00, 16500.00, '2026-03-30');
INSERT INTO folha_pagamento VALUES (16, 1, 7, 3, 2026, 18000.00, 4500.00, 13500.00, '2026-03-30');
INSERT INTO folha_pagamento VALUES (17, 1, 8, 3, 2026, 7500.00, 1875.00, 5625.00, '2026-03-30');
INSERT INTO folha_pagamento VALUES (18, 1, 1, 4, 2026, 45000.00, 11250.00, 33750.00, '2026-04-29');
INSERT INTO folha_pagamento VALUES (19, 1, 2, 4, 2026, 32000.00, 8000.00, 24000.00, '2026-04-29');
INSERT INTO folha_pagamento VALUES (20, 1, 3, 4, 2026, 22000.00, 5500.00, 16500.00, '2026-04-29');
INSERT INTO folha_pagamento VALUES (21, 1, 1, 5, 2026, 45000.00, 11250.00, 33750.00, '2026-05-29');
INSERT INTO folha_pagamento VALUES (22, 1, 2, 5, 2026, 32000.00, 8000.00, 24000.00, '2026-05-29');
INSERT INTO folha_pagamento VALUES (23, 1, 3, 5, 2026, 22000.00, 5500.00, 16500.00, '2026-05-29');
INSERT INTO folha_pagamento VALUES (24, 1, 1, 6, 2026, 45000.00, 11250.00, 33750.00, '2026-06-29');
INSERT INTO folha_pagamento VALUES (25, 1, 2, 6, 2026, 32000.00, 8000.00, 24000.00, '2026-06-29');
INSERT INTO folha_pagamento VALUES (26, 1, 3, 6, 2026, 22000.00, 5500.00, 16500.00, '2026-06-29');
INSERT INTO folha_pagamento VALUES (27, 1, 9, 6, 2026, 11000.00, 2750.00, 8250.00, '2026-06-29');

-- --------------------------------------------------
-- 15. PRODUTOS (catálogo de produtos)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id_produto INTEGER PRIMARY KEY,
  codigo TEXT,
  nome TEXT,
  categoria TEXT,
  unidade_medida TEXT,
  preco_unitario REAL,
  custo_unitario REAL
);

INSERT INTO produtos VALUES (1, 'PROD-001', 'Componente Estrutural Aço Carbono', 'Industrial', 'UN', 450.00, 280.00);
INSERT INTO produtos VALUES (2, 'PROD-002', 'Válvula de Controle Hidráulico', 'Industrial', 'UN', 780.00, 490.00);
INSERT INTO produtos VALUES (3, 'PROD-003', 'Painel de Instrumentação Digital', 'Eletrônico', 'UN', 1200.00, 750.00);
INSERT INTO produtos VALUES (4, 'PROD-004', 'Conector Industrial IP67', 'Eletrônico', 'UN', 85.00, 52.00);
INSERT INTO produtos VALUES (5, 'PROD-005', 'Manta Isolante Térmica', 'Industrial', 'M2', 320.00, 195.00);
INSERT INTO produtos VALUES (6, 'PROD-006', 'Kit Ferramentas Precisão', 'Ferramentas', 'KIT', 650.00, 410.00);
INSERT INTO produtos VALUES (7, 'PROD-007', 'Sensor de Temperatura Industrial', 'Eletrônico', 'UN', 210.00, 130.00);
INSERT INTO produtos VALUES (8, 'PROD-008', 'Atuador Pneumático', 'Industrial', 'UN', 920.00, 580.00);

COMMIT;
