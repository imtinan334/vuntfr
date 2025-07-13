"use client";

import { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { ApiService } from '@/lib/api';

export const SubscriberCounter = () => {
  const [stats, setStats] = useState<{ total: number; eligible: number }>({ total: 0, eligible: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayStats, setDisplayStats] = useState({ total: 0, eligible: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await ApiService.getStatus() as any;
        const subscriberData = response.data?.subscribers;
        setStats({
          total: subscriberData?.total || 0,
          eligible: subscriberData?.eligible || 0
        });
        setHasError(false);
      } catch (err) {
        // Silently handle connection errors when backend is unavailable
        // This is expected behavior when the backend server is not running
        setHasError(true);
        // Set a fallback count when backend is not available
        setStats({ total: 0, eligible: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animate count display
  useEffect(() => {
    if (!isLoading && !hasError) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const totalIncrement = stats.total / steps;
      const eligibleIncrement = stats.eligible / steps;
      let currentTotal = 0;
      let currentEligible = 0;
      
      const timer = setInterval(() => {
        currentTotal += totalIncrement;
        currentEligible += eligibleIncrement;
        
        if (currentTotal >= stats.total && currentEligible >= stats.eligible) {
          setDisplayStats({ total: stats.total, eligible: stats.eligible });
          clearInterval(timer);
        } else {
          setDisplayStats({
            total: Math.floor(currentTotal),
            eligible: Math.floor(currentEligible)
          });
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [stats, isLoading, hasError]);

  if (hasError) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200 shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
          <AlertCircle className="h-8 w-8 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          <div className="text-4xl font-bold text-gray-600">
            ---
          </div>
          <p className="text-gray-700 font-semibold text-lg">Students Subscribed</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Backend server not connected</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
          <Users className="h-10 w-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              displayStats.total.toLocaleString()
            )}
          </div>
          <p className="text-blue-800 font-semibold text-lg">Total Students</p>
        </div>
        
        <div className="border-t border-blue-200 pt-4">
          <div className="space-y-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : (
                displayStats.eligible.toLocaleString()
              )}
            </div>
            <p className="text-green-700 font-semibold text-base">Eligible for Notifications</p>
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium">
              <GraduationCap className="h-3 w-3" />
              <span>Final semester students notified once</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
          <TrendingUp className="h-4 w-4" />
          <span>Join the community!</span>
        </div>
      </div>
    </div>
  );
};