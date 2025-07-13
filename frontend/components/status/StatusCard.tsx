"use client";

import { useState, useEffect } from 'react';
import { Activity, Clock, Users, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { ApiService } from '@/lib/api';
import { SystemStatus } from '@/types';

export const StatusCard = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await ApiService.getStatus();
        setStatus(response as SystemStatus);
        setHasError(false);
      } catch (err) {
        // Silently handle connection errors when backend is unavailable
        // This is expected behavior when the backend server is not running
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !status) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-xl">
            <WifiOff className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">System Status</h3>
            <p className="text-sm text-gray-600">Connection Status</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <span className="text-gray-900 font-medium">Backend Connection</span>
                <p className="text-sm text-gray-600">Server connectivity</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              Disconnected
            </span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-700 font-medium mb-1">Server Unavailable</p>
                <p className="text-sm text-gray-600">
                  Unable to connect to the backend server. Please ensure your Node.js/Express server is running on the configured port.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Activity className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">System Status</h3>
          <p className="text-gray-600">Real-time monitoring dashboard</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
              status.monitoring ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {status.monitoring ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <span className="text-gray-900 font-semibold text-lg">Monitoring Status</span>
              <p className="text-sm text-gray-600">Automated system monitoring</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            status.monitoring 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {status.monitoring ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
              status.datesheetStatus === 'available' ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {status.datesheetStatus === 'available' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-600" />
              )}
            </div>
            <div>
              <span className="text-gray-900 font-semibold text-lg">Datesheet Status</span>
              <p className="text-sm text-gray-600">VU exam schedule availability</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            status.datesheetStatus === 'available'
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {status.datesheetStatus === 'available' ? 'Available' : 'Pending'}
          </span>
        </div>

        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold text-lg">Total Subscribers</span>
              <p className="text-sm text-gray-600">Registered email notifications</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
            {(status.subscriberCount || 0).toLocaleString()}
          </span>
        </div>

        {status.lastChecked && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-gray-700 font-medium">Last Checked</p>
                <p className="text-sm text-gray-600">
                  {new Date(status.lastChecked).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};