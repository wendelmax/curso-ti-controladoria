import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../AuthProvider';

const DB_URL = '/db/seed.sqlite';
let cachedDb = null;

async function getDatabase(SQL) {
  if (cachedDb) return cachedDb;
  const resp = await fetch(DB_URL);
  const buffer = await resp.arrayBuffer();
  cachedDb = new SQL.Database(new Uint8Array(buffer));
  return cachedDb;
}

const ERROR_TRANSLATIONS = [
  [/near "([^"]+)": syntax error/i, (_, token) => `Erro de sintaxe perto de "${token}". Verifique a digitação — você quis digitar "${suggestCorrection(token)}"?`],
  [/no such table: (\w+)/i, (_, tbl) => `Tabela "${tbl}" não encontrada. As tabelas disponíveis são: lancamentos, contas, clientes, fornecedores, centros_custo, plano_contas.`],
  [/no such column: (\w+)/i, (_, col) => `Coluna "${col}" não encontrada. Verifique os nomes das colunas na tabela que você está consultando.`],
  [/unrecognized token/i, () => 'Caractere não reconhecido. Verifique aspas, vírgulas e parênteses.' ],
  [/ORDER BY clause should come after/i, () => 'A cláusula ORDER BY deve vir depois do GROUP BY, não antes.' ],
  [/GROUP BY clause should come after/i, () => 'A cláusula GROUP BY deve vir depois do WHERE, não antes.' ],
  [/syntax error/i, () => 'Erro de sintaxe no SQL. Verifique a estrutura do comando.' ],
  [/multiple statements/i, () => 'Execute apenas uma consulta por vez.'],
];

function suggestCorrection(token) {
  const corrections = {
    'SELEC': 'SELECT', 'SELET': 'SELECT', 'SELCT': 'SELECT',
    'FOM': 'FROM', 'FORM': 'FROM', 'FRO': 'FROM',
    'WHER': 'WHERE', 'WHRE': 'WHERE', 'WHE': 'WHERE',
    'GROP': 'GROUP', 'GRUP': 'GROUP',
    'HAVING': 'HAVING', 'HAVNG': 'HAVING',
    'ORDRE': 'ORDER', 'OREDER': 'ORDER',
    'JOI': 'JOIN', 'JO': 'JOIN',
    'ON': 'ON', 'O': 'ON',
    'AND': 'AND', 'ADN': 'AND',
    'OR': 'OR',
    'IN': 'IN',
    'NOT': 'NOT', 'NOTT': 'NOT',
    'NULL': 'NULL', 'NUL': 'NULL',
    'AS': 'AS', 'A': 'AS',
    'LIMIT': 'LIMIT', 'LIMT': 'LIMIT',
    'DISTINCT': 'DISTINCT', 'DISTCT': 'DISTINCT',
    'COUNT': 'COUNT', 'COUN': 'COUNT', 'CONT': 'COUNT',
    'SUM': 'SUM', 'SU': 'SUM',
    'AVG': 'AVG', 'AV': 'AVG',
    'MIN': 'MIN', 'MI': 'MIN',
    'MAX': 'MAX', 'MA': 'MAX',
    'INSERT': 'INSERT', 'INSRT': 'INSERT',
    'UPDATE': 'UPDATE', 'UPDTE': 'UPDATE',
    'DELETE': 'DELETE', 'DELTE': 'DELETE',
    'CREATE': 'CREATE', 'CRETE': 'CREATE',
    'TABLE': 'TABLE', 'TABL': 'TABLE',
    'INNER': 'INNER', 'INER': 'INNER',
    'LEFT': 'LEFT', 'LEF': 'LEFT',
    'RIGHT': 'RIGHT', 'RIGTH': 'RIGHT',
    'CROSS': 'CROSS', 'CROS': 'CROSS',
    'DESC': 'DESC', 'DES': 'DESC',
    'ASC': 'ASC', 'AS': 'ASC',
    'BETWEEN': 'BETWEEN', 'BETWN': 'BETWEEN',
    'LIKE': 'LIKE', 'LIK': 'LIKE',
    'IS': 'IS', 'I': 'IS',
    'CASE': 'CASE', 'CAS': 'CASE',
    'WHEN': 'WHEN', 'WHN': 'WHEN',
    'THEN': 'THEN', 'THN': 'THEN',
    'ELSE': 'ELSE', 'ELS': 'ELSE',
    'END': 'END', 'EN': 'END',
    'CAST': 'CAST', 'CAST': 'CAST',
    'COALESCE': 'COALESCE', 'COALSC': 'COALESCE',
    'NULLIF': 'NULLIF', 'NULIF': 'NULLIF',
  };
  const upper = token.toUpperCase();
  return corrections[upper] || upper;
}

