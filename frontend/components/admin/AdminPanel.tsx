"use client";

import { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, Play, Square, RotateCcw, Users, Shield } from 'lucide-react';
import { ApiService } from '@/lib/api';
import { Subscriber } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading';

interface AdminPanelProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const AdminPanel = ({ onSuccess, onError }: AdminPanelProps) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getAllEmails();
      setSubscribers(response.data || []);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to fetch subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAction = async (action: string, apiCall: () => Promise<any>) => {
    try {
      setActionLoading(action);
      await apiCall();
      onSuccess?.(`${action} completed successfully`);
      if (action === 'fetch-subscribers') {
        fetchSubscribers();
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      onError?.('Please enter an email address');
      return;
    }
    
    await handleAction('send-test-email', () => ApiService.testEmail(testEmail));
    setTestEmail('');
  };

  const adminActions = [
    {
      id: 'notify-all',
      label: 'Notify All Subscribers',
      icon: Send,
      action: () => handleAction('notify-all', ApiService.notifyAll),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'reset-notification',
      label: 'Reset Notification',
      icon: RotateCcw,
      action: () => handleAction('reset-notification', ApiService.resetNotification),
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      id: 'start-monitoring',
      label: 'Start Monitoring',
      icon: Play,
      action: () => handleAction('start-monitoring', ApiService.startMonitoring),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'stop-monitoring',
      label: 'Stop Monitoring',
      icon: Square,
      action: () => handleAction('stop-monitoring', ApiService.stopMonitoring),
      color: 'bg-red-600 hover:bg-red-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="opacity-90">System management and monitoring</p>
          </div>
        </div>
      </div>

      {/* Test Email Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Test Email
        </h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleTestEmail}
            disabled={actionLoading === 'send-test-email'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading === 'send-test-email' ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Test
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminActions.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            disabled={actionLoading === item.id}
            className={`${item.color} text-white p-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {actionLoading === item.id ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            {item.label}
          </button>
        ))}
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscribers ({subscribers.length})
          </h3>
          <button
            onClick={fetchSubscribers}
            disabled={isLoading}
            className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {subscribers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No subscribers found</p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{subscriber.email}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}</p>
                      <p>Semester: {subscriber.semester || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      subscriber.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {subscriber.semester === 8 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subscriber.finalSemesterNotified 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {subscriber.finalSemesterNotified ? 'Notified' : 'Pending Notification'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};