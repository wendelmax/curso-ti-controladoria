import React, { useState } from 'react';

const SCHEMA = [
  {
    name: 'empresas',
    columns: [
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'cnpj', type: 'TEXT' },
      { name: 'razao_social', type: 'TEXT' },
      { name: 'nome_fantasia', type: 'TEXT' },
      { name: 'regime_tributario', type: 'TEXT' },
    ],
  },
  {
    name: 'planos_contas',
    columns: [
      { name: 'id_conta', type: 'INTEGER' },
      { name: 'codigo', type: 'TEXT' },
      { name: 'descricao', type: 'TEXT' },
      { name: 'tipo_conta', type: 'TEXT' },
      { name: 'natureza', type: 'TEXT' },
      { name: 'nivel', type: 'INTEGER' },
      { name: 'id_conta_pai', type: 'INTEGER' },
    ],
  },
  {
    name: 'centros_custo',
    columns: [
      { name: 'id_centro_custo', type: 'INTEGER' },
      { name: 'codigo', type: 'TEXT' },
      { name: 'descricao', type: 'TEXT' },
      { name: 'departamento', type: 'TEXT' },
    ],
  },
  {
    name: 'lancamentos_contabeis',
    columns: [
      { name: 'id_lancamento', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'id_conta', type: 'INTEGER' },
      { name: 'id_centro_custo', type: 'INTEGER' },
      { name: 'data_lancamento', type: 'DATE' },
      { name: 'valor', type: 'REAL' },
      { name: 'debito_credito', type: 'TEXT' },
      { name: 'historico', type: 'TEXT' },
      { name: 'id_documento', type: 'TEXT' },
      { name: 'data_competencia', type: 'TEXT' },
    ],
  },
  {
    name: 'clientes',
    columns: [
      { name: 'id_cliente', type: 'INTEGER' },
      { name: 'cnpj_cpf', type: 'TEXT' },
      { name: 'nome', type: 'TEXT' },
      { name: 'cidade', type: 'TEXT' },
      { name: 'uf', type: 'TEXT' },
      { name: 'segmento', type: 'TEXT' },
    ],
  },
  {
    name: 'fornecedores',
    columns: [
      { name: 'id_fornecedor', type: 'INTEGER' },
      { name: 'cnpj_cpf', type: 'TEXT' },
      { name: 'nome', type: 'TEXT' },
      { name: 'tipo', type: 'TEXT' },
      { name: 'cidade', type: 'TEXT' },
      { name: 'uf', type: 'TEXT' },
    ],
  },
  {
    name: 'faturamento',
    columns: [
      { name: 'id_faturamento', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'id_cliente', type: 'INTEGER' },
      { name: 'data_emissao', type: 'DATE' },
      { name: 'data_vencimento', type: 'DATE' },
      { name: 'valor_total', type: 'REAL' },
      { name: 'valor_liquido', type: 'REAL' },
      { name: 'status', type: 'TEXT' },
      { name: 'produto_servico', type: 'TEXT' },
    ],
  },
  {
    name: 'contas_pagar',
    columns: [
      { name: 'id_conta_pagar', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'id_fornecedor', type: 'INTEGER' },
      { name: 'id_centro_custo', type: 'INTEGER' },
      { name: 'descricao', type: 'TEXT' },
      { name: 'data_emissao', type: 'DATE' },
      { name: 'data_vencimento', type: 'DATE' },
      { name: 'valor', type: 'REAL' },
      { name: 'status', type: 'TEXT' },
    ],
  },
  {
    name: 'contas_receber',
    columns: [
      { name: 'id_conta_receber', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'id_cliente', type: 'INTEGER' },
      { name: 'data_emissao', type: 'DATE' },
      { name: 'data_vencimento', type: 'DATE' },
      { name: 'valor', type: 'REAL' },
      { name: 'status', type: 'TEXT' },
    ],
  },
  {
    name: 'notas_fiscais',
    columns: [
      { name: 'id_nota_fiscal', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'numero', type: 'TEXT' },
      { name: 'tipo', type: 'TEXT' },
      { name: 'data_emissao', type: 'DATE' },
      { name: 'id_cliente_fornecedor', type: 'INTEGER' },
      { name: 'tipo_pessoa', type: 'TEXT' },
      { name: 'base_calculo', type: 'REAL' },
      { name: 'valor_imposto', type: 'REAL' },
    ],
  },
  {
    name: 'funcionarios',
    columns: [
      { name: 'id_funcionario', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'nome', type: 'TEXT' },
      { name: 'cargo', type: 'TEXT' },
      { name: 'departamento', type: 'TEXT' },
      { name: 'salario', type: 'REAL' },
      { name: 'data_admissao', type: 'DATE' },
    ],
  },
  {
    name: 'dre_mensal',
    columns: [
      { name: 'id_dre', type: 'INTEGER' },
      { name: 'id_empresa', type: 'INTEGER' },
      { name: 'ano', type: 'INTEGER' },
      { name: 'mes', type: 'INTEGER' },
      { name: 'id_conta', type: 'INTEGER' },
      { name: 'valor', type: 'REAL' },
    ],
  },
];

export default function SchemaExplorer({ onTableClick, onColumnClick }) {
  const [expandedTables, setExpandedTables] = useState(new Set());

  const toggleTable = (tableName) => {
    const next = new Set(expandedTables);
    if (next.has(tableName)) next.delete(tableName);
    else next.add(tableName);
    setExpandedTables(next);
  };

  return (
    <div className="schema-explorer">
      <div className="schema-explorer-header">
        <span>&#128218;</span> Banco de Dados
      </div>
      <div className="schema-explorer-content">
        {SCHEMA.map((table) => (
          <React.Fragment key={table.name}>
            <div
              className="schema-table"
              onClick={() => toggleTable(table.name)}
            >
              <span className="schema-table-icon">
                {expandedTables.has(table.name) ? '▼' : '▶'}
              </span>
              <span>{table.name}</span>
            </div>
            {expandedTables.has(table.name) && (
              <div className="schema-columns">
                {table.columns.map((col) => (
                  <div key={col.name} className="schema-column">
                    <span>{col.name}</span>
                    <span className="schema-column-type">{col.type}</span>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export { SCHEMA };