function translateSqlError(msg) {
  for (const [regex, handler] of ERROR_TRANSLATIONS) {
    const match = msg.match(regex);
    if (match) return handler(...match);
  }
  return `Erro SQL: ${msg}`;
}

function translateBQtoSQLite(sql) {
  let s = sql;
  s = s.replace(/EXTRACT\s*\(\s*YEAR\s+FROM\s+(\w+(?:\.\w+)?)\s*\)/gi, "CAST(STRFTIME('%Y', $1) AS INTEGER)");
  s = s.replace(/EXTRACT\s*\(\s*MONTH\s+FROM\s+(\w+(?:\.\w+)?)\s*\)/gi, "CAST(STRFTIME('%m', $1) AS INTEGER)");
  s = s.replace(/EXTRACT\s*\(\s*DAY\s+FROM\s+(\w+(?:\.\w+)?)\s*\)/gi, "CAST(STRFTIME('%d', $1) AS INTEGER)");
  s = s.replace(/DATE_TRUNC\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*MONTH\s*\)/gi, "STRFTIME('%Y-%m-01', $1)");
  s = s.replace(/DATE_TRUNC\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*YEAR\s*\)/gi, "STRFTIME('%Y-01-01', $1)");
  s = s.replace(/FORMAT_DATE\s*\(\s*'([^']+)'\s*,\s*(\w+(?:\.\w+)?)\s*\)/gi, "STRFTIME('$1', $2)");
  s = s.replace(/SAFE_DIVIDE\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "CASE WHEN ($2) = 0 THEN NULL ELSE ($1) / ($2) END");
  s = s.replace(/DIV\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "CAST(($1) / NULLIF($2, 0) AS INTEGER)");
  s = s.replace(/IF\s*\(\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "CASE WHEN ($1) THEN $2 ELSE $3 END");
  s = s.replace(/STARTS_WITH\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "($1) LIKE ($2) || '%'");
  s = s.replace(/ENDS_WITH\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "($1) LIKE '%' || ($2)");
  s = s.replace(/CONTAINS_SUBSTR\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/gi, "($1) LIKE '%' || ($2) || '%'");
  s = s.replace(/DATE_ADD\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "DATE($1, '+$2 days')");
  s = s.replace(/DATE_ADD\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/gi, "DATE($1, '+$2 months')");
  s = s.replace(/DATE_SUB\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "DATE($1, '-$2 days')");
  s = s.replace(/DATE_SUB\s*\(\s*(\w+(?:\.\w+)?)\s*,\s*INTERVAL\s+(\d+)\s+MONTH\s*\)/gi, "DATE($1, '-$2 months')");
  s = s.replace(/CAST\s*\(\s*(\w+(?:\.\w+)?)\s+AS\s+STRING\s*\)/gi, "CAST($1 AS TEXT)");
  s = s.replace(/CAST\s*\(\s*(\w+(?:\.\w+)?)\s+AS\s+INT64\s*\)/gi, "CAST($1 AS INTEGER)");
  s = s.replace(/CAST\s*\(\s*(\w+(?:\.\w+)?)\s+AS\s+FLOAT64\s*\)/gi, "CAST($1 AS REAL)");
  return s;
}

function normalizeSql(sql) {
  return sql.replace(/;+$/, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function sortResult(rows) {
  return rows.slice().sort((a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return 0;
  });
}

function resultsMatch(actual, expected) {
  if (actual.length !== expected.length) return false;
  const aSorted = sortResult(actual);
  const eSorted = sortResult(expected);
  for (let i = 0; i < aSorted.length; i++) {
    if (aSorted[i].length !== eSorted[i].length) return false;
    for (let j = 0; j < aSorted[i].length; j++) {
      if (String(aSorted[i][j]) !== String(eSorted[i][j])) return false;
    }
  }
  return true;
}

const EXERCISE_STORAGE = 'curso_ti_exercise_results';

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(EXERCISE_STORAGE) || '{}');
  } catch { return {}; }
}

function saveLocal(id, data) {
  const all = loadLocal();
  all[id] = data;
  localStorage.setItem(EXERCISE_STORAGE, JSON.stringify(all));
}

