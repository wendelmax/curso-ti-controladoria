const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

module.exports = {
  title: 'Curso TI para Controladoria',
  tagline: 'SQL, BigQuery, Looker, Tableau & IA para Análise Financeira',
  favicon: 'img/favicon.svg',
  url: 'https://curso-ti-controladoria.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
  customFields: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  plugins: ['@docusaurus/plugin-vercel-analytics'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/curso/',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
    image: 'img/logo.svg',
    navbar: {
      title: 'TI para Controladoria',
      items: [
        { to: '/curso/intro/', label: 'Curso', position: 'left' },
        { to: '/playground', label: 'SQL Playground', position: 'left' },
        { to: '/notas', label: 'Notas', position: 'left' },
        { to: '/login', label: 'Entrar', position: 'right' },
        {
          href: 'https://github.com/wendelmax/curso-ti-controladoria',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Módulos',
          items: [
            { label: 'SQL para Análise Financeira', to: '/curso/sql/intro-sql' },
            { label: 'Google BigQuery', to: '/curso/bigquery/intro-bigquery' },
            { label: 'Looker', to: '/curso/looker/intro-looker' },
            { label: 'Tableau', to: '/curso/tableau/intro-tableau' },
            { label: 'IA Aplicada', to: '/curso/ia/intro-ia' },
            { label: 'Projeto Final', to: '/curso/projeto-final/intro-projeto' },
          ],
        },
      ],
      copyright: `Curso TI para Controladoria © ${new Date().getFullYear()}`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['sql', 'json', 'yaml'],
    },
  },
};
