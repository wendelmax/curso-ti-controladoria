import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import initSqlJs from 'sql.js';
import { format } from 'sql-formatter';
import SchemaExplorer, { SCHEMA } from '../SchemaExplorer';

const DB_URL = '/db/seed.sqlite';
const SAVED_QUERY_KEY = 'curso_sql_playground_query';

function formatValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return val.toLocaleString('pt-BR');
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(val);
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  }
}

function getSavedQuery() {
  try { return localStorage.getItem(SAVED_QUERY_KEY) || ''; } catch { return ''; }
}

function saveQuery(sql) {
  try { localStorage.setItem(SAVED_QUERY_KEY, sql); } catch {}
}

export default function SqlPlayground() {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [query, setQuery] = useState(getSavedQuery);

  useEffect(() => {
    async function loadDatabase() {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `/db/${file}`,
        });
        const resp = await fetch(DB_URL);
        if (!resp.ok) throw new Error(`Erro ao carregar banco: ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buffer));
        setDb(database);
        setLoading(false);
      } catch (err) {
        setLoadError(err.message);
        setLoading(false);
      }
    }
    loadDatabase();
    return () => {
      // db is closed inside loadDatabase error handler when needed
    };
  }, []);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();

    editor.addAction({
      id: 'execute-query',
      label: 'Executar Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => executeQuery(),
    });
  }, []);

  const clearDecorations = () => {
    if (editorRef.current && decorationsRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  const executeQuery = useCallback(() => {
    clearDecorations();
    if (!db || !editorRef.current) return;
    const sql = editorRef.current.getValue().trim();
    if (!sql) return;

    setExecuting(true);
    setError(null);
    setResults(null);
    setExecutionTime(null);

    try {
      const start = performance.now();
      const res = db.exec(sql);
      const end = performance.now();
      setExecutionTime(((end - start) / 1000).toFixed(3));
      setResults(res);
    } catch (e) {
      const msg = e.message;
      setError(msg);
      const lineMatch = msg.match(/line (\d+):/i) || msg.match(/at line (\d+)/i) || msg.match(/(\d+):/);
      if (lineMatch && editorRef.current && monacoRef.current) {
        const line = parseInt(lineMatch[1]);
        const monaco = monacoRef.current;
        decorationsRef.current = editorRef.current.deltaDecorations([], [
          {
            range: new monaco.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              overviewRuler: { color: '#e74c3c', position: monaco.editor.OverviewRulerLane.Full },
            },
          },
          {
            range: new monaco.Range(line, 1, line, 1000),
            options: {
              inlineClassName: 'error-line-highlight',
            },
          },
        ]);
      }
    } finally {
      setExecuting(false);
    }
  }, [db]);

  const exportCSV = useCallback(() => {
    if (!results || results.length === 0) return;
    const r = results[0];
    const header = r.columns.join(',');
    const rows = r.values.map(row =>
      row.map(v => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const formatQuery = useCallback(() => {
    if (!editorRef.current) return;
    try {
      const formatted = format(editorRef.current.getValue(), {
        language: 'sqlite',
        uppercase: true,
        tabWidth: 2,
      });
      editorRef.current.setValue(formatted);
    } catch {
      // keep original if formatting fails
    }
  }, []);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    saveQuery(value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      executeQuery();
    }
  }, [executeQuery]);

  const clearResults = () => {
    setResults(null);
    setError(null);
    setExecutionTime(null);
    clearDecorations();
  };

  const getTableNames = () => SCHEMA.map((t) => t.name);
  const getColumnNames = (tableName) => {
    const table = SCHEMA.find((t) => t.name === tableName);
    return table ? table.columns.map((c) => c.name) : [];
  };

  function handleEditorWillMount(monaco) {
    const tableNames = SCHEMA.map((t) => t.name);
    const allColumns = {};
    SCHEMA.forEach((t) => {
      allColumns[t.name] = t.columns.map((c) => c.name);
    });

    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [];

        tableNames.forEach((name) => {
          suggestions.push({
            label: name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: name,
            range,
            detail: 'tabela',
          });
        });

        const textBefore = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const fromMatch = textBefore.match(/\bfrom\s+(\w+)\s*/i);
        const joinMatch = textBefore.match(/\bjoin\s+(\w+)\s*/i);
        let activeTable = null;
        if (fromMatch) activeTable = fromMatch[1];
        else if (joinMatch) activeTable = joinMatch[1];

        if (activeTable && allColumns[activeTable]) {
          allColumns[activeTable].forEach((col) => {
            suggestions.push({
              label: col,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col,
              range,
              detail: `coluna de ${activeTable}`,
            });
          });
        }

        SCHEMA.forEach((t) => {
          t.columns.forEach((col) => {
            suggestions.push({
              label: `${t.name}.${col.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `${t.name}.${col.name}`,
              range,
              detail: `${t.name}.${col.name} (${col.type})`,
            });
          });
        });

        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN',
          'LIKE', 'IS', 'NULL', 'AS', 'ON', 'JOIN', 'LEFT', 'RIGHT', 'INNER',
          'OUTER', 'CROSS', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
          'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 'THEN',
          'ELSE', 'END', 'SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'COALESCE',
          'CAST', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'OVER', 'PARTITION BY',
          'WITH', 'RECURSIVE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE',
          'ALTER', 'DROP', 'INDEX', 'VIEW', 'EXISTS', 'HAVING',
        ];
        keywords.forEach((kw) => {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw.toLowerCase(),
            range,
            detail: 'palavra-chave SQL',
          });
        });

        return { suggestions };
      },
      triggerCharacters: ['.', ' ', ','],
    });

    monaco.editor.defineTheme('cursoTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'type', foreground: '267f99' },
        { token: 'string', foreground: 'a31515' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editorLineNumber.foreground': '#999999',
        'editorCursor.foreground': '#1a73e8',
      },
    });
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Carregando banco de dados...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="loading-container">
        <span style={{ color: 'var(--ifm-color-danger)' }}>
          Erro: {loadError}
        </span>
      </div>
    );
  }

  return (
    <div className="playground-container" onKeyDown={handleKeyDown}>
      <div className="playground-header">
        <h2>&#128187; SQL Playground</h2>
        <button className="btn-execute" onClick={executeQuery} disabled={executing}>
          {executing ? 'Executando...' : '▶ Executar'}
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-600)' }}>
          Ctrl+Enter para executar
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn-clear" onClick={clearResults}>
          ✕ Limpar
        </button>
      </div>

      <div className="playground-layout">
        <SchemaExplorer />

        <div className="playground-right">
          <div className="playground-editor-panel">
            <div className="playground-editor-header">
              <span>&#128221; Editor SQL</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {executionTime && (
                  <span style={{ fontWeight: 400, fontSize: '0.8rem' }}>
                    {executionTime}s
                  </span>
                )}
                <button onClick={formatQuery} title="Formatar SQL"
                  style={{
                    padding: '0.15rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '4px', background: 'transparent', cursor: 'pointer',
                    fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-700)',
                  }}>
                  ✨ Formatar
                </button>
              </div>
            </div>
            <div className="playground-editor-wrapper">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={query}
                onChange={handleQueryChange}
                theme="cursoTheme"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  wordBasedSuggestions: false,
                  tabSize: 2,
                }}
              />
            </div>
          </div>

          <div className="playground-results-panel">
            <div className="playground-results-header">
              <span>&#128200; Resultados</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {results && results.length > 0 && (
                  <>
                    <span style={{ fontWeight: 400, fontSize: '0.8rem' }}>
                      {results[0].values.length} linha(s)
                    </span>
                    <button onClick={exportCSV} title="Exportar CSV"
                      style={{
                        padding: '0.15rem 0.5rem', border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: '4px', background: 'transparent', cursor: 'pointer',
                        fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-700)',
                      }}>
                      📥 CSV
                    </button>
                  </>
                )}
                {error && <span style={{ color: 'var(--ifm-color-danger)' }}>Erro</span>}
              </div>
            </div>
            <div className="playground-results-content">
              {error && <div className="playground-error">{error}</div>}
              {!error && results && results.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      {results[0].columns.map((col, i) => (
                        <th key={i}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results[0].values.map((row, i) => (
                      <tr key={i}>
                        {row.map((val, j) => (
                          <td key={j} onClick={() => copyToClipboard(String(val))}
                            title="Clique para copiar"
                            style={{ cursor: 'pointer' }}>
                            {formatValue(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!error && (!results || results.length === 0) && (
                <div className="playground-empty">
                  Execute uma query para ver os resultados aqui.
                  <br />
                  <small>
                    Exemplo: <code>SELECT * FROM empresas LIMIT 5;</code>
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
