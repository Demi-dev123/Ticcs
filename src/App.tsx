import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import NewEventPage from './components/events/NewEventPage';
import EventsDashboardPage from './components/events/EventsDashboardPage';
import EventDetailPage from './components/events/EventDetailPage';
import { Event } from './types';
import { Sparkles, Sun, Moon, CheckCircle2, RotateCcw, ArrowRight, LogOut, User } from 'lucide-react';

function DashboardShell() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut, isRealSupabase } = useAuth();
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'create' | 'success' | 'dashboard' | 'event-details'>('landing');

  // URL routing synchronization (history state sync)
  React.useEffect(() => {
    if (loading) return;
    
    // Check initial path on mount for high-fidelity direct links
    const path = window.location.pathname;
    if (path.startsWith('/events/')) {
      const parts = path.split('/');
      const id = parts[parts.length - 1];
      if (id && user) {
        setSelectedEventId(id);
        setCurrentView('event-details');
        return;
      }
    } else if (path === '/events' && user) {
      setCurrentView('dashboard');
      return;
    }

    // Default redirection if logged in and visiting standard index
    if (user && (currentView === 'landing' || currentView === 'login' || currentView === 'signup')) {
      setCurrentView('dashboard');
    }
  }, [user, loading]);

  // Synchronize history path on state changes
  React.useEffect(() => {
    if (currentView === 'dashboard') {
      window.history.pushState({}, '', '/events');
    } else if (currentView === 'event-details' && selectedEventId) {
      window.history.pushState({}, '', `/events/${selectedEventId}`);
    } else if (currentView === 'create') {
      window.history.pushState({}, '', '/create');
    } else if (currentView === 'landing') {
      window.history.pushState({}, '', '/');
    }
  }, [currentView, selectedEventId]);

  const handleEventCreated = (event: Event) => {
    setCreatedEvent(event);
    setCurrentView('success');
  };

  const resetFlow = () => {
    setCreatedEvent(null);
    setCurrentView(user ? 'dashboard' : 'landing');
  };

  // Protected route action wrapper
  const navigateToCreate = () => {
    if (!user) {
      setCurrentView('login');
    } else {
      setCurrentView('create');
    }
  };

  // Guard routing on unauthorized state updates
  React.useEffect(() => {
    if (!loading && !user && (currentView === 'create' || currentView === 'success' || currentView === 'dashboard' || currentView === 'event-details')) {
      setCurrentView('login');
    }
  }, [user, loading, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#121212] flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-neutral-200 dark:border-neutral-850 border-t-[#6C47FF] animate-spin mb-4" />
        <span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-550 uppercase">
          Synchronizing Session...
        </span>
      </div>
    );
  }

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'TA';
  const userName = user?.email ? user.email.split('@')[0] : 'Demo Author';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-base text-neutral-900 dark:text-dark-ink flex flex-col transition-colors duration-150">
      
       {/* Navbar System */}
      <header className="sticky top-0 z-50 h-[56px] border-b border-light-border-soft dark:border-[#2A2A2A] bg-white/95 dark:bg-[#1B1B1B]/95 backdrop-blur px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <button 
            type="button"
            onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
            className="w-8 h-8 rounded-full bg-[#6C47FF] flex items-center justify-center shadow-focus cursor-pointer"
          >
            <span className="text-white font-mono text-xs font-extrabold tracking-tight">TS</span>
          </button>
          <span 
            onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
            className="font-display font-semibold text-neutral-900 dark:text-white text-lg tracking-tight hover:opacity-80 transition-all cursor-pointer"
          >
            Ticss
          </span>
         <span className="text-[10px] font-mono tracking-wider font-semibold bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded ml-2 text-neutral-700 dark:text-neutral-200 border border-neutral-300/40 dark:border-neutral-600/40">
  MVP V1.0
