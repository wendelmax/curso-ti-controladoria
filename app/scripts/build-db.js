const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function build() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const staticDbDir = path.join(__dirname, '..', 'static', 'db');
  const seedPath = path.join(staticDbDir, 'seed.sql');
  const outputPath = path.join(staticDbDir, 'seed.sqlite');

  const wasmFiles = ['sql-wasm.wasm', 'sql-wasm-browser.wasm'];
  for (const f of wasmFiles) {
    const src = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', f);
    const dst = path.join(staticDbDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }
  console.log(`WASM files copiados para ${staticDbDir}`);
  const sqlScript = fs.readFileSync(seedPath, 'utf-8');
  const statements = sqlScript.split(';').filter(s => s.trim());

  for (const stmt of statements) {
    const sql = stmt.trim();
    if (!sql) continue;
    try {
      db.run(sql + ';');
    } catch (err) {
      if (!sql.toUpperCase().includes('COMMIT') && !sql.toUpperCase().includes('ROLLBACK')) {
        console.error(`Erro ao executar: ${sql.substring(0, 80)}...`);
        console.error(err);
      }
    }
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(outputPath, buffer);

  const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('Tabelas criadas:', result[0].values.flat().join(', '));

  for (const [tableName] of result[0].values) {
    const count = db.exec(`SELECT COUNT(*) FROM ${tableName}`);
    console.log(`  ${tableName}: ${count[0].values[0][0]} registros`);
  }

  console.log(`\nBanco criado com sucesso: ${(buffer.length / 1024).toFixed(1)} KB`);
  db.close();
}

build().catch(console.error);
