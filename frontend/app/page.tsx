"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { SubscriberCounter } from '@/components/stats/SubscriberCounter';
import { StatusCard } from '@/components/status/StatusCard';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { Bell, Calendar, Shield, Zap, ArrowRight, CheckCircle, Star, GraduationCap } from 'lucide-react';

export default function Home() {
  const { toasts, addToast, removeToast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscriptionSuccess = (email: string) => {
    setIsSubscribed(true);
    addToast(`Successfully subscribed ${email}! You'll receive notifications when datesheet is available.`, 'success');
  };

  const handleSubscriptionError = (error: string) => {
    addToast(error, 'error');
  };

  const features = [
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Get notified immediately when VU releases exam datesheet',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: Calendar,
      title: 'Never Miss Dates',
      description: 'Stay updated with all important exam schedule announcements',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: GraduationCap,
      title: 'Semester-Based Filtering',
      description: 'Final semester students receive current notification but are excluded from future ones',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your email is safe with us. Unsubscribe anytime.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Automated monitoring ensures you get updates within minutes',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
          </div>
          
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-white/90 text-sm font-medium">Trusted by 10,000+ VU Students</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="text-white">Never Miss Your</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  VU Datesheet
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Get instant email notifications when Virtual University announces your exam datesheet. 
                Stay ahead of the game with our automated monitoring system.
                <br />
                <span className="text-sm text-blue-200 mt-2 block">
                  Note: Final semester students (8th semester) will receive the current notification but be excluded from future notifications.
                </span>
              </p>
              
              {/* Subscription Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 mb-12 border border-white/20 shadow-2xl">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Join the Community</h3>
                  <p className="text-blue-100 mb-8">Get notified the moment your datesheet is available</p>
                  
                  <SubscriptionForm 
                    onSuccess={handleSubscriptionSuccess}
                    onError={handleSubscriptionError}
                  />
                  
                  {isSubscribed && (
                    <div className="mt-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <p className="text-green-100 font-medium">
                          🎉 Welcome aboard! You'll receive an email as soon as the datesheet is available.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="max-w-sm mx-auto">
                <SubscriberCounter />
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowRight className="h-6 w-6 text-white/60 rotate-90" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Students Choose
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> VU Notifier</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built by students, for students. We understand the importance of staying informed about your academic schedule.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Status Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Real-Time System Status
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Monitor our system's performance and VU datesheet availability in real-time
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <StatusCard />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>
          
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Stay Informed?
            </h2>
            <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto">
              Join thousands of VU students who never miss their datesheet announcements. 
              It's free, secure, and takes just seconds to set up.
            </p>
            <div className="max-w-md mx-auto">
              <SubscriptionForm 
                onSuccess={handleSubscriptionSuccess}
                onError={handleSubscriptionError}
                variant="compact"
              />
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>No Spam</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Unsubscribe Anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}