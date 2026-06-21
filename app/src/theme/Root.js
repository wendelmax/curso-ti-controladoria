import React from 'react';
import AuthProvider from '../components/AuthProvider';
import SidebarProgress from '../components/SidebarProgress';

export default function Root({ children }) {
  return (
    <AuthProvider>
      <SidebarProgress />
      {children}
    </AuthProvider>
  );
}