</span>
        </div>

        {/* Navigation Action Buttons / Links */}
        <div className="flex items-center gap-4">
          
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-[#333333] flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#2A2A2A] cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D97706]" /> : <Moon className="w-4 h-4 text-[#6C47FF]" />}
          </button>

          {/* Profile placeholder info / Sign out actions */}
          <div className="flex items-center gap-2 border-l border-neutral-200 dark:border-neutral-800 pl-4">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{userInitials}</span>
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[110px]">{userName}</p>
                  <p className="text-[9px] text-neutral-400 font-mono leading-none">AUTHENTICATED</p>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    setCurrentView('landing');
                  }}
                  title="Sign Out"
                  className="p-1 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold font-mono"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">EXIT</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white flex items-center gap-1 shadow-focus cursor-pointer transition-all active:scale-[0.98]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Primary Workspace Panel */}
      <main className="flex-1 flex flex-col justify-between">
        {currentView === 'landing' && (
          <LandingPage 
            onGetStarted={navigateToCreate}
            onLoginClick={() => setCurrentView('login')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage 
            onNavigateToSignup={() => setCurrentView('signup')}
            onSuccess={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'signup' && (
          <SignupPage 
            onNavigateToLogin={() => setCurrentView('login')}
            onSuccess={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <EventsDashboardPage 
            onCreateEventClick={() => setCurrentView('create')}
            onEventClick={(id) => {
              setSelectedEventId(id);
              setCurrentView('event-details');
            }}
          />
        )}

        {currentView === 'event-details' && selectedEventId && (
          <EventDetailPage 
            eventId={selectedEventId}
            onBack={() => {
              setSelectedEventId(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'create' && (
          <NewEventPage 
            onEventCreated={handleEventCreated}
            onNavigateToDashboard={() => setCurrentView(user ? 'dashboard' : 'landing')}
          />
        )}

        {currentView === 'success' && (
          /* SUCCESS PAGE AFTER GENERATING AN EVENT */
          <div className="w-full flex items-center justify-center py-20 px-4 flex-1 bg-slate-50 dark:bg-[#121212]">
            <div className="max-w-xl w-full text-center space-y-6 bg-white dark:bg-[#1C1C1C] border border-neutral-200/20 dark:border-neutral-800/25 rounded-3xl p-8 md:p-12 shadow-sm transition-all text-left md:text-center">
              
              <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold tracking-widest text-[#6C47FF] uppercase">DEPLOYMENT COMPLETION</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Event Generated Successfully!
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Branded digital passes representive layout is ready for <strong>{createdEvent?.name}</strong>.
                </p>
              </div>

              {/* Summary of what compiled */}
              {createdEvent && (
                <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800 text-left space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-850 pb-2.5">
                    <span className="text-neutral-400 font-medium">DESIGN TEMPLATE:</span>
                    <span className="font-mono text-neutral-900 dark:text-white uppercase">{createdEvent.template}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-850 pb-2.5">
                    <span className="text-neutral-400 font-medium font-sans">VENUE LOCATION:</span>
                    <span className="text-neutral-900 dark:text-white truncate max-w-[240px]">{createdEvent.venue}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-850 pb-2.5">
                    <span className="text-neutral-400 font-medium font-sans">ORGANIZER AUTHOR:</span>
                    <span className="text-neutral-900 dark:text-white">{createdEvent.organizer_name}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-neutral-400 font-medium">ACCENT BRANDING:</span>
                    <div className="flex items-center gap-1.5 font-mono text-neutral-700 dark:text-neutral-300 uppercase">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: createdEvent.brand_color }} />
                      <span>{createdEvent.brand_color}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive buttons to explore next flow */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetFlow}
                  className="flex-1 px-5 py-3 rounded-full text-xs font-semibold tracking-wide border border-neutral-200/50 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    if (createdEvent) {
                      setSelectedEventId(createdEvent.id);
                      setCurrentView('event-details');
                    } else {
                      setCurrentView('dashboard');
                    }
                  }}
                  className="flex-1 px-5 py-3 rounded-full text-xs font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white cursor-pointer flex items-center justify-center gap-2 transition-all shadow-focus active:scale-[0.98]"
                >
                  <span>Manage Event & Attendees</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Simple structured Footer */}
      <footer className="py-6 px-4 md:px-8 bg-white dark:bg-[#1B1B1B] border-t border-light-border-soft dark:border-[#2A2A2A] text-center text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
        <span> · Built by Demi for Ticss ·</span>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

