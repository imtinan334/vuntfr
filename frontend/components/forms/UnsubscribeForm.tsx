"use client";

import { useState } from 'react';
import { Mail, UserX } from 'lucide-react';
import { ApiService } from '@/lib/api';
import { validateEmail } from '@/lib/validation';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/useToast';

interface UnsubscribeFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export const UnsubscribeForm = ({ onSuccess, onError }: UnsubscribeFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      await ApiService.unsubscribe(email);
      onSuccess?.(email);
      setEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        addToast('Unable to connect to server. Please try again later.', 'error');
      } else {
        addToast('Failed to unsubscribe. Please try again.', 'error');
      }
      // Show user-friendly error message for connection issues
      const displayMessage = errorMessage.includes('fetch') 
        ? 'Unable to connect to server. Please try again later.' 
        : errorMessage;
      setError(displayMessage);
      onError?.(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <>
              <UserX className="h-5 w-5" />
              Unsubscribe
            </>
          )}
        </button>
      </form>
    </div>
  );
};