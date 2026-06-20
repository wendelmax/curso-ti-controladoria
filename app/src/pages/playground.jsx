import React from 'react';
import Layout from '@theme/Layout';
import SqlPlayground from '../components/SqlPlayground';

export default function Playground() {
  return (
    <Layout
      title="SQL Playground"
      description="Editor SQL interativo para praticar consultas no banco de dados financeiro"
    >
      <div style={{ padding: '1rem' }}>
        <SqlPlayground />
      </div>
    </Layout>
  );
}
