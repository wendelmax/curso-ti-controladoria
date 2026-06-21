import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from '../components/AuthProvider';

function LoginForm() {
  const { user, loading, supabase } = useAuth();
  const [showConfig, setShowConfig] = useState(false);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando...</div>;
  }

  if (!supabase) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ifm-color-emphasis-500)' }}>
        <h2>Supabase não configurado</h2>
        <p>Para ativar login, configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no Vercel e faça redeploy.</p>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Você já está logado</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          {user.email}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <a href="/notas" className="button button--primary button--lg">
            Ver Notas e Certificado
          </a>
          <button
            onClick={() => supabase.auth.signOut()}
            className="button button--secondary button--lg"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Entrar no Curso</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Senha',
              button_label: 'Entrar',
              loading_button_label: 'Entrando...',
              social_provider_text: 'Entrar com {{provider}}',
              link_text: 'Já tem conta? Entre',
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Senha',
              button_label: 'Criar conta',
              loading_button_label: 'Criando conta...',
              social_provider_text: 'Criar conta com {{provider}}',
              link_text: 'Não tem conta? Cadastre-se',
            },
          },
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Layout title="Login" description="Faça login para salvar seu progresso">
      <LoginForm />
    </Layout>
  );
}
