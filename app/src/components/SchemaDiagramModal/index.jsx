import React, { useEffect, useRef, useState } from 'react';

const ER_DEFINITION = `erDiagram
    empresas {
        int id_empresa PK
        text cnpj
        text razao_social
        text nome_fantasia
        text regime_tributario
    }
    planos_contas {
        int id_conta PK
        text codigo
        text descricao
        text tipo_conta
        text natureza
        int nivel
        int id_conta_pai FK
    }
    centros_custo {
        int id_centro_custo PK
        text codigo
        text descricao
        text departamento
    }
    lancamentos_contabeis {
        int id_lancamento PK
        int id_empresa FK
        int id_conta FK
        int id_centro_custo FK
        date data_lancamento
        real valor
        text debito_credito
        text historico
        text id_documento
        text data_competencia
    }
    clientes {
        int id_cliente PK
        text cnpj_cpf
        text nome
        text cidade
        text uf
        text segmento
    }
    fornecedores {
        int id_fornecedor PK
        text cnpj_cpf
        text nome
        text tipo
        text cidade
        text uf
    }
    faturamento {
        int id_faturamento PK
        int id_empresa FK
        int id_cliente FK
        date data_emissao
        date data_vencimento
        real valor_total
        real valor_liquido
        text status
        text produto_servico
    }
    contas_pagar {
        int id_conta_pagar PK
        int id_empresa FK
        int id_fornecedor FK
        int id_centro_custo FK
        text descricao
        date data_emissao
        date data_vencimento
        real valor
        text status
    }
    contas_receber {
        int id_conta_receber PK
        int id_empresa FK
        int id_cliente FK
        date data_emissao
        date data_vencimento
        real valor
        text status
    }
    notas_fiscais {
        int id_nota_fiscal PK
        int id_empresa FK
        text numero
        text tipo
        date data_emissao
        int id_cliente_fornecedor
        text tipo_pessoa
        real base_calculo
        real valor_imposto
    }
    funcionarios {
        int id_funcionario PK
        int id_empresa FK
        text nome
        text cargo
        text departamento
        real salario
        date data_admissao
    }
    folha_pagamento {
        int id_folha PK
        int id_funcionario FK
        int mes
        int ano
        real salario_bruto
        real descontos
        real salario_liquido
    }
    produtos {
        int id_produto PK
        text nome
        text tipo
        text unidade
        real preco_unitario
        real custo_unitario
    }
    dre_mensal {
        int id_dre PK
        int id_empresa FK
        int ano
        int mes
        int id_conta FK
        real valor
    }
    impostos_recolher {
        int id_imposto PK
        int id_empresa FK
        int mes
        int ano
        text tipo_imposto
        real base_calculo
        real valor
        text status
    }

    empresas ||--o{ lancamentos_contabeis : ""
    empresas ||--o{ faturamento : ""
    empresas ||--o{ contas_pagar : ""
    empresas ||--o{ contas_receber : ""
    empresas ||--o{ notas_fiscais : ""
    empresas ||--o{ funcionarios : ""
    empresas ||--o{ dre_mensal : ""
    empresas ||--o{ impostos_recolher : ""
    planos_contas ||--o{ lancamentos_contabeis : ""
    planos_contas ||--o{ dre_mensal : ""
    centros_custo ||--o{ lancamentos_contabeis : ""
    centros_custo ||--o{ contas_pagar : ""
    clientes ||--o{ faturamento : ""
    clientes ||--o{ contas_receber : ""
    fornecedores ||--o{ contas_pagar : ""
    funcionarios ||--o{ folha_pagamento : ""
    planos_contas ||--o{ planos_contas : "id_conta_pai"`;

const MODAL_STYLES = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  content: {
    position: 'relative', maxWidth: '95vw', maxHeight: '90vh',
    width: '1200px', background: 'white', borderRadius: '12px',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #e0e0e0',
  },
  closeBtn: {
    border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem',
    color: '#666',
  },
  body: {
    flex: 1, overflow: 'auto', padding: '1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '400px',
  },
  legend: {
    padding: '0.75rem 1.25rem', borderTop: '1px solid #e0e0e0',
    fontSize: '0.82rem', color: '#555',
    display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
  },
};

const LEGEND_ITEMS = [
  { label: 'PK', desc: 'Chave Primária', color: '#2563eb' },
  { label: 'FK', desc: 'Chave Estrangeira', color: '#7c3aed' },
  { label: '||--o{', desc: '1 para N (um para muitos)', color: '#2ecc71' },
];

export default function SchemaDiagramModal({ open, onClose }) {
  const mermaidRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setRendered(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    import('mermaid').then((mod) => {
      const mermaid = mod.default || mod;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        themeVariables: {
          primaryColor: '#e8f0fe',
          primaryBorderColor: '#2563eb',
          lineColor: '#666',
          secondaryColor: '#f0f0f0',
          tertiaryColor: '#fff',
        },
        er: {
          layoutDirection: 'TB',
          minEntityWidth: 100,
          entityPadding: 12,
          fontSize: 12,
        },
      });

      const id = 'er-diagram-' + Date.now();
      mermaid.render(id, ER_DEFINITION).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
          const svgEl = mermaidRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        }
        setRendered(true);
        setLoading(false);
      }).catch((err) => {
        setError(err.message || 'Erro ao renderizar diagrama');
        setLoading(false);
      });
    }).catch((err) => {
      setError('Erro ao carregar Mermaid: ' + (err.message || ''));
      setLoading(false);
    });
  }, [open]);

  if (!open) return null;

  return (
    <div style={MODAL_STYLES.overlay} onClick={onClose}>
      <div style={MODAL_STYLES.content} onClick={(e) => e.stopPropagation()}>
        <div style={MODAL_STYLES.header}>
          <strong style={{ fontSize: '1rem' }}>
            &#128220; Diagrama do Banco de Dados — Nova Era S.A.
          </strong>
          <button style={MODAL_STYLES.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={MODAL_STYLES.body}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
              Gerando diagrama...
            </div>
          )}
          {error && (
            <div style={{ color: '#e74c3c', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div ref={mermaidRef} style={{ width: '100%', display: loading ? 'none' : 'block' }} />
        </div>

        <div style={MODAL_STYLES.legend}>
          {LEGEND_ITEMS.map((item) => (
            <span key={item.label}>
              <strong style={{ color: item.color }}>{item.label}</strong>
              {' — '}{item.desc}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
            Passe o mouse sobre as entidades para ver detalhes
          </span>
        </div>
      </div>
    </div>
  );
}
