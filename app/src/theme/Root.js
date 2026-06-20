import React from 'react';
import AuthProvider from '../components/AuthProvider';

export default function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
