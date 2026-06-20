import React, { useState } from 'react';

const RULES = {
  'view': /^view:\s*\w+\s*\{/,
  'dimension': /^\s*dimension:\s*\w+\s*\{/,
  'measure': /^\s*measure:\s*\w+\s*\{/,
  'explore': /^explore:\s*\w+\s*\{/,
  'sql': /sql:/,
  'type': /type:\s*(string|number|count|sum|avg|date|yesno|duration)\s*;/,
  'primary_key': /primary_key:\s*(yes|no)\s*;/,
  'hidden': /hidden:\s*(yes|no)\s*;/,
  'description': /description:\s*".*"\s*;/,
};

function validateLookML(code) {
  const errors = [];
  const lines = code.split('\n');

  if (!code.includes('view ') && !code.includes('explore ')) {
    errors.push('Deve conter ao menos um view ou explore block.');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.includes('dimension:') && !trimmed.endsWith('{') && !trimmed.match(/^\s*dimension:\s*\w+/)) {
      errors.push(`Linha ${i + 1}: formato de dimension inválido. Use: dimension: nome {`);
    }
    if (trimmed.includes('measure:') && !trimmed.endsWith('{') && !trimmed.match(/^\s*measure:\s*\w+/)) {
      errors.push(`Linha ${i + 1}: formato de measure inválido. Use: measure: nome {`);
    }
    if (trimmed.startsWith('sql:') && !trimmed.includes('${TABLE}') && !trimmed.includes(';')) {
      errors.push(`Linha ${i + 1}: sql: deve referenciar ${'${TABLE}.coluna'} ou terminar com ;`);
    }
    if (trimmed.includes('type:') && !trimmed.match(/type:\s*(string|number|count|sum|avg|date|yesno|duration)\s*;/) && !trimmed.includes('{')) {
      errors.push(`Linha ${i + 1}: type inválido. Tipos válidos: string, number, count, sum, avg, date, yesno, duration`);
    }
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Chaves desbalanceadas: ${openBraces} abertas, ${closeBraces} fechadas`);
  }

  return errors;
}

const CHALLENGES = [
  {
    id: 'lookml-1',
    title: 'Criar uma View de Clientes',
    prompt: 'Crie uma view "clientes" com: dimension: id (primary_key: yes, type: number), dimension: nome (type: string), dimension: cidade (type: string, hidden: no), measure: total_clientes (type: count)',
    solution: `view: clientes {
  sql_table_name: "clientes"
    ;

  dimension: id {
    type: number;
    primary_key: yes;
    sql: \${TABLE}.id ;;
  }

  dimension: nome {
    type: string;
    sql: \${TABLE}.nome ;;
  }

  dimension: cidade {
    type: string;
    hidden: no;
    sql: \${TABLE}.cidade ;;
  }

  measure: total_clientes {
    type: count;
    sql: \${TABLE}.id ;;
  }
}`,
  },
  {
    id: 'lookml-2',
    title: 'Criar uma Measure de Soma',
    prompt: 'Crie uma measure "total_faturamento" do tipo "sum" baseada na coluna "valor" da tabela "faturamento". Depois crie uma measure "media_faturamento" do tipo "avg".',
    hint: 'Use type: sum e type: avg com sql: \${TABLE}.valor ;;',
    solution: `measure: total_faturamento {
  type: sum;
  sql: \${TABLE}.valor ;;
}

measure: media_faturamento {
  type: avg;
  sql: \${TABLE}.valor ;;
}`,
  },
  {
    id: 'lookml-3',
    title: 'Explorer com JOIN',
    prompt: 'Crie um explore "vendas" que faça join com a view "clientes" usando uma relação "many_to_one" pela chave "cliente_id".',
    hint: 'Use explore: vendas { join: clientes { relationship: many_to_one; sql_on: \${vendas.cliente_id} = \${clientes.id} ;; } }',
    solution: `explore: vendas {
  join: clientes {
    relationship: many_to_one;
    sql_on: \${vendas.cliente_id} = \${clientes.id} ;;
  }
}`,
  },
];

export default function LookMLEditor() {
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState([]);
  const [valid, setValid] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengeSolved, setChallengeSolved] = useState({});

  const handleValidate = () => {
    const result = validateLookML(code);
    setErrors(result);
    setValid(result.length === 0);

    if (result.length === 0 && activeChallenge) {
      setChallengeSolved(prev => ({ ...prev, [activeChallenge.id]: true }));
    }
  };

  const loadChallenge = (ch) => {
    setActiveChallenge(ch);
    setCode(ch.solution);
    setErrors([]);
    setValid(false);
  };

  const cardStyle = {
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    margin: '1.5rem 0',
    overflow: 'hidden',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {CHALLENGES.map(ch => (
          <button key={ch.id} onClick={() => loadChallenge(ch)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)',
              background: challengeSolved[ch.id] ? '#eafaf1' : 'var(--ifm-color-emphasis-100)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              borderLeft: challengeSolved[ch.id] ? '3px solid #2ecc71' : '3px solid transparent',
            }}>
            {challengeSolved[ch.id] ? '✓ ' : ''}{ch.title}
          </button>
        ))}
      </div>

      {activeChallenge && (
        <div style={cardStyle}>
          <div style={{
            padding: '0.75rem 1rem', background: 'var(--ifm-color-emphasis-100)',
            borderBottom: '1px solid var(--ifm-color-emphasis-300)',
          }}>
            <strong>{activeChallenge.title}</strong>
            {challengeSolved[activeChallenge.id] && (
              <span style={{ color: '#2ecc71', marginLeft: '0.75rem', fontSize: '0.85rem' }}>✓ Concluído</span>
            )}
          </div>
          <div style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{activeChallenge.prompt}</p>
            {activeChallenge.hint && (
              <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-500)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                Dica: {activeChallenge.hint}
              </p>
            )}
            <div style={{
              border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{
                  width: '100%', minHeight: '200px', padding: '1rem',
                  fontFamily: "'Courier New', monospace", fontSize: '13px',
                  border: 'none', resize: 'vertical', lineHeight: 1.5,
                  background: '#f8f9fa', color: '#1a1a2e',
                }}
                placeholder="Digite seu LookML aqui..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button onClick={handleValidate}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px',
                  background: 'var(--ifm-color-primary)', color: 'white',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                }}>
                Validar LookML
              </button>
            </div>

            {valid && (
              <div style={{
                marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '6px',
                background: '#eafaf1', border: '1px solid #2ecc71', color: '#1b5e20',
              }}>
                ✓ LookML válido! {challengeSolved[activeChallenge.id] ? 'Exercício concluído!' : ''}
              </div>
            )}

            {errors.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                {errors.map((err, i) => (
                  <div key={i} style={{
                    padding: '0.4rem 0.75rem', margin: '0.25rem 0', borderRadius: '4px',
                    background: '#fdedec', border: '1px solid #e74c3c', color: '#b71c1c',
                    fontSize: '0.85rem',
                  }}>
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!activeChallenge && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-emphasis-500)' }}>
          Clique em um exercício acima para começar
        </div>
      )}
    </div>
  );
}
