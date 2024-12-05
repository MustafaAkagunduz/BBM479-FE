// /app/hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    ...context,
    loading: context.loading // Guard'larda loading kullanıldığı için alias ekliyoruz
  };
};