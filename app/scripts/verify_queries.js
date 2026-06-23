const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

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
  s = s.replace(/CAST\\s*\\(\\s*(\\w+(?:\\.\\w+)?)\\s+AS\\s+STRING\\s*\\)/gi, "CAST($1 AS TEXT)");
  s = s.replace(/CAST\\s*\\(\\s*(\\w+(?:\\.\\w+)?)\\s+AS\\s+INT64\\s*\\)/gi, "CAST($1 AS INTEGER)");
  s = s.replace(/CAST\\s*\\(\\s*(\\w+(?:\\.\\w+)?)\\s+AS\\s+FLOAT64\\s*\\)/gi, "CAST($1 AS REAL)");
  return s;
}

const queries = [
  { id: "bq-1", sql: "SELECT data_emissao, EXTRACT(YEAR FROM data_emissao) AS ano, EXTRACT(MONTH FROM data_emissao) AS mes FROM notas_fiscais WHERE tipo = 'saida' LIMIT 10" },
  { id: "bq-2", sql: "SELECT UPPER(nome_fantasia) || ' - ' || regime_tributario AS empresa_regime FROM empresas" },
  { id: "bq-3", sql: "SELECT nome, 'Físico' AS tipo FROM produtos WHERE categoria = 'Industrial' UNION ALL SELECT nome, 'Digital' AS tipo FROM produtos WHERE categoria = 'Eletrônico'" },
  { id: "bq-4", sql: "SELECT SUM(valor) AS total FROM contas_pagar WHERE data_vencimento BETWEEN '2026-04-01' AND '2026-04-30'" },
  { id: "bq-5", sql: "SELECT e.nome_fantasia AS empresa, CAST(STRFTIME('%m', f.data_emissao) AS INTEGER) AS mes, SUM(f.valor_liquido) AS total FROM faturamento f JOIN empresas e ON f.id_empresa = e.id_empresa GROUP BY e.nome_fantasia, mes ORDER BY e.nome_fantasia, mes" },
  { id: "bq-6", sql: "SELECT c.nome, SUM(COALESCE(nf.base_calculo, 0)) AS total_gasto, ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(nf.base_calculo, 0)) DESC) AS ranking FROM clientes c LEFT JOIN notas_fiscais nf ON c.id_cliente = nf.id_cliente_fornecedor AND nf.tipo = 'saida' AND nf.tipo_pessoa = 'cliente' GROUP BY c.nome ORDER BY ranking" },
  { id: "bq-7", sql: "SELECT STRFTIME('%Y-%m', data_emissao) AS mes, SUM(valor_liquido) AS faturamento, LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao)) AS mes_anterior, SUM(valor_liquido) - LAG(SUM(valor_liquido)) OVER (ORDER BY STRFTIME('%Y-%m', data_emissao)) AS variacao FROM faturamento GROUP BY mes ORDER BY mes" },
  { id: "bq-8", sql: "SELECT f.nome, SUM(cp.valor) AS total_contas, DENSE_RANK() OVER (ORDER BY SUM(cp.valor) DESC) AS categoria FROM fornecedores f JOIN contas_pagar cp ON f.id_fornecedor = cp.id_fornecedor GROUP BY f.nome ORDER BY categoria" }
];

async function verify() {
  const SQL = await initSqlJs();
  const dbFile = path.join(__dirname, '..', 'static', 'db', 'seed.sqlite');
  if (!fs.existsSync(dbFile)) {
    console.error("seed.sqlite not found.");
    process.exit(1);
  }
  const fileBuffer = fs.readFileSync(dbFile);
  const db = new SQL.Database(fileBuffer);

  for (const q of queries) {
    const translated = translateBQtoSQLite(q.sql);
    console.log(`\n--- VERIFYING ${q.id} ---`);
    console.log(`Original:   ${q.sql}`);
    console.log(`Translated: ${translated}`);
    try {
      const res = db.exec(translated);
      console.log(`Status: SUCCESS`);
      if (res.length > 0) {
        console.log(`Columns: ${res[0].columns.join(', ')}`);
        console.log(`Rows: ${res[0].values.length}`);
        console.log(`First row: ${JSON.stringify(res[0].values[0])}`);
      } else {
        console.log(`No rows returned`);
      }
    } catch (e) {
      console.error(`Status: FAILED`);
      console.error(e.message);
    }
  }
  db.close();
}

verify().catch(console.error);
