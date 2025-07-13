"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UnsubscribeForm } from '@/components/forms/UnsubscribeForm';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { UserX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const { toasts, addToast, removeToast } = useToast();
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const handleUnsubscribeSuccess = (email: string) => {
    setIsUnsubscribed(true);
    addToast(`Successfully unsubscribed ${email}. You won't receive any more notifications.`, 'success');
  };

  const handleUnsubscribeError = (error: string) => {
    addToast(error, 'error');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <UserX className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Unsubscribe from Notifications
            </h1>
            <p className="text-lg text-gray-600">
              We're sorry to see you go. Enter your email address to stop receiving datesheet notifications.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {!isUnsubscribed ? (
              <>
                <UnsubscribeForm 
                  onSuccess={handleUnsubscribeSuccess}
                  onError={handleUnsubscribeError}
                />
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You can always resubscribe later if you change your mind.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <UserX className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Successfully Unsubscribed
                </h2>
                <p className="text-gray-600 mb-6">
                  You have been removed from our notification list. You won't receive any more emails from us.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  If you change your mind, you can always subscribe again from our home page.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}