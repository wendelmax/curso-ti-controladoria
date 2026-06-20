import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const DB_URL = '/db/seed.sqlite';
let cachedDb = null;

async function getDatabase(SQL) {
  if (cachedDb) return cachedDb;
  const resp = await fetch(DB_URL);
  const buffer = await resp.arrayBuffer();
  cachedDb = new SQL.Database(new Uint8Array(buffer));
  return cachedDb;
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

function loadExerciseResults() {
  try {
    return JSON.parse(localStorage.getItem(EXERCISE_STORAGE) || '{}');
  } catch { return {}; }
}

function saveExerciseResult(id, data) {
  const all = loadExerciseResults();
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
  const editorRef = useRef(null);
  const sqlJsRef = useRef(null);
  const [status, setStatus] = useState(null); // null | 'running' | 'correct' | 'wrong' | 'error'
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [saved, setSaved] = useState(null);
  const [initError, setInitError] = useState(null);

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

    const prev = loadExerciseResults();
    if (id && prev[id]) setSaved(prev[id]);
  }, [id]);

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const checkAnswer = useCallback(() => {
    if (!editorRef.current || !sqlJsRef.current) return;
    const sql = editorRef.current.getValue().trim();
    if (!sql) { setMessage('Digite uma query primeiro.'); return; }

    setStatus('running');
    setMessage('');
    setFeedback(null);

    try {
      const { db } = sqlJsRef.current;
      const studentResult = db.exec(sql);

      if (validation === 'exact') {
        const normalizedStudent = normalizeSql(sql);
        const normalizedExpected = normalizeSql(expectedSql);
        if (normalizedStudent === normalizedExpected) {
          setStatus('correct');
          setMessage('Resposta correta!');
          setFeedback(studentResult);
        } else {
          setStatus('wrong');
          setMessage('A query não coincide com a resposta esperada.');
          setFeedback(null);
        }
      } else {
        const expectedResult = db.exec(expectedSql);
        const studentRows = studentResult.length > 0 ? studentResult[0].values : [];
        const expectedRows = expectedResult.length > 0 ? expectedResult[0].values : [];

        if (resultsMatch(studentRows, expectedRows)) {
          setStatus('correct');
          setMessage('Resposta correta!');
          setFeedback(studentResult);
        } else {
          setStatus('wrong');
          setMessage('O resultado não corresponde ao esperado.');
          setFeedback(null);
        }
      }

      if (id && status === 'correct') {
        saveExerciseResult(id, { done: true, date: new Date().toISOString() });
        setSaved({ done: true });
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }, [expectedSql, validation, id, status]);

  const resetExercise = () => {
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
    setStatus(null);
    setMessage('');
    setFeedback(null);
    setShowHint(false);
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
          <button onClick={checkAnswer} disabled={status === 'running' || initError}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px',
              background: status !== 'running' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
              color: status !== 'running' ? 'white' : 'var(--ifm-color-emphasis-500)',
              cursor: status !== 'running' ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '0.9rem',
            }}>
            {status === 'running' ? 'Verificando...' : 'Verificar Resposta'}
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
      </div>
    </div>
  );
}
