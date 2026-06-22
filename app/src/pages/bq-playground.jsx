import React from 'react';
import Layout from '@theme/Layout';
import BQPlayground from '../components/BQPlayground';

export default function BQPlaygroundPage() {
  return (
    <Layout
      title="BigQuery Playground"
      description="Playground interativo para praticar SQL no estilo BigQuery com tradução automática para SQLite"
    >
      <div style={{ padding: '1rem' }}>
        <BQPlayground />
      </div>
    </Layout>
  );
}
