import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const LOOKML_KEYWORDS = [
  'view:', 'explore:', 'dimension:', 'measure:', 'join:',
  'sql_table_name:', 'derived_table:', 'sql_on:', 'sql:',
  'primary_key:', 'hidden:', 'description:', 'relationship:',
  'type:', 'label:', 'group_label:', 'value_format:',
  'currency:', 'timeframe:', 'timeframes:', 'convert_tz:',
  'datatype:', 'html:', 'link:', 'action:', 'access_filter:',
  'always_filter:', 'suggest_dimension:', 'suggest_explore:',
  'tags:', 'drill_fields:', 'extends:', 'include:',
];

const LOOKML_TYPES = [
  'string', 'number', 'count', 'sum', 'avg', 'date', 'yesno',
  'duration', 'percent', 'percent_of_total', 'running_total',
  'running_percentage', 'list', 'max', 'min', 'median',
  'percentile', 'count_distinct', 'number_distinct',
];

const LOOKML_RELATIONSHIPS = [
  'many_to_one', 'one_to_many', 'one_to_one',
];

function validateLookML(code) {
  const errors = [];
  const lines = code.split('\n');

  if (!code.includes('view ') && !code.includes('explore ')) {
    errors.push('Deve conter ao menos um "view" ou "explore" — são os blocos principais do LookML.');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes('dimension:') && !trimmed.endsWith('{') && !trimmed.match(/^\s*dimension:\s*\w+/)) {
      errors.push(`Linha ${i + 1}: toda dimension precisa de um nome e chaves { }. Ex: dimension: nome {`);
    }
    if (trimmed.includes('measure:') && !trimmed.endsWith('{') && !trimmed.match(/^\s*measure:\s*\w+/)) {
      errors.push(`Linha ${i + 1}: toda measure precisa de um nome e chaves { }. Ex: measure: total {`);
    }
    if (trimmed.startsWith('sql:') && !trimmed.includes('${TABLE}') && !trimmed.includes(';')) {
      errors.push(`Linha ${i + 1}: sql: deve referenciar a tabela com \${TABLE}.coluna ou terminar com ;`);
    }
    if (trimmed.includes('type:') && !trimmed.match(/type:\s*(string|number|count|sum|avg|date|yesno|duration|percent|percent_of_total|running_total|list|max|min|median|count_distinct)\s*;/) && !trimmed.includes('{')) {
      errors.push(`Linha ${i + 1}: tipo inválido. Use: string, number, count, sum, avg, date, yesno, duration, percent, count_distinct`);
    }
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Chaves desbalanceadas: ${openBraces} abertas { e ${closeBraces} fechadas }.`);
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
    title: 'Criar Measures de Soma e Média',
    prompt: 'Crie uma measure "total_faturamento" do tipo "sum" e outra "media_faturamento" do tipo "avg", ambas baseadas na coluna "valor" da tabela "faturamento".',
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
    title: 'Explore com JOIN',
    prompt: 'Crie um explore "vendas" que faça join com a view "clientes" usando relação "many_to_one" pela chave "cliente_id".',
    hint: 'Use explore: vendas { join: clientes { relationship: many_to_one; sql_on: \${vendas.cliente_id} = \${clientes.id} ;; } }',
    solution: `explore: vendas {
  join: clientes {
    relationship: many_to_one;
    sql_on: \${vendas.cliente_id} = \${clientes.id} ;;
  }
}`,
  },
  {
    id: 'lookml-4',
    title: 'View com dimension de Data',
    prompt: 'Crie uma view "notas_fiscais" com: dimension: id (primary_key, number), dimension: data_emissao (type: date), measure: total_notas (type: count), measure: valor_total (type: sum).',
    hint: 'Use sql_table_name para apontar para a tabela e sql: \${TABLE}.coluna ;; para cada campo.',
    solution: `view: notas_fiscais {
  sql_table_name: "notas_fiscais"
    ;

  dimension: id {
    type: number;
    primary_key: yes;
    sql: \${TABLE}.id ;;
  }

  dimension: data_emissao {
    type: date;
    sql: \${TABLE}.data_emissao ;;
  }

  measure: total_notas {
    type: count;
    sql: \${TABLE}.id ;;
  }

  measure: valor_total {
    type: sum;
    sql: \${TABLE}.valor_total ;;
  }
}`,
  },
  {
    id: 'lookml-5',
    title: 'Measure Percentual',
    prompt: 'Adicione uma measure "taxa_crescimento" do tipo "percent" que calcula a variação percentual do faturamento.',
    hint: 'A measure percent usa type: percent_of_total ou type: percent com uma expressão SQL personalizada.',
    solution: `measure: taxa_crescimento {
  type: percent;
  sql: (\${TABLE}.valor_atual - \${TABLE}.valor_anterior) / NULLIF(\${TABLE}.valor_anterior, 0) ;;
}`,
  },
  {
    id: 'lookml-6',
    title: 'View com Filtro Padrão',
    prompt: 'Crie uma view "despesas" com filtro padrão (always_filter) para o campo "centro_custo".',
    hint: 'Use always_filter dentro do explore para forçar o filtro.',
    solution: `explore: despesas {
  always_filter: {
    filters: [centro_custo: "Administrativo"]
  }
  join: centro_custos {
    relationship: many_to_one;
    sql_on: \${despesas.centro_custo_id} = \${centro_custos.id} ;;
  }
}`,
  },
];

export default function LookMLEditor() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState([]);
  const [valid, setValid] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengeSolved, setChallengeSolved] = useState({});
  const [showSolution, setShowSolution] = useState(false);

  const defineLookML = useCallback((monaco) => {
    monaco.languages.register({ id: 'lookml' });

    monaco.languages.setMonarchTokensProvider('lookml', {
      defaultToken: '',
      tokenPostfix: '.lookml',
      keywords: LOOKML_KEYWORDS.map(k => k.replace(':', '')),
      typeKeywords: LOOKML_TYPES,
      operators: ['{', '}', ';', ':'],
      symbols: /[{};:=]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier',
            }
          }],
          { include: '@whitespace' },
          [/[{};]/, 'delimiter.bracket'],
          [/".*?"/, 'string'],
          [/'[^']*'/, 'string'],
          [/;/, 'delimiter'],
          [/[:\/]/, 'delimiter'],
          [/[0-9]+/, 'number'],
          [/true|false|yes|no/, 'constant'],
        ],
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/(?:#|##).*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],
      },
    });

    monaco.editor.defineTheme('lookmlTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'type', foreground: '267f99' },
        { token: 'string', foreground: 'a31515' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'number', foreground: '098658' },
        { token: 'constant', foreground: 'e67e22' },
        { token: 'delimiter.bracket', foreground: '7f8c8d' },
      ],
      colors: {
        'editorLineNumber.foreground': '#999999',
        'editorCursor.foreground': '#1a73e8',
      },
    });
  }, []);

  const handleValidate = () => {
    const currentCode = editorRef.current?.getValue() || code;
    const result = validateLookML(currentCode);
    setErrors(result);
    setValid(result.length === 0);

    if (result.length === 0 && activeChallenge) {
      setChallengeSolved(prev => ({ ...prev, [activeChallenge.id]: true }));
    }
  };

  const loadChallenge = (ch) => {
    setActiveChallenge(ch);
    setCode('');
    setErrors([]);
    setValid(false);
    setShowSolution(false);
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
  };

  const handleCodeChange = (value) => {
    setCode(value || '');
    if (valid) setValid(false);
    if (errors.length > 0) setErrors([]);
  };

  const solveChallenge = () => {
    setShowSolution(true);
    if (editorRef.current) {
      editorRef.current.setValue(activeChallenge.solution);
    }
    setCode(activeChallenge.solution);
  };

  const cardStyle = {
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    margin: '1.5rem 0',
    overflow: 'hidden',
  };

  const btnStyle = (active) => ({
    padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--ifm-color-emphasis-300)',
    background: active ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-100)',
    color: active ? 'white' : 'var(--ifm-color-emphasis-700)',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {CHALLENGES.map(ch => (
          <button key={ch.id} onClick={() => loadChallenge(ch)}
            style={{
              ...btnStyle(activeChallenge?.id === ch.id),
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
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <strong>{activeChallenge.title}</strong>
              {challengeSolved[activeChallenge.id] && (
                <span style={{ color: '#2ecc71', marginLeft: '0.75rem', fontSize: '0.85rem' }}>✓ Concluído</span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)' }}>
              Dica: {activeChallenge.hint || 'Leia o enunciado com atenção'}
            </span>
          </div>
          <div style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{activeChallenge.prompt}</p>

            <div style={{
              border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px',
              overflow: 'hidden', height: '300px',
            }}>
              <Editor
                height="100%"
                defaultLanguage="lookml"
                value={code}
                onChange={handleCodeChange}
                theme="lookmlTheme"
                beforeMount={defineLookML}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
                options={{
                  fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false,
                  lineNumbers: 'on', renderLineHighlight: 'line', automaticLayout: true,
                  wordBasedSuggestions: false, tabSize: 2, padding: { top: 8 },
                }}
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
              <button onClick={solveChallenge}
                style={{
                  padding: '0.5rem 1.25rem', border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px', background: 'var(--ifm-color-emphasis-100)',
                  cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
                }}>
                Ver solução
              </button>
            </div>

            {showSolution && (
              <div style={{
                marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '6px',
                background: '#fff8e1', border: '1px solid #ffd54f',
                fontSize: '0.85rem', color: '#f57f17',
              }}>
                💡 Solução carregada. Compare com seu código e tente entender cada parte. Depois tente fazer outro desafio sem consultar.
              </div>
            )}

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

      <div style={{
        marginTop: '1rem', padding: '0.6rem 1rem', borderRadius: '6px',
        background: '#e8f4f8', border: '1px solid #b3d9e8',
        fontSize: '0.82rem', color: '#1a5276',
      }}>
        <strong>✨ Editor atualizado!</strong> Agora com Monaco Editor — syntax highlighting, numeração de linhas e mais conforto para escrever LookML.
      </div>
    </div>
  );
}
