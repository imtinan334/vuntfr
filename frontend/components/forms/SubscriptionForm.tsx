"use client";

import { useState } from 'react';
import { Mail, Bell, CheckCircle, ArrowRight, GraduationCap } from 'lucide-react';
import { ApiService } from '@/lib/api';
import { validateEmail } from '@/lib/validation';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/useToast';

interface SubscriptionFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'compact';
}

export const SubscriptionForm = ({ onSuccess, onError, variant = 'default' }: SubscriptionFormProps) => {
  const [email, setEmail] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSemesterFocused, setIsSemesterFocused] = useState(false);
  const { addToast } = useToast();

  const validateSemester = (sem: string) => {
    const semNum = parseInt(sem);
    if (!sem || isNaN(semNum)) {
      return 'Please select your semester';
    }
    if (semNum < 1 || semNum > 8) {
      return 'Semester must be between 1 and 8';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const semesterError = validateSemester(semester);
    if (semesterError) {
      setError(semesterError);
      return;
    }

    setIsLoading(true);
    
    try {
      await ApiService.subscribe(email, parseInt(semester));
      onSuccess?.(email);
      setEmail('');
      setSemester('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        addToast('Unable to connect to server. Please try again later.', 'error');
      } else {
        addToast('Failed to subscribe. Please try again.', 'error');
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

  if (variant === 'compact') {
    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your email"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-300' : isFocused ? 'border-blue-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
          </div>
          
          <div className="relative">
            <GraduationCap className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
              isSemesterFocused ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              onFocus={() => setIsSemesterFocused(true)}
              onBlur={() => setIsSemesterFocused(false)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                error ? 'border-red-300' : isSemesterFocused ? 'border-blue-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Select your semester</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester (Final)</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <Bell className="h-5 w-5" />
                Subscribe
              </>
            )}
          </button>
        </form>
        
        {error && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
            isFocused ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your email address"
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
              error ? 'border-red-300' : isFocused ? 'border-blue-300' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
        </div>
        
        <div className="relative">
          <GraduationCap className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
            isSemesterFocused ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            onFocus={() => setIsSemesterFocused(true)}
            onBlur={() => setIsSemesterFocused(false)}
            placeholder="Select your semester"
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg appearance-none bg-white ${
              error ? 'border-red-300' : isSemesterFocused ? 'border-blue-300' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select your semester</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
            <option value="7">7th Semester</option>
            <option value="8">8th Semester (Final)</option>
          </select>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Subscribe to Notifications</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-white">100% Free</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-white">No Spam</span>
          </div>
        </div>
      </form>
    </div>
  );
};