export default function SqlExercicio({
  id,
  prompt,
  hint,
  expectedSql,
  validation = 'result',
  table,
}) {
  const { user, supabase } = useAuth();
  const editorRef = useRef(null);
  const sqlJsRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [saved, setSaved] = useState(null);
  const [initError, setInitError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expectedResult, setExpectedResult] = useState(null);
  const [studentResult, setStudentResult] = useState(null);
  const [showExpected, setShowExpected] = useState(false);

  useEffect(() => {
    import('sql.js').then(async (mod) => {
      try {
        const SQL = await mod.default({
          locateFile: (f) => `/db/${f}`,
        });
        sqlJsRef.current = { SQL, db: await getDatabase(SQL) };
      } catch (err) {
        setInitError(err.message);
      }
    });

    const local = loadLocal();
    if (id && local[id]) setSaved(local[id]);
  }, [id]);

  useEffect(() => {
    if (user && supabase && id) {
      supabase
        .from('exercise_results')
        .select('*')
        .eq('exercise_id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const local = loadLocal();
            if (!local[id]) {
              local[id] = { done: true, date: data.date };
              saveLocal(id, local[id]);
              setSaved(local[id]);
            }
          }
        })
        .catch(() => {});
    }
  }, [user, supabase, id]);

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const checkAnswer = useCallback(async () => {
    if (!editorRef.current || !sqlJsRef.current) return;
    const sql = editorRef.current.getValue().trim();
    if (!sql) { setMessage('Digite uma query primeiro.'); return; }

    setStatus('running');
    setMessage('');
    setFeedback(null);
    setExpectedResult(null);
    setStudentResult(null);
    setShowExpected(false);

    try {
      const { db } = sqlJsRef.current;
      const translatedStudent = translateBQtoSQLite(sql);
      const translatedExpected = translateBQtoSQLite(expectedSql);
      const studentRaw = db.exec(translatedStudent);
      const expectedRaw = db.exec(translatedExpected);
      let isCorrect = false;

      if (validation === 'exact') {
        const normalizedStudent = normalizeSql(sql);
        const normalizedExpected = normalizeSql(expectedSql);
        isCorrect = normalizedStudent === normalizedExpected;
      } else {
        const studentRows = studentRaw.length > 0 ? studentRaw[0].values : [];
        const expectedRows = expectedRaw.length > 0 ? expectedRaw[0].values : [];
        isCorrect = resultsMatch(studentRows, expectedRows);
      }

      if (isCorrect) {
        setStatus('correct');
        setMessage('Resposta correta!');
        setFeedback(studentRaw);

        const entry = { done: true, date: new Date().toISOString() };
        saveLocal(id, entry);
        setSaved(entry);
        window.dispatchEvent(new CustomEvent('sidebar-progress-update'));

        if (user && supabase) {
          setSaving(true);
          await supabase.from('exercise_results').upsert({
            user_id: user.id,
            exercise_id: id,
            done: true,
            date: entry.date,
          }, { onConflict: 'user_id,exercise_id' });
          setSaving(false);
        }
      } else {
        setStatus('wrong');
        setMessage('O resultado não corresponde ao esperado. Veja a diferença abaixo.');
        const sCols = studentRaw.length > 0 ? studentRaw[0].columns : [];
        const sRows = studentRaw.length > 0 ? studentRaw[0].values : [];
        const eCols = expectedRaw.length > 0 ? expectedRaw[0].columns : [];
        const eRows = expectedRaw.length > 0 ? expectedRaw[0].values : [];
        setStudentResult({ columns: sCols, rows: sRows });
        setExpectedResult({ columns: eCols, rows: eRows });
      }
    } catch (err) {
      setStatus('error');
      setMessage(translateSqlError(err.message));
    }
  }, [expectedSql, validation, id, user, supabase]);

  const resetExercise = () => {
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
    setStatus(null);
    setMessage('');
    setFeedback(null);
    setShowHint(false);
    setExpectedResult(null);
    setStudentResult(null);
    setShowExpected(false);
  };

  const cardStyle = {
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    margin: '1.5rem 0',
    overflow: 'hidden',
  };

  const headerBg = saved?.done ? '#eafaf1' : 'var(--ifm-color-emphasis-100)';
  const headerBorder = saved?.done ? '#2ecc71' : 'var(--ifm-color-emphasis-300)';

  return (
    <div style={cardStyle}>
      <div style={{
        padding: '0.75rem 1rem',
        background: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <strong style={{ fontSize: '0.95rem' }}>
            &#128221; {id ? `Exercício ${id}` : 'Exercício'}
          </strong>
          {saved?.done && (
            <span style={{ color: '#2ecc71', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
              &#10003; Concluído
            </span>
          )}
        </div>
        <button onClick={resetExercise}
          style={{
            padding: '0.25rem 0.75rem', border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px', background: 'transparent', cursor: 'pointer',
            fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)',
          }}>
          &#8635; Limpar
        </button>
      </div>

      <div style={{ padding: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.5 }}>{prompt}</p>

        {hint && !showHint && (
          <p>
            <button onClick={() => setShowHint(true)}
              style={{
                border: 'none', background: 'transparent', color: 'var(--ifm-color-primary)',
                cursor: 'pointer', fontSize: '0.85rem', padding: 0,
              }}>
              &#128161; Mostrar dica
            </button>
          </p>
        )}
        {hint && showHint && (
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)', fontStyle: 'italic' }}>
            &#128161; Dica: {hint}
          </p>
        )}

        {table && (
          <p style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)' }}>
            Tabela: <code>{table}</code>
          </p>
        )}

        <div style={{ height: '180px', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px', overflow: 'hidden' }}>
          {initError ? (
            <div style={{ padding: '1rem', color: 'var(--ifm-color-danger)' }}>
              Erro ao carregar: {initError}
            </div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="cursoTheme"
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13, minimap: { enabled: false },
                scrollBeyondLastLine: false, lineNumbers: 'off',
                automaticLayout: true, tabSize: 2,
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.75rem' }}>
          <button onClick={checkAnswer} disabled={status === 'running' || initError || saving}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px',
              background: status !== 'running' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
              color: status !== 'running' ? 'white' : 'var(--ifm-color-emphasis-500)',
              cursor: status !== 'running' ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '0.9rem',
            }}>
            {status === 'running' ? 'Verificando...' : saving ? 'Salvando...' : 'Verificar Resposta'}
          </button>
        </div>

        {message && (
          <div style={{
            marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '6px',
            background: status === 'correct' ? '#eafaf1' : status === 'wrong' ? '#fdedec' : '#fff3e0',
            border: `1px solid ${
              status === 'correct' ? '#2ecc71' : status === 'wrong' ? '#e74c3c' : '#ff9800'
            }`,
            color: status === 'correct' ? '#1b5e20' : status === 'wrong' ? '#b71c1c' : '#e65100',
            fontSize: '0.9rem',
          }}>
            {status === 'correct' ? '&#10003; ' : status === 'wrong' ? '&#10007; ' : '&#9888; '}
            {message}
          </div>
        )}

        {feedback && status === 'correct' && feedback.length > 0 && (
          <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem',
            }}>
              <thead>
                <tr>
                  {feedback[0].columns.map((col, i) => (
                    <th key={i} style={{
                      padding: '0.3rem 0.6rem', border: '1px solid var(--ifm-color-emphasis-300)',
                      background: 'var(--ifm-color-emphasis-100)', textAlign: 'left', whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedback[0].values.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((val, ci) => (
                      <td key={ci} style={{
                        padding: '0.25rem 0.6rem', border: '1px solid var(--ifm-color-emphasis-300)',
                      }}>{val === null ? 'NULL' : String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {status === 'wrong' && expectedResult && !showExpected && (
          <div style={{ marginTop: '0.75rem' }}>
            <button onClick={() => setShowExpected(true)}
              style={{
                padding: '0.4rem 1rem', border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px', background: 'transparent', cursor: 'pointer',
                fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)',
              }}>
              &#128065; Ver resultado esperado
            </button>
          </div>
        )}

        {showExpected && expectedResult && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px', overflowX: 'auto' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e74c3c', marginBottom: '0.3rem' }}>
                  &#10007; Seu resultado ({studentResult.rows.length} linhas)
                </p>
                {studentResult.rows.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        {studentResult.columns.map((col, i) => (
                          <th key={i} style={{
                            padding: '0.25rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                            background: '#fdedec', textAlign: 'left', whiteSpace: 'nowrap',
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {studentResult.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((val, ci) => (
                            <td key={ci} style={{
                              padding: '0.2rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                            }}>{val === null ? 'NULL' : String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)', fontStyle: 'italic' }}>
                    Nenhum resultado retornado
                  </p>
                )}
              </div>

              <div style={{ flex: '1 1 300px', overflowX: 'auto' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2ecc71', marginBottom: '0.3rem' }}>
                  &#10003; Resultado esperado ({expectedResult.rows.length} linhas)
                </p>
                {expectedResult.rows.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        {expectedResult.columns.map((col, i) => (
                          <th key={i} style={{
                            padding: '0.25rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                            background: '#eafaf1', textAlign: 'left', whiteSpace: 'nowrap',
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expectedResult.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((val, ci) => (
                            <td key={ci} style={{
                              padding: '0.2rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                            }}>{val === null ? 'NULL' : String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)', fontStyle: 'italic' }}>
                    Nenhum resultado esperado
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
