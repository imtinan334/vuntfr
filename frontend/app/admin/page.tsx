"use client";

import { useState } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleSuccess = (message: string) => {
    addToast(message, 'success');
  };

  const handleError = (error: string) => {
    addToast(error, 'error');
  };

  if (!isAuthenticated) {
    return (
      <>
        <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <AdminPanel onSuccess={handleSuccess} onError={handleError} />
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